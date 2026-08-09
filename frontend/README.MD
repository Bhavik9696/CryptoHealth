# Crypto Health — Frontend

> Secure React web portal for hospitals and doctors to manage, upload, verify, and securely access patient medical records.

The Crypto Health frontend is the web interface used primarily by **hospitals and doctors**.

It communicates with the Crypto Health Node.js backend through secure REST APIs.

The frontend must provide a clean, responsive, accessible, and security-conscious interface for:

* Hospital/doctor authentication
* Dashboard
* Patient search
* Patient profiles
* Medical-record management
* Medical-report upload
* Report viewing
* Report verification
* Temporary-access management
* QR-code generation/display
* Access-history viewing
* Profile management
* Error and loading states
* Role-based UI
* Secure session handling

The project proposal specifies **React, Tailwind CSS, and shadcn/ui** for the hospital web portal.

---

# 1. Frontend Architecture

```text
                         CRYPTO HEALTH
                              |
                              v
                    React Web Application
                              |
              +---------------+---------------+
              |                               |
              v                               v
       Hospital Portal                 Doctor Portal
              |                               |
              +---------------+---------------+
                              |
                              v
                         REST API
                              |
                              v
                    Node.js Backend
                              |
               +--------------+--------------+
               |                             |
               v                             v
       Supabase PostgreSQL            Supabase Storage
```

The frontend must **not directly perform authorization decisions**.

The Node.js backend remains the authority for:

* User authorization
* Patient access
* Report access
* Sharing permissions
* Token validation
* Report verification
* Audit operations

---

# 2. Technology Stack

| Category         | Technology                          |
| ---------------- | ----------------------------------- |
| Framework        | React                               |
| Language         | TypeScript                          |
| Build Tool       | Vite                                |
| Styling          | Tailwind CSS                        |
| UI Components    | shadcn/ui                           |
| Routing          | React Router                        |
| API Client       | Axios / Fetch                       |
| Authentication   | Supabase Auth                       |
| State Management | React Context + React Query/Zustand |
| Forms            | React Hook Form                     |
| Validation       | Zod                                 |
| QR               | QR code library                     |
| Icons            | Lucide React                        |
| Testing          | Vitest + React Testing Library      |
| E2E Testing      | Playwright                          |
| Deployment       | Vercel / Netlify / Render           |

---

# 3. Frontend Goals

The frontend should provide:

### Security

* Secure authentication
* Protected routes
* Role-based navigation
* Secure API communication
* Session handling
* No sensitive secrets in frontend code

### Usability

* Simple hospital dashboard
* Fast patient search
* Clear report status
* Easy report upload
* Easy report verification
* Simple sharing workflow

### Accessibility

* Keyboard navigation
* Accessible forms
* Accessible buttons
* Proper labels
* Color-independent status indicators
* Responsive design

### Reliability

* Loading states
* Empty states
* Error states
* Retry actions
* Network failure handling
* Upload progress

---

# 4. Application Structure

