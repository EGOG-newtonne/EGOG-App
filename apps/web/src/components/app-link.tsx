"use client";

import Link, {
  useLinkStatus,
  type LinkProps,
} from "next/link";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type AppLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
  };

function NavigationPendingIndicator() {
  const { pending } = useLinkStatus();

  if (!pending || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <span aria-hidden="true" className="route-progress-indicator" />
      <span className="sr-only" role="status">
        Loading page…
      </span>
    </>,
    document.body,
  );
}

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  function AppLink({ children, ...props }, ref) {
    return (
      <Link {...props} ref={ref}>
        {children}
        <NavigationPendingIndicator />
      </Link>
    );
  },
);
