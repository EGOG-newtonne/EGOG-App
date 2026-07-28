import type { Metadata } from "next";

import { LegalPage } from "../../components/legal-page";

export const metadata: Metadata = {
  alternates: {
    canonical: "/privacy",
  },
  title: "Privacy Policy | EGOG",
};

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="July 12, 2026">
    <h2>Information we process</h2><p>EGOG processes your Google-linked email address, Privy user ID, embedded wallet address, consent choices, and participation request status.</p>
    <h2>Why we use it</h2><p>We use this information to authenticate you, provision an embedded wallet, manage optional project-update consent, prevent duplicate participation, submit your signed request, and show your participation dashboard.</p>
    <h2>Service providers</h2><p>The MVP uses Privy for authentication and wallet provisioning, Supabase for PostgreSQL storage, Vercel for hosting, Pinata for public IPFS files, AWS S3 for backup storage, and GIWA Testnet for public blockchain records.</p>
    <h2>Public blockchain records</h2><p>Your wallet address and participation record are public and cannot be deleted from GIWA Testnet. Do not participate if you do not want that address publicly associated with the record.</p>
    <h2>Deletion</h2><p>You may delete your service account from My Page. EGOG deletes or anonymizes off-chain personal data and requests deletion of the Privy user connection. You may permanently lose access to the embedded wallet. Existing blockchain records remain.</p>
    <h2>Contact and legal review</h2><p>This policy supports a demonstration MVP and must be reviewed by qualified counsel before production use.</p>
  </LegalPage>;
}
