# Day 5 Design – Milestone Scheduling & Advisor Workflow

## Goals
- Enforce milestone sequencing and scheduling windows outlined in the final documentation.
- Provide coordinator-facing APIs to set milestone windows and deadlines.
- Ensure advisor assignment and approvals are tracked for every stage.
- Prepare migration steps to align existing data.

## Requirements Mapping
- FR2, FR9, FR11–FR13: coordinators schedule synopsis/proposal windows, track deadlines, and provide status dashboards.
- UC4, UC11, UC12: advisor assignment capacity and defense scheduling must be included.
- UC15/UC16: researchers/advisors view pending tasks based on milestones and windows.

## Data Model Updates
- `Milestone` (current fields: `sequence`, `window_start`, `window_end`, `due_at`, `status`, `approved_by`).
  - Add `assignment_required` (boolean) to mark stages needing advisor link (default true except registration).
  - Add `reviewer_roles` array to store which roles may approve a given milestone.
- `Project`
  - Track `advisor_assigned_at`, `coordinator_notes` to support scheduling history.

## API Additions
- `PUT /projects/{id}/milestones/{type}/schedule`
  - Coordinator/Admin only.
  - Body: `{ window_start?, window_end?, due_at?, notes? }`.
  - Updates scheduling fields on the milestone and logs the change.
- `GET /projects/{id}/milestones`
  - Returns all milestones with scheduling metadata for the project.
- `POST /projects/{id}/advisor`
  - Existing endpoint extended to accept optional `coordinator_notes` and return updated milestone map.
- `GET /milestones/pending`
  - For coordinator dashboards; filter milestones by status and upcoming deadlines.

## Business Rules
- Coordinator can only set `window_start` = `window_end` and both within the semester.
- Lock future milestones until previous stage transitions to `approved` or required status (already enforced in Day 4 code; ensure scheduling respects this).
- Advisor assignment must exist before any milestone with `assignment_required = true` can be approved.
- Defense scheduling must update both `Schedule` document and the corresponding milestone windows.

## Migration Plan
1. Script `migrate-milestones.mjs` to:
   - Populate `sequence`, `assignment_required`, `reviewer_roles` defaults.
   - For projects lacking certain milestones, create placeholders (`thesis_postdefense`, `journal`).
   - Set `project.current_stage` based on latest approved milestone.
2. Backfill existing defense schedules to milestone `window_start`/`window_end`.

## Testing Strategy
- Unit tests for `milestonesService` to validate scheduling updates and advisor requirement logic.
- Integration tests covering coordinator scheduling endpoint and unauthorized access.
- Manual Swagger walkthrough (researcher submit ? coordinator adjusts windows ? advisor approves).

## Next Steps (Day 6 Implementation)
- Implement `PUT /projects/{id}/milestones/{type}/schedule` and `GET /projects/{id}/milestones`.
- Extend advisor assignment and milestone responses with scheduling metadata.
- Wire defense scheduling to update milestone windows (already partially done; finalize logic and validation).
- Update Swagger contracts and add example request/response bodies.
