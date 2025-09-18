Auth v2 – Registration and Password Reset

Overview
- Adds self-registration for Researchers and a password reset flow.
- Production hides sensitive tokens; development returns tokens to simplify testing.

Endpoints
- POST `/auth/register`
  - Body: `{ name: string, email: string, student_id?: string }`
  - 201 Dev: `{ id, status: 'pending', activation_token }`
  - 201 Prod: `{ id, status: 'pending' }`
  - 400: `{ error }`

- POST `/auth/activate`
  - Body: `{ token: string, password: string }`
  - 200: `{ ok: true }`
  - 400: `{ error }`

- POST `/auth/reset/request`
  - Body: `{ email: string }`
  - 200 Dev: `{ ok: true, reset_token, expires_at }`
  - 200 Prod: `{ ok: true }`
  - 400: `{ error }`

- POST `/auth/reset/confirm`
  - Body: `{ token: string, password: string }`
  - 200: `{ ok: true }`
  - 400: `{ error }`

Validation
- Register: name 2..80, email valid, student_id optional <=40.
- Reset/confirm: token 16..128, password >=8.

Notes
- Registered users are created with role `Researcher` and status `pending` until activation.
- In development (NODE_ENV != 'production') token values are returned for manual testing.

