import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./context/AppContext', () => ({
  AppProvider: ({ children }) => children,
  useAppContext: () => ({
    isHydrating: false,
    dispatchAiAction: async () => ({ message: 'ok', proposedAction: null }),
    executeAction: () => {},
  }),
}));

vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

describe('App smoke test', () => {
  it('renders login screen when unauthenticated', () => {
    render(<App />);
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });
});