```text
frontend/
│
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── src/
│   │
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── RecentReports.tsx
│   │   │   └── ActivityFeed.tsx
│   │   │
│   │   ├── patients/
│   │   │   ├── PatientCard.tsx
│   │   │   ├── PatientTable.tsx
│   │   │   └── PatientSearch.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── ReportCard.tsx
│   │   │   ├── ReportTable.tsx
│   │   │   ├── ReportViewer.tsx
│   │   │   ├── ReportUpload.tsx
│   │   │   └── VerificationBadge.tsx
│   │   │
│   │   ├── sharing/
│   │   │   ├── ShareDialog.tsx
│   │   │   ├── QRCodeDisplay.tsx
│   │   │   ├── ShareStatus.tsx
│   │   │   └── ShareHistory.tsx
│   │   │
│   │   └── common/
│   │       ├── Loading.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   │
│   │   ├── Dashboard.tsx
│   │   ├── Patients.tsx
│   │   ├── PatientDetails.tsx
│   │   ├── Reports.tsx
│   │   ├── ReportDetails.tsx
│   │   ├── UploadReport.tsx
│   │   ├── Verification.tsx
│   │   ├── Sharing.tsx
│   │   ├── AccessLogs.tsx
│   │   ├── Profile.tsx
│   │   └── NotFound.tsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleRoute.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   ├── report.service.ts
│   │   ├── sharing.service.ts
│   │   ├── verification.service.ts
│   │   └── audit.service.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePatients.ts
│   │   ├── useReports.ts
│   │   ├── useSharing.ts
│   │   └── useVerification.ts
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── patient.schema.ts
│   │   ├── report.schema.ts
│   │   └── sharing.schema.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── patient.ts
│   │   ├── report.ts
│   │   ├── sharing.ts
│   │   └── api.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   └── styles/
│       └── globals.css
│
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

# 5. Application Layout

The authenticated application uses:

```text
┌──────────────────────────────────────────────────────────┐
│ Crypto Health                         Doctor / Hospital  │
├──────────────┬───────────────────────────────────────────┤
│              │                                           │
│ Dashboard    │                                           │
│ Patients     │              Page Content                 │
│ Reports      │                                           │
│ Upload       │                                           │
│ Sharing      │                                           │
│ Verification │                                           │
│ Access Logs  │                                           │
│              │                                           │
│ Settings     │                                           │
│              │                                           │
│ Logout       │                                           │
│              │                                           │
└──────────────┴───────────────────────────────────────────┘
```

---

# 6. Main Pages

## Authentication

```text
/login
/forgot-password
/reset-password
```

## Main application

```text
/dashboard
/patients
/patients/:patientId
/reports
/reports/:reportId
/reports/upload
/sharing
/verification
/access-logs
/profile
```

---

# 7. Login Page

The login page should contain:

```text
Crypto Health Logo

Welcome Back

Email
[_____________________]

Password
[_____________________]

[ Sign In ]

Forgot Password?
```

Login flow:

```text
User
 |
 v
Login Form
 |
 v
Supabase Auth
 |
 v
Authenticated Session
 |
 v
Fetch User Profile
 |
 v
Determine Role
 |
 v
Protected Dashboard
```

The frontend should never store a password.

---

# 8. Authentication State

Create:

```text
AuthContext
```

It should expose:

```typescript
type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};
```

Authentication state:

```text
LOADING
   |
   v
Checking session
   |
   +---- No session ---> Logged Out
   |
   +---- Session ------> Logged In
```

---

# 9. Protected Routes

Protected routes prevent unauthenticated users from accessing the application.

```text
/dashboard
/patients
/reports
/sharing
/verification
/access-logs
```

Flow:

```text
Route
 |
 v
Authenticated?
 |
 +---- NO ---> /login
 |
 YES
 |
 v
Role authorized?
 |
 +---- NO ---> /403
 |
 YES
 |
 v
Page
```

---

# 10. Role-Based UI

The frontend should adapt navigation based on the authenticated role.

Example:

```text
Patient
├── Dashboard
├── My Reports
├── Sharing
├── Access History
└── Profile

Doctor
├── Dashboard
├── Patients
├── Reports
├── Upload Report
├── Verification
└── Profile

Hospital
├── Dashboard
├── Patients
├── Reports
├── Upload
├── Verification
├── Access Logs
└── Settings

Admin
├── Dashboard
├── Users
├── Hospitals
├── Doctors
├── Audit Logs
└── Settings
```

The UI role restrictions are only for user experience.

The Node.js backend remains responsible for actual authorization.

---

# 11. Dashboard

The dashboard should provide an overview.

Example:

```text
┌────────────────────────────────────────────────────────┐
│ Dashboard                                              │
│                                                        │
│ Welcome, Dr. Sharma                                    │
│                                                        │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐             │
│ │ Patients  │ │ Reports   │ │ Shared    │             │
│ │    125    │ │    340    │ │    18     │             │
│ └───────────┘ └───────────┘ └───────────┘             │
│                                                        │
│ Recent Reports                                         │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Patient │ Report │ Date │ Status │ Action          │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ Recent Activity                                        │
└────────────────────────────────────────────────────────┘
```

---

# 12. Patient Management

## Patient list

Route:

```text
/patients
```

Features:

* Search
* Filtering
* Pagination
* Patient selection
* Patient status

Example:

```text
Search patient...
[____________________________]

