export interface PolicyOptions {
  nonce: string;
  apiOrigin: string;
  development?: boolean;
  upgradeInsecure?: boolean;
}

export interface QrClaims {
  sub?: unknown;
  typ?: unknown;
}
