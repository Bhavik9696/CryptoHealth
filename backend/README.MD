# Crypto Health Backend

> Secure Node.js backend for the Crypto Health medical-record sharing platform.

Crypto Health is a privacy-focused healthcare platform designed to allow patients to securely manage and share their medical records while maintaining control over who can access them.

The backend provides the core security and business logic for:

* Authentication and authorization
* Patient and hospital management
* Doctor management
* Medical-record management
* Encrypted medical-file storage
* Cryptographic integrity verification
* Digital signatures
* Temporary medical-record sharing
* QR-code access
* One-time access tokens
* Access expiration
* Access revocation
* Audit logging
* Secure file retrieval
* Hospital/report verification
* API security

The system consists of a **Flutter patient application**, a **React hospital/doctor web portal**, and this **Node.js backend**.

The project proposal identifies the patient application as Flutter, the hospital portal as React with Tailwind CSS/shadcn/ui, Supabase PostgreSQL/Storage, Supabase Auth/JWT, QR/one-time sharing, and cryptographic protection for medical reports.

---

# 1. System Overview

```text
                         CRYPTO HEALTH
                              |
              +---------------+---------------+
              |                               |
              v                               v
      Flutter Patient App            React Hospital Portal
              |                               |
              +---------------+---------------+
                              |
                            HTTPS
                              |
                              v
                    Node.js + Express API
                              |
          +-------------------+-------------------+
          |                   |                   |
          v                   v                   v
   Authentication       Business Logic       Security
          |                   |                   |
      Supabase Auth       Services             RBAC
      JWT validation      Reports             Validation
                          Sharing             Rate Limit
                          Encryption          Audit
                          Verification
                              |
              +---------------+---------------+
              |                               |
              v                               v
       Supabase PostgreSQL              Supabase Storage
              |                               |
       Users / Patients                 Encrypted files
       Hospitals / Doctors
       Reports / Sharing
       Audit logs
```

---

# 2. Backend Responsibilities

The backend is the central trust layer of the application.

It is responsible for making all authorization and security decisions.

## Core responsibilities

### Authentication

* User authentication
* JWT validation
* Session validation
* Current-user identification
* Logout/session handling

### Authorization

* Role-based access control
* Patient ownership validation
* Hospital authorization
* Doctor authorization
* Report-level authorization
* Temporary-share authorization

### Medical Records

* Upload medical reports
* Validate uploaded files
* Encrypt reports
* Generate report hashes
* Store encrypted files
* Store report metadata
* Retrieve authorized reports
* Delete/revoke reports

### Secure Sharing

* Create temporary shares
* Generate cryptographically secure tokens
* Generate QR codes
* Validate share tokens
* Expire shares
* Revoke shares
* Support one-time access

### Verification

* Generate report hashes
* Generate digital signatures
* Verify signatures
* Detect modified reports
* Display authenticity status

### Auditing

* Record report access
* Record report uploads
* Record sharing
* Record revocation
* Record verification
* Record failed authorization attempts
* Record security events

---

# 3. Technology Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| Runtime           | Node.js                 |
| Language          | TypeScript              |
| Web Framework     | Express.js              |
| Database          | Supabase PostgreSQL     |
| File Storage      | Supabase Storage        |
| Authentication    | Supabase Auth           |
| Authorization     | JWT + RBAC              |
| Validation        | Zod                     |
| Encryption        | Node.js `crypto`        |
| QR Generation     | QR-code library         |
| API               | REST                    |
| Testing           | Vitest/Jest + Supertest |
| API Documentation | OpenAPI                 |
| Deployment        | Render / Railway        |
| Version Control   | Git                     |

---

# 4. Architecture Principles

The backend follows a layered architecture.

```text
Client
  |
  v
Routes
  |
  v
Middleware
  |
  +---- Authentication
  +---- Authorization
  +---- Validation
  +---- Rate limiting
  |
  v
Controller
  |
  v
Service
  |
  +---- Encryption
  +---- Storage
  +---- Sharing
  +---- Verification
  +---- Audit
  |
  v
Repository
  |
  +---- PostgreSQL
  +---- Supabase Storage
```

## Important principles

1. Frontend is never trusted.
2. Every protected operation is authorized on the backend.
3. Medical files are never stored as plaintext when encrypted storage is required.
4. Secrets never belong in source code.
5. Private cryptographic keys never reach the frontend.
6. QR codes contain access references/tokens, not medical files.
7. Sensitive actions are logged.
8. API responses must not expose unnecessary sensitive information.
9. Database access must be restricted.
10. Cryptographic algorithms and data formats must be standardized between Node.js and Flutter.

---

# 5. Project Structure

