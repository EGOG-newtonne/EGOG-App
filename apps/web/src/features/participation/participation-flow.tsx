"use client";

import {
  usePrivy,
  useSignTypedData,
  useWallets,
  type SignTypedDataParams,
} from "@privy-io/react-auth";
import { buildParticipationTypedData } from "@egog/shared";
import { Check, Circle, ExternalLink, LoaderCircle, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Address, Hex } from "viem";

import { clientEnvironment } from "../../env/env.client";
import {
  findPrivyEmbeddedWallet,
  requireWalletAddress,
  shortenAddress,
} from "../auth/wallet";

type ChallengeResponse = {
  action: "SIGN";
  requestId: string;
  message: {
    participant: Address;
    projectId: Hex;
    snapshotHash: Hex;
    snapshotVersion: string;
    snapshotURI: string;
    memberNumber: string;
    tokenURI: string;
    nonce: string;
    deadline: string;
  };
};

type ProcessingResponse = {
  action: "PROCESSING";
  requestId: string;
  status: string;
  transactionHash: Hex | null;
};

type ConfirmedResult = {
  action: "CONFIRMED";
  status: "CONFIRMED";
  transactionHash: Hex;
  tokenId: string;
  memberNumber: string;
  tokenUri: string;
  walletAddress: string;
  joinedAt: string;
};

type ParticipationStatus = {
  id: string;
  status: string;
  transactionHash: Hex | null;
  memberNumber: string | null;
  tokenId: string | null;
  tokenUri: string | null;
  walletAddress: string;
  joinedAt: string | null;
  lastErrorCode: string | null;
};

async function jsonRequest<T>(url: string, accessToken: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Request failed");
  return result;
}

