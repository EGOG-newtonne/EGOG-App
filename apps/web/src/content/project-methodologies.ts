export type ProjectMethodology = {
  label: string;
  name: string;
  url: string;
};

const projectMethodologies: Record<string, ProjectMethodology> = {
  "jeju-erw": {
    label: "Isometric · Enhanced Weathering in Agriculture",
    name: "Isometric Enhanced Weathering in Agriculture",
    url: "https://isometric.dev/protocol/enhanced-weathering-agriculture",
  },
  "solar-mobility": {
    label: "Verra VM0038 · EV Charging Systems",
    name: "Verra VM0038 Methodology for Electric Vehicle Charging Systems",
    url: "https://verra.org/methodologies/vm0038-methodology-for-electric-vehicle-charging-systems-v1-0/",
  },
  "vietnam-brick": {
    label: "UNFCCC CDM AMS-III.Z · Brick Manufacturing",
    name: "UNFCCC CDM AMS-III.Z Brick Manufacturing Methodology",
    url: "https://cdm.unfccc.int/methodologies/DB/VLZZ1DVT1QI3KHZKSM6QECOAKNSCXZ",
  },
};

export function projectMethodology(slug: string) {
  return projectMethodologies[slug] ?? null;
}
