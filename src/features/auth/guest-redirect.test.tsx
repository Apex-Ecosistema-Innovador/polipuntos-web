import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GuestRedirect } from './guest-redirect';

const replace = vi.fn();
let auth: { user: { role: string } | null; status: string } = { user: null, status: 'loading' };

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('./auth-context', () => ({ useAuth: () => auth }));

const teacher = { role: 'teacher' };

describe('GuestRedirect', () => {
  beforeEach(() => {
    replace.mockClear();
    window.history.replaceState(null, '', '/login');
  });
  afterEach(cleanup);

  it('sends a restored session to its home', () => {
    auth = { user: null, status: 'loading' };
    const { rerender } = render(<GuestRedirect />);
    expect(replace).not.toHaveBeenCalled();

    auth = { user: teacher, status: 'authenticated' };
    rerender(<GuestRedirect />);
    expect(replace).toHaveBeenCalledWith('/profesor');
  });

  it('returns to the requested page when it belongs to the role', () => {
    window.history.replaceState(null, '', '/login?next=%2Fprofesor%2Fescanear');
    auth = { user: teacher, status: 'authenticated' };
    render(<GuestRedirect />);
    expect(replace).toHaveBeenCalledWith('/profesor/escanear');
  });

  it('ignores a next that points to another role area', () => {
    window.history.replaceState(null, '', '/login?next=%2Fadmin');
    auth = { user: teacher, status: 'authenticated' };
    render(<GuestRedirect />);
    expect(replace).toHaveBeenCalledWith('/profesor');
  });

  it('does not interfere with a sign-in done on the page itself', () => {
    auth = { user: null, status: 'anonymous' };
    const { rerender } = render(<GuestRedirect />);

    auth = { user: teacher, status: 'authenticated' };
    rerender(<GuestRedirect />);
    expect(replace).not.toHaveBeenCalled();
  });
});
