# EGOG Production UI Dogfood Results

Status values: `PASS`, `PARTIAL`, `FAIL`, `NOT RUN`.

## Environment matrix

| Environment | Device method | Viewport | Status | Evidence |
| --- | --- | --- | --- | --- |
| Desktop Chrome | Local browser | 1366x768 | NOT RUN | Pending Account Menu deployment |
| Desktop Chrome | Local browser | 1920x1080 | NOT RUN | Pending Account Menu deployment |
| Desktop Edge | Pending decision | 1366x768 | NOT RUN | Pending environment |
| iPhone Safari | Pending decision | 390x844 | NOT RUN | Pending environment |
| Android Chrome | Pending decision | 390x844 | NOT RUN | Pending environment |

## Scenario results

| ID | Status | Executed at | Environment | Actual result | Evidence / limitation |
| --- | --- | --- | --- | --- | --- |
| E2E-01 | NOT RUN | — | — | — | — |
| E2E-02 | NOT RUN | — | — | — | — |
| E2E-03 | NOT RUN | — | — | — | — |
| E2E-04 | PARTIAL | 2026-07-13 | Local jsdom | Trigger opens the Radix menu without calling `logout()`; toggle, outside click, Escape, Tab, and Shift+Tab close only the menu. | Automated regression passes; Production deployment evidence is still required. |
| E2E-05 | PARTIAL | 2026-07-13 | Local jsdom | Only the explicit `Sign out` menu item calls `logout()`. | Automated regression passes; Production deployment evidence is still required. |
| E2E-06 | NOT RUN | — | — | — | — |
| E2E-07 | NOT RUN | — | — | — | — |
| E2E-08 | NOT RUN | — | — | — | — |
| E2E-09 | NOT RUN | — | — | — | — |
| E2E-10 | NOT RUN | — | — | — | — |
| E2E-11 | NOT RUN | — | — | — | — |
| E2E-12 | NOT RUN | — | — | — | — |
| E2E-13 | NOT RUN | — | — | — | — |
| E2E-14 | NOT RUN | — | — | — | — |
| E2E-15 | NOT RUN | — | — | — | Disposable account is prepared; final deletion requires action-time approval. |
| E2E-16 | NOT RUN | — | — | — | — |
| E2E-17 | NOT RUN | — | — | — | — |
| E2E-18 | PARTIAL | 2026-07-13 | Local component test and CSS inspection | Portal uses collision padding; menu and AlertDialog widths are constrained to the viewport. | A real 390x844 Production interaction capture is still required. |
| E2E-19 | NOT RUN | — | — | — | — |
| E2E-20 | NOT RUN | — | — | — | — |

Do not change a row to `PASS` until the evidence proves the full named scenario in the stated environment.
