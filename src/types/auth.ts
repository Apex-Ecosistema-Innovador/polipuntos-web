import type { User } from './api';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  verified: boolean;
  signedOutByUser: boolean;
  signIn: (identifier: string, password: string) => Promise<User>;
  completeSession: (user: User, accessToken: string) => void;
  signOut: () => Promise<void>;
}

export type RestoredSession =
  { kind: 'verified'; user: User } | { kind: 'cached'; user: User } | { kind: 'anonymous' };

export interface SessionPayload {
  user: User;
  accessToken?: string;
}

export interface StudentRegistration {
  cedula: string;
  fullName: string;
  password: string;
  email: string;
  offeringIds?: string[];
}

export interface TeacherRegistration {
  cedula: string;
  fullName: string;
  password: string;
  email: string;
  inviteCode?: string;
}