```text
crypto-health-backend/
│
├── src/
│   │
│   ├── server.ts
│   ├── app.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── supabase.ts
│   │   ├── database.ts
│   │   └── constants.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── hospitals.routes.ts
│   │   ├── doctors.routes.ts
│   │   ├── patients.routes.ts
│   │   ├── reports.routes.ts
│   │   ├── sharing.routes.ts
│   │   ├── verification.routes.ts
│   │   └── audit.routes.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── hospitals.controller.ts
│   │   ├── doctors.controller.ts
│   │   ├── patients.controller.ts
│   │   ├── reports.controller.ts
│   │   ├── sharing.controller.ts
│   │   ├── verification.controller.ts
│   │   └── audit.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── hospital.service.ts
│   │   ├── doctor.service.ts
│   │   ├── patient.service.ts
│   │   ├── report.service.ts
│   │   ├── encryption.service.ts
│   │   ├── signature.service.ts
│   │   ├── storage.service.ts
│   │   ├── sharing.service.ts
│   │   ├── qr.service.ts
│   │   └── audit.service.ts
│   │
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── hospital.repository.ts
│   │   ├── doctor.repository.ts
│   │   ├── patient.repository.ts
│   │   ├── report.repository.ts
│   │   ├── sharing.repository.ts
│   │   └── audit.repository.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── upload.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── security.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   ├── hospital.schema.ts
│   │   ├── doctor.schema.ts
│   │   ├── patient.schema.ts
│   │   ├── report.schema.ts
│   │   ├── sharing.schema.ts
│   │   └── verification.schema.ts
│   │
│   ├── utils/
│   │   ├── hash.ts
│   │   ├── token.ts
│   │   ├── file-validation.ts
│   │   ├── response.ts
│   │   └── logger.ts
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── report.types.ts
│   │   ├── sharing.types.ts
│   │   └── express.d.ts
│   │
│   └── docs/
│       └── openapi.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── security/
│   └── fixtures/
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

---

# 6. User Roles

The system will support four primary roles.

```text
PATIENT
DOCTOR
HOSPITAL
ADMIN
```

## Patient

A patient can:

* View their profile
* View their medical records
* View report metadata
* Create temporary access
* Generate QR access
* Revoke access
* View sharing history
* View report verification status
* View access logs related to their records

---

## Doctor

A doctor can:

* Authenticate
* Access authorized patient records
* Upload reports
* View authorized reports
* Verify report authenticity
* Access valid temporary shares
* View relevant access history

---

## Hospital

A hospital can:

* Manage hospital information
* Manage authorized doctors
* Upload reports
* Associate reports with patients
* Verify/sign reports
* View hospital reports
* Review report activity

---

## Admin

An administrator can:

* Manage users
* Manage hospitals
* Manage doctors
* Manage roles
* Verify organizations
* Review audit logs
* Review security events

---

# 7. Authentication Architecture

Authentication is handled through Supabase Auth.

```text
Client
  |
  | Login
  v
Supabase Auth
  |
  v
JWT
  |
  v
Client
  |
  | Authorization: Bearer <JWT>
  v
Node.js API
  |
  v
JWT validation
  |
  v
Authenticated User
```

## Backend requirements

The backend must:

* Validate JWTs
* Reject expired tokens
* Reject malformed tokens
* Extract authenticated user ID
* Retrieve user role
* Attach authenticated user to request
* Protect private endpoints

Example request:

```http
Authorization: Bearer eyJ...
```

---

# 8. Authorization Architecture

Authentication alone is not enough.

The backend must verify that the authenticated user has permission to access the requested resource.

```text
Request
   |
   v
JWT valid?
   |
   +---- NO ---> 401
   |
   YES
   |
   v
Role allowed?
   |
   +---- NO ---> 403
   |
   YES
   |
   v
Resource ownership/access valid?
   |
   +---- NO ---> 403
   |
   YES
   |
   v
Execute operation
```

Example:

A doctor cannot access an arbitrary patient report simply because the doctor is authenticated.

The backend must verify the doctor's authorization for that report.

---

# 9. Database Architecture

Supabase PostgreSQL stores metadata and relational information.

```text
users
  |
  +---- patients
  |
  +---- doctors
             |
             +---- hospitals
             |
             +---- medical_reports
                         |
                         +---- access_grants
                         |
                         +---- signatures
                         |
                         +---- audit_logs
```

---

# 10. Database Tables

## profiles

```text
id
email
full_name
role
avatar_url
created_at
updated_at
```

---

## patients

```text
id
user_id
patient_identifier
date_of_birth
created_at
updated_at
```

Only the minimum necessary information should be stored.

---

## hospitals

```text
id
name
registration_identifier
address
phone
email
verified
created_at
updated_at
```

---

## doctors

```text
id
user_id
hospital_id
license_identifier
specialization
verified
created_at
updated_at
```

---

## medical_reports

```text
id
patient_id
hospital_id
doctor_id
report_type
file_path
file_name
file_size
mime_type
file_hash
encryption_metadata
signature
status
uploaded_at
updated_at
```

The medical file itself is stored in Supabase Storage.

The PostgreSQL record stores metadata.

---

## access_grants

```text
id
report_id
patient_id
created_by
recipient_id
token_hash
permissions
expires_at
revoked_at
used_at
created_at
```

---

## signatures

```text
id
report_id
algorithm
signature
key_identifier
signed_hash
created_at
```

---

## audit_logs

```text
id
user_id
action
resource_type
resource_id
status
metadata
created_at
```

---

# 11. Database Relationships

```text
profiles
   |
   +----------------+
   |                |
   v                v
