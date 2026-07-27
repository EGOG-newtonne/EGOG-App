"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Check, Copy, ExternalLink, LogIn, ShieldCheck, Trash2, Wallet } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  snapshotKind,
  type ClimateMetricsSnapshot,
  type PublicSnapshot,
} from "@egog/shared";

import { AppLink } from "../../components/app-link";
import { AccountSkeleton } from "../../components/route-skeleton";
import { clientEnvironment } from "../../env/env.client";
import { findPrivyEmbeddedWallet, shortenAddress } from "../auth/wallet";
import { DeleteAccountDialog } from "./delete-account-dialog";

type ParticipationView = {
  project: { slug: string; name: string; heroImage: string };
  participation: {
    memberNumber: string;
    tokenId: string;
    tokenUri: string;
    transactionHash: string;
    walletAddress: string;
    joinedAt: string;
  };
  joinedSnapshot: {
    version: number;
    dataType: string;
    gatewayUrl: string;
    publicData: PublicSnapshot;
  };
  latestSnapshot: {
    version: number;
    verificationStage: string;
    publicData: PublicSnapshot;
  } | null;
};

function snapshotLabel(snapshot: ParticipationView["joinedSnapshot"]) {
  if (snapshotKind(snapshot.publicData) === "field_evidence") {
    return `Field Evidence Snapshot v${snapshot.version} · Carbon data pending`;
  }
  const climate = snapshot.publicData as ClimateMetricsSnapshot;
  return `v${snapshot.version} · ${climate.monitoredReduction.value} tCO₂e`;
}

function latestSnapshotLabel(snapshot: ParticipationView["latestSnapshot"]) {
  if (!snapshot) return "Not available";
  if (snapshotKind(snapshot.publicData) === "field_evidence") {
    return `Field Evidence Snapshot v${snapshot.version} · Carbon data pending`;
  }
  const climate = snapshot.publicData as ClimateMetricsSnapshot;
  return `v${snapshot.version} · ${climate.monitoredReduction.value} tCO₂e`;
}

