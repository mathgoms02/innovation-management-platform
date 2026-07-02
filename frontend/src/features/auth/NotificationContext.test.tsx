import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from './NotificationContext';

const showToast = vi.fn();
let currentUser: { id: number } | null = { id: 1 };

vi.mock('../../components/Toast', () => ({
  useToast: () => ({ showToast }),
}));

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ user: currentUser }),
}));

// Minimal fake WebSocket that lets tests push messages in.
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  url: string;
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances = [...FakeWebSocket.instances, this];
  }

  emit(message: string) {
    this.onmessage?.({ data: JSON.stringify({ message }) });
  }
}

function Consumer() {
  const { notifications } = useNotifications();
  return <span data-testid="count">{notifications.length}</span>;
}

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.stubGlobal('WebSocket', FakeWebSocket as unknown as typeof WebSocket);
    FakeWebSocket.instances = [];
    showToast.mockClear();
    currentUser = { id: 1 };
    localStorage.clear();
  });

  it('does not open a socket without a token', () => {
    localStorage.removeItem('access_token');
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );
    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it('passes the JWT in the socket URL', () => {
    localStorage.setItem('access_token', 'my-token');
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeWebSocket.instances[0].url).toContain('token=my-token');
  });

  it('adds a notification and fires a toast on incoming message', () => {
    localStorage.setItem('access_token', 'my-token');
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );
    act(() => {
      FakeWebSocket.instances[0].emit('Hello world');
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(showToast).toHaveBeenCalledWith('info', 'Hello world');
  });
});