patients          doctors
                     |
                     v
                 hospitals
                     |
                     v
              medical_reports
                     |
          +----------+----------+
          |                     |
          v                     v
   access_grants           signatures
          |
          v
      audit_logs
```

---

# 12. Row Level Security

Supabase PostgreSQL should use appropriate Row Level Security policies.

The objective is to ensure users cannot directly bypass application-level authorization through database access.

Examples of policies:

### Patient

A patient can read their own patient record.

### Report

A patient can access reports belonging to them.

### Doctor

A doctor can access reports only when authorized.

### Hospital

A hospital can access reports belonging to that hospital according to the application's rules.

### Audit

Audit records should not be freely writable or editable by ordinary users.

---

# 13. Medical Report Workflow

The report workflow is:

```text
Doctor/Hospital
      |
      v
Upload Report
      |
      v
Authenticate
      |
      v
Authorize
      |
      v
Validate File
      |
      v
Calculate Hash
      |
      v
Encrypt Report
      |
      v
Generate Signature
      |
      v
Upload Encrypted File
      |
      v
Save Metadata
      |
      v
Create Audit Log
```

---

# 14. File Upload

The API should accept medical report files through a multipart upload endpoint.

Example:

```http
POST /api/v1/reports
Content-Type: multipart/form-data
```

The request should contain:

```text
patient_id
report_type
file
```

The backend must validate:

* File type
* MIME type
* Extension
* File size
* File content where practical
* Authenticated user
* Patient relationship
* Hospital relationship

---

# 15. File Storage

Supabase Storage is used for medical files.

Recommended structure:

```text
medical-reports/
    {patient-id}/
        {report-id}/
            encrypted-report.bin
```

Example:

```text
medical-reports/
    8d2.../
        a91.../
            encrypted-report.bin
```

The original user filename should not be used as the storage path.

---

# 16. Encryption Architecture

The backend must encrypt sensitive medical files before storage.

```text
Original Medical Report
          |
          v
   Encryption Service
          |
          v
   Encrypted Binary
          |
          v
   Supabase Storage
```

The encryption implementation should use a modern authenticated encryption scheme supported by the Node.js cryptographic stack.

The exact algorithm, key-management mechanism, nonce/IV representation, authentication-tag handling, encoding, and metadata format must be formally defined before implementation.

This is especially important because the Flutter application and Node.js backend must be cryptographically compatible.

---

# 17. Encryption Metadata

The system may need to store metadata such as:

```json
{
  "algorithm": "...",
  "version": 1,
  "iv": "...",
  "auth_tag": "...",
  "key_reference": "..."
}
```

Do not store secret keys inside this metadata.

The metadata should describe how the encrypted object is interpreted, not reveal the secret material required to compromise it.

---

# 18. Key Management

Cryptographic keys must be handled separately from ordinary application data.

```text
Secret Management
       |
       +---- Encryption keys
       |
       +---- Signing keys
       |
       +---- Service credentials
```

Never:

```text
- Commit keys to Git
- Put keys in React
- Put keys in Flutter source
- Put keys in QR codes
- Return keys through APIs
- Log keys
- Store private keys in ordinary report metadata
```

Production key management should use a suitable secret-management mechanism.

---

# 19. Digital Signature

A medical report can be associated with a digital signature to support authenticity verification.

```text
Medical Report
      |
      v
Calculate Hash
      |
      v
Signing Key
      |
      v
Digital Signature
      |
      +------------+
      |            |
      v            v
   Report      Signature
```

The backend stores the signature metadata.

---

# 20. Report Verification

Verification workflow:

```text
Report
  |
  v
Calculate Current Hash
  |
  v
Retrieve Stored Signature
  |
  v
Verify Signature
  |
  +------ VALID ------> Authentic
  |
  +---- INVALID ------> Verification Failed
```

Example response:

```json
{
  "report_id": "report-uuid",
  "verified": true,
  "signature_status": "VALID"
}
```

If a report has been modified, verification should fail.

---

# 21. Temporary Sharing

Patients can temporarily share reports.

```text
Patient
   |
   v
Select Report
   |
   v
Create Share
   |
   +---- Recipient
   +---- Permissions
   +---- Expiration
   |
   v
Generate Secure Token
   |
   v
Store Token Hash
   |
   v
Generate QR
```

---

# 22. Secure Share Token

Tokens should be:

* Cryptographically random
* Unpredictable
* Sufficiently long
* Time-limited
* Revocable
* Auditable

The preferred database representation is:

```text
Raw token
    |
    v