Patient ID     Name       Reports    Action
------------------------------------------------
P001           Rahul      5          View
P002           Ananya     3          View
P003           Arjun      8          View
```

---

# 13. Patient Search

Search should use backend APIs.

```text
Search Input
      |
      v
Debounce
      |
      v
GET /api/v1/patients
      |
      v
Node.js API
      |
      v
Results
```

Do not load the entire patient database into the browser.

---

# 14. Patient Details

Route:

```text
/patients/:patientId
```

Page:

```text
Patient Information

Name
Patient ID
Hospital

Medical Reports
--------------------------------
Report       Date       Status
Blood Test   10 Aug     Verified
X-Ray        08 Aug     Verified
MRI          01 Aug     Pending
```

Actions:

```text
View Report
Verify
Upload Report
Share
```

---

# 15. Medical Reports

Route:

```text
/reports
```

Features:

* List reports
* Search
* Filter
* Sort
* View
* Verify
* Download/access
* Status indicators

Report statuses:

```text
VERIFIED
PENDING
INVALID
REVOKED
```

---

# 16. Report Upload

Route:

```text
/reports/upload
```

Example UI:

```text
Upload Medical Report

Patient
[ Select Patient ]

Report Type
[ Select Type ]

Medical Report
┌────────────────────────────────────┐
│                                    │
│     Drag & Drop File Here          │
│                                    │
│          or Browse Files           │
│                                    │
└────────────────────────────────────┘

[ Upload Report ]
```

---

# 17. Upload Flow

```text
Select Patient
      |
      v
Select Report Type
      |
      v
Select File
      |
      v
Frontend Validation
      |
      v
Upload Progress
      |
      v
POST /api/v1/reports
      |
      v
Node.js Backend
      |
      v
Encryption + Storage
      |
      v
Success
```

Frontend validation should provide immediate feedback.

The backend must repeat all validation.

---

# 18. File Validation

Frontend should check:

```text
File exists
File extension
MIME type
File size
```

Example:

```text
PDF
Maximum configured file size
```

The frontend check is for user experience only.

The backend performs the authoritative validation.

---

# 19. Upload Progress

During upload:

```text
Uploading Report

████████████████░░░░ 80%

Please do not close this page.
```

States:

```text
IDLE
SELECTED
UPLOADING
PROCESSING
SUCCESS
ERROR
```

---

# 20. Report Details

Route:

```text
/reports/:reportId
```

Example:

```text
Medical Report

Patient: Rahul
Report Type: Blood Test
Hospital: ABC Hospital
Doctor: Dr. Sharma
Date: 10 Aug 2026

Verification
✓ Signature Valid

File
[ View Report ]

Actions
[ Verify ]
[ Download ]
```

---

# 21. Report Verification UI

The frontend should clearly show verification state.

### Verified

```text
✓ VERIFIED

This report passed cryptographic verification.
```

### Invalid

```text
⚠ VERIFICATION FAILED

The report could not be verified.
```

### Pending

```text
Verification Pending
```

Never use color alone to communicate verification status.

Use:

* Icon
* Text
* Badge

---

# 22. Report Viewer

The viewer should provide an appropriate interface for supported medical documents.

Example:

```text
┌──────────────────────────────────────────────┐
│ Report                         [Close]        │
├──────────────────────────────────────────────┤
│                                              │
│                PDF VIEWER                    │
│                                              │
│                                              │
│                                              │
├──────────────────────────────────────────────┤
│ ✓ Signature Valid                            │
└──────────────────────────────────────────────┘
```

Access should come from the backend after authorization.

---

# 23. Temporary Sharing UI

Route:

```text
/sharing
```

Features:

* Create share
* View active shares
* View expired shares
* Revoke share
* Display QR
* View share history

Example:

```text
Temporary Access

[ + Create Share ]

Active Shares

