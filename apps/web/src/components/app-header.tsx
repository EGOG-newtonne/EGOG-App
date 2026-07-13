"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useRef, useState } from "react";

import { findPrivyEmbeddedWallet, shortenAddress } from "../features/auth/wallet";

const pageControlSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function findAdjacentPageControl(trigger: HTMLElement, backwards: boolean) {
  const controls = Array.from(
    document.querySelectorAll<HTMLElement>(pageControlSelector),
  ).filter(
    (control) =>
      !control.closest('[role="menu"]') &&
      !control.closest("[hidden]") &&
      !control.hasAttribute("data-radix-focus-guard"),
  );
  const triggerIndex = controls.indexOf(trigger);

  if (triggerIndex === -1) {
    return trigger;
  }

  return controls[triggerIndex + (backwards ? -1 : 1)] ?? trigger;
}

export function AppHeader() {
  const { authenticated, login, logout, ready } = usePrivy();
  const { wallets } = useWallets();
  const wallet = findPrivyEmbeddedWallet(wallets);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const tabFocusTargetRef = useRef<HTMLElement | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

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
        {authenticated && wallet ? (
          <DropdownMenu.Root
            onOpenChange={setAccountMenuOpen}
            open={accountMenuOpen}
          >
            <DropdownMenu.Trigger asChild>
              <button
                aria-label={`Account menu for ${shortenAddress(wallet.address)}`}
                className="header-account"
                disabled={!ready}
                ref={accountTriggerRef}
                type="button"
              >
                {shortenAddress(wallet.address)}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="account-menu-content"
                collisionPadding={12}
                onCloseAutoFocus={(event) => {
                  const tabFocusTarget = tabFocusTargetRef.current;

                  if (!tabFocusTarget) {
                    return;
                  }

                  event.preventDefault();
                  tabFocusTargetRef.current = null;
                  tabFocusTarget.focus();
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Tab" || !accountTriggerRef.current) {
                    return;
                  }

                  event.preventDefault();
                  tabFocusTargetRef.current = findAdjacentPageControl(
                    accountTriggerRef.current,
                    event.shiftKey,
                  );
                  setAccountMenuOpen(false);
                }}
                sideOffset={8}
              >
                <DropdownMenu.Label className="account-menu-label">
                  Wallet address
                </DropdownMenu.Label>
                <code className="account-menu-wallet">{wallet.address}</code>
                <DropdownMenu.Separator className="account-menu-separator" />
                <DropdownMenu.Item asChild>
                  <Link className="account-menu-item" href="/me">
                    My Participation
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link className="account-menu-item" href="/privacy">
                    Privacy
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link className="account-menu-item" href="/terms">
                    Terms
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="account-menu-separator" />
                <DropdownMenu.Item
                  className="account-menu-item account-menu-item-danger"
                  onSelect={() => void logout()}
                >
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <button
            className="header-account"
            disabled={!ready}
            onClick={() => login({ loginMethods: ["google"] })}
            type="button"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
}