export function MyPage() {
  const { authenticated, getAccessToken, login, ready } = usePrivy();
  const { wallets } = useWallets();
  const wallet = findPrivyEmbeddedWallet(wallets);
  const [items, setItems] = useState<ParticipationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) { setLoading(false); return; }
    void getAccessToken().then(async (token) => {
      if (!token) throw new Error("Missing access token");
      const [participationsResponse, preferenceResponse] = await Promise.all([
        fetch("/api/me/participations", { headers: { authorization: `Bearer ${token}` } }),
        fetch("/api/me/preferences", { headers: { authorization: `Bearer ${token}` } }),
      ]);
      if (!participationsResponse.ok || !preferenceResponse.ok) throw new Error("Could not load My Page");
      setItems(await participationsResponse.json() as ParticipationView[]);
      const preference = await preferenceResponse.json() as { emailOptIn: boolean };
      setEmailOptIn(preference.emailOptIn);
    }).catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load My Page"))
      .finally(() => setLoading(false));
  }, [authenticated, getAccessToken, ready]);

  async function changeEmailPreference(nextValue: boolean) {
    setSavingPreference(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Missing access token");
      const response = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ emailOptIn: nextValue }),
      });
      if (!response.ok) throw new Error("Could not update email preference");
      const updated = await response.json() as { emailOptIn: boolean };
      setEmailOptIn(updated.emailOptIn);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update email preference");
    } finally {
      setSavingPreference(false);
    }
  }

  if (!ready || loading) return <AccountSkeleton />;
  if (!authenticated) return <div className="account-empty"><LogIn size={32} /><p className="eyebrow">My participation</p><h1>Sign in to view your badges</h1><p>Your EGOG embedded wallet keeps your participation records connected to your Google login.</p><button className="primary-cta flow-button" onClick={() => login({ loginMethods: ["google"] })}>Continue with Google</button></div>;

  return (
    <div className="account-layout">
      <section className="account-heading"><div><p className="eyebrow">My participation</p><h1>Your climate project records</h1><p>Compare the Snapshot you signed with the project&apos;s latest published status.</p></div>{wallet ? <div className="wallet-card"><Wallet size={20} /><div><span>Your GIWA wallet</span><strong>{shortenAddress(wallet.address)}</strong><code>{wallet.address}</code><div className="wallet-actions"><button onClick={() => { void navigator.clipboard.writeText(wallet.address); setCopied(true); window.setTimeout(() => setCopied(false), 2_000); }} type="button">{copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy address"}</button><a href={`${clientEnvironment.NEXT_PUBLIC_GIWA_EXPLORER_URL}/address/${wallet.address}`} target="_blank" rel="noreferrer">Explorer <ExternalLink size={13} /></a></div></div></div> : null}</section>
      {error ? <p className="flow-error">{error}</p> : null}
      {items.length === 0 ? <section className="account-empty compact"><ShieldCheck size={32} /><h2>No participation badge yet</h2><p>Explore an active project and sign your support to create your first record.</p><AppLink className="primary-cta" href="/">Explore projects</AppLink></section> : <div className="participation-list">{items.map((item) => {
        const fieldEvidence = snapshotKind(item.joinedSnapshot.publicData) === "field_evidence";
        const latestClimate = item.latestSnapshot && snapshotKind(item.latestSnapshot.publicData) === "climate_metrics"
          ? item.latestSnapshot.publicData as ClimateMetricsSnapshot
          : null;
        return <article className="participation-record" key={item.participation.transactionHash}><div className="participation-art"><Image alt="EGOG participation badge" height={220} src="/images/participation-badge.svg" width={220} /></div><div className="participation-copy"><div><span className={fieldEvidence ? "field-evidence-pill" : "demo-pill"}>{fieldEvidence ? "Field evidence at join" : `${item.joinedSnapshot.dataType} data at join`}</span><h2>{item.project.name}</h2><p>Early Participant #{item.participation.memberNumber} · Confirmed</p><small>Joined {new Date(item.participation.joinedAt).toLocaleString("en-GB")}</small></div><dl><div><dt>Joined Snapshot</dt><dd>{snapshotLabel(item.joinedSnapshot)}</dd></div><div><dt>Latest Snapshot</dt><dd>{latestSnapshotLabel(item.latestSnapshot)}</dd></div><div><dt>Current stage</dt><dd>{item.latestSnapshot?.verificationStage ?? "Not available"}</dd></div><div><dt>{fieldEvidence ? "Carbon data" : "Current progress"}</dt><dd>{fieldEvidence ? "Pending" : latestClimate?.projectProgress ? `${latestClimate.projectProgress}%` : "Not available"}</dd></div><div><dt>NFT Token ID</dt><dd>{item.participation.tokenId}</dd></div></dl><div className="record-actions"><a href={item.participation.tokenUri.replace("ipfs://", `${clientEnvironment.NEXT_PUBLIC_PINATA_GATEWAY_URL}/`)} target="_blank" rel="noreferrer">View badge <ExternalLink size={13} /></a><AppLink href={`/projects/${item.project.slug}`}>View project</AppLink><a href={`${clientEnvironment.NEXT_PUBLIC_GIWA_EXPLORER_URL}/tx/${item.participation.transactionHash}`} target="_blank" rel="noreferrer">Participation record <ExternalLink size={13} /></a><a href={item.joinedSnapshot.gatewayUrl} target="_blank" rel="noreferrer">Snapshot JSON <ExternalLink size={13} /></a></div></div></article>;
      })}</div>}
      <section className="account-preference"><div><h2>Early Access email</h2><p>Store your preference for future project updates. EGOG does not send newsletters in this MVP.</p></div><label className="preference-toggle"><input checked={emailOptIn} disabled={savingPreference} onChange={(event) => void changeEmailPreference(event.target.checked)} type="checkbox" /><span>{savingPreference ? "Saving…" : emailOptIn ? "Updates enabled" : "Updates disabled"}</span></label></section>
      <section className="account-danger"><div><h2>Delete account</h2><p>Off-chain personal data and your Privy connection will be removed. Public blockchain records and badges remain permanently visible.</p></div><button onClick={() => setDeleteDialogOpen(true)} type="button"><Trash2 size={16} /> Delete account</button></section>
      <DeleteAccountDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen} />
    </div>
  );
}