async function jsonGet<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, { headers: { authorization: `Bearer ${accessToken}` } });
  const result = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Request failed");
  return result;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function ParticipationFlow({
  projectSlug,
  projectName,
  snapshotVersion,
  snapshotHash,
  snapshotUri,
  dataType,
}: {
  projectSlug: string;
  projectName: string;
  snapshotVersion: number;
  snapshotHash: string;
  snapshotUri: string;
  dataType: string;
}) {
  const { authenticated, getAccessToken, login, ready } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { signTypedData } = useSignTypedData();
  const embeddedWallet = findPrivyEmbeddedWallet(wallets);
  const [requiredConsent, setRequiredConsent] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [status, setStatus] = useState<"review" | "signing" | "confirming" | "complete">("review");
  const [result, setResult] = useState<ConfirmedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const storageKey = `egog:participation:${projectSlug}`;
  const idempotencyKey = useMemo(() => {
    if (typeof window === "undefined") return crypto.randomUUID();
    const existing = localStorage.getItem(storageKey);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(storageKey, created);
    return created;
  }, [storageKey]);

  useEffect(() => {
    if (!authenticated || !embeddedWallet) return;
    void getAccessToken().then((accessToken) => {
      if (!accessToken) return;
      return jsonRequest("/api/users/session", accessToken, {});
    }).catch(() => setError("We could not prepare your embedded wallet session."));
  }, [authenticated, embeddedWallet, getAccessToken]);

  async function participate() {
    if (!authenticated) {
      login({ loginMethods: ["google"] });
      return;
    }
    if (!embeddedWallet || !requiredConsent) return;
    setError(null);
    setStatus("signing");
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("AUTH_TOKEN_REQUIRED");
      const walletAddress = requireWalletAddress(embeddedWallet.address);
      const challenge = await jsonRequest<ChallengeResponse | ProcessingResponse | ConfirmedResult>(
        "/api/participations/challenge",
        accessToken,
        {
          projectSlug,
          walletAddress,
          idempotencyKey,
          requiredConsent: true,
          emailOptIn,
        },
      );
      if (challenge.action === "CONFIRMED") {
        setResult(challenge);
        localStorage.removeItem(storageKey);
        setStatus("complete");
        return;
      }
      if (challenge.action === "PROCESSING") {
        setStatus("confirming");
        await pollUntilSettled(challenge.requestId, accessToken);
        return;
      }
      const message = {
        participant: challenge.message.participant,
        projectId: challenge.message.projectId,
        snapshotHash: challenge.message.snapshotHash,
        snapshotVersion: BigInt(challenge.message.snapshotVersion),
        snapshotURI: challenge.message.snapshotURI,
        memberNumber: BigInt(challenge.message.memberNumber),
        tokenURI: challenge.message.tokenURI,
        nonce: BigInt(challenge.message.nonce),
        deadline: BigInt(challenge.message.deadline),
      } as const;
      const typedData = buildParticipationTypedData(
          clientEnvironment.NEXT_PUBLIC_PARTICIPATION_CONTRACT_ADDRESS as Address,
          message,
        );
      const { signature } = await signTypedData(
        {
          ...typedData,
          types: { Participation: [...typedData.types.Participation] },
        } as SignTypedDataParams,
        { address: walletAddress },
      );
      setStatus("confirming");
      const confirmed = await jsonRequest<ConfirmedResult | ProcessingResponse>(
        "/api/participations/submit",
        accessToken,
        { requestId: challenge.requestId, signature },
      );
      if (confirmed.action === "PROCESSING") {
        await pollUntilSettled(confirmed.requestId, accessToken);
      } else {
        setResult(confirmed);
        localStorage.removeItem(storageKey);
        setStatus("complete");
      }
    } catch (caught) {
      if (caught instanceof Error && ["SIGNATURE_EXPIRED", "PARTICIPATION_FAILED_FINAL"].includes(caught.message)) {
        localStorage.removeItem(storageKey);
      }
      setStatus("review");
      setError(caught instanceof Error ? caught.message : "Participation failed");
    }
  }

  async function pollUntilSettled(requestId: string, accessToken: string) {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const current = await jsonGet<ParticipationStatus>(`/api/participations/${requestId}`, accessToken);
      if (current.status === "CONFIRMED" && current.transactionHash && current.memberNumber && current.tokenId && current.tokenUri && current.joinedAt) {
        setResult({
          action: "CONFIRMED",
          status: "CONFIRMED",
          transactionHash: current.transactionHash,
          memberNumber: current.memberNumber,
          tokenId: current.tokenId,
          tokenUri: current.tokenUri,
          walletAddress: current.walletAddress,
          joinedAt: current.joinedAt,
        });
        localStorage.removeItem(storageKey);
        setStatus("complete");
        return;
      }
      if (current.status === "FAILED_FINAL" || current.status === "EXPIRED") {
        localStorage.removeItem(storageKey);
        throw new Error(current.lastErrorCode ?? current.status);
      }
      await wait(3_000);
    }
    setStatus("confirming");
  }

  const step = !authenticated ? 1 : !requiredConsent ? 2 : status === "review" || status === "signing" ? 3 : 4;

  return (
    <div className="flow-shell">
      <ol className="flow-steps" aria-label="Participation progress">
        {["Sign in", "Review & consent", "Sign participation", "Confirmed"].map((label, index) => (
          <li className={index + 1 <= step ? "current" : ""} key={label}>
            <span>{index + 1 < step ? <Check size={15} /> : index + 1}</span>{label}
          </li>
        ))}
      </ol>
      <section className="flow-card">
        {status === "complete" && result ? (
          <div className="completion-state">
            <div className="success-icon"><ShieldCheck size={32} /></div>
            <p className="eyebrow">Participation confirmed</p>
            <h1>You are Early Participant #{result.memberNumber}</h1>
            <p>Your signed support for {projectName} is now recorded on GIWA Testnet and your non-transferable badge has been minted.</p>
            <dl>
              <div><dt>Status</dt><dd>Confirmed</dd></div>
              <div><dt>Data type</dt><dd>{dataType === "demonstration" ? "Demonstration" : "Actual"}</dd></div>
              <div><dt>Snapshot</dt><dd>Version {snapshotVersion}</dd></div>
              <div><dt>Snapshot hash</dt><dd>{snapshotHash.slice(0, 12)}…{snapshotHash.slice(-8)}</dd></div>
              <div><dt>NFT token ID</dt><dd>{result.tokenId}</dd></div>
              <div><dt>Transaction</dt><dd>{result.transactionHash.slice(0, 10)}…{result.transactionHash.slice(-8)}</dd></div>
              <div><dt>Wallet</dt><dd>{shortenAddress(result.walletAddress)}</dd></div>
              <div><dt>Joined at</dt><dd>{new Date(result.joinedAt).toLocaleString("en-GB")}</dd></div>
            </dl>
            <div className="flow-actions">
              <Link className="primary-cta" href="/me">View my badge</Link>
              {result.tokenUri ? <a className="secondary-action" href={result.tokenUri.replace("ipfs://", `${clientEnvironment.NEXT_PUBLIC_PINATA_GATEWAY_URL}/`)} target="_blank" rel="noreferrer">View Badge metadata <ExternalLink size={15} /></a> : null}
              <a className="secondary-action" href={`${clientEnvironment.NEXT_PUBLIC_GIWA_EXPLORER_URL}/tx/${result.transactionHash}`} target="_blank" rel="noreferrer">View transaction <ExternalLink size={15} /></a>
              <a className="secondary-action" href={snapshotUri.replace("ipfs://", `${clientEnvironment.NEXT_PUBLIC_PINATA_GATEWAY_URL}/`)} target="_blank" rel="noreferrer">View dMRV Snapshot <ExternalLink size={15} /></a>
            </div>
          </div>
        ) : status === "confirming" ? (
          <div className="processing-state"><LoaderCircle className="spinner" size={42} /><p className="eyebrow">Confirming on GIWA</p><h1>Creating your participation record…</h1><p>You can safely leave this page after the transaction is submitted. My Page will show the final result.</p></div>
        ) : (
          <>
            <div className="flow-title"><p className="eyebrow">Support & join early access</p><h1>Review your participation</h1><p>You will sign a gas-free message. EGOG&apos;s relayer submits the on-chain transaction.</p></div>
            <div className="wallet-ready"><Wallet size={21} /><div><strong>{authenticated && embeddedWallet ? "Your embedded wallet is ready" : "Sign in to create your embedded wallet"}</strong><span>{embeddedWallet ? shortenAddress(embeddedWallet.address) : "Google login · no browser wallet required"}</span></div></div>
            <div className="snapshot-review"><div><span>Project</span><strong>{projectName}</strong></div><div><span>Snapshot</span><strong>Version {snapshotVersion}</strong></div><div><span>Snapshot hash</span><strong>{snapshotHash.slice(0, 12)}…{snapshotHash.slice(-8)}</strong></div></div>
            <label className="consent-row"><input checked={requiredConsent} onChange={(event) => setRequiredConsent(event.target.checked)} type="checkbox" /><span><strong>Required</strong> I understand that the participation record and badge are permanently recorded on a public blockchain and cannot be deleted.</span></label>
            <label className="consent-row"><input checked={emailOptIn} onChange={(event) => setEmailOptIn(event.target.checked)} type="checkbox" /><span><strong>Optional</strong> Send me project updates and early-access information by email.</span></label>
            <p className="consent-links">By continuing, you acknowledge the <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
            {error ? <p className="flow-error" role="alert">{error}</p> : null}
            <button className="primary-cta flow-button" disabled={!ready || (authenticated && (!walletsReady || !embeddedWallet || !requiredConsent)) || status === "signing"} onClick={participate} type="button">
              {status === "signing" ? <><LoaderCircle className="spinner" size={17} /> Preparing signature…</> : authenticated ? "Review & sign participation" : "Continue with Google"}
            </button>
          </>
        )}
      </section>
      <p className="flow-footnote"><Circle fill="currentColor" size={8} /> GIWA Testnet · Gas sponsored by EGOG</p>
    </div>
  );
}
