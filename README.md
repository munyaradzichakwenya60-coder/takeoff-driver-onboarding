# TakeOFF Driver Onboarding & Fleet Verification Platform
### African Unicorn Software Development Internship — Track A Assessment

**Candidate:** Munyaradzi Chakwenya  
**Phone:** `+263 712 599 823`  
**Email:** `munyaradzichakwenya60@gmail.com`  
**Live Demo:** [https://munyaradzichakwenya60-coder.github.io/takeoff-driver-onboarding/](https://munyaradzichakwenya60-coder.github.io/takeoff-driver-onboarding/)

---

## ⚡ Overview & Design Philosophy

This project implements a complete, production-grade **Driver & Fleet Partner Onboarding Flow** for **TakeOFF** (`co.zw.africanunicorn.takeoff`), Zimbabwe's on-demand delivery network.

Designed with a high-craft **"Driven" emerald theme** (`#10B981` mint/emerald accents, rounded-2xl geometry, dark slate `#0F172A` contrast, and crisp micro-interactions), it streamlines the recruitment and compliance verification of courier drivers across Harare, Bulawayo, Chitungwiza, and nationwide.

---

## 🚀 Key Features & Architectural Highlights

### 1. Dual Authentication & OTP Verification
- Mobile number validation supporting Zimbabwean country code `+263`.
- Multi-channel delivery selector (**WhatsApp** vs **SMS**).
- 6-digit auto-advancing OTP input box with live countdown timer (`45s`) and resend fallback.
- Pre-filled candidate demo number: `+263 712 599 823`.

### 2. Guided 4-Step Onboarding Wizard
- **Step 1: Driver Information & Contacts** — Full legal name, email, DOB, operating city selection (Harare CBD, Borrowdale, Bulawayo, Chitungwiza, Mutare, Gweru), and emergency contact details.
- **Step 2: Identity & KYC Verification** — National ID / Passport capture with client-side image compression badge (`342 KB · WebP`) and OCR matching.
- **Step 3: Vehicle & Delivery Equipment** — Sleek vehicle selection cards with cargo specifications:
  - 🛵 **Motorbike Courier** (Parcels & documents up to 25kg)
  - 🚗 **Courier Car** (Cartons & passenger dispatch up to 150kg)
  - 🚐 **Delivery Van** (Commercial freight & bulk logistics up to 1.2t)
  - 🚚 **Light Cargo Truck** (Pallets & heavy freight up to 5t)
- **Step 4: Licensing & Safety Compliance** — Driver license number, class selection (Class 3 / Class 4 / Class 2), vehicle third-party insurance certificate, and roadworthy inspection document capture.

### 3. Digital Sign-Off & Submission
- Comprehensive application summary breakdown with inline edit triggers.
- **Interactive Digital Signature Canvas** for on-screen touch/mouse signing.
- Legal authenticity declaration checkbox.
- Animated canvas confetti celebration with unique Application Reference ID generation (`TKF-DRV-XXXX`).

### 4. Live Reviewer Console & Database Engine
- Built-in slide-out **Reviewer Console** (`Admin Mode`) accessible via header.
- Persistent **LocalStorage Database** initialized with realistic test profiles.
- Live search & filter by driver name, phone, vehicle type, or reference ID.
- Profile inspector modal displaying all submitted data, document statuses, and digital signatures.
- **Live Status Updater**: Reviewers can toggle application status (`Approved`, `Under Review`, `Rejected`) with instant persistence.
- **JSON Data Export**: One-click download of all stored driver profiles.

---

## 🛠️ Tech Stack & Dependencies

- **HTML5 & Vanilla JavaScript (ES6+ Class State Pattern)**: Zero framework bloat, instant HMR, high runtime performance.
- **Tailwind CSS & Custom Driven Stylesheet (`styles.css`)**: Responsive mobile-first phone frame with desktop expansion toggle.
- **Lucide Icons**: Featherweight vector iconography.
- **Canvas-Confetti**: Delightful celebratory feedback.

---

## 📋 Running Locally

Simply serve `index.html` with any static server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Navigate to `http://localhost:8000` in your browser.
