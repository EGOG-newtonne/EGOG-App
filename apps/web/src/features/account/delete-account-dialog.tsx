"use client";

import { usePrivy } from "@privy-io/react-auth";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteAccountDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function DeleteAccountDialog({ onOpenChange, open }: DeleteAccountDialogProps) {
  const { getAccessToken, logout } = usePrivy();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen && !deleting) setDeleteError(null);
    onOpenChange(nextOpen);
  }

  async function deleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Missing access token");
      const response = await fetch("/api/me", {
        headers: { authorization: `Bearer ${token}` },
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Account deletion failed");
      await logout();
      setDeleting(false);
      onOpenChange(false);
      router.replace("/");
    } catch (caught) {
      setDeleteError(caught instanceof Error ? caught.message : "Account deletion failed");
      setDeleting(false);
    }
  }

  return (
    <AlertDialog.Root onOpenChange={changeOpen} open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="account-dialog-overlay" />
        <AlertDialog.Content className="account-dialog-content">
          <AlertDialog.Title className="account-dialog-title">
            Delete your EGOG account?
          </AlertDialog.Title>
          <AlertDialog.Description className="account-dialog-description">
            Your off-chain personal data and Privy account connection will be removed. Your public on-chain wallet address, participation record, and Badge cannot be deleted, and you may lose access to this embedded wallet.
          </AlertDialog.Description>
          {deleteError ? (
            <p className="account-dialog-error" role="alert">
              {deleteError}
            </p>
          ) : null}
          <div className="account-dialog-actions">
            <AlertDialog.Cancel className="account-dialog-cancel" disabled={deleting}>
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className="account-dialog-delete"
                disabled={deleting}
                onClick={(event) => {
                  event.preventDefault();
                  void deleteAccount();
                }}
                type="button"
              >
                {deleting ? "Deleting…" : "Delete account"}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