Hash token
    |
    v
Store token_hash
```

The raw token is returned only when necessary to create the share/QR experience.

---

# 23. QR Code

The QR code should contain a secure access URL.

Example:

```text
https://api.example.com/share/<token>
```

The QR code must not contain:

```text
Medical file
Database credentials
Encryption master key
Private signing key
Supabase service key
Sensitive medical information
```

---

# 24. QR Access Flow

```text
Doctor
  |
  | Scan QR
  v
Share URL
  |
  v
Node.js API
  |
  +---- Token exists?
  |
  +---- Token expired?
  |
  +---- Token revoked?
  |
  +---- User authenticated?
  |
  +---- User authorized?
  |
  v
Access granted
  |
  v
Report retrieval
  |
  v
Verification
  |
  v
Audit log
```

---

# 25. Token Expiration

Each share has an expiration timestamp.

```text
CREATED
   |
   v
ACTIVE
   |
   +---- Expiration ----> EXPIRED
   |
   +---- Revocation ----> REVOKED
   |
   +---- One-time use --> USED
```

Every access request must validate the current state.

---

# 26. Access Revocation

The patient can revoke an active share.

```text
Patient
   |
   v
Revoke Share
   |
   v
Node.js API
   |
   v
Update access_grants
   |
   v
revoked_at = current time
   |
   v
Future access rejected
   |
   v
Audit log
```

Revocation must always be checked on the backend.

---

# 27. One-Time Access

For one-time access:

```text
Share created
      |
      v
ACTIVE
      |
      v
Doctor accesses report
      |
      v
used_at = current time
      |
      v
USED
      |
      v
Future access denied
```

This provides an additional layer of control for sensitive sharing scenarios.

---

# 28. Audit Logging

Every sensitive operation should be recorded.

Example events:

```text
LOGIN
LOGOUT

REPORT_UPLOAD
REPORT_VIEW
REPORT_DOWNLOAD
REPORT_DELETE

REPORT_VERIFY

SHARE_CREATED
SHARE_ACCESSED
SHARE_REVOKED
SHARE_EXPIRED

UNAUTHORIZED_ACCESS
INVALID_TOKEN
INVALID_SIGNATURE
```

---

# 29. Audit Log Example

```json
{
  "user_id": "user-uuid",
  "action": "REPORT_VIEW",
  "resource_type": "medical_report",
  "resource_id": "report-uuid",
  "status": "SUCCESS",
  "created_at": "2026-08-09T12:00:00Z"
}
```

Do not put sensitive medical contents into audit logs.

---

# 30. REST API

Base URL:

```text
/api/v1
```

---

## Health

```http
GET /health
```

Response:

```json
{
  "status": "healthy",
  "service": "crypto-health-api"
}
```

---

# 31. Authentication API

```http
GET /api/v1/auth/me
POST /api/v1/auth/logout
```

Authentication itself is performed through Supabase Auth.

The backend validates the resulting JWT.

---

# 32. User API

```http
GET /api/v1/users/me
PATCH /api/v1/users/me
```

---

# 33. Hospital API

```http
GET /api/v1/hospitals/me
GET /api/v1/hospitals/doctors
GET /api/v1/hospitals/reports
```

---

# 34. Doctor API

```http
GET /api/v1/doctors/me
GET /api/v1/doctors/patients
```

---

# 35. Patient API

```http
GET /api/v1/patients
GET /api/v1/patients/:patientId
GET /api/v1/patients/:patientId/reports
```

Authorization is required on every patient-specific endpoint.

---

# 36. Report API

```http
POST /api/v1/reports
GET /api/v1/reports/:reportId
GET /api/v1/reports/:reportId/download
DELETE /api/v1/reports/:reportId
```

---

# 37. Sharing API

```http
POST /api/v1/sharing
GET /api/v1/sharing/:shareId
POST /api/v1/sharing/validate
POST /api/v1/sharing/:shareId/revoke
```

---

# 38. Verification API

```http
POST /api/v1/verification/reports/:reportId
GET /api/v1/verification/reports/:reportId
```

---

# 39. Audit API

```http
GET /api/v1/audit/logs
GET /api/v1/audit/reports/:reportId
```

Audit endpoints require appropriate authorization.

---

# 40. API Response Format

Use consistent responses.

### Success

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "REPORT_NOT_FOUND",
    "message": "The requested report was not found"
  }
}
```

---

# 41. HTTP Status Codes

Use standard status codes.

```text
200 OK
201 Created
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
413 Payload Too Large
422 Validation Error
429 Too Many Requests

500 Internal Server Error
```

Do not expose stack traces or internal implementation details in production.

---

# 42. Request Validation

Use Zod or equivalent schema validation.

Example:

```text
Request
   |
   v
Zod Schema
   |
   +---- Invalid ---> 422
   |
   v
Controller
```

