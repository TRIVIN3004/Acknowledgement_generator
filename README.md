# Project Role & Digital Acknowledgement Management System (PRDAMS)

PRDAMS is an enterprise full-stack web application designed for software engineering teams, startups, colleges, and enterprise project groups. It eliminates role confusion by requiring team members to officially accept or decline assigned project roles and record electronic signatures. Accepted roles generate cryptographically verifiable Digital Acknowledgement Letters in PDF format complete with QR Code verification and audit metadata.

---

## 🌟 Key Features

### 👑 Admin Features & Dashboards
- **System Overview & KPI Widgets**: Total Projects, Team Members, Role Catalog, Pending & Completed Acknowledgements, Acceptance Rate.
- **Visual Analytics (Recharts)**: Interactive charts displaying members per project and role popularity distribution.
- **Project Management**: Create, edit, filter, search, archive, and track multi-stage project timelines (`Assigned` -> `Accepted` -> `Started` -> `Completed`).
- **Role Catalog Builder**: Unlimited custom roles with detailed responsibility matrices and skill requirements.
- **Member Management & Role Allocation**: Approve pending user registrations, view roster details, and assign project roles.
- **Digital Acknowledgements Master Center**: View signed letters, search by cryptographic hash or member name, preview PDF, export Excel/CSV reports, and generate ZIP archives.
- **System Security & Audit Logs**: Immutable log history of all administrative and signatory transactions.

### 👤 Team Member Workspace
- **Member Dashboard**: Overview of active projects, assigned roles, downloaded letters, and urgent action banners for pending signatures.
- **Role Acceptance & Decision Workflow**: Review project specs, tech stack, and role responsibilities before choosing to **Accept**, **Decline**, or **Request Changes**.
- **Multi-Option Digital Signature Module**:
  - **Option 1**: Draw signature on HTML5 Canvas.
  - **Option 2**: Upload signature image (PNG/JPG).
  - **Option 3**: Type full name with signature font styles (`Caveat`, `Dancing Script`, `Great Vibes`, `Alex Brush`).
  - Stores Audit Metadata: IP address, timestamp, browser user agent, and legal consent log.
- **Official PDF Acknowledgement Generator**: High-fidelity letter preview with corporate header, QR code verification badge, signature block, and instant PDF download.
- **Public QR Code Verification Portal**: Anyone can scan or verify document authenticity by hash (e.g. `PRDAMS-ACK-89F3A19C`).

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, jsPDF, html2canvas.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: Mongoose ODM schemas for MongoDB with robust automatic In-Memory Store fallback for zero-setup demoing.
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).

---

## 💻 Quick Start & Running Locally

1. **Install Dependencies**:
   ```bash
   npm run setup
   ```

2. **Run Development Servers**:
   ```bash
   # Start backend API (Port 5000)
   npm run dev:server

   # Start frontend client (Port 3000)
   npm run dev:client
   ```

3. **Login Credentials**:
   - **Admin Portal**: `admin@prdams.com` (Password: `admin123`)
   - **Team Member**: `alex@prdams.com` (Password: `member123`)
   *(Preset quick-login buttons are also provided on the Auth page for instant testing)*
