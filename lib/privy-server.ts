/**
 * Server-side Privy token verification.
 * Privy JWTs are signed with RS256. We verify using Privy's public JWKS endpoint.
 */

import { createRemoteJWKSet, jwtVerify } from "jose";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const JWKS_URL = `https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json`;

// Cache the JWKS so we don't fetch on every request
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(JWKS_URL));
  }
  return jwks;
}

/**
 * Verifies a Privy Bearer token from an incoming request.
 * Returns the verified user ID (Privy DID) or null if invalid.
 */
export async function verifyPrivyToken(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: "privy.io",
      audience: PRIVY_APP_ID,
    });
    // Privy puts the user DID in `sub`
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}
