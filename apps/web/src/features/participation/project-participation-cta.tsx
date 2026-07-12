"use client";

import { usePrivy } from "@privy-io/react-auth";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ProjectParticipationCta({ projectSlug }: { projectSlug: string }) {
  const { authenticated, getAccessToken, ready } = usePrivy();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!ready || !authenticated) return;
    void getAccessToken().then(async (token) => {
      if (!token) return;
      const response = await fetch("/api/me/participations", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const rows = await response.json() as Array<{ project: { slug: string } }>;
      setJoined(rows.some((row) => row.project.slug === projectSlug));
    });
  }, [authenticated, getAccessToken, projectSlug, ready]);

  if (joined) {
    return <Link className="primary-cta" href="/me"><Check size={18} /> Joined · View Badge</Link>;
  }
  return <Link className="primary-cta" href={`/participate/${projectSlug}`}>Support &amp; Join Early Access <ArrowRight size={18} /></Link>;
}
