# Jeju ERW Detail Tabs — Production Verification

- Verified at: 2026-07-27 13:56 KST
- Production URL: `https://egog-app-web.vercel.app`
- Commit: `c71af2d980ece1bca076a6edd037a88d24c77206`
- Vercel deployment: `dpl_FHgQ92X5MkEBPgNrpvWhz1y5Lx29`
- Browser: Google Chrome via Playwright
- Desktop viewport: `1440×1000`
- Mobile viewport: `390×844`

## Result

| Check | Result | Evidence |
| --- | --- | --- |
| Jeju Overview is the default | PASS | `desktop-overview.png`, `mobile-overview.png` |
| Overview shows Hero, KPI, Timeline, Source, and On-chain status | PASS | `desktop-overview.png`, `mobile-overview.png` |
| Overview omits gallery headings and gallery images | PASS | Captured request audit contains only `jeju-field-site.jpg` |
| Field deep link renders only the four field evidence items | PASS | `desktop-gallery-field.png`, captured request audit |
| Sensor deep link renders only the four sensor evidence items | PASS | `mobile-gallery-sensor.png`, captured request audit |
| Invalid `tab` falls back to Overview | PASS | Production HTTP smoke test |
| Invalid `type` falls back to Field | PASS | Production HTTP smoke test |
| Mobile navigation uses two rows without horizontal overflow | PASS | `mobile-overview.png`, `mobile-gallery-sensor.png` |
| Mobile participation CTA does not overlap content | PASS | `mobile-overview.png`, `mobile-gallery-sensor.png` |
| Vietnam Brick does not receive Jeju tabs | PASS | Production HTTP smoke test |
| Jeju project API | PASS | `GET /api/projects/jeju-erw` returned HTTP 200 |

## Network Isolation

The Playwright network capture confirmed that the inactive evidence category is not requested. Only the resulting public image-request list is retained below; raw HAR files were removed because browser-generated Cookie headers are not repository-safe QA artifacts.

- Overview: `jeju-field-site.jpg` only.
- Field Gallery: `jeju-field-site.jpg`, `field-monitoring-crop-rows.jpg`, `subsurface-soil-probes.jpg`, `weather-monitoring-station.jpg`.
- Sensor Gallery: `jeju-field-site.jpg`, `weekly-solar-air-dashboard.jpg`, `treatment-area-sensor-map.jpg`, `multi-port-telemetry.jpg`, `weekly-water-ec-trends.jpg`.

The Hero is shared page content and remains loaded in all states. Gallery requests are restricted to the selected category.

## Automated Checks

- ESLint: PASS
- Vitest: PASS — 29 files, 101 tests
- Typecheck: PASS — 5 packages
- Production build: PASS
- Vercel production build: PASS
- Production page/API smoke test: PASS

The first parallel typecheck attempt raced with `next build` while `.next/types` was being regenerated. Typecheck was immediately rerun after the build and passed for all five packages.

## `verify:demo`

Status: PARTIAL

The official `vercel env run` path did not provide the production `DATABASE_URL` to the process. A temporary Production env pull was then tested with file permissions restricted to `600` and deleted immediately, but the CLI-provided database variables were non-URL placeholders. No value was printed or persisted. Because the runtime Production deployment continues to serve the Jeju page and project API successfully, this is recorded as a local Vercel CLI secret-delivery limitation rather than a page regression. No Production environment variable was modified.
