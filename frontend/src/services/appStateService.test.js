import { describe, expect, it, vi, beforeEach } from 'vitest';
import { loadUserAppState, saveUserAppState } from './appStateService';

const mockDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();

vi.mock('../firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: (...args) => mockDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
  serverTimestamp: () => 'SERVER_TS',
}));

describe('appStateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockReturnValue({ path: 'users/u1/appState/main' });
  });

  it('creates defaults when state document is missing', async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });
    mockSetDoc.mockResolvedValue(undefined);

    const state = await loadUserAppState('u1');

    expect(state.settings).toBeTruthy();
    expect(Array.isArray(state.tasks)).toBe(true);
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
  });

  it('reads and normalizes existing state document', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ settings: { theme: 'light' }, profile: { firstName: 'A' }, tasks: [] }),
    });

    const state = await loadUserAppState('u1');

    expect(state.settings.theme).toBe('light');
    expect(state.profile.firstName).toBe('A');
    expect(Array.isArray(state.tasks)).toBe(true);
  });

  it('saves normalized state with merge update', async () => {
    mockSetDoc.mockResolvedValue(undefined);

    await saveUserAppState('u1', {
      settings: { theme: 'dark' },
      profile: { firstName: 'Tester' },
      tasks: [{ id: 1, title: 'Task 1', completed: false }],
    });

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const call = mockSetDoc.mock.calls[0];
    expect(call[2]).toEqual({ merge: true });
    expect(call[1].profile.firstName).toBe('Tester');
  });
});
