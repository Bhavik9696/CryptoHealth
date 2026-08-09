# Crypto Health

> **Secure, patient-controlled healthcare record sharing platform**

Crypto Health is a secure healthcare record-sharing platform developed by **Runtime Terror**. The system is designed to allow hospitals to securely upload medical reports, patients to control access to their records, and authorized doctors or specialists to access those records through temporary QR codes or one-time access tokens.

The platform addresses a common healthcare problem: patients often undergo expensive diagnostic procedures such as blood tests, MRI, CT scans, X-rays, and ECGs, but their previous reports may not be easily accessible when they visit another hospital or specialist. This can result in repeated tests, increased healthcare costs, treatment delays, and unnecessary procedures.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Problem Statement](#problem-statement)
* [Proposed Solution](#proposed-solution)
* [Project Objectives](#project-objectives)
* [Key Features](#key-features)
* [System Users](#system-users)
* [System Workflow](#system-workflow)
* [Architecture](#architecture)
* [Technology Stack](#technology-stack)
* [Security Architecture](#security-architecture)
* [Medical Report Workflow](#medical-report-workflow)
* [QR and Temporary Access](#qr-and-temporary-access)
* [Digital Signature Verification](#digital-signature-verification)
* [Audit Logging](#audit-logging)
* [Database Design](#database-design)
* [Project Structure](#project-structure)
* [Prerequisites](#prerequisites)
* [Environment Variables](#environment-variables)
* [Installation](#installation)
* [Running the Project](#running-the-project)
* [API Architecture](#api-architecture)
* [Deployment](#deployment)
* [Security Considerations](#security-considerations)
* [Testing](#testing)
* [Development Workflow](#development-workflow)
* [Future Enhancements](#future-enhancements)
* [Team](#team)
* [Project Context](#project-context)
* [License](#license)

---

## Project Overview

Crypto Health provides a secure mechanism for sharing medical records between healthcare providers while keeping the patient in control of access.

The core workflow is:

```text
Hospital
   |
   | Upload Medical Report
   v
Node.js Backend
   |
   | Encrypt + Digitally Sign
   v
Supabase Storage
   |
   | Store Metadata
   v
Supabase PostgreSQL
   |
   | Patient Controls Access
   v
Patient Flutter App
   |
   | Generate Temporary QR / Token
   v
Doctor / Specialist
   |
   | Scan QR / Enter Token
   v
Node.js Backend
   |
   | Validate Authorization
   | Check Expiration
   | Verify Signature
   v
Authorized Medical Report
   |
   v
Access Logged
```

The proposed system is intended to provide encrypted storage, patient-controlled access, temporary sharing, report authenticity verification, and access logging.

---

## Problem Statement

Patients often undergo expensive diagnostic tests including:

* Blood tests
* MRI
* CT scans
* X-rays
* ECG
* Other diagnostic investigations

When a patient visits another hospital or specialist, their previous reports may be:

* Inaccessible
* Stored in incompatible systems
* Difficult to verify
* Unavailable to the new healthcare provider

As a result, patients may be required to repeat diagnostic tests.

This creates:

* Increased healthcare costs
* Treatment delays
* Patient inconvenience
* Additional medical procedures
* Financial burden

The problem is especially relevant to the Mangalore region because patients frequently travel from neighboring districts and North Kerala for healthcare services.

---

## Proposed Solution

Crypto Health introduces a secure digital health-record sharing platform.

The platform allows:

1. Hospitals to upload medical reports.
2. Reports to be encrypted before secure storage.
3. Patients to control access to their records.
4. Patients to generate temporary QR codes or one-time access tokens.
5. Doctors to access reports only when authorized.
6. Access permissions to automatically expire.
7. Hospitals to digitally sign reports.
8. Doctors to verify report integrity and authenticity.
9. Every report access to be recorded in an audit log.

---

## Project Objectives

### Primary Objectives

* Reduce unnecessary repetition of medical tests.
* Make existing medical reports easier to access.
* Give patients control over their health records.
* Protect medical reports using encryption.
* Provide temporary and controlled report sharing.
* Verify that medical reports have not been altered.
* Maintain an auditable history of report access.

### Security Objectives

* Protect medical information from unauthorized access.
* Authenticate patients, doctors, and hospitals.
* Enforce role-based authorization.
* Use temporary access permissions.
* Support access revocation.
* Protect stored medical files.
* Maintain access logs.

---

# Key Features

## 1. Patient Authentication

Patients can securely authenticate using the platform's authentication system.

Authentication is handled using:

* Supabase Auth
* JWT-based sessions

---

## 2. Hospital Authentication

Hospitals and authorized healthcare personnel can authenticate and access hospital-side functionality.

---

## 3. Medical Report Upload

Authorized hospital users can upload diagnostic reports for patients.

Supported report types can include:

* MRI reports
* CT reports
* X-ray reports
* ECG reports
* Blood test reports
* Other diagnostic documents

The exact supported file formats should be defined during implementation.

---

## 4. Encrypted Medical Storage

Medical files should be encrypted before being stored.

```text
Original Report
      |
      v
Encryption
      |
      v
Encrypted Medical File
      |
      v
Supabase Storage
```

---

## 5. Patient-Controlled Sharing

Patients can decide when and with whom a report is shared.

```text
Patient
   |
   v
Select Report
   |
   v
Create Temporary Access
   |
   v
QR Code / One-Time Token
   |
   v
Doctor
```

---

## 6. Temporary Access

Access grants can have an expiration time.

```text
Token Created
      |
      v
Access Allowed
      |
      v
Expiration Time
      |
      v
Access Automatically Denied
```

---

## 7. Access Revocation

The system should support revoking active access before the original expiration time.

```text
Active Access
     |
     v
Patient Revokes Access
     |
     v
Token = REVOKED
     |
     v
Future Access = DENIED
```

---

## 8. QR Code Sharing

The platform uses QR codes to simplify secure sharing.

The patient can generate a QR code containing or representing a temporary access mechanism.

The doctor can scan the QR code to initiate authorized access.

---

## 9. Digital Signatures

Medical reports are digitally signed by the issuing hospital.

This allows a receiving doctor to verify whether the report has been modified.

```text
Hospital
   |
   v
Medical Report
   |
   v
Digital Signature
   |
   v
Stored Report
```

Verification:

```text
Retrieved Report
       |
       v
Signature Verification
       |
   +---+---+
   |       |
 Valid   Invalid
   |       |
   v       v
Allow    Reject /
Access   Flag
```

---

## 10. Access Logging

Every important access event should be recorded.

Example events:

* Report uploaded
* Report signed
* Report shared
* QR generated
* Token generated
* Report accessed
* Access denied
* Access revoked
* Token expired

Patients should be able to review relevant access history.

---

# System Users

## Patient

Responsibilities:

* Register/login
* View medical reports
* Manage report access
* Generate QR codes
* Generate temporary tokens
* Revoke access
* View access history

---

## Hospital

Responsibilities:

* Authenticate hospital personnel
* Manage patient records as authorized
* Upload reports
* Digitally sign reports
* Manage uploaded medical documents

---

## Doctor / Specialist

Responsibilities:

* Authenticate
* Scan QR codes
* Enter temporary access tokens
* Access authorized medical reports
* Verify report authenticity

---

## Administrator

An administrative role may be implemented for:

* User management
* Hospital management
* Platform monitoring
* Security/audit administration

The exact administrator capabilities should be finalized during implementation.

---

# System Workflow

## Step 1 — Patient Registration

```text
Patient
   |
   v
Supabase Auth
   |
   v
Authentication
   |
   v
JWT Session
```

---

## Step 2 — Hospital Uploads Report

```text
Hospital Portal
      |
      v
Select Patient
      |
      v
Upload Report
      |
      v
Node.js API
      |
      v
Encrypt Report
      |
      v
Digitally Sign
      |
      v
Supabase Storage
      |
      v
Store Metadata
      |
      v
PostgreSQL
```

---

## Step 3 — Patient Creates Access

```text
Patient Flutter App
        |
        v
Select Medical Report
        |
        v
Share Report
        |
        v
Node.js Backend
        |
        v
Create Temporary Access
        |
        v
Generate Token
        |
        v
Generate QR
```

---

## Step 4 — Doctor Scans QR

```text
Doctor
   |
   v
Scan QR
   |
   v
Extract Access Token
   |
   v
Node.js API
   |
   v
Validate Token
```

The backend checks:

```text
Is token valid?
       |
       +---- NO ---> Access Denied
       |
       YES
       |
       v
Is token expired?
       |
       +---- YES --> Access Denied
       |
       NO
       |
       v
Is token revoked?
       |
       +---- YES --> Access Denied
       |
       NO
       |
       v
Verify authorization
       |
       v
Verify report signature
       |
       v
Provide authorized access
```

---

## Step 5 — Access Logging

```text
Doctor Views Report
        |
        v
Node.js Backend
        |
        v
Create Audit Event
        |
        v
PostgreSQL
        |
        v
Patient Access History
```

---

# Architecture

```text
                       CRYPTO HEALTH
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
    Patient App       Hospital Portal      Doctor
      Flutter          React Web        Web / Portal
          |                 |                 |
          +-----------------+-----------------+
                            |
                           HTTPS
                            |
                            v
                  +--------------------+
                  |   Node.js Backend  |
                  |      Express.js    |
                  +---------+----------+
                            |
            +---------------+---------------+
            |               |               |
            v               v               v
      Supabase Auth   PostgreSQL      Supabase Storage
            |               |               |
           JWT         Metadata / Logs   Encrypted Files
```

---

# Technology Stack

| Layer                | Technology                                         |
| -------------------- | -------------------------------------------------- |
| Mobile Application   | Flutter                                            |
| Hospital Web Portal  | React                                              |
| UI Framework         | Tailwind CSS                                       |
| UI Components        | shadcn/ui                                          |
| Backend              | Node.js                                            |
| Backend Framework    | Express.js                                         |
| Authentication       | Supabase Auth                                      |
| Database             | Supabase PostgreSQL                                |
| File Storage         | Supabase Storage                                   |
| Mobile QR            | qr_flutter                                         |
| Web QR               | qrcode.react                                       |
| Backend Cryptography | Node.js cryptographic APIs / appropriate libraries |
| Client Cryptography  | Dart-compatible cryptographic implementation       |
| API Authentication   | JWT                                                |
| Deployment           | Render or Railway                                  |

---

# Backend Architecture

The Node.js backend acts as the central application API.

```text
Node.js / Express
|
+-- Authentication
|
+-- Authorization
|
+-- User Management
|
+-- Patient APIs
|
+-- Hospital APIs
|
+-- Doctor APIs
|
+-- Medical Report APIs
|
+-- Encryption Services
|
+-- Digital Signature Services
|
+-- QR / Token Services
|
+-- Access Control
|
+-- Audit Logging
|
+-- Error Handling
```

A recommended Express organization is:

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   └── app.js
├── package.json
└── .env
```

The exact implementation structure can be adjusted during development.

---

# Frontend Architecture

## Flutter Patient Application

```text
mobile/
├── lib/
│   ├── screens/
│   ├── widgets/
│   ├── services/
│   ├── models/
│   ├── providers/
│   ├── utils/
│   └── main.dart
└── pubspec.yaml
```

Suggested screens:

```text
Login
  |
  v
Dashboard
  |
  +-- Medical Records
  |
  +-- Share Report
  |
  +-- QR Generator
  |
  +-- Access History
  |
  +-- Profile
```

---

## React Hospital Portal

```text
web/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   └── App.jsx
├── package.json
└── ...
```

Suggested pages:

```text
Login
  |
  v
Dashboard
  |
  +-- Patients
  |
  +-- Patient Profile
  |
  +-- Upload Report
  |
  +-- Reports
  |
  +-- Doctors
  |
  +-- Activity
```

---

# Security Architecture

Crypto Health uses multiple security layers.

```text
+--------------------------------------+
|             HTTPS / TLS              |
+--------------------------------------+
|          Authentication              |
|          Supabase Auth               |
+--------------------------------------+
|              JWT                     |
+--------------------------------------+
|        Role-Based Access             |
+--------------------------------------+
|     Temporary Access Tokens          |
+--------------------------------------+
|       Medical File Encryption        |
+--------------------------------------+
|       Digital Signature              |
+--------------------------------------+
|       Secure File Storage            |
+--------------------------------------+
|          Audit Logging               |
+--------------------------------------+
```

---

# Encryption

Medical records are sensitive information and should not be stored as publicly readable files.

Conceptually:

```text
Medical Report
      |
      v
Encryption
      |
      v
Encrypted File
      |
      v
Supabase Storage
```

The final production cryptographic design must clearly define:

* Encryption algorithm
* Key generation
* Key ownership
* Key storage
* Key rotation
* Encryption/decryption boundaries
* Recovery procedure

These details are implementation decisions and should be finalized before production deployment.

---

# Digital Signature Verification

Digital signatures provide report integrity and authenticity.

```text
Hospital
   |
   v
Report
   |
   v
Hash / Signing Process
   |
   v
Digital Signature
   |
   v
Stored with Report Metadata
```

When a doctor retrieves the report:

```text
Report
  |
  v
Signature Verification
  |
  +---- Valid ------> Continue
  |
  +---- Invalid ----> Reject / Flag
```

---

# QR and Temporary Token Architecture

A temporary access grant can conceptually contain:

```text
Access Grant
├── Report ID
├── Patient ID
├── Authorized User / Doctor
├── Token
├── Created At
├── Expires At
└── Status
```

Possible statuses:

```text
ACTIVE
EXPIRED
REVOKED
USED
```

The exact token model should be finalized during backend implementation.

---

# Database Design

The system requires structured metadata in PostgreSQL.

Suggested logical entities:

```text
users
│
├── patients
├── doctors
├── hospitals
└── administrators

medical_reports

access_grants

access_logs
```

## Users

Possible fields:

```text
id
auth_user_id
role
name
email
created_at
updated_at
```

---

## Medical Reports

Possible fields:

```text
id
patient_id
hospital_id
report_type
file_reference
signature
created_at
updated_at
```

---

## Access Grants

Possible fields:

```text
id
report_id
patient_id
doctor_id
token_reference
created_at
expires_at
status
revoked_at
```

---

## Access Logs

Possible fields:

```text
id
report_id
user_id
action
status
timestamp
metadata
```

These schemas are conceptual and should be finalized before implementation.

---

# Storage Architecture

Supabase Storage is used as the medical file vault.

```text
                    Supabase
                       |
          +------------+------------+
          |                         |
          v                         v
     PostgreSQL                  Storage
          |                         |
     Metadata                  Medical Files
          |                         |
          +-------- Reference ------+
```

The database should contain metadata and references rather than unnecessarily duplicating medical file contents.

---

# API Architecture

The Node.js API can be organized around resources.

Suggested API groups:

```text
/api/auth
/api/users
/api/patients
/api/hospitals
/api/doctors
/api/reports
/api/access
/api/qr
/api/audit
```

Example conceptual endpoints:

```text
POST   /api/reports
GET    /api/reports
GET    /api/reports/:id

POST   /api/access
GET    /api/access
DELETE /api/access/:id

POST   /api/qr
POST   /api/qr/validate

GET    /api/audit
```

These are proposed API structures rather than routes specified in the original project proposal and should be adjusted to the actual implementation.

---

# Project Structure

A possible monorepo structure:

```text
crypto-health/
│
├── mobile/
│   ├── lib/
│   ├── android/
│   ├── ios/
│   └── pubspec.yaml
│
├── web/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── package.json
│   └── .env
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── database/
│
├── .gitignore
├── README.md
└── LICENSE
```

This is a recommended repository organization and can be changed according to the implementation.

---

# Prerequisites

Install the following before development:

### Required

* Node.js
* npm
* Flutter SDK
* Dart SDK
* Git
* Supabase project

### Recommended

* VS Code
* Android Studio
* Chrome
* Postman or an equivalent API testing tool

Version requirements should be pinned once the project dependencies are selected.

---

# Environment Variables

Create a `.env` file for the backend.

Example:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

JWT_SECRET=

STORAGE_BUCKET=

FRONTEND_URL=
```

**Never commit real secrets to Git.**

Use:

```text
.env
.env.local
```

in `.gitignore`.

The exact environment variables will depend on the final implementation.

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
cd crypto-health
```

---

## Backend

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the required variables.

Start development server:

```bash
npm run dev
```

---

## Hospital Web Portal

```bash
cd web
npm install
npm run dev
```

---

## Flutter Application

```bash
cd mobile
flutter pub get
flutter run
```

---

# Running the Complete System

Start the components independently.

### 1. Backend

```bash
cd backend
npm run dev
```

### 2. React Hospital Portal

```bash
cd web
npm run dev
```

### 3. Flutter Patient Application

```bash
cd mobile
flutter run
```

The final development environment should provide:

```text
Flutter App
     |
     v
Node.js API
     |
     +---- Supabase Auth
     |
     +---- PostgreSQL
     |
     +---- Storage

React Hospital Portal
     |
     v
Node.js API
```

---

# Deployment

The original project proposes **Render or Railway** for code deployment and Supabase for authentication, database, and storage services.

Recommended production architecture:

```text
                 INTERNET
                    |
          +---------+---------+
          |                   |
          v                   v
    Flutter Client       React Portal
                              |
                              v
                    Node.js / Express
                         Production
                              |
               +--------------+--------------+
               |              |              |
               v              v              v
          Supabase Auth   PostgreSQL     Storage
```

Before production deployment:

* Configure HTTPS.
* Configure production environment variables.
* Configure CORS.
* Configure Supabase security policies.
* Disable development/debug settings.
* Protect service-role credentials.
* Validate authentication and authorization.
* Test token expiration and revocation.
* Test file access restrictions.
* Test audit logging.

---

# Security Considerations

Because Crypto Health deals with medical information, security must be treated as a core system requirement.

## Authentication

All protected API endpoints should require appropriate authentication.

## Authorization

Authentication alone is not sufficient.

Every request should verify:

```text
Who is the user?
        |
        v
What is their role?
        |
        v
What resource are they accessing?
        |
        v
Are they authorized?
```

## Token Security

Temporary access tokens should:

* Be difficult to guess
* Have an expiration time
* Support revocation
* Be validated server-side
* Not expose sensitive medical information directly

## Storage Security

Medical files should not be publicly accessible.

Access should occur through an authorized backend flow.

## Secrets

Never commit:

```text
Passwords
API Keys
Private Keys
JWT Secrets
Supabase Service Keys
Encryption Keys
```

to source control.

---

# Testing

Testing should cover all major components.

## Backend Testing

Test:

* Authentication
* Authorization
* Report upload
* Report retrieval
* Token generation
* Token validation
* Expiration
* Revocation
* Signature verification
* Audit logging

---

## Frontend Testing

Test:

* Login
* Dashboard
* Report listing
* Report viewing
* QR generation
* Access management
* Access history
* Error states

---

## Security Testing

Important cases:

```text
Unauthorized User
       |
       v
Should be DENIED

Expired Token
       |
       v
Should be DENIED

Revoked Token
       |
       v
Should be DENIED

Invalid Signature
       |
       v
Should be REJECTED

Modified Report
       |
       v
Should Fail Verification
```

---

# Development Workflow

Recommended development sequence:

```text
1. Repository Setup
        |
        v
2. Supabase Setup
        |
        v
3. Database Design
        |
        v
4. Authentication
        |
        v
5. Node.js Backend
        |
        v
6. Medical Report Upload
        |
        v
7. Encryption
        |
        v
8. Digital Signatures
        |
        v
9. Patient Flutter App
        |
        v
10. Hospital React Portal
        |
        v
11. QR / Token Sharing
        |
        v
12. Access Expiration
        |
        v
13. Audit Logging
        |
        v
14. Security Testing
        |
        v
15. Deployment
```

---

# Future Enhancements

Potential future enhancements include:

* Support for additional medical document formats
* More advanced hospital interoperability
* Multi-hospital patient history
* Enhanced patient profile
* Doctor verification
* Notifications when a record is accessed
* More detailed audit dashboards
* Advanced analytics
* Emergency access workflows
* Additional identity verification
* Mobile push notifications

These are future possibilities and are not part of the currently specified core implementation.

---

# Project Context

Crypto Health is designed around a simple principle:

> **The patient's medical record should be securely accessible when needed, while the patient remains in control of who can access it.**

The system combines:

```text
Healthcare
    +
Security
    +
Encryption
    +
Digital Signatures
    +
Temporary Access
    +
QR Codes
    +
Audit Logging
```

The intended result is a healthcare record-sharing platform that can reduce unnecessary repetition of diagnostic tests while improving secure access to existing medical information.

---

# Core Workflow Summary

```text
             HOSPITAL
                |
                | Upload
                v
         +-------------+
         |   NODE.JS   |
         |   BACKEND   |
         +------+------+
                |
         Encrypt + Sign
                |
                v
       +----------------+
       |    SUPABASE    |
       |    STORAGE     |
       +----------------+
                |
             Metadata
                |
                v
       +----------------+
       |   POSTGRESQL   |
       +----------------+
                ^
                |
          Patient Control
                |
                v
       +----------------+
       | FLUTTER PATIENT|
       |      APP       |
       +-------+--------+
               |
          Generate QR
               |
               v
            DOCTOR
               |
          Scan QR / Token
               |
               v
         +-------------+
         |   NODE.JS   |
         | Validation  |
         +------+------+
                |
       +--------+--------+
       |        |        |
    Valid?   Expired?  Revoked?
       |        |        |
       v        v        v
     Allow     Deny      Deny
       |
       v
 Verify Signature
       |
       v
  View Report
       |
       v
  Audit Log
```

---

# Status

**Project:** Crypto Health
**Backend:** Node.js + Express.js
**Mobile:** Flutter
**Web:** React + Tailwind CSS + shadcn/ui
**Database:** Supabase PostgreSQL
**Storage:** Supabase Storage
**Authentication:** Supabase Auth
**Deployment Target:** Render / Railway

> **Note:** This README describes the intended project architecture and functionality. Implementation-specific API routes, database migrations, exact cryptographic algorithms, key-management procedures, environment variables, and repository paths should be updated as those components are finalized.

---

All rights reserved.
```
