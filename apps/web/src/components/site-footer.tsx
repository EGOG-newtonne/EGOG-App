import { AppLink } from "./app-link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <span>EGOG · Verified Climate Participation</span>
        <nav aria-label="Legal">
          <AppLink href="/privacy">Privacy</AppLink>
          <AppLink href="/terms">Terms</AppLink>
        </nav>
      </div>
    </footer>
  );
}
