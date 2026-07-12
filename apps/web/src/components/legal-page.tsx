import { AppHeader } from "./app-header";
import { SiteFooter } from "./site-footer";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return <><AppHeader /><main className="legal-page"><p className="eyebrow">EGOG MVP</p><h1>{title}</h1><p className="legal-updated">Last updated: {updated}</p><div>{children}</div></main><SiteFooter /></>;
}
