export interface PolicyOptions {
  nonce: string;
  apiOrigin?: string | null;
  development?: boolean;
  upgradeInsecure?: boolean;
}

export interface QrClaims {
  sub?: unknown;
  typ?: unknown;
}
