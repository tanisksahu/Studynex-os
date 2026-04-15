import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const {
  mockOnAuthStateChanged,
  mockEnsureUserProfile,
  mockLogActivity,
  mockUpdateLeaderboard,
} = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn(),
  mockEnsureUserProfile: vi.fn(),
  mockLogActivity: vi.fn(),
  mockUpdateLeaderboard: vi.fn(),
}));

vi.mock('../firebase', () => ({
  auth: {},
  onAuthStateChanged: mockOnAuthStateChanged,
  signInWithGoogle: vi.fn(),
  logOut: vi.fn(),
}));

vi.mock('../services/firestoreService', () => ({
  ensureUserProfile: mockEnsureUserProfile,
  logActivity: mockLogActivity,
  updateLeaderboard: mockUpdateLeaderboard,
}));

function Probe() {
  const { user, loading } = useAuth();
  return <div>{loading ? 'loading' : user?.email || 'no-user'}</div>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hydrates authenticated user and syncs profile data', async () => {
    const fakeUser = {
      uid: 'uid-1',
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: 'https://example.com/avatar.png',
    };

    mockEnsureUserProfile.mockResolvedValue({ streakCount: 3, xp: 50, level: 1 });
    mockLogActivity.mockResolvedValue(undefined);
    mockUpdateLeaderboard.mockResolvedValue(undefined);
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(fakeUser);
      return () => {};
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    expect(mockEnsureUserProfile).toHaveBeenCalledWith(fakeUser);
    expect(mockLogActivity).toHaveBeenCalledWith('uid-1', 'login', { name: 'Test User' });
    expect(mockUpdateLeaderboard).toHaveBeenCalled();
  });
});
