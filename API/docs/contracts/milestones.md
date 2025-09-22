# Milestone Lifecycle Contract

## Types
- `registration`
- `synopsis`
- `proposal`
- `progress1`
- `progress2`
- `thesis_precheck`
- `thesis_postdefense`
- `defense`
- `journal`

Each milestone stores:
- `sequence`: numeric ordering hint (10..90)
- `window_start` / `window_end`: optional scheduling window for coordinators
- `due_at`: submission due date
- `status`: `draft` ? `submitted` ? `under_review` ? `approved/changes_requested` ? `scheduled` (defense) ? `graded`
- `submitted_at`: timestamp of most recent submission
- `approved_by`: user id of the reviewer who approved the milestone

## Transition Rules
- Only Researchers can move `draft ? submitted`.
- Advisors/Coordinators/Examiners can set `submitted ? under_review`.
- Advisors/Examiners can set `under_review ? approved/changes_requested`.
- Only Coordinators can schedule defenses (`defense` milestone `approved ? scheduled`).
- Examiners/Coordinators record grades for defense (`scheduled ? graded`).

## Submission Eligibility
Submissions are accepted only for:
`['synopsis','proposal','progress1','progress2','thesis_precheck','thesis_postdefense','journal']`
when the milestone status is `draft` or `changes_requested`.

## API Notes
- `POST /milestones` accepts `projectId`, `type`, optional `due_at`.
- `GET /milestones` returns sorted list (sequence, due date).
- `POST /milestones/{id}/transition` enforces transitions using the rules above.
- `POST /submissions` validates milestone type/status before accepting files.

## Migration Outline
Run `node scripts/migrate-milestones.mjs` after reviewing the TODOs to convert legacy `progress`/`thesis` data.
\n## Sequencing Rules\n- proposal submissions require the synopsis milestone to be approved.\n- progress1 requires proposal approval; progress2 requires progress1 approval.\n- thesis_precheck requires progress2 approval.\n- defense requires thesis_precheck approval and is scheduled by the coordinator.\n- thesis_postdefense submissions require the defense milestone to be graded.\n- journal submissions require thesis_postdefense approval.\n\n## Advisor Requirement\n- All milestones beyond registration must have an assigned advisor before they can be approved.\n\n