Validate:

* IDs
* UUIDs
* Dates
* Expiration
* Permissions
* File metadata
* Request body
* Query parameters

---

# 43. Middleware

Required middleware:

```text
Authentication
Authorization
Validation
Error handling
Rate limiting
Security headers
File upload validation
Request logging
```

Request flow:

```text
Request
  |
  v
Security Middleware
  |
  v
Rate Limit
  |
  v
JWT Middleware
  |
  v
Role Middleware
  |
  v
Validation
  |
  v
Controller
```

---

# 44. Rate Limiting

Rate limiting should be applied especially to:

```text
Login-related endpoints
Token validation
QR/share access
Report download
Verification endpoints
```

This reduces abuse and brute-force attempts.

---

# 45. Security Headers

Production API responses should use appropriate security headers.

Examples include:

```text
Content-Security-Policy
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Strict-Transport-Security
```

Exact configuration should match the deployment architecture.

---

# 46. CORS

Development:

```text
http://localhost:5173
```

Production:

```text
https://<production-web-domain>
```

Do not use unrestricted CORS in production.

Avoid:

```text
Access-Control-Allow-Origin: *
```

for authenticated production APIs unless there is a specific justified architecture.

---

# 47. Environment Variables

Create:

```text
.env
```

Example:

```env
NODE_ENV=development
PORT=5000

APP_NAME=Crypto Health API
APP_URL=http://localhost:5000

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

SUPABASE_STORAGE_BUCKET=medical-reports

CORS_ORIGINS=http://localhost:5173

ENCRYPTION_KEY=
SIGNING_PRIVATE_KEY=
SIGNING_PUBLIC_KEY=

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Never commit actual secrets.

Use:

```text
.env.example
```

for the repository.

---

# 48. Node.js Setup

Initialize:

```bash
npm init -y
```

Install production dependencies:

```bash
npm install express cors helmet dotenv zod multer qrcode
```

Install Supabase:

```bash
npm install @supabase/supabase-js
```

Install development dependencies:

```bash
npm install -D typescript tsx @types/node @types/express @types/cors @types/multer
```

Testing dependencies can be added using the selected test framework.

---

# 49. TypeScript Configuration

Recommended settings:

```text
strict: true
noImplicitAny: true
esModuleInterop: true
module: NodeNext
moduleResolution: NodeNext
```

The backend should be strongly typed.

Avoid:

```typescript
any
```

unless there is a clear technical reason.

---

# 50. Development Commands

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

Start development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

---

# 51. Local Development

Clone repository:

```bash
git clone <repository-url>
cd crypto-health-backend
```

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Configure Supabase credentials.

Start:

```bash
npm run dev
```

API:

```text
http://localhost:5000
```

---

# 52. API Documentation

The backend should provide OpenAPI documentation.

Recommended endpoints:

```text
/api-docs
/api-docs.json
```

Documentation should contain:

* Authentication requirements
* Request parameters
* Request bodies
* Response structures
* Error codes
* Examples
* Authorization requirements

---

# 53. Testing Strategy

Testing will have three levels.

```text
                 TESTING
                    |
       +------------+------------+
       |            |            |
       v            v            v
      Unit      Integration    Security
```

---

# 54. Unit Tests

Test individual services.

Examples:

```text
Encryption Service
Token Service
Hash Service
Signature Service
Validation Service
Permission Service
```

Example:

```text
encrypt(data)
decrypt(encrypt(data))
      |
      v
original data
```

---

# 55. Integration Tests

Test complete API workflows.

Examples:

```text
Login
   ↓
Create patient
   ↓
Upload report
   ↓
Create share
   ↓
Validate share
   ↓
Access report
   ↓
Revoke share
   ↓
Access denied
```

---

# 56. Security Tests

Test:

```text
Expired JWT
Invalid JWT
Missing JWT

Wrong role
Wrong hospital
Wrong patient

Invalid share token
Expired share token
Revoked share token
Used share token

Modified report
Invalid signature

Invalid file type
Oversized file

Rate-limit violation
```

---

# 57. Encryption Tests

Required tests:

```text
Encrypt plaintext
Decrypt ciphertext
Verify plaintext recovery
Verify invalid ciphertext rejection
Verify authentication-tag failure
Verify nonce/IV handling
Verify key configuration
```

The exact tests depend on the finalized cryptographic protocol.

---

# 58. Sharing Tests

```text
Create share
   ✓

Validate active share
   ✓

Validate expired share
   ✗

Validate revoked share
   ✗

Validate used one-time share
   ✗

Invalid token
   ✗
```

---

# 59. Report Security Tests

Test:

```text
Doctor A → authorized report → ALLOW

Doctor A → unauthorized report → DENY

Patient A → Patient A report → ALLOW

Patient A → Patient B report → DENY