Patient       Report       Expires       Status
------------------------------------------------
Rahul         Blood Test   30 min        Active
Ananya        X-Ray        2 hours       Active
```

---

# 24. Create Share Dialog

```text
Create Temporary Access

Report
[ Blood Test — Rahul ]

Recipient
[ Doctor / Hospital ]

Access Duration
[ 30 minutes ▼ ]

Permissions
[x] View report
[ ] Download

[ Create Share ]
```

The backend must enforce these permissions.

---

# 25. QR Code Display

After creating a share:

```text
┌──────────────────────────────┐
│                              │
│          QR CODE             │
│                              │
│       ████████████           │
│       ██        ██           │
│       ██  ████  ██           │
│       ██        ██           │
│       ████████████           │
│                              │
└──────────────────────────────┘

Temporary Access

Expires in:
29:42

[ Copy Link ]
[ Revoke Access ]
```

The QR contains an access token/reference rather than the medical file itself.

---

# 26. Share Expiration UI

Show remaining time:

```text
Active
Expires in 27 minutes
```

When expired:

```text
Expired
Access is no longer available.
```

When revoked:

```text
Revoked
Access was revoked by the patient.
```

---

# 27. Revoke Access

Confirmation dialog:

```text
Revoke Access?

This will immediately prevent the recipient
from accessing this medical report.

[ Cancel ] [ Revoke Access ]
```

After confirmation:

```text
POST /api/v1/sharing/:shareId/revoke
```

Then refresh the share state.

---

# 28. Verification Page

Route:

```text
/verification
```

The page can provide:

```text
Verify Medical Report

Report ID
[________________]

[ Verify ]

Result:

✓ Signature Valid
Hospital: ABC Hospital
Doctor: Dr. Sharma
Report Hash: Verified
```

The frontend sends verification requests to the backend.

---

# 29. Access Logs

Route:

```text
/access-logs
```

Example:

```text
Access History

Date        User          Action          Status
--------------------------------------------------
10 Aug      Dr. Sharma    Report View     Success
10 Aug      Dr. Kumar     Share Access    Success
09 Aug      Unknown       Invalid Token   Denied
```

Filters:

```text
Date
User
Action
Status
Report
```

---

# 30. Profile

Route:

```text
/profile
```

Display:

```text
Profile

Name
Email
Role
Hospital
Doctor ID
Verification Status
```

Allow only safe editable information.

---

# 31. API Service Layer

All backend communication should go through service modules.

Example:

```text
services/
├── api.ts
├── auth.service.ts
├── patient.service.ts
├── report.service.ts
├── sharing.service.ts
├── verification.service.ts
└── audit.service.ts
```

Avoid making raw API calls directly inside page components.

Bad:

```typescript
fetch("/api/reports")
```

inside every component.

Preferred:

```typescript
reportService.getReports()
```

---

# 32. API Client

Create one centralized API client.

Responsibilities:

* Base URL
* Authorization
* Request headers
* Error handling
* Response parsing
* Request timeout

Architecture:

```text
React Component
      |
      v
React Hook
      |
      v
Service
      |
      v
API Client
      |
      v
Node.js Backend
```

---

# 33. Authentication API Flow

```text
Login Page
    |
    v
Auth Service
    |
    v
Supabase Auth
    |
    v
Session
    |
    v
Auth Context
    |
    v
Protected Routes
```

---

# 34. Data Fetching

Recommended approach:

```text
React Query / TanStack Query
```

Use it for:

* Patients
* Reports
* Sharing
* Verification
* Audit logs

Benefits:

* Caching
* Refetching
* Loading state
* Error handling
* Mutation state
* Cache invalidation

---

# 35. State Management

Use different mechanisms for different types of state.

### Authentication state

```text
AuthContext
```

### Server state

```text
TanStack Query
```

### Local UI state

```text
React useState
```

### Complex global UI state

```text
Zustand
```

Avoid putting every piece of application data into global state.

---

# 36. Form Management

Use:

```text
React Hook Form
+
Zod
```

Example:

```text
Form
 |
 v
React Hook Form
 |
 v
Zod validation
 |
 +---- Invalid ---> Show error
 |
 v
