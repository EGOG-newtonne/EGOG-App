import type { Metadata } from "next";

import { LegalPage } from "../../components/legal-page";

export const metadata: Metadata = {
  alternates: {
    canonical: "/terms",
  },
  title: "Terms of Participation | EGOG",
};

export default function TermsPage() {
  return <LegalPage title="Terms of Participation" updated="July 12, 2026">
    <h2>Demonstration service</h2><p>EGOG is a testnet MVP. Vietnam Brick figures are fictional demonstration data and are not verified reductions or issued carbon credits.</p>
    <h2>What participation means</h2><p>Participation records your support and interest in possible future updates, beta programs, or community access. Those opportunities are not guaranteed.</p>
    <h2>No financial or carbon rights</h2><p>The Participation Badge is not an investment, security, payment instrument, claim on financial returns, carbon credit, or right to acquire a carbon credit.</p>
    <h2>Permanent badge</h2><p>The ERC-721 badge is locked under ERC-5192 and cannot be transferred, sold, approved, burned, or deleted through EGOG. The blockchain transaction remains public.</p>
    <h2>Data integrity</h2><p>EGOG records the hash, version, and public IPFS URI of the Snapshot you reviewed. This proves which JSON was referenced; it does not prove that demonstration figures are true or Newtonne-approved.</p>
    <h2>MVP limitation</h2><p>This text is an operational MVP notice and requires legal review before any production launch.</p>
  </LegalPage>;
}
