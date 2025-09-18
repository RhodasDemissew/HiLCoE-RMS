# Backend Roadmap - Weeks 1-2

## Purpose
Create a focused 14-day backend plan that aligns with the Senior Project final documentation, keeps APIs ready for concurrent frontend work, and tracks coverage of each functional requirement (FR) and use case (UC).

## Scope & Assumptions
- Backend only; frontend team consumes documented endpoints.
- MongoDB Atlas is the shared datastore (`MONGO_URI`).
- .env distribution handled via `.env.example` (no secrets committed).
- Existing services remain functional during iterations; migrations must be backward-compatible where possible.

## Day 1 Outcomes
1. Confirmed backlog derived from FR1-FR21 and UC1-UC20.
2. Tagged tasks as `backend`, `frontend`, or `shared` to coordinate parallel work.
3. Established target completion day per task to support daily standups.

## Feature Coverage Snapshot
| Requirement | Backend Status | Notes |
|-------------|----------------|-------|
| FR1 (Researcher registration) | MISSING | Needs self-registration plus ID verification workflow.
| FR2 (Schedule synopsis dates) | PARTIAL | Need coordinator scheduling endpoints and calendar data model.
| FR3-FR7 (Submission/review/feedback) | OK | Routes: `/submissions`, `/reviews`, milestone transitions.
| FR8 (Advisor assignment limit <=10) | OK | Enforced in `projectsService.assignAdvisor`.
| FR9 (Automated notifications) | PARTIAL | Event-triggered only; need deadline reminder scheduler.
| FR10 (Template downloads) | OK | `/templates` list/create endpoints.
| FR11-FR12 (Progress dashboards) | MISSING | Require role-specific aggregate endpoints.
| FR13 (Extension requests) | OK | `/extensions` routes in place.
| FR14-FR15 (Formatting and plagiarism checks) | PARTIAL | Stub verification jobs exist; need real scoring and reporting turnaround.
| FR16-FR18 (Examiners and grades) | PARTIAL | Assignment and grading exist; enforce due dates and registrar export.
| FR19-FR20 (Analytics downloads) | PARTIAL | Basic reports exist; expand filters and export formats.
| FR21 (Admin user/role management) | PARTIAL | CRUD exists via generic routes; refine workflows and validations.

Legend: OK = requirement satisfied, PARTIAL = enhancement needed, MISSING = not yet implemented.

## 14-Day Backend Backlog
| Day | Theme | Tasks (Backend) | FE Dependency |
|-----|-------|-----------------|---------------|
| 1 | Planning | Finalize backlog, tag tasks, share plan (this document) | N/A |
| 2 | Auth design | Update data model plan for self-registration and reset; draft endpoint specs | Yes - specs shared |
| 3 | Auth build | Implement `/auth/register`, `/auth/reset/request`, `/auth/reset/confirm`; unit tests | Yes |
| 4 | Auth QA | Manual and automated tests; docs for onboarding; polish error responses | Yes |
| 5 | Milestone schema | Design expanded milestone stages and migration strategy | Yes |
| 6 | Milestone build | Implement schema updates, transitions, notifications | Yes |
| 7 | Milestone QA | Seed data plus regression suite across submissions | Yes |
| 8 | Dashboards design | Define aggregation outputs (researcher/advisor/coordinator) | Yes |
| 9 | Dashboards build | Implement `/dashboards/*` APIs plus caching | Yes |
| 10 | Automation | Add scheduler for reminders, verification retries | Minimal |
| 11 | Defense/Grades | Enforce examiner due dates, registrar export endpoint | Yes |
| 12 | Ops/NFRs | Backup script, health checks, logging review | Minimal |
| 13 | QA Sweep | Smoke tests, fix bugs, prepare release notes | Yes |
| 14 | Buffer/Polish | Performance tuning, doc cleanup, next sprint prep | Minimal |

## Detailed Task Queue
| ID | Task | Requirement Link | Owner | Status | Target |
|----|------|------------------|-------|--------|--------|
| T1 | Add researcher self-registration and activation mapping | FR1, UC1 | Backend | Todo | Day 3 |
| T2 | Implement password reset flow | UC2 | Backend | Todo | Day 3 |
| T3 | Create coordinator scheduling endpoints (`/milestones/schedule`) | FR2 | Backend | Todo | Day 6 |
| T4 | Expand milestone types (progress1, progress2, thesis_precheck, thesis_postdefense) | UC7-UC13 | Backend | Todo | Day 6 |
| T5 | Provide milestone aggregation endpoints per role | FR11-FR12, UC15 | Backend | Todo | Day 9 |
| T6 | Build notification scheduler for upcoming deadlines | FR9, UC19 | Backend | Todo | Day 10 |
| T7 | Enhance verification jobs with actual scoring integration hooks | FR14-FR15 | Backend | Todo | Day 10 |
| T8 | Enforce examiner review deadlines and auto reminders | UC12, UC20 | Backend | Todo | Day 11 |
| T9 | Registrar export (`/defense/grades/export`) | FR18 | Backend | Todo | Day 11 |
| T10 | Strengthen admin management APIs (status toggles, search) | FR21 | Backend | Todo | Day 12 |
| T11 | Document backup and recovery runbook | NFR9 | Backend | Todo | Day 12 |
| T12 | Add `/healthz` plus enhanced logging configuration | NFR10, NFR8 | Backend | Todo | Day 12 |
| T13 | Extend analytics report filters and CSV export | FR19-FR20, UC18 | Backend | Todo | Day 9 |

## Coordination Notes
- Share this file with the frontend team; endpoint contracts for upcoming work will be added to `API/docs/contracts/`.
- Use branch naming `feature/<task-id>-<slug>` for traceability.
- Daily standup: confirm yesterday's progress, today's target, blockers aligned with table above.

## Next Actions (Day 1)
- Published this backlog document.
- Prepare Day 2 design session: gather auth model diagrams and current user schema.