Service
 |
 v
Backend
```

---

# 37. Loading States

Every asynchronous operation should have a loading state.

Examples:

```text
Loading patients...
Loading reports...
Uploading...
Verifying...
Creating share...
Revoking access...
```

Use skeletons/spinners appropriately.

---

# 38. Empty States

Example:

```text
No Medical Reports

This patient does not have any
medical reports yet.

[ Upload Report ]
```

Another:

```text
No Active Shares

You haven't created any temporary
access links yet.

[ Create Share ]
```

---

# 39. Error States

Example:

```text
Unable to load reports.

Something went wrong while retrieving
the medical reports.

[ Try Again ]
```

Errors should be understandable without exposing internal backend details.

---

# 40. Notifications

Use toast notifications for operations such as:

```text
Report uploaded successfully.
Report verification completed.
Access created.
Access revoked.
Profile updated.
```

Do not display sensitive medical information in browser notifications.

---

# 41. Responsive Design

The application should work on:

```text
Desktop
Tablet
Mobile
```

Primary target:

```text
Hospital / Doctor Desktop
```

But mobile/tablet layouts should remain usable.

Example:

```text
Desktop
Sidebar + Content

Tablet
Collapsible Sidebar + Content

Mobile
Top Bar + Drawer
```

---

# 42. Tailwind Design System

Use Tailwind for layout and styling.

Recommended design principles:

```text
Clean
Professional
Medical
Trustworthy
Minimal
Accessible
```

Avoid overly decorative interfaces.

---

# 43. shadcn/ui

Use shadcn/ui for:

```text
Button
Input
Select
Dialog
Dropdown
Table
Card
Badge
Tabs
Toast
Alert
Tooltip
Calendar
Sheet
Pagination
Skeleton
```

Create reusable components instead of duplicating styles.

---

# 44. Color Semantics

Use semantic states:

```text
Success
Verified
Active

Warning
Pending
Expiring

Error
Invalid
Revoked
Denied
```

Do not rely only on color.

For example:

```text
✓ Verified
⚠ Pending
✕ Invalid
```

---

# 45. Accessibility

Requirements:

* Semantic HTML
* Proper form labels
* Keyboard navigation
* Focus states
* Screen-reader labels
* Accessible dialogs
* Accessible tables
* Sufficient contrast
* No color-only status communication

Example:

```tsx
<Button aria-label="Revoke temporary access">
  Revoke
</Button>
```

---

# 46. Security Rules

The frontend must never contain:

```text
Database passwords
Supabase service-role key
Private signing keys
Master encryption keys
Backend secrets
```

Only public/client-safe configuration belongs in frontend environment variables.

---

# 47. Frontend Environment

Example:

```env
VITE_API_URL=http://localhost:5000/api/v1

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Production:

```env
VITE_API_URL=https://api.example.com/api/v1
```

Never place server-only secrets into `VITE_*` variables.

---

# 48. Frontend Security

Implement:

```text
Protected routes
Session validation
Role-based navigation
HTTPS
Restricted CORS
Safe API handling
Input validation
File validation
Secure logout
```

Important:

> Frontend authorization is not security.

The backend must independently verify every sensitive operation.

---

# 49. Report Access Security

The frontend should never assume that possessing a report ID grants access.

Incorrect:

```text
/reports/123
```

therefore user can access report 123.

Correct:

```text
Frontend
   |
   v
GET /reports/123
   |
   v
Backend authorization
   |
   +---- DENY
   |
   +---- ALLOW
```

---

# 50. Frontend API Endpoints

The frontend will consume:

```text
/api/v1/auth/me

/api/v1/users/me

/api/v1/hospitals/me
/api/v1/hospitals/doctors

/api/v1/doctors/me

/api/v1/patients
/api/v1/patients/:patientId
/api/v1/patients/:patientId/reports

/api/v1/reports
/api/v1/reports/:reportId
/api/v1/reports/:reportId/download

/api/v1/sharing
/api/v1/sharing/:shareId
/api/v1/sharing/validate
/api/v1/sharing/:shareId/revoke

/api/v1/verification/reports/:reportId

/api/v1/audit/logs
```