Hospital A → Hospital B report → DENY
```

---

# 60. Logging

The backend should maintain structured logs.

Log:

```text
Request ID
Timestamp
Endpoint
HTTP method
Status code
Execution time
User ID where appropriate
Security event
Error category
```

Never log:

```text
Passwords
JWT secrets
Encryption keys
Private signing keys
Raw share tokens
Medical report contents
Sensitive medical information
```

---

# 61. Error Handling

Central error middleware:

```text
Controller
    |
    v
Service error
    |
    v
Error middleware
    |
    +---- Log internal error
    |
    v
Safe API response
```

Production response:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

Do not return:

```text
Stack traces
Database errors
File system paths
Cryptographic implementation details
Secret configuration
```

---

# 62. Performance

The backend should support:

* Pagination
* Database indexes
* Efficient queries
* Async I/O
* Streaming where appropriate
* Efficient storage operations
* Request limits
* Rate limiting

Large medical reports should not unnecessarily remain fully in server memory.

---

# 63. Database Indexes

Recommended indexes include:

```text
profiles.user_id
patients.user_id
doctors.user_id
doctors.hospital_id

medical_reports.patient_id
medical_reports.hospital_id
medical_reports.doctor_id

access_grants.report_id
access_grants.patient_id
access_grants.expires_at

audit_logs.user_id
audit_logs.resource_id
audit_logs.created_at
```

Exact indexes should be finalized after query patterns are known.

---

# 64. Deployment Architecture

```text
                    INTERNET
                        |
                      HTTPS
                        |
           +------------+------------+
           |                         |
           v                         v
     React Web Portal          Flutter App
           |                         |
           +------------+------------+
                        |
                        v
               Node.js API
              Render / Railway
                        |
             +----------+----------+
             |                     |
             v                     v
       Supabase PostgreSQL   Supabase Storage
             |                     |
             v                     v
       Metadata / Logs        Encrypted Reports
```

---

# 65. Production Deployment

Production requirements:

```text
[ ] NODE_ENV=production
[ ] HTTPS enabled
[ ] Production CORS
[ ] Environment secrets configured
[ ] Supabase configured
[ ] Storage configured
[ ] RLS enabled
[ ] Rate limiting enabled
[ ] Security headers enabled
[ ] Error handling enabled
[ ] Logging enabled
[ ] Health check enabled
[ ] Database backup strategy
[ ] Monitoring
```

---

# 66. Docker

Example architecture:

```text
Docker
  |
  v
Node.js Application
  |
  +---- Express
  +---- TypeScript build
  +---- Environment variables
```

Production build:

```bash
npm run build
```

Then:

```bash
npm start
```

---

# 67. Health Checks

Implement:

```http
GET /health
```

Response:

```json
{
  "status": "healthy",
  "service": "crypto-health-api",
  "version": "1.0.0"
}
```

Optional:

```http
GET /health/live
GET /health/ready
```

---

# 68. Implementation Phases

## Phase 1 — Project Initialization

```text
[ ] Node.js project
[ ] TypeScript
[ ] Express
[ ] ESLint
[ ] Prettier
[ ] Environment configuration
[ ] Application entry point
[ ] Health endpoint
```

---

## Phase 2 — Supabase

```text
[ ] Supabase project
[ ] PostgreSQL connection
[ ] Supabase client
[ ] Storage bucket
[ ] Authentication
[ ] Database migrations
[ ] RLS policies
```

---

## Phase 3 — Authentication

```text
[ ] JWT middleware
[ ] Current-user middleware
[ ] User profile
[ ] Role system
[ ] Protected routes
```

---

## Phase 4 — Hospital & Doctor

```text
[ ] Hospital model
[ ] Doctor model
[ ] Hospital verification
[ ] Doctor verification
[ ] Hospital-doctor relationship
```

---

## Phase 5 — Patients

```text
[ ] Patient profile
[ ] Patient lookup
[ ] Patient ownership
[ ] Patient authorization
```

---

## Phase 6 — Medical Reports

```text
[ ] Upload endpoint
[ ] File validation
[ ] Hash generation
[ ] Encryption
[ ] Storage
[ ] Metadata
[ ] Secure retrieval
```

---

## Phase 7 — Digital Verification

```text
[ ] Hash
[ ] Signature
[ ] Signature storage
[ ] Verification endpoint
[ ] Modified-report detection
```

---

## Phase 8 — Temporary Sharing

```text
[ ] Share creation
[ ] Secure token
[ ] Token hashing
[ ] Permissions
[ ] Expiration
[ ] Revocation
[ ] One-time access
```

---

## Phase 9 — QR Sharing

```text
[ ] QR generation
[ ] Secure URL
[ ] QR validation
[ ] Share lookup
[ ] Access authorization
```

---

## Phase 10 — Audit

```text
[ ] Audit service
[ ] Report access logs
[ ] Share logs
[ ] Verification logs
[ ] Security logs
[ ] Audit API
```

---

## Phase 11 — Security Hardening

```text
[ ] Helmet
[ ] CORS
[ ] Rate limiting
[ ] Input validation
[ ] File validation
[ ] Secret management
[ ] Error sanitization
[ ] Authorization review
```

---

## Phase 12 — Testing

```text
[ ] Unit tests
[ ] Integration tests
[ ] API tests
[ ] Encryption tests
[ ] Authorization tests
[ ] Sharing tests
[ ] Security tests
```

---

## Phase 13 — Deployment

```text
[ ] Production environment
[ ] Build pipeline
[ ] Render/Railway deployment
[ ] Supabase production configuration
[ ] HTTPS
[ ] Monitoring
[ ] Health checks
```

---

# 69. Complete Report Upload Flow

```text
                 HOSPITAL / DOCTOR
                         |
                         v
                  Select Report
                         |
                         v
                 React Web Portal
                         |
                         | POST /reports
                         v
                 Node.js Express
                         |
                         v
                 Authentication
                         |
                         v
                  Authorization
                         |
                         v
                  File Validation
                         |
                         v
                   Calculate Hash
                         |
                         v
                  Encrypt Report
                         |
                         v
                 Generate Signature
                         |
              +----------+----------+
              |                     |
              v                     v
      Supabase Storage        PostgreSQL
      Encrypted Report         Metadata
              |                     |
              +----------+----------+
                         |
                         v
                    Audit Log
                         |
                         v
                    Success
