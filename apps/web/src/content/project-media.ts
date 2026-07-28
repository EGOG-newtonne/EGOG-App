export type ProjectPhoto = {
  id: string;
  path: string;
  title: string;
  description: string;
};

const projectHeroImages: Record<string, string> = {
  "vietnam-brick": "/images/vietnam-brick/production-line.jpg",
  "solar-mobility": "/images/solar-mobility/solar-container-array.jpg",
};

const projectPhotoGalleries: Record<string, ProjectPhoto[]> = {
  "vietnam-brick": [
    {
      id: "production-line",
      path: "/images/vietnam-brick/production-line.jpg",
      title: "Brick production line",
      description: "A wide view of the operating brick-production equipment inside the facility.",
    },
    {
      id: "fresh-bricks-conveyor",
      path: "/images/vietnam-brick/fresh-bricks-conveyor.jpg",
      title: "Fresh bricks leaving the press",
      description: "Newly formed bricks move from the production equipment for drying and handling.",
    },
    {
      id: "kiln-and-chimney",
      path: "/images/vietnam-brick/kiln-and-chimney.jpg",
      title: "Kiln facility and chimney",
      description: "Exterior view of the brick facility, kiln area, and chimney infrastructure.",
    },
    {
      id: "brick-loading",
      path: "/images/vietnam-brick/brick-loading.jpg",
      title: "Brick loading operation",
      description: "Workers load finished bricks for movement from the production site.",
    },
    {
      id: "brick-storage-yard",
      path: "/images/vietnam-brick/brick-storage-yard.jpg",
      title: "Brick storage yard",
      description: "Finished bricks are stacked in organized groups at the facility.",
    },
    {
      id: "brick-inventory-bays",
      path: "/images/vietnam-brick/brick-inventory-bays.jpg",
      title: "Inventory bays",
      description: "Packaged brick inventory stored across covered production bays.",
    },
    {
      id: "finished-brick-inventory",
      path: "/images/vietnam-brick/finished-brick-inventory.jpg",
      title: "Finished brick inventory",
      description: "Large quantities of finished bricks arranged for storage and distribution.",
    },
    {
      id: "production-floor-storage",
      path: "/images/vietnam-brick/production-floor-storage.jpg",
      title: "Production-floor storage",
      description: "Stored bricks and facility materials inside the covered production area.",
    },
    {
      id: "packed-brick-stacks",
      path: "/images/vietnam-brick/packed-brick-stacks.jpg",
      title: "Packed brick stacks",
      description: "Finished brick bundles prepared in the facility's covered storage area.",
    },
  ],
};

export function projectHeroImage(slug: string, storedImage: string) {
  return projectHeroImages[slug] ?? storedImage;
}

export function projectPhotoGallery(slug: string) {
  return projectPhotoGalleries[slug] ?? [];
}