---

# 51. Frontend Route Map

```text
/
|
+-- /login
|
+-- /forgot-password
|
+-- /dashboard
|
+-- /patients
|     |
|     +-- /patients/:patientId
|
+-- /reports
|     |
|     +-- /reports/:reportId
|     +-- /reports/upload
|
+-- /sharing
|
+-- /verification
|
+-- /access-logs
|
+-- /profile
|
+-- /403
|
+-- *
|     |
|     +-- /404
```

---

# 52. Main User Flow

```text
Login
  |
  v
Dashboard
  |
  v
Search Patient
  |
  v
Patient Details
  |
  v
View Reports
  |
  +----------+
  |          |
  v          v
View       Upload
Report     Report
  |
  v
Verify
  |
  v
Create Temporary Share
  |
  v
Generate QR
  |
  v
Access History
```

---

# 53. Report Upload Flow

```text
Upload Page
    |
    v
Select Patient
    |
    v
Select Report Type
    |
    v
Select File
    |
    v
Validate
    |
    v
Upload
    |
    v
Backend
    |
    v
Encryption
    |
    v
Storage
    |
    v
Success
    |
    v
Report Details
```

---

# 54. Sharing Flow

```text
Report Details
      |
      v
Share
      |
      v
Share Dialog
      |
      v
Set Recipient
      |
      v
Set Expiry
      |
      v
Set Permissions
      |
      v
Create Share
      |
      v
Backend
      |
      v
QR Code
      |
      v
Display QR
```

---

# 55. Verification Flow

```text
Report Details
      |
      v
Verify Report
      |
      v
POST /verification
      |
      v
Backend
      |
      v
Hash + Signature Verification
      |
      v
Result
      |
      +---- Valid
      |
      +---- Invalid
```

---

# 56. Component Design

Components should follow reusable patterns.

Example:

```text
ReportCard
 ├── ReportTitle
 ├── PatientName
 ├── Date
 ├── VerificationBadge
 └── ActionMenu
```

Instead of duplicating report UI across pages.

---

# 57. Type Definitions

Create shared frontend types.

Example:

```typescript
export interface MedicalReport {
  id: string;
  patientId: string;
  hospitalId: string;
  doctorId: string;
  reportType: string;
  fileName: string;
  uploadedAt: string;
  status: ReportStatus;
}
```

Status:

```typescript
export type ReportStatus =
  | "VERIFIED"
  | "PENDING"
  | "INVALID"
  | "REVOKED";
```

---

# 58. API Error Handling

Centralize API errors.

Example:

```text
401
 |
 v
Session expired
 |
 v
Redirect to login
```

```text
403
 |
 v
Access denied
 |
 v
Display permission error
```

```text
404
 |
 v
Resource not found
```

```text
500
 |
 v
Generic server error
```

---

# 59. Frontend Testing

Testing levels:

```text
                 FRONTEND TESTING
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
       Unit        Component        E2E
```

---

# 60. Unit Tests

Test:

```text
Formatters
Validators
Permission helpers
Token helpers
Utility functions
```

---

# 61. Component Tests

Test:

```text
Login form
Patient search
Report card
Report upload
Verification badge
Share dialog
QR display
Access table
```

---

# 62. E2E Tests

Use Playwright for important user journeys.

### Login

```text
Open login
   ↓
Enter credentials
   ↓
Login
   ↓
Dashboard
```

### Report

```text
Login
 ↓
Patient
 ↓
Upload
 ↓
Report appears
```

### Sharing

```text
Report
 ↓
Create Share
 ↓
QR displayed
 ↓
Revoke
 ↓
Share becomes revoked
```

---

# 63. Security Testing

Frontend security tests should include:

```text
Unauthenticated route access
Role-restricted routes
Expired sessions
403 handling
Invalid API responses
Unsafe file upload attempts
Unexpected API data
```

The frontend should never bypass backend authorization.

---

# 64. Performance

Optimize:

* Lazy-loaded pages
* Code splitting
* Image optimization
* Query caching
* Pagination
* Debounced search
* Virtualized large tables if needed

Example:

```text
Dashboard
Patients
Reports
Verification
```

can be lazy loaded.

---

# 65. Error Boundary

Use React Error Boundaries around the application.

```text
Application
   |
   v
Error Boundary
   |
   +---- Normal application
   |
   +---- Unexpected error
             |
             v
       Safe error page
```

Example:

```text
Something went wrong.

Please refresh the application or try again.

[ Refresh ]
```

---

# 66. Deployment Architecture

```text
                     INTERNET
                         |
                       HTTPS
                         |
                         v
                 React Web Application
                         |
                         |
                  REST API Requests
                         |
                         v
                 Node.js Backend
                         |
             +-----------+-----------+
             |                       |
             v                       v
       Supabase Database       Supabase Storage
```

Frontend can be deployed on:

```text
Vercel
Netlify
Render
```

---

# 67. Production Configuration

Before deployment:

```text
[ ] Production API URL
[ ] Supabase URL
[ ] Supabase public/anon key
[ ] HTTPS
[ ] Production domain
[ ] CORS configured in backend
[ ] Environment variables
[ ] Build tested
[ ] Error pages
[ ] Authentication tested
[ ] Protected routes tested
```

---

# 68. Build

Install dependencies:

```bash
npm install
```

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

---

# 69. Recommended package structure

Example dependencies:

```text
react
react-dom
react-router-dom

@supabase/supabase-js

axios

@tanstack/react-query

react-hook-form
zod
@hookform/resolvers

lucide-react

tailwindcss

shadcn/ui

qrcode.react
```

Testing:

```text
vitest
@testing-library/react
@testing-library/jest-dom
playwright
```

---

# 70. Implementation Phases

## Phase 1 — Project Setup

```text
[ ] React + Vite
[ ] TypeScript
[ ] Tailwind CSS
[ ] shadcn/ui
[ ] ESLint
[ ] Prettier
[ ] Environment configuration
```

---

## Phase 2 — Application Layout

```text
[ ] Sidebar
[ ] Header
[ ] Responsive navigation
[ ] Theme
[ ] Common components
```

---

## Phase 3 — Authentication

```text
[ ] Login
[ ] Forgot password
[ ] Session handling
[ ] Auth context
[ ] Protected routes
[ ] Role routes
[ ] Logout
```

---

## Phase 4 — Dashboard

```text
[ ] Dashboard
[ ] Statistics
[ ] Recent reports
[ ] Recent activity
[ ] Quick actions
```

---

## Phase 5 — Patients

```text
[ ] Patient list
[ ] Search
[ ] Filtering
[ ] Pagination
[ ] Patient details
[ ] Patient reports
```

---

## Phase 6 — Reports

```text
[ ] Report list
[ ] Report details
[ ] Upload page
[ ] File validation
[ ] Upload progress
[ ] Report viewer
[ ] Download/access
```

---

## Phase 7 — Verification

```text
[ ] Verification page
[ ] Verification API
[ ] Verified status
[ ] Invalid status
[ ] Verification details
```

---

## Phase 8 — Sharing

```text
[ ] Share dialog
[ ] Expiration selector
[ ] Permissions
[ ] Create share
[ ] QR generation
[ ] QR display
[ ] Share history
[ ] Revoke share
```

---

## Phase 9 — Audit

```text
[ ] Access logs
[ ] Filters
[ ] Pagination
[ ] Report activity
[ ] Security events
```

---

## Phase 10 — Testing

```text
[ ] Unit tests
[ ] Component tests
[ ] E2E tests
[ ] Authentication tests
[ ] Authorization UI tests
[ ] Upload tests
[ ] Sharing tests
```

---

## Phase 11 — Production

```text
[ ] Production environment
[ ] API URL
[ ] Build
[ ] Deployment
[ ] HTTPS
[ ] Error monitoring
[ ] Performance testing
```

---

# 71. Definition of Done

## Authentication

* [ ] Login works
* [ ] Logout works
* [ ] Session persistence works
* [ ] Protected routes work
* [ ] Role-based navigation works

