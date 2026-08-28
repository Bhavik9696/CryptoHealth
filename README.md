# Crypto Health

> **Secure, patient-controlled medical-record locker and sharing platform**

Crypto Health is a patient-centric healthcare application developed by **Runtime Terror**.

The core idea is simple:

> **When a patient moves from one hospital to another, the patient's previous medical reports should remain securely available to the patient and reusable by the new healthcare provider when the patient grants access.**

The patient is the centre of the system. Hospitals and diagnostic centres are **record issuers**, while doctors and specialists are **authorized recipients**.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Why This Matters for Mangalore](#why-this-matters-for-mangalore)
- [Proposed Solution](#proposed-solution)
- [Product Scope and Boundaries](#product-scope-and-boundaries)
- [Project Objectives](#project-objectives)
- [Key Features](#key-features)
- [System Users](#system-users)
- [System Workflow](#system-workflow)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Security Architecture](#security-architecture)
- [Cryptographic Architecture](#cryptographic-architecture)
- [Digital Signature Verification](#digital-signature-verification)
- [Secure Healthcare File Transfer](#secure-healthcare-file-transfer)
- [FHIR and Healthcare Interoperability](#fhir-and-healthcare-interoperability)
- [ABDM Direction](#abdm-direction)
- [QR and Temporary Access](#qr-and-temporary-access)
- [Access Revocation](#access-revocation)
- [Audit Logging](#audit-logging)
- [Key Lifecycle and Recovery](#key-lifecycle-and-recovery)
- [Authorized Decryption](#authorized-decryption)
- [Emergency and Family Access](#emergency-and-family-access)
- [Database Design](#database-design)
- [Frontend Architecture](#frontend-architecture)
- [API Architecture](#api-architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Testing](#testing)
- [Security Testing](#security-testing)
- [Development Planning Direction](#development-planning-direction)
- [Technical Milestones and MVP](#technical-milestones-and-mvp)
- [Future Enhancements](#future-enhancements)
- [Business Model Direction](#business-model-direction)
- [Project Context](#project-context)
- [Current Status](#current-status)

---

# Project Overview

Crypto Health is designed around one primary patient journey:

```text
Patient completes a medical investigation
                |
                v
Hospital / Diagnostic Centre issues report
                |
                v
Report is securely associated with patient
                |
                v
Patient can access report through Crypto Health
                |
                v
Patient later visits another hospital
                |
                v
Patient selects previous report
                |
                v
Patient grants temporary/scoped access
                |
                v
Doctor authenticates and receives authorized access
                |
                v
Issuer/signature is verified
                |
                v
Doctor views authorized report
                |
                v
Access is recorded in audit log
```

The hackathon prototype focuses on **secure patient-controlled diagnostic-record portability**.

Crypto Health is not intended to replace a hospital's:

- HIS
- EMR/EHR
- LIS
- PACS
- Existing healthcare infrastructure

Instead, it provides a **patient-centric secure access and sharing layer**.

## Product Interfaces

Crypto Health has three primary interfaces:

### 1. Patient

- Flutter mobile application
- Patient web application

### 2. Hospital / Diagnostic Centre

- React web portal

### 3. Doctor / Specialist

- React web portal

The **patient experience remains the primary product experience**.

---

# Problem Statement

Patients often undergo expensive diagnostic investigations such as:

- Blood tests
- MRI
- CT scans
- X-rays
- ECG
- Specialized diagnostic investigations

When a patient later visits another hospital or specialist, previous reports may be:

- Inaccessible to the new provider
- Stored in incompatible systems
- Difficult to verify
- Available only as paper copies
- Manually transferred
- Difficult to reuse in the new provider's workflow

As a result, patients may be asked to repeat investigations that have already been performed.

This can cause:

- Increased healthcare costs
- Treatment delays
- Patient inconvenience
- Additional medical procedures
- Financial burden

## The Specific Problem Crypto Health Targets

> **How can a patient securely carry access to previously issued medical reports and selectively present those reports to a new hospital when needed?**

The project is deliberately focused on this patient journey rather than attempting to solve every healthcare interoperability problem.

---

# Why This Matters for Mangalore

Mangalore is a major healthcare destination for patients travelling from neighbouring districts such as:

- Udupi
- Chikkamagaluru
- Kodagu

and from North Kerala, including:

- Kasaragod
- Kannur

For these inter-district and cross-border patients, moving between healthcare providers can make previous reports especially difficult to present and verify.

For example, if a patient has already paid approximately **₹8,000 for an MRI** or completed a series of specialized cardiac blood tests, being asked to repeat the same investigation creates immediate financial pressure and can delay treatment.

Crypto Health therefore uses the Mangalore healthcare-travel context as its primary demonstration scenario while keeping the architecture applicable to other regions.

---

# Proposed Solution

Crypto Health introduces a **patient-centric medical-record locker and secure sharing platform**.

The intended workflow is:

1. A hospital or diagnostic centre issues a medical report.
2. The report is associated with the correct patient through a controlled patient-linking workflow.
3. The report is encrypted before secure storage.
4. The issuing healthcare organization digitally signs the report.
5. The patient can view and manage the report through the mobile application or website.
6. The patient later visits another hospital.
7. The patient selects the required report.
8. The patient grants temporary and scoped access.
9. The patient generates a QR code or one-time access token.
10. The doctor authenticates and uses the authorized access.
11. The system verifies the report issuer/signature.
12. The UI displays **Verified Issuer** when cryptographic verification succeeds.
13. Access is recorded in an audit log.
14. The patient can revoke access or allow it to expire.

## Important Product Principle

Crypto Health does **not** claim that a report is "medically verified".

Cryptographic verification can establish:

- Who signed/issued the report
- Whether the signed content has been modified

It cannot establish:

- Whether a diagnosis is clinically correct
- Whether the medical interpretation is correct
- Whether treatment is appropriate

Therefore the correct product language is:

> **Verified Issuer**

not:

> **Medically Verified**

---

# Product Scope and Boundaries

Crypto Health should implement the **secure-transfer and patient-control architecture now**, while integrating with external healthcare standards and networks progressively.

## We Implement Now

- Patient-controlled record access
- Secure report upload
- Secure report storage
- Encryption
- Digital signatures
- Authentication
- Authorization
- Temporary access
- QR/one-time access credentials
- Revocation
- Audit logging
- Key lifecycle design
- Secure healthcare file-transfer workflow
- Structured healthcare metadata

## We Do Not Rebuild

Crypto Health will not attempt to recreate an entire national or enterprise healthcare network.

The following are integration directions rather than systems we build from scratch:

- National HIE infrastructure
- DirectTrust trust network
- Complete Direct Secure Messaging ecosystem
- Hospital EHR/HIS ecosystems
- Full PACS infrastructure
- National ABDM infrastructure

The principle is:

> **Implement the secure transfer mechanism and patient-controlled access layer ourselves, while keeping the system compatible with established healthcare interoperability and trust standards.**

---

# Project Objectives

## Primary Objectives

- Reduce unnecessary repetition of diagnostic tests.
- Make previously issued medical reports easier for patients to carry and present.
- Keep the patient at the centre of record-access decisions.
- Protect stored medical reports using strong encryption.
- Provide temporary, scoped and revocable sharing.
- Allow receiving providers to verify the issuing organization and report integrity.
- Maintain a transparent audit history of report access.
- Provide a secure transfer mechanism for sensitive medical files.
- Keep the architecture suitable for future healthcare interoperability.
- Provide a path toward ABDM/FHIR integration.

## Security Objectives

- Protect medical information from unauthorized access.
- Authenticate patients, hospitals/diagnostic centres and doctors.
- Enforce server-side role-based authorization.
- Use short-lived and scoped access grants.
- Support access revocation.
- Encrypt medical files before storage.
- Protect cryptographic keys throughout their lifecycle.
- Provide secure key recovery.
- Prevent doctors from receiving the patient's private encryption key.
- Maintain tamper-evident audit records.

---

# Key Features

## 1. Patient Authentication

Patients authenticate securely using the platform authentication system.

## 2. Patient Medical Record Locker

Patients can:

- View reports
- View report metadata
- Open authorized reports
- Organize records
- Review report history

## 3. Patient-Initiated Hospital Linking

The preferred prototype workflow is:

```text
Patient App/Web
      |
      | Generate short-lived linking QR/code
      v
Hospital Portal
      |
      | Scan / enter code
      v
Patient identity resolved
      |
      v
Hospital uploads report
```

The linking code:

- Is short-lived
- Should not contain the medical report
- Should not expose unnecessary patient information
- Should be validated by the backend

This approach reduces dependence on matching patients only through names, dates of birth and phone numbers.

## 4. Secure Medical File Storage

Medical files are encrypted before being stored.

The storage layer must not expose report files publicly.

## 5. Digital Signatures

Reports are digitally signed by the issuing hospital or diagnostic centre.

## 6. Verified Issuer

The doctor can see a status such as:

```text
✓ VERIFIED ISSUER

Issued by:
ABC Diagnostic Centre

Signature:
Valid

Report integrity:
Valid
```

## 7. Patient-Controlled Sharing

The patient decides:

- Which report to share
- With whom
- For what scope
- For how long
- Whether to revoke access

## 8. Temporary QR / One-Time Access

Access grants can be:

- Time-limited
- Scope-limited
- Revocable
- One-time or limited-use where appropriate

## 9. Access Revocation

Patients can revoke active access grants.

Revocation is enforced by the backend.

## 10. Audit Logging

Sensitive operations create audit events.

## 11. Family / Caregiver Access

Patients can later authorize immediate family members or caregivers where supported.

## 12. Emergency Break-Glass Access

A future emergency workflow may allow authorized healthcare professionals to request exceptional access with:

- Strong identity verification
- Explicit emergency justification
- Restricted scope
- Mandatory audit logging
- Patient/family notification where possible

Emergency access must not become a hidden bypass around patient authorization.

---

# System Users

## Patient

The patient is the **primary user and access controller**.

Responsibilities:

- Register/login
- View medical reports
- Manage reports
- Share selected reports
- Generate temporary QR codes
- Generate one-time access tokens
- Set sharing scope and expiry
- Revoke access
- View access history
- Manage recovery/security settings
- Manage family/caregiver access where supported

### Patient Interfaces

- Flutter mobile application
- Patient web application

---

## Hospital / Diagnostic Centre

The hospital or diagnostic centre is a **record issuer**.

It is not the owner of the patient's Crypto Health account.

Responsibilities:

- Authenticate authorized staff
- Link a report to the correct patient
- Upload issued medical reports
- Digitally sign reports using the organization's signing identity
- Submit report metadata
- View upload/status history

The first implementation should keep this portal focused. It should not become a complete hospital-management system.

### How the Hospital Identifies the Patient

For the prototype:

```text
Patient
   |
   | "Add Report from Hospital"
   v
Temporary Linking QR / Code
   |
   v
Hospital Portal
   |
   | Scan / enter code
   v
Patient identity resolved
   |
   v
Upload Report
```

Future versions can support ABHA/ABDM-based identity workflows.

---

## Doctor / Specialist

The doctor is an **authorized recipient**.

Responsibilities:

- Authenticate
- Scan QR codes or enter temporary access tokens
- Confirm access status
- View authorized reports
- Verify issuer/signature status
- Respect scope and expiry
- Generate an audit event through report access

The doctor must never receive the patient's private encryption key.

---

## Administrator

An administrative role may be implemented for:

- User and organization management
- Platform monitoring
- Security administration
- Audit review
- Credential lifecycle administration where appropriate

Administrative privileges must not automatically provide unrestricted access to patient report plaintext.

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
Authenticated Patient Account
   |
   v
Patient Profile + Security/Recovery Setup
```

## Step 2 — Hospital-Patient Linking

```text
Patient App/Web
      |
      | Generate short-lived linking QR/code
      v
Hospital Portal
      |
      | Scan / enter code
      v
Patient identity resolved
```

## Step 3 — Hospital Uploads Report

```text
Hospital Portal
      |
      v
Upload Report
      |
      v
Node.js API
      |
      +---- Validate hospital/user authorization
      |
      +---- Validate patient link
      |
      +---- Encrypt report
      |
      +---- Create digital signature
      |
      v
Encrypted Storage
      |
      v
Metadata Database
```

## Step 4 — Patient Views Report

```text
Patient App/Web
      |
      v
Authenticate
      |
      v
Request Report
      |
      v
Backend Authorization
      |
      v
Secure Retrieval / Decryption
      |
      v
Patient Views Report
```

## Step 5 — Patient Creates Access

```text
Patient
   |
   v
Select Report
   |
   v
Share
   |
   v
Create Access Grant
   |
   +---- Recipient / role
   +---- Scope
   +---- Expiration
   +---- Usage policy
   |
   v
QR Code / One-Time Token
```

## Step 6 — Doctor Accesses Report

```text
Doctor Portal
      |
      v
Authenticate
      |
      v
Scan QR / Enter Token
      |
      v
Backend validates:
      |
      +---- Doctor identity
      +---- Token validity
      +---- Expiration
      +---- Revocation
      +---- Scope
      +---- Patient authorization
      |
      v
Authorized Access
      |
      +---- Verify Issuer Signature
      |
      v
Verified Report View
      |
      v
Audit Event
```

## Step 7 — Expiration / Revocation

```text
Patient
   |
   +---- Revoke immediately
   |
   +---- Or allow configured expiry
   |
   v
Access Grant becomes invalid
```

---

# Architecture

```text
                         CRYPTO HEALTH
              Secure Transfer + Access Layer
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
        Hospital A       Hospital B          Lab C
        / Diagnostic     / Healthcare        / Diagnostic
        Centre           Provider            Centre
             |                |                |
          Reports          Reports           Reports
             \                |               /
              \               |              /
               +--------------+-------------+
                              |
                     Patient-controlled
                         record access
                              |
                 +------------+------------+
                 |                         |
                 v                         v
          Patient Mobile App        Patient Website
             (Flutter)                (Web)

                              |
                              v
                       Doctor Portal
```

## Security / Transfer Layers

```text
+------------------------------------------------+
| Healthcare Interoperability / Metadata         |
| FHIR direction / structured records            |
+------------------------------------------------+
| Patient Consent + Access Control               |
+------------------------------------------------+
| Digital Signatures / Issuer Verification       |
+------------------------------------------------+
| Key Management / Authorized Decryption         |
+------------------------------------------------+
| AES-256-GCM Medical File Encryption             |
+------------------------------------------------+
| HTTPS / TLS Secure Transport                   |
+------------------------------------------------+
| Secure Storage                                 |
+------------------------------------------------+
| Audit Logging                                  |
+------------------------------------------------+
```

## Architectural Principles

1. **Patient-centric** — the patient is the primary record consumer and access controller.
2. **Provider-neutral** — hospitals and labs remain the issuers of their records.
3. **Secure by design** — encryption, authentication, authorization, signatures and auditing are core requirements.
4. **Secure transfer** — sensitive medical files are transferred through authenticated and encrypted channels.
5. **Temporary sharing** — access is scoped, time-limited and revocable.
6. **Interoperability-ready** — future FHIR/ABDM integration is possible.
7. **No blockchain dependency** — blockchain is not required for the core workflow.
8. **Separation of security concerns** — confidentiality, issuer authenticity, authorization, identity and auditing are distinct functions.

---

# Technology Stack

The project uses the selected repository technology stack.

## Patient Mobile

- Flutter
- Dart

## Patient Website

- Web client using the selected project web stack

## Hospital Portal

- React
- Tailwind CSS
- shadcn/ui

## Doctor Portal

- React
- Tailwind CSS
- shadcn/ui

## Backend

- Node.js
- Express.js

## Authentication

- Supabase Auth

## Database

- Supabase PostgreSQL

## Storage

- Supabase Storage for the prototype

## Deployment Target

- Render
- Railway

## Cryptographic Libraries

Crypto Health will use **established, maintained cryptographic libraries**.

---

# Security Architecture

Crypto Health separates network security, application authorization and cryptographic protection.

```text
+----------------------------------------------+
|             HTTPS / TLS                      |
+----------------------------------------------+
|              Authentication                 |
|              Supabase Auth                  |
+----------------------------------------------+
|         Server-Side Authorization            |
+----------------------------------------------+
|       Patient Consent / Access Grants        |
+----------------------------------------------+
|       Temporary QR / Access Tokens           |
+----------------------------------------------+
|          AES-256-GCM File Encryption         |
+----------------------------------------------+
|       Protected Key Management / HPKE        |
+----------------------------------------------+
|       Ed25519 Issuer Digital Signature       |
+----------------------------------------------+
|            Secure File Storage               |
+----------------------------------------------+
|              Audit Logging                   |
+----------------------------------------------+
```

## Security Separation

Crypto Health intentionally separates:

- **Confidentiality** — protecting the medical file from unauthorized reading.
- **Authenticated encryption/integrity** — detecting modification of encrypted data.
- **Issuer authenticity** — proving that a recognized healthcare organization signed the report.
- **Authorization** — deciding whether a particular user can access the report.
- **Auditability** — recording who accessed what and when.
- **Transport security** — protecting information while it is moving between trusted endpoints.

## Threat Model

Before security-sensitive implementation, the team must model:

- Stolen QR/access token
- Expired token replay
- Revoked token reuse
- Unauthorized API access
- Storage exposure
- Database compromise
- Modified report
- Fake/compromised hospital identity
- Compromised hospital signing credential
- Patient device loss
- Patient private-key loss
- Insider access
- Unauthorized administrative access
- File upload abuse
- Man-in-the-middle attempts
- Credential theft
- Broken object-level authorization
- Privilege escalation

The architecture should be designed around these threats rather than relying on the statement "the file is encrypted."

---

# Cryptographic Architecture

The current cryptographic direction is:

| Security requirement | Target technique |
|---|---|
| Medical file confidentiality | AES-256-GCM |
| Authenticated encryption | AES-256-GCM |
| Hospital/report issuer signature | Ed25519 |
| Public-key key protection / key encapsulation | HPKE with X25519 direction |
| Key derivation inside HPKE | HKDF as specified by the selected HPKE suite |
| Hashing / fingerprints | SHA-256 or approved construction where required |
| Transport security | HTTPS/TLS |
| Device key protection | Platform secure storage |
| Backend key protection | Protected server-side key-management infrastructure |

These are the **current architecture targets**. Exact libraries, suite selection, key ownership and decryption protocol must be finalized and tested before security-critical implementation.

## Why Use Multiple Cryptographic Mechanisms?

A single algorithm should not be forced to solve every security problem.

```text
AES-256-GCM
     |
     +---- Encrypt large medical files
     +---- Authenticated encryption

HPKE / X25519
     |
     +---- Protect / encapsulate small key material
     +---- Public-key key management

Ed25519
     |
     +---- Hospital/diagnostic-centre signature
     +---- Issuer authenticity
```

This is cleaner than trying to use one primitive for everything.

---

# Encryption Architecture

Medical reports must not be stored as plaintext in the storage layer.

## Envelope Encryption

Crypto Health will use **envelope encryption**.

```text
Medical Report
      |
      v
Generate fresh random 256-bit Data Encryption Key (DEK)
      |
      v
AES-256-GCM
      |
      v
Encrypted Medical File
      |
      +----------------------+
      |                      |
      v                      v
Protected DEK          GCM metadata
      |                nonce/tag/AAD
      v
Secure Metadata Store
```

The large file is encrypted using a symmetric data-encryption key.

The small DEK is separately protected using the public-key key-management mechanism.

## Why AES-256-GCM?

AES-256-GCM is the current target because:

- AES is a widely established cryptographic standard.
- GCM provides authenticated encryption.
- It provides confidentiality and integrity protection.
- It is appropriate for large-file encryption when correctly implemented.
- The encryption and authentication functions are provided by established cryptographic libraries.

A fresh nonce/IV must be generated according to the library's requirements for every encryption operation. GCM nonce reuse with the same key must never occur.

## Public-Key Protection

The project currently targets **HPKE** for protecting/encapsulating small encryption-key material rather than encrypting an entire medical file with public-key cryptography.

Current direction:

```text
HPKE
 |
 +-- X25519 KEM direction
 +-- HKDF-based key derivation
 +-- AES-256-GCM AEAD direction
```

The exact HPKE configuration and authorized-decryption protocol remain architecture decisions to be finalized.

---

# Digital Signature Verification

Digital signatures provide **issuer authenticity and report integrity**.

## Target Technique: Ed25519

```text
Hospital / Diagnostic Centre
          |
          v
     Report Package
          |
          v
     Canonical representation
          |
          v
     Ed25519 Signature
          |
          v
Stored with report metadata
```

The signature should bind the report and relevant identifying metadata.

## Verification

```text
Doctor accesses report
        |
        v
Verify Ed25519 signature
        |
        +---- Valid ------> VERIFIED ISSUER
        |
        +---- Invalid ----> REJECT / WARNING
```

The UI should use:

> **Verified Issuer**

It should not use:

> **Medically Verified**

A digital signature can establish who issued a report and whether the signed content was altered. It cannot establish that the medical diagnosis itself is clinically correct.

The exact signing format, canonicalization, hospital key storage and credential lifecycle must be finalized before implementation.

---

# Secure Healthcare File Transfer

Secure transfer is **part of Crypto Health's current architecture**, not merely a future feature.

The project takes architectural lessons from current enterprise healthcare systems:

- Authenticated endpoints
- Encrypted transport
- Public-key infrastructure concepts
- Digital signatures
- Encryption at rest
- Strong authentication
- Granular authorization
- Audit logging
- Structured healthcare data
- Secure recipient-based transfer

## Conceptual Transfer

```text
Hospital / Diagnostic Centre
            |
            | HTTPS / TLS
            v
     Crypto Health Transfer API
            |
            +---- Authenticate sender
            |
            +---- Authorize organization
            |
            +---- Validate patient link
            |
            +---- Validate file
            |
            +---- Encrypt report
            |
            +---- Sign report
            |
            v
       Encrypted Storage
            |
            v
       Patient Account
            |
            | Patient authorization
            v
      Temporary Access Grant
            |
            | HTTPS / TLS
            v
       Doctor Portal
            |
            +---- Authenticate doctor
            +---- Validate access grant
            +---- Verify signature
            |
            v
       Authorized Report
```

## Why This Resembles Secure Financial Transfer

The analogy is useful at the architectural level:

```text
Financial system:

Sender
  |
Authenticated secure channel
  |
Trusted transfer infrastructure
  |
Authorized recipient
```

Crypto Health:

```text
Healthcare provider
  |
Authenticated encrypted channel
  |
Crypto Health secure transfer layer
  |
Patient-controlled authorization
  |
Authorized healthcare recipient
```

However, Crypto Health is **not claiming to implement a banking-grade national settlement network**. The comparison is about the principle of authenticated, encrypted and authorized transfer.

## Important Distinction

TLS protects information **while travelling over the network**.

AES-256-GCM protects the report **as encrypted data at the storage layer**.

Ed25519 protects **issuer authenticity and signed integrity**.

Authorization determines **who is allowed to access it**.

These layers solve different problems.

---

# FHIR and Healthcare Interoperability

FHIR is included in Crypto Health as an **interoperability and structured-health-data layer**.

FHIR should not be treated as the encryption mechanism or as the only file-transfer mechanism.

## What FHIR Provides

FHIR can represent structured healthcare information such as:

- Patient
- Organization
- Practitioner
- Observation
- DiagnosticReport
- DocumentReference
- Consent
- AuditEvent

This makes FHIR valuable when Crypto Health eventually connects to real hospital systems.

## Crypto Health Direction

```text
Hospital HIS / LIS / EHR
          |
          | FHIR / integration adapter
          v
     Crypto Health
          |
          +---- Structured metadata
          +---- Secure report file
          +---- Consent
          +---- Access control
          +---- Verification
          +---- Audit
          |
          v
     Patient App / Web
```

---

# ABDM Direction

Crypto Health should **not** claim that it replaces ABDM.

ABDM provides important digital-health ecosystem components around areas such as:

- ABHA identity
- Consent
- Health record linking
- Personal Health Records
- Health facility registries
- Healthcare professional registries
- Interoperability

The long-term positioning is:

```text
              ABDM / Healthcare Ecosystem
                         |
                  Interoperability
                         |
                         v
                  Crypto Health
              Secure Access Layer
                         |
            +------------+------------+
            |                         |
       Patient Experience       Provider Experience
```

Crypto Health can evolve into an **ABDM-compatible secure access and sharing layer**.

ABHA can also become a future identity/linking mechanism instead of relying only on local patient-linking codes.

---

# QR and Temporary Access

A QR code is only a transport mechanism for an access credential.

The QR code must not contain the medical report itself.

Conceptually:

```text
Access Grant

Report:
MRI-2026-001

Recipient:
Authorized Doctor / Role

Scope:
VIEW

Created:
Timestamp

Expires:
Timestamp

Usage:
One-time / Limited / Time-bound

Status:
ACTIVE / REVOKED / EXPIRED
```

## Token Requirements

Tokens should be:

- Cryptographically random
- Short-lived where appropriate
- Scoped
- Server-validated
- Revocable
- Resistant to replay
- Unusable after expiration
- Unusable after revocation

A stolen token should have limited value because of its scope and lifetime.

---

# Access Revocation

The patient can revoke an active access grant.

```text
Patient
   |
   v
Revoke
   |
   v
Backend changes grant status
   |
   v
Future access attempt
   |
   v
DENIED
```

Revocation must be enforced by the backend.

The UI alone must never be treated as the security boundary.

---

# Audit Logging

Sensitive events should produce audit records.

Example:

```text
Doctor ID:
D123

Action:
VIEW_REPORT

Report:
MRI-2026-001

Time:
2026-08-26 20:41

Result:
SUCCESS
```

Audit events should cover at least:

- Report upload
- Report access
- Access denied
- Access grant created
- Access revoked
- Token expired
- Signature verification result
- Recovery events
- Emergency access events where implemented
- Security-relevant administrative actions

Audit records should be protected against unauthorized modification.

---

# Key Lifecycle and Recovery

Key recovery is a **core architecture requirement**.

Without recovery:

```text
Patient loses device
       |
       v
Private key unavailable
       |
       v
Encrypted records may become inaccessible
```

The final design must define:

- Where patient keys are generated.
- How private key material is protected on the device.
- Whether an encrypted backup is created.
- How recovery authentication works.
- How recovery works after device loss.
- How key rotation works.
- How compromised keys are replaced.
- How old keys are revoked.
- What happens if the key is permanently lost.

## Recovery Principle

Recovery must not give the platform unrestricted access to plaintext medical records.

The team must evaluate secure recovery designs before implementation.

---

# Authorized Decryption

This is one of the most important remaining architecture decisions.

The desired security property is:

```text
Patient owns/controls access
          |
          v
Patient grants Doctor access
          |
          v
Doctor receives authorized decryption capability
          |
          v
Doctor can access the report
          |
          X
Doctor does NOT receive patient's master/private key
```

The final implementation must determine exactly how the authorization and cryptographic key flow work.

Possible designs to evaluate include:

- Recipient-specific key wrapping
- Per-report encryption keys
- HPKE-based key encapsulation
- Short-lived decryption capabilities
- Backend-assisted authorized decryption
- Patient-device-assisted key release

No single option should be declared final until the threat model and recovery requirements are evaluated.

This decision must be completed **before implementing the production cryptographic workflow**.

---

# Emergency and Family Access

## Family / Caregiver Access

Patients may grant access to immediate family members or authorized caregivers.

Examples may include:

- Parent
- Spouse
- Adult child
- Appropriate caregiver

The same principles should apply:

- Patient authorization
- Scope
- Expiration
- Revocation
- Audit

## Emergency Break-Glass Access

A future emergency mechanism may support:

```text
Patient unable to provide normal consent
        |
        v
Emergency healthcare professional
        |
        v
Emergency justification
        |
        v
Restricted emergency access
        |
        v
Mandatory audit
        |
        v
Patient/family notification where possible
```

Emergency access must never become a hidden backdoor.

---

# Database Design

The exact schema will be finalized during architecture planning.

Core entities are expected to include:

```text
User
Patient
Hospital
Doctor
MedicalReport
ReportMetadata
PatientLink
AccessGrant
AccessToken
DigitalSignature
KeyMetadata
AuditLog
RecoveryEvent
```

## MedicalReport

Conceptually contains:

- Report ID
- Patient ID
- Issuing organization ID
- Report type
- File reference
- Creation timestamp
- Upload timestamp
- Encryption metadata reference
- Signature metadata reference
- Status

## AccessGrant

Conceptually contains:

- Grant ID
- Patient ID
- Report ID
- Recipient identity/role
- Scope
- Created time
- Expiry time
- Revocation state
- Usage policy

## AuditLog

Conceptually contains:

- Event ID
- Actor
- Action
- Resource
- Timestamp
- Result
- Relevant security context

---

# Frontend Architecture

## Flutter Patient Application

Suggested structure:

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
  +-- Report Details
  +-- Share Report
  +-- QR Generator
  +-- Access History
  +-- Family / Caregiver Access
  +-- Recovery / Security
  +-- Profile
```

## Patient Web Application

Suggested pages:

```text
Login
  |
  v
Dashboard
  |
  +-- Medical Records
  +-- Report Details
  +-- Share Report
  +-- QR Generator
  +-- Access History
  +-- Family / Caregiver Access
  +-- Recovery / Security
  +-- Profile
```

The mobile application remains the primary patient experience.

## React Hospital Portal

Suggested structure:

```text
hospital-web/
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
  +-- Patient Linking
  +-- Upload Report
  +-- Reports
  +-- Activity
```

## React Doctor Portal

Suggested structure:

```text
doctor-web/
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
Access Report
  |
  +-- Scan QR / Enter Token
  +-- Authorization Status
  +-- Verified Issuer
  +-- Report Viewer
  +-- Access History
```

---

# API Architecture

The backend should expose role-aware APIs.

Conceptual API groups:

```text
/auth
/patients
/hospitals
/doctors
/patient-links
/reports
/access-grants
/tokens
/signatures
/audit
/recovery
```

Examples:

```text
POST   /patient-links
POST   /reports
GET    /reports
GET    /reports/:id
POST   /access-grants
POST   /access-grants/:id/revoke
POST   /access-tokens/validate
GET    /audit
```

Exact routes should be finalized after the database and authorization model are defined.

---

# Prerequisites

Required:

- Node.js
- npm
- Flutter SDK
- Dart SDK
- Git
- Supabase project

Recommended:

- VS Code
- Android Studio
- Chrome
- Postman or equivalent API testing tool

Dependency versions should be pinned after the initial repository setup.

---

# Environment Variables

Example backend environment:

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

Additional cryptographic-service configuration will be added only after the final key-management architecture is approved.

Never commit:

```text
.env
.env.local
```

or any real secret.

Never commit:

- Passwords
- API keys
- Private keys
- JWT secrets
- Supabase service keys
- Encryption keys
- Hospital signing keys

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
cd crypto-health
```

## Backend

```bash
cd backend
npm install
npm run dev
```

## Hospital Portal

```bash
cd hospital-web
npm install
npm run dev
```

## Doctor Portal

```bash
cd doctor-web
npm install
npm run dev
```

## Patient Web

```bash
cd patient-web
npm install
npm run dev
```

## Flutter Patient App

```bash
cd mobile
flutter pub get
flutter run
```

---

# Testing

Testing should cover all major components.

## Backend

Test:

- Authentication
- Authorization
- Patient linking
- Report upload
- Report retrieval
- Encryption/decryption
- Token generation
- Token validation
- Expiration
- Revocation
- Signature verification
- Audit logging
- Recovery workflows

## Frontend

Test:

- Login
- Dashboard
- Report listing
- Report viewing
- QR generation
- Access management
- Access history
- Error states
- Recovery flows

---

# Security Testing

Important cases:

```text
Unauthorized User
       |
       v
Should be DENIED
```

```text
Expired Token
       |
       v
Should be DENIED
```

```text
Revoked Token
       |
       v
Should be DENIED
```

```text
Invalid Signature
       |
       v
Should be REJECTED / FLAGGED
```

```text
Modified Report
       |
       v
Should Fail Verification
```

Also test:

- Token replay
- QR theft
- Direct storage access
- Broken object-level authorization
- Role escalation
- Patient-to-patient access
- Doctor-to-doctor access
- Hospital impersonation
- Compromised signing key
- Lost-device recovery
- Malformed uploads
- Oversized uploads
- API rate limiting
- Transport security
- Credential theft
- Unauthorized administrative access

---

# Development Planning Direction

The project should **not start by building all UI screens**.

The secure-transfer and cryptographic architecture needs to be designed before implementing security-critical components.

The current planning order is:

```text
1. Final Product Definition
          |
          v
2. Complete User Journeys
          |
          v
3. Patient-Hospital Linking Design
          |
          v
4. Secure File Transfer Model
          |
          v
5. Threat Model
          |
          v
6. Cryptographic Protocol
          |
          v
7. Key Lifecycle + Recovery
          |
          v
8. Authorized Decryption Design
          |
          v
9. Access-Control Model
          |
          v
10. Database Model
          |
          v
11. API Model
          |
          v
12. UI/UX
          |
          v
13. MVP Definition
          |
          v
14. Implementation Plan
          |
          v
15. Security Testing
```

This sequence should be followed before large-scale development.

---

# Technical Milestones and MVP

The exact milestones will be finalized during the development-planning phase.

The MVP should demonstrate one complete end-to-end journey:

```text
Hospital
   |
   | Link patient
   v
Patient Account
   |
   | Upload report
   v
Encrypted + Signed Report
   |
   v
Patient App/Web
   |
   | Grant access
   v
Temporary QR / Token
   |
   v
Doctor Portal
   |
   | Authenticate
   | Validate authorization
   | Verify issuer
   v
Authorized Report
   |
   v
Audit Log
```

## MVP Success Criteria

A successful MVP should demonstrate that:

1. A patient can be registered.
2. A hospital can securely link to the patient.
3. A hospital can upload a report.
4. The report is encrypted before storage.
5. The report has an issuer signature.
6. The patient can view the report.
7. The patient can create temporary access.
8. A doctor can authenticate.
9. The doctor can use the temporary access mechanism.
10. The backend enforces scope/expiry/revocation.
11. The doctor can see **Verified Issuer**.
12. Access is logged.
13. Unauthorized access fails.
14. Expired/revoked access fails.

The MVP should prioritize a **secure complete journey** over a large number of incomplete features.

---

# Future Enhancements

Potential future enhancements include:

- ABDM / ABHA integration
- Actual FHIR APIs and interoperability adapters
- Direct Secure Messaging integration
- Hospital HIS/EHR/LIS integration
- PACS/DICOM support
- Large-file optimized transfer
- Patient push notifications
- Doctor/HPR verification
- Family/caregiver access
- Emergency break-glass access
- Advanced key recovery
- Multi-hospital history
- Report comparison
- Additional document formats
- Enterprise hospital APIs
- Cryptographic key rotation
- Advanced audit dashboards
- Post-quantum cryptography when justified by the project's threat model and ecosystem maturity

These are future possibilities and are not all part of the first MVP.

---

# Business Model Direction

The preferred long-term business model is:

## Patient Freemium

Patients should ideally access the core patient experience without direct payment.

## Hospital SaaS / Enterprise Integration

Hospitals and healthcare networks can pay for:

- Secure integration
- APIs
- Enterprise administration
- Interoperability integrations
- Support
- Infrastructure
- Security controls

Conceptually:

```text
                 CRYPTO HEALTH

                      |
        +-------------+-------------+
        |                           |
     PATIENTS                   HOSPITALS
        |                           |
      FREE                  SaaS / Enterprise
                                    |
                              APIs / Integration
```

The business model is a future direction and is not part of the hackathon MVP.

---

# Project Context

Crypto Health is designed around a simple principle:

> **When a patient moves between healthcare providers, the patient's previous medical reports should remain securely available and reusable with the patient's authorization.**

The project combines:

```text
Patient-Centric Access
        +
Secure Healthcare Transfer
        +
Secure Medical Storage
        +
AES-256-GCM Encryption
        +
HPKE/X25519 Key Protection Direction
        +
Ed25519 Digital Signatures
        +
Temporary Consent
        +
QR / One-Time Access
        +
Audit Logging
        +
FHIR/ABDM Interoperability Direction
```

## What Makes the Project Different

Crypto Health should not claim that it invented medical-record sharing, FHIR, encryption or healthcare interoperability.

Its focus is the combination of:

- A patient-first experience for carrying previously issued reports
- Secure healthcare file transfer
- Secure report storage
- Cryptographic protection
- Issuer verification
- Temporary, scoped and revocable access
- Transparent access history
- A future path toward FHIR/ABDM interoperability

The core differentiator is the **cross-hospital patient journey**:

```text
Previous Hospital
      |
      | Existing medical report
      v
Patient
      |
      | Patient-controlled secure access
      v
New Hospital in Mangalore
      |
      | Authorized access
      v
Doctor
      |
      | Verify issuer
      v
Existing report reused
```

---

# Current Status

**Project:** Crypto Health  
**Team:** Runtime Terror

## Current Product

Patient-centric secure medical-record locker and secure sharing platform.

## Interfaces

- Flutter patient mobile application
- Patient web application
- React hospital/diagnostic-centre portal
- React doctor/specialist portal

## Backend

- Node.js
- Express.js

## Authentication

- Supabase Auth

## Database

- Supabase PostgreSQL

## Storage

- Supabase Storage for prototype encrypted files

## Security Direction

- HTTPS/TLS
- AES-256-GCM envelope encryption
- HPKE/X25519 direction for key protection/encapsulation
- Ed25519 issuer signatures
- Established cryptographic libraries
- Temporary scoped access
- QR/one-time access credentials
- Backend-enforced revocation
- Audit logging
- Key recovery design
- Authorized decryption design

## Healthcare Interoperability Direction

- Structured healthcare metadata now
- FHIR interoperability direction
- ABDM/ABHA integration direction
- Direct Secure Messaging integration direction
- Future hospital-system integration
- Future PACS/DICOM integration

## Explicitly Out of Current MVP Scope

- Blockchain
- Post-quantum cryptography
- Full HIE implementation
- Full PACS/DICOM infrastructure
- National-scale ABDM infrastructure
- AI diagnosis
- Rebuilding DirectTrust or another national trust network

> **Important:** The exact cryptographic library choices, HPKE suite, key lifecycle, authorized-decryption protocol, recovery mechanism, patient-linking protocol, FHIR mapping, external healthcare integrations, and production compliance requirements must be finalized before implementation of the corresponding security-critical or interoperability-critical portions of the system.

---

All rights reserved.
