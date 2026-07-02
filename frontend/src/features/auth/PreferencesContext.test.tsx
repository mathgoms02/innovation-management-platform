import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesProvider, usePreferences, ACCENTS } from './PreferencesContext';
import type { UserPreferences } from '../../services/user';

const updateUser = vi.fn();
let userPrefs: Partial<UserPreferences> = {};

vi.mock('./AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, preferences: userPrefs }, updateUser }),
}));

const updatePreferences = vi.fn();
vi.mock('../../services/user', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/user')>();
  return { ...actual, updatePreferences: (p: Partial<UserPreferences>) => updatePreferences(p) };
});

function Consumer() {
  const { prefs, fmt, setPreference } = usePreferences();
  return (
    <div>
      <span data-testid="accent">{prefs.accent}</span>
      <span data-testid="fmt">{fmt('System_Control_v2')}</span>
      <button onClick={() => setPreference('plain_text', true)}>plain</button>
      <button onClick={() => setPreference('accent', 'lime')}>lime</button>
    </div>
  );
}

function renderConsumer() {
  return render(
    <PreferencesProvider>
      <Consumer />
    </PreferencesProvider>,
  );
}

describe('PreferencesContext', () => {
  beforeEach(() => {
    userPrefs = {};
    updateUser.mockClear();
    updatePreferences.mockReset();
    // Resolve without a `preferences` payload so the optimistic local state is
    // kept (in production the merged prefs flow back through updateUser).
    updatePreferences.mockResolvedValue({});
    document.documentElement.style.removeProperty('--color-primary');
  });

  it('falls back to defaults when the user has no preferences', () => {
    renderConsumer();
    expect(screen.getByTestId('accent')).toHaveTextContent('cyan');
  });

  it('fmt keeps underscores until plain_text is enabled', async () => {
    renderConsumer();
    expect(screen.getByTestId('fmt')).toHaveTextContent('System_Control_v2');
    await userEvent.click(screen.getByText('plain'));
    await waitFor(() =>
      expect(screen.getByTestId('fmt')).toHaveTextContent('System Control v2'),
    );
  });

  it('applies the accent to the document CSS variables', async () => {
    renderConsumer();
    await userEvent.click(screen.getByText('lime'));
    await waitFor(() =>
      expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(
        ACCENTS.lime.primary,
      ),
    );
  });

  it('persists changes through updatePreferences', async () => {
    renderConsumer();
    await userEvent.click(screen.getByText('plain'));
    expect(updatePreferences).toHaveBeenCalledWith({ plain_text: true });
  });
});