## Dashboard

* [ ] Dashboard loads
* [ ] Statistics display
* [ ] Recent reports display
* [ ] Activity displays

## Patients

* [ ] Patient search works
* [ ] Patient list works
* [ ] Patient details work
* [ ] Patient reports work

## Reports

* [ ] Report upload works
* [ ] File validation works
* [ ] Upload progress works
* [ ] Report list works
* [ ] Report details work
* [ ] Report viewer works

## Verification

* [ ] Verify action works
* [ ] Valid status displayed
* [ ] Invalid status displayed
* [ ] Verification details displayed

## Sharing

* [ ] Create share works
* [ ] Expiration works
* [ ] Permissions display
* [ ] QR code displays
* [ ] Share history works
* [ ] Revoke works
* [ ] Expired state displays

## Audit

* [ ] Access logs display
* [ ] Filters work
* [ ] Pagination works

## UI/UX

* [ ] Responsive
* [ ] Accessible
* [ ] Loading states
* [ ] Empty states
* [ ] Error states
* [ ] Toast notifications
* [ ] Consistent design

## Security

* [ ] No secrets in frontend
* [ ] HTTPS
* [ ] Protected routes
* [ ] Backend authorization respected
* [ ] Safe API errors
* [ ] Secure session handling

---

# 72. Frontend Priority

## P0 — Core MVP

```text
React setup
Tailwind
shadcn/ui
Authentication
Protected routes
Dashboard
Patients
Reports
Report upload
Report details
API integration
```

## P1 — Core Crypto Health Features

```text
Report verification
Temporary sharing
QR code
Expiration
Revocation
Access history
```

## P2 — Production Quality

```text
Advanced filtering
Notifications
Performance optimization
Advanced accessibility
E2E testing
Error monitoring
Analytics
```

---

# 73. Final Frontend Architecture

```text
                           CRYPTO HEALTH
                                |
                                v
                     REACT WEB APPLICATION
                                |
              +-----------------+-----------------+
              |                 |                 |
              v                 v                 v
         Authentication     Dashboard         Application
              |                                  |
              |                    +-------------+-------------+
              |                    |             |             |
              v                    v             v             v
           Patients             Reports       Sharing      Verification
              |                    |             |             |
              |                    |             |             |
              +--------------------+-------------+-------------+
                                           |
                                           v
                                      API SERVICES
                                           |
                                           v
                                  NODE.JS BACKEND
                                           |
                              +------------+------------+
                              |                         |
                              v                         v
                       PostgreSQL                 File Storage
```

---

# 74. Final User Journey

```text
                    LOGIN
                      |
                      v
                  DASHBOARD
                      |
                      v
                SEARCH PATIENT
                      |
                      v
               PATIENT DETAILS
                      |
                      v
                MEDICAL REPORT
                      |
          +-----------+-----------+
          |                       |
          v                       v
       VIEW                    UPLOAD
          |                       |
          v                       v
     VERIFY REPORT          PROCESS REPORT
          |                       |
          +-----------+-----------+
                      |
                      v
              TEMPORARY SHARE
                      |
                      v
                  QR CODE
                      |
                      v
                ACCESS LOG
```

---

# 75. Frontend Development Principle

The frontend should be developed in this order:

```text
PROJECT SETUP
      ↓
DESIGN SYSTEM
      ↓
APPLICATION LAYOUT
      ↓
AUTHENTICATION
      ↓
PROTECTED ROUTES
      ↓
DASHBOARD
      ↓
PATIENT MANAGEMENT
      ↓
REPORT MANAGEMENT
      ↓
REPORT VERIFICATION
      ↓
TEMPORARY SHARING
      ↓
QR CODE
      ↓
ACCESS LOGS
      ↓
ERROR / LOADING STATES
      ↓
ACCESSIBILITY
      ↓
TESTING
      ↓
DEPLOYMENT
```

The frontend is therefore responsible for the **user experience and presentation layer**, while the Node.js backend remains responsible for the actual security, authorization, encryption, report access, sharing, verification, and audit decisions.