```

---

# 70. Complete Sharing Flow

```text
                    PATIENT
                       |
                       v
                Select Report
                       |
                       v
                Create Share
                       |
             +---------+---------+
             |         |         |
             v         v         v
          Report    Recipient  Expiry
             |         |         |
             +---------+---------+
                       |
                       v
                Secure Token
                       |
                       v
                  Token Hash
                       |
                       v
                Access Grant
                       |
                       v
                   QR Code
                       |
                       v
                  Doctor Scan
                       |
                       v
               Authenticate
                       |
                       v
                Validate Token
                       |
            +----------+----------+
            |          |          |
         Valid       Expired    Revoked
            |          |          |
            v          v          v
         Continue     DENY       DENY
            |
            v
        Authorization
            |
            v
       Retrieve Report
            |
            v
       Verify Signature
            |
            v
        Authorized View
            |
            v
         Audit Log
```

---

# 71. Complete Security Model

```text
                  USER
                   |
                   v
             Authentication
                   |
                   v
               JWT Valid
                   |
                   v
             Role Validation
                   |
                   v
          Resource Authorization
                   |
                   v
            Access Permission
                   |
                   v
          Encrypted File Access
                   |
                   v
          Signature Verification
                   |
                   v
             Audit Logging
```

No single layer should be treated as sufficient by itself.

---

# 72. MVP Definition

The backend MVP is complete when the following workflow works end-to-end:

```text
Hospital Login
      ↓
Find Patient
      ↓
Upload Medical Report
      ↓
Validate File
      ↓
Hash Report
      ↓
Encrypt Report
      ↓
Store Encrypted Report
      ↓
Store Metadata
      ↓
Generate Signature
      ↓
Patient Views Report
      ↓
Patient Creates Temporary Share
      ↓
Secure Token Generated
      ↓
QR Generated
      ↓
Doctor Scans QR
      ↓
Doctor Authenticated
      ↓
Token Validated
      ↓
Expiration Checked
      ↓
Revocation Checked
      ↓
Authorization Checked
      ↓
Report Retrieved
      ↓
Signature Verified
      ↓
Report Accessed
      ↓
