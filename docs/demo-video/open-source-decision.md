# EGOG demo video open-source decision

Reviewed: 2026-07-13.

| Tool | License / status | Decision | Reason |
| --- | --- | --- | --- |
| Remotion 4.0.489 | Custom Remotion license | Keep as the rendering baseline, subject to entity eligibility | Existing source and render pipeline already use it; official Agent Skill guides implementation |
| Playwright | Existing project dependency | Keep | Deterministic Production capture and evidence |
| FFmpeg / ffprobe | Existing local tooling | Keep | Render inspection, contact sheet, and delivery QC |
| `demo-video-creation-skill` | MIT workflow skill | Keep for storyboard and QC procedure | No client-specific assets or claims are reused |
| Testreel | MIT, small project | Do not integrate into the final pipeline now | Useful cursor/zoom/auth features, but a new dependency creates avoidable capture risk for Google OAuth and Privy signing |
| Screenity | GPL-3.0 | Do not copy or integrate code | Click-ring ideas may be recreated independently in Remotion; GPL source is not imported |
| browser-use | Not needed | Do not add | Playwright is more deterministic for submission evidence |
| Motion Canvas / Manim | Not needed | Do not add | Duplicates the existing Remotion pipeline |

## Remotion license gate

The installed package is Remotion `4.0.489` and declares `SEE LICENSE IN
LICENSE.md`. The current upstream license states that individuals, non-profit
entities, and for-profit organizations with up to three employees are eligible
for the Free License; other for-profit organizations require a Company License.

On 2026-07-13, the product owner confirmed that EGOG's relevant for-profit
legal entity has no more than three employees. The current demo-video render is
therefore eligible for Remotion's Free License under the reviewed upstream
terms. This eligibility must be reviewed again if the entity's employee count
or Remotion's license terms change.

No Testreel or Screenity dependency has been added in this revision.
