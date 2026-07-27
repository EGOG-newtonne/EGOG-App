"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, Expand, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { FieldEvidenceSnapshot } from "@egog/shared";

type EvidenceMedia = FieldEvidenceSnapshot["media"][number];

function localEvidencePath(media: EvidenceMedia) {
  return `/images/jeju-erw/${media.id}.jpg`;
}

function EvidenceImage({
  alt,
  media,
  sizes,
}: {
  alt: string;
  media: EvidenceMedia;
  sizes: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="evidence-image-error" role="status">
        Image unavailable. The evidence record remains available from its public IPFS link.
      </span>
    );
  }
  return (
    <Image
      alt={alt}
      fill
      onError={() => setFailed(true)}
      sizes={sizes}
      src={localEvidencePath(media)}
    />
  );
}

export function EvidenceGallery({
  description,
  media,
  title,
}: {
  description: string;
  media: EvidenceMedia[];
  title: string;
}) {
  return (
    <section className="content-card evidence-section">
      <div className="card-heading evidence-heading">
        <div>
          <p className="eyebrow">Published evidence</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span>{media.length} images</span>
      </div>
      <ul className="evidence-grid">
        {media.map((item) => (
          <li key={item.id}>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button
                  aria-label={`Open ${item.title}`}
                  className="evidence-thumbnail"
                  type="button"
                >
                  <span className="evidence-thumbnail-image">
                    <EvidenceImage
                      alt={item.description}
                      media={item}
                      sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                    />
                  </span>
                  <span className="evidence-thumbnail-copy">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <Expand aria-hidden="true" className="evidence-expand" size={18} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="evidence-dialog-overlay" />
                <Dialog.Content
                  aria-describedby={`${item.id}-description`}
                  className="evidence-dialog-content"
                >
                  <div className="evidence-dialog-heading">
                    <div>
                      <Dialog.Title>{item.title}</Dialog.Title>
                      <Dialog.Description id={`${item.id}-description`}>
                        {item.description}
                      </Dialog.Description>
                    </div>
                    <Dialog.Close aria-label="Close image viewer" className="evidence-dialog-close">
                      <X aria-hidden="true" size={20} />
                    </Dialog.Close>
                  </div>
                  <div className="evidence-dialog-image">
                    <EvidenceImage
                      alt={item.description}
                      media={item}
                      sizes="calc(100vw - 64px)"
                    />
                  </div>
                  <div className="evidence-dialog-meta">
                    <span>
                      Captured {new Date(item.capturedAt).toLocaleString("en-GB", {
                        timeZone: "UTC",
                      })}{" "}
                      UTC · timestamp from {item.timestampBasis}
                    </span>
                    <a href={item.gatewayUrl} rel="noreferrer" target="_blank">
                      View public IPFS file <ExternalLink aria-hidden="true" size={14} />
                    </a>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </li>
        ))}
      </ul>
    </section>
  );
}
