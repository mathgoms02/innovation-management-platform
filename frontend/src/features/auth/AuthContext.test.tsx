import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import type { User } from './AuthContext';

// AuthContext calls the API on mount when a token exists; stub it out.
vi.mock('../../services/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: null }) },
}));

const sampleUser: User = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  role: 'PARTICIPANT',
};

function Consumer() {
  const { user, login, logout, updateUser } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.username : 'anonymous'}</span>
      <span data-testid="email">{user?.email ?? ''}</span>
      <button onClick={() => login(sampleUser)}>login</button>
      <button onClick={() => updateUser({ email: 'new@example.com' })}>update</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts anonymous when there is no token', () => {
    renderWithProvider();
    expect(screen.getByTestId('user')).toHaveTextContent('anonymous');
  });

  it('login sets the user', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByText('login'));
    expect(screen.getByTestId('user')).toHaveTextContent('alice');
  });

  it('updateUser merges fields into the current user', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByText('login'));
    await userEvent.click(screen.getByText('update'));
    expect(screen.getByTestId('email')).toHaveTextContent('new@example.com');
    // untouched field is preserved
    expect(screen.getByTestId('user')).toHaveTextContent('alice');
  });

  it('logout clears the user and tokens', async () => {
    localStorage.setItem('access_token', 'x');
    localStorage.setItem('refresh_token', 'y');
    renderWithProvider();
    await userEvent.click(screen.getByText('login'));
    await userEvent.click(screen.getByText('logout'));
    expect(screen.getByTestId('user')).toHaveTextContent('anonymous');
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('useAuth throws outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      act(() => {
        render(<Consumer />);
      }),
    ).toThrow(/must be used within an AuthProvider/);
    spy.mockRestore();
  });
});
