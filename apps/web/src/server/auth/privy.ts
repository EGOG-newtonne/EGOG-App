import "server-only";

import { PrivyClient } from "@privy-io/node";
import { and, eq, isNull } from "drizzle-orm";
import type { Address } from "viem";

import { serverEnvironment } from "../../env/env.server";
import { db } from "../db/client";
import { participationRequests, participations, users } from "../db/schema";

const privy = new PrivyClient({
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  appSecret: serverEnvironment.PRIVY_APP_SECRET,
});

export type AuthenticatedPrivyUser = {
  privyUserId: string;
  walletAddress: Address;
  email: string | null;
};

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("AUTH_TOKEN_REQUIRED");
  }
  return authorization.slice("Bearer ".length);
}

export async function authenticatePrivyRequest(
  request: Request,
  expectedWallet?: string,
): Promise<AuthenticatedPrivyUser> {
  const token = bearerToken(request);
  const verified = await privy.utils().auth().verifyAccessToken(token);
  const user = await privy.users()._get(verified.user_id);
  const embeddedWallet = user.linked_accounts.find(
    (account) =>
      account.type === "wallet" &&
      account.chain_type === "ethereum" &&
      account.wallet_client_type === "privy" &&
      account.connector_type === "embedded",
  );
  if (!embeddedWallet || embeddedWallet.type !== "wallet") {
    throw new Error("EMBEDDED_WALLET_REQUIRED");
  }
  const walletAddress = embeddedWallet.address as Address;
  if (expectedWallet && walletAddress.toLowerCase() !== expectedWallet.toLowerCase()) {
    throw new Error("WALLET_OWNERSHIP_MISMATCH");
  }
  const google = user.linked_accounts.find((account) => account.type === "google_oauth");

  return {
    privyUserId: user.id,
    walletAddress,
    email: google?.type === "google_oauth" ? google.email : null,
  };
}

export async function upsertAuthenticatedUser(auth: AuthenticatedPrivyUser) {
  const [user] = await db
    .insert(users)
    .values({
      privyUserId: auth.privyUserId,
      walletAddress: auth.walletAddress,
      email: auth.email,
    })
    .onConflictDoUpdate({
      target: users.walletAddress,
      set: {
        privyUserId: auth.privyUserId,
        email: auth.email,
        updatedAt: new Date(),
      },
    })
    .returning();
  if (!user) throw new Error("USER_UPSERT_FAILED");
  return user;
}

export async function deletePrivyAndLocalUser(request: Request) {
  const auth = await authenticatePrivyRequest(request);
  await db.transaction(async (transaction) => {
    const [user] = await transaction
      .select()
      .from(users)
      .where(
        and(
          eq(users.privyUserId, auth.privyUserId),
          eq(users.walletAddress, auth.walletAddress),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);
    if (!user) throw new Error("USER_NOT_FOUND");
    await privy.users().delete(auth.privyUserId);
    await transaction
      .update(participationRequests)
      .set({ userId: null, updatedAt: new Date() })
      .where(eq(participationRequests.userId, user.id));
    await transaction
      .update(participations)
      .set({ userId: null })
      .where(eq(participations.userId, user.id));
    await transaction
      .update(users)
      .set({
        privyUserId: null,
        email: null,
        emailOptIn: false,
        emailOptInAt: null,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  });
}

export async function getEmailPreference(request: Request) {
  const auth = await authenticatePrivyRequest(request);
  const [user] = await db.select({
    emailOptIn: users.emailOptIn,
    emailOptInAt: users.emailOptInAt,
  }).from(users).where(and(
    eq(users.privyUserId, auth.privyUserId),
    eq(users.walletAddress, auth.walletAddress),
    isNull(users.deletedAt),
  )).limit(1);
  if (!user) throw new Error("USER_NOT_FOUND");
  return {
    emailOptIn: user.emailOptIn,
    emailOptInAt: user.emailOptInAt?.toISOString() ?? null,
  };
}

export async function updateEmailPreference(request: Request, emailOptIn: boolean) {
  const auth = await authenticatePrivyRequest(request);
  const now = new Date();
  const [user] = await db.update(users).set({
    emailOptIn,
    emailOptInAt: emailOptIn ? now : null,
    updatedAt: now,
  }).where(and(
    eq(users.privyUserId, auth.privyUserId),
    eq(users.walletAddress, auth.walletAddress),
    isNull(users.deletedAt),
  )).returning({ emailOptIn: users.emailOptIn, emailOptInAt: users.emailOptInAt });
  if (!user) throw new Error("USER_NOT_FOUND");
  return {
    emailOptIn: user.emailOptIn,
    emailOptInAt: user.emailOptInAt?.toISOString() ?? null,
  };
}
