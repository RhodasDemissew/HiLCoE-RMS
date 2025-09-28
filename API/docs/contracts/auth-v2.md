# Auth v2 – Verification-First Signup

## Overview
- Researchers must verify their student record before creating an account.
- Verification issues a short-lived token; registration exchanges the token for an active account.
- Password reset flow remains unchanged. Production suppresses sensitive tokens from responses.

## Endpoints

### POST `/auth/verify`
- Body: `{ first_name: string, middle_name?: string, last_name: string, student_id: string }`
- 200 (new): `{ verification_token|null, expires_at|null, login_hint|null, already_registered: boolean, student: { first_name, middle_name, last_name, student_id, program, already_registered, verified_email|null } }`
- 400: `{ error }`

### POST `/auth/register`
- Body: `{ verification_token: string, email: string, phone?: string, password: string }`
- 201: `{ token, user }`
- 400: `{ error }`

### POST `/auth/reset/request`
- Body: `{ email: string }`
- 200 Dev: `{ ok: true, reset_token, expires_at }`
- 200 Prod: `{ ok: true }`
- 400: `{ error }`

### POST `/auth/reset/confirm`
- Body: `{ token: string, password: string }`
- 200: `{ ok: true }`
- 400: `{ error }`

## Validation
- Verify: names min length 1, student_id required.
- Register: verification_token min length 10, password >= 8 characters.
- Reset/confirm: token 16..128, password >=8.

## Notes
- Verification tokens expire after 30 minutes and are single-use.
- Successful registration creates an active `Researcher` user and stamps the corresponding student verification record with the account email.
- Existing non-researcher accounts can still be managed by admins via the `/users` endpoints.
