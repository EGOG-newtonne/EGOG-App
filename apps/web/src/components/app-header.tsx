"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import Link from "next/link";

import { findPrivyEmbeddedWallet, shortenAddress } from "../features/auth/wallet";

export function AppHeader() {
  const { authenticated, login, logout, ready } = usePrivy();
  const { wallets } = useWallets();
  const wallet = findPrivyEmbeddedWallet(wallets);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" href="/" aria-label="EGOG home">
          EGOG
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/">Projects</Link>
          {authenticated ? <Link href="/me">My participation</Link> : null}
        </nav>
        <button
          className="header-account"
          disabled={!ready}
          onClick={() => (authenticated ? logout() : login({ loginMethods: ["google"] }))}
          type="button"
        >
          {authenticated && wallet ? shortenAddress(wallet.address) : "Sign in with Google"}
        </button>
      </div>
    </header>
  );
}
