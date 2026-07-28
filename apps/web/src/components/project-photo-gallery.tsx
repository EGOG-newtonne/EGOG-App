"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Expand, X } from "lucide-react";
import Image from "next/image";

import type { ProjectPhoto } from "../content/project-media";

export function ProjectPhotoGallery({
  photos,
  title,
}: {
  photos: ProjectPhoto[];
  title: string;
}) {
  return (
    <section className="content-card evidence-section">
      <div className="card-heading evidence-heading">
        <div>
          <p className="eyebrow">Project photography</p>
          <h2>{title}</h2>
          <p>Original project-site photography supplied for the EGOG project preview.</p>
        </div>
        <span>{photos.length} images</span>
      </div>
      <ul className="evidence-grid">
        {photos.map((photo) => (
          <li key={photo.id}>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button
                  aria-label={`Open ${photo.title}`}
                  className="evidence-thumbnail"
                  type="button"
                >
                  <span className="evidence-thumbnail-image">
                    <Image
                      alt={photo.description}
                      fill
                      sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                      src={photo.path}
                    />
                  </span>
                  <span className="evidence-thumbnail-copy">
                    <strong>{photo.title}</strong>
                    <small>{photo.description}</small>
                  </span>
                  <Expand aria-hidden="true" className="evidence-expand" size={18} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="evidence-dialog-overlay" />
                <Dialog.Content
                  aria-describedby={`${photo.id}-description`}
                  className="evidence-dialog-content"
                >
                  <div className="evidence-dialog-heading">
                    <div>
                      <Dialog.Title>{photo.title}</Dialog.Title>
                      <Dialog.Description id={`${photo.id}-description`}>
                        {photo.description}
                      </Dialog.Description>
                    </div>
                    <Dialog.Close aria-label="Close image viewer" className="evidence-dialog-close">
                      <X aria-hidden="true" size={20} />
                    </Dialog.Close>
                  </div>
                  <div className="evidence-dialog-image">
                    <Image
                      alt={photo.description}
                      fill
                      sizes="calc(100vw - 64px)"
                      src={photo.path}
                    />
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