Audit Log Created
```

---

# 73. Definition of Done

## Authentication

* [ ] Supabase authentication integrated
* [ ] JWT validation implemented
* [ ] Protected routes implemented
* [ ] Role validation implemented

## Hospital

* [ ] Hospital records implemented
* [ ] Hospital verification implemented
* [ ] Doctor relationship implemented

## Doctor

* [ ] Doctor records implemented
* [ ] Hospital relationship implemented
* [ ] Authorization implemented

## Patient

* [ ] Patient records implemented
* [ ] Patient ownership implemented
* [ ] Patient report access implemented

## Reports

* [ ] File upload implemented
* [ ] File validation implemented
* [ ] Hashing implemented
* [ ] Encryption implemented
* [ ] Storage implemented
* [ ] Metadata implemented
* [ ] Secure download implemented

## Verification

* [ ] Digital signature implemented
* [ ] Signature storage implemented
* [ ] Verification endpoint implemented
* [ ] Tampering detection implemented

## Sharing

* [ ] Temporary shares implemented
* [ ] Secure token implemented
* [ ] Token hashing implemented
* [ ] Expiration implemented
* [ ] Revocation implemented
* [ ] One-time access implemented
* [ ] QR generation implemented

## Audit

* [ ] Report access logging
* [ ] Upload logging
* [ ] Share logging
* [ ] Revocation logging
* [ ] Verification logging
* [ ] Security-event logging

## Security

* [ ] HTTPS
* [ ] CORS
* [ ] Rate limiting
* [ ] Security headers
* [ ] Input validation
* [ ] File validation
* [ ] Secret management
* [ ] Error sanitization
* [ ] Authorization testing

## Deployment

* [ ] Production build
* [ ] Render/Railway deployment
* [ ] Supabase production environment
* [ ] Storage configuration
* [ ] Environment secrets
* [ ] Health check
* [ ] Monitoring

---

# 74. Future Enhancements

Potential future features include:

* Multi-factor authentication
* Advanced consent management
* Emergency access
* Key rotation
* Hardware-backed key storage
* Hospital certificate management
* Notifications
* Email notifications
* SMS notifications
* Report versioning
* Advanced access permissions
* Advanced monitoring
* Background job processing
* Healthcare interoperability
* Formal security audit

These are not required for the initial MVP.

---

# 75. Security Disclaimer

Crypto Health deals with highly sensitive medical information.

The implementation must undergo appropriate security review before being used with real patient data.

In particular, the following must be formally reviewed before production:

* Cryptographic protocol
* Key management
* Database security
* Supabase RLS policies
* Storage access policies
* Authentication
* Authorization
* Token design
* QR sharing
* Audit logging
* Deployment security
* Applicable privacy and healthcare requirements

The cryptographic implementation should not be considered finalized until the Node.js backend and Flutter client have a documented, compatible protocol.

---

# 76. Backend Roadmap

```text
                    CRYPTO HEALTH
                         BACKEND
                           |
                           v
                Node.js + Express
                           |
                           v
                  TypeScript Setup
                           |
                           v
                    Supabase Setup
                           |
                           v
                Database + RLS
                           |
                           v
                  Authentication
                           |
                           v
                  Authorization
                           |
                           v
              Hospital / Doctor APIs
                           |
                           v
                    Patient APIs
                           |
                           v
                 Report Management
                           |
                           v
                    Encryption
                           |
                           v
                  Secure Storage
                           |
                           v
                 Digital Signature
                           |
                           v
                   Verification
                           |
                           v
                Temporary Sharing
                           |
                           v
                    QR Sharing
                           |
                           v
                Expiration / Revoke
                           |
                           v
                  Audit Logging
                           |
                           v
                  Security Testing
                           |
                           v
                     Deployment
```

---

# 77. Priority Levels

## P0 — Core MVP

```text
Node.js + Express
TypeScript
Supabase
Authentication
Authorization
Database
Patients
Hospitals
Doctors
Medical reports
Encrypted storage
Temporary sharing
Token expiration
Audit logging
```

## P1 — Security & Verification

```text
Digital signatures
Report verification
QR access
Token revocation
One-time access
Rate limiting
Security headers
Security testing
```

## P2 — Production Enhancements

```text
Key rotation
Advanced monitoring
Notifications
Advanced consent
Emergency access
Background jobs
Performance optimization
Security audit
```

---

# 78. Final Architecture

```text
                              INTERNET
                                  |
                           HTTPS / TLS
                                  |
              +-------------------+-------------------+
              |                                       |
              v                                       v
      React Hospital Portal                    Flutter Patient App
              |                                       |
              +-------------------+-------------------+
                                  |
                                  v
                         NODE.JS BACKEND
                        EXPRESS + TYPESCRIPT
                                  |
          +-----------------------+-----------------------+
          |                       |                       |
          v                       v                       v
   Authentication          Business Services          Security
          |                       |                       |
    Supabase Auth          Reports                   RBAC
    JWT Validation         Patients                  Validation
                           Sharing                   Rate Limit
                           QR                        Audit
                           Encryption
                           Signature
                           Storage
          |                       |                       |
          +-----------------------+-----------------------+
                                  |
                    +-------------+-------------+
                    |                           |
                    v                           v
            Supabase PostgreSQL          Supabase Storage
                    |                           |
                    |                           |
              Users / Patients             Encrypted Files
              Hospitals / Doctors
              Reports
              Shares
              Signatures
              Audit Logs
```

---

# 79. Final Development Principle

The backend should be developed in this order:

```text
DATABASE
   ↓
AUTHENTICATION
   ↓
AUTHORIZATION
   ↓
PATIENT / HOSPITAL / DOCTOR
   ↓
REPORT MANAGEMENT
   ↓
ENCRYPTION
   ↓
STORAGE
   ↓
SIGNATURE / VERIFICATION
   ↓
TEMPORARY SHARING
   ↓
QR ACCESS
   ↓
EXPIRATION / REVOCATION
   ↓
AUDIT LOGGING
   ↓
SECURITY TESTING
   ↓
DEPLOYMENT
```

This ordering is intentional: **database and authorization must be established before implementing report access and sharing**, because those features depend on correctly identifying who owns a record and who is permitted to access it.
