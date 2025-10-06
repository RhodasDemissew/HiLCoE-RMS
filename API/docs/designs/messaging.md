# Messaging Module Design

## Goals
- Enable secure 3-way conversations between researcher, advisor, and coordinator tied to each project.
- Support direct messages between any two roles when needed.
- Surface feedback (e.g. "changes requested") within the same conversation so researchers see actionable guidance.
- Provide lightweight delivery using free infrastructure (initially REST + polling), with a roadmap for SSE/Socket upgrades.

## Data Model
### Conversation
- participants: [{ user: ObjectId, role: 'researcher'|'advisor'|'coordinator' }].
- project: optional ObjectId reference to Project (null for direct chats).
- 	ype: enum project | direct | system for routing/filters.
- subject: optional string (defaults to project title for project threads).
- last_message_at: Date for sorting.
- last_message: embedded snapshot { sender: ObjectId, preview: String, created_at: Date }.
- created_by: ObjectId.
- ead_markers: [{ user: ObjectId, last_read_at: Date, last_read_message: ObjectId }].
- Timestamps via created_at / updated_at. Index on participants.user and project.

### Message
- conversation: ObjectId ref Conversation.
- sender: ObjectId ref User.
- ody: String (Markdown-lite allowed).
- ttachments: [{ name, url, size }] (reuses storage service).
- kind: enum 	ext | system | eedback.
- meta: optional object (e.g. milestoneId, submissionId).
- Timestamps, index on conversation + created_at.

## API Endpoints
1. GET /conversations — list user conversations (with unread counts).
2. POST /conversations — start new direct/group conversation.
3. GET /conversations/:id — fetch metadata, participants.
4. GET /conversations/:id/messages?cursor= — paginated messages (descending by time).
5. POST /conversations/:id/messages — send new message (text + optional attachments).
6. POST /conversations/:id/read — update read marker for current user.
7. POST /projects/:id/conversation — ensure default project channel exists & join.

All routes require auth; membership check ensures only participants access a conversation.

## Delivery Strategy
- Phase 1: Client polls GET /conversations every 10s while on the messaging screen, with exponential backoff. Messages use long-lived cursor (last message timestamp) so updates are cheap.
- Phase 2 (optional): reuse existing SSE infrastructure for notifications to push message badges; we can piggyback on /notifications/stream events.

## Feedback Integration
- When milestone/review status transitions to changes_requested, call messagingService.emitSystemMessage with context (submission id, milestone, summary).
- Template message inserted into the project conversation (auto-create conversation if missing).
- Researcher receives notification badge + message entry.

## Frontend Outline
- Left nav "Messaging" opens a new page component using shared layout.
- Conversation list pane shows title, last message, unread badge.
- Main pane shows message history (infinite scroll upwards) and composer (text input + attach).
- Feedback screens (advisor/coordinator) add "Send message with decision" toggle; on changes_requested, the comment flows into conversation automatically.

## Security & Audit
- All writes captured in existing AuditLog via middleware.
- Soft-delete not planned for MVP; editing limited to future iteration.
- Message content validated + trimmed; attachments restricted to allowed MIME types (reuse submission file checks).

## Roadmap
- Push notifications / mobile.
- Typing indicators using SSE/WebSockets.
- Message search & filters.
- Reactions/acknowledgements for quick responses.
