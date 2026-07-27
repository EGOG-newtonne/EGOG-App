import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  ProjectDetailNavigation,
  resolveProjectDetailView,
} from "./project-detail-navigation";

describe("resolveProjectDetailView", () => {
  it("uses overview and field as the safe defaults", () => {
    expect(resolveProjectDetailView({})).toEqual({
      tab: "overview",
      evidenceType: "field",
    });
    expect(resolveProjectDetailView({ tab: "unknown", type: "unknown" })).toEqual({
      tab: "overview",
      evidenceType: "field",
    });
  });

  it("rejects array query values instead of selecting one of them", () => {
    expect(resolveProjectDetailView({
      tab: ["gallery"],
      type: ["sensor"],
    })).toEqual({
      tab: "overview",
      evidenceType: "field",
    });
  });

  it("restores a directly linked gallery selection", () => {
    expect(resolveProjectDetailView({
      tab: "gallery",
      type: "sensor",
    })).toEqual({
      tab: "gallery",
      evidenceType: "sensor",
    });
  });
});

describe("ProjectDetailNavigation", () => {
  afterEach(cleanup);

  it("exposes URL navigation and the selected overview state", () => {
    render(
      <ProjectDetailNavigation
        evidenceType="field"
        projectSlug="jeju-erw"
        tab="overview"
      />,
    );

    expect(screen.getByRole("link", { name: "Overview" }).getAttribute("aria-current"))
      .toBe("page");
    expect(screen.getByRole("link", { name: "Gallery" }).getAttribute("href"))
      .toBe("/projects/jeju-erw?tab=gallery&type=field");
    expect(screen.queryByRole("navigation", { name: "Evidence gallery categories" }))
      .toBeNull();
  });

  it("shows only the selected gallery category as current", () => {
    render(
      <ProjectDetailNavigation
        evidenceType="sensor"
        projectSlug="jeju-erw"
        tab="gallery"
      />,
    );

    expect(screen.getByRole("link", { name: "Gallery" }).getAttribute("aria-current"))
      .toBe("page");
    expect(screen.getByRole("link", { name: "Field" }).hasAttribute("aria-current"))
      .toBe(false);
    expect(screen.getByRole("link", { name: "Sensor" }).getAttribute("aria-current"))
      .toBe("page");
  });
});
