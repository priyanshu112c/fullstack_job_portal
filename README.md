# AIGravity Job Portal

Deploy Link :- [https://job-portal-frontend-daddy82.vercel.app/](https://job-portal-frontend-daddy82.vercel.app/)

A full-stack job portal platform connecting job seekers, recruiters, and administrators with real-time messaging, AI-powered resume analysis, and comprehensive administrative moderation tools.

**Purpose:** Provide a modern, secure, and scalable job marketplace where job seekers can discover opportunities, recruiters can manage postings and applicants, and administrators can oversee platform operations with granular moderation capabilities.

**Target Users:**
- **Job Seekers** — Browse jobs, apply with resumes, track applications, analyze resumes with AI
- **Recruiters** — Register companies, post jobs, manage applications, communicate with candidates
- **Administrators** — Manage users, moderate jobs and conversations, view analytics, audit logs

---

## Table of Contents

- [Project Overview](#3-project-overview)
- [Tech Stack](#4-tech-stack)
- [Project Folder Structure](#5-project-folder-structure)
- [Architecture](#6-architecture)
- [Feature Documentation](#7-feature-documentation)
- [Authentication](#8-authentication)
- [Database Documentation](#9-database-documentation)
- [API Documentation](#10-api-documentation)
- [Environment Variables](#11-environment-variables)
- [Installation Guide](#12-installation-guide)
- [Run Commands](#13-run-commands)
- [Deployment Guide](#14-deployment-guide)
- [Security](#15-security)
- [Error Handling](#16-error-handling)
- [Performance Optimizations](#17-performance-optimizations)
- [Socket.IO](#18-socketio)
- [State Management](#19-state-management)
- [Code Flow](#20-code-flow)
- [Dependencies](#21-dependencies)
- [Scripts](#22-scripts)
- [Troubleshooting](#23-troubleshooting)
- [FAQ](#24-faq)
- [Future Improvements](#25-future-improvements)
- [Contributing Guide](#26-contributing-guide)
- [License](#27-license)
- [Credits](#28-credits)

---

## 3. Project Overview

### What It Does

AIGravity Job Portal is a role-based web application that enables three user types to interact within a job marketplace:

- **Job Seekers** can register, create detailed profiles, browse and search job listings, apply with resumes, track application statuses, chat with recruiters in real time, and get AI-powered resume analysis.
- **Recruiters** can register companies, post and manage job openings, review and update application statuses, view candidate profiles, and communicate with applicants via real-time messaging.
- **Administrators** have a full moderation dashboard to manage users (block/unblock, role changes), oversee jobs, monitor conversations (lock, unlock, delete messages), view monthly user analytics, and maintain a full audit log of all admin actions.

### Why It Was Built

To create a production-ready, open-source job portal that demonstrates modern full-stack development practices including JWT authentication with refresh tokens, real-time bidirectional communication via Socket.IO, AI integration for resume analysis, role-based access control, and comprehensive admin moderation — all while maintaining clean separation of concerns.

### Major Features

- **Role-Based Authentication** — Register, login, JWT access/refresh tokens with secure HttpOnly cookies
- **Job Seeker Profiles** — Rich profiles with education, work experience, projects, certifications, skills
- **Job Listings** — Create, read, update, delete jobs with search, filter, and pagination
- **Job Applications** — Apply to jobs, track status (applied, reviewed, interview, rejected, hired)
- **Company Management** — Recruiters register and manage their company profiles with logo upload
- **Real-Time Messaging** — Direct messaging between users with conversation listing, soft-delete, and admin moderation
- **Resume Upload & AI Analysis** — Upload PDF resumes to Cloudinary, extract text, analyze with OpenRouter AI
- **Admin Dashboard** — User management, job moderation, conversation monitoring, audit logs
- **Dark/Light Theme** — Persistent theme toggle with system preference detection
- **Persistent Auth State** — Redux-persisted authentication with automatic token refresh

### Project Goals

- Provide a fully functional job marketplace ready for production deployment
- Demonstrate industry-standard authentication and authorization patterns
- Implement real-time communication for messaging between users
- Leverage AI for value-added resume analysis features
- Include comprehensive admin tools for platform moderation
- Maintain clean, layered architecture (routes → controllers → services → models)

---

## 4. Tech Stack

### Backend

| Technology | What It Is | Why Chosen | How Used | Alternatives |
|---|---|---|---|---|
| **Node.js** | JavaScript runtime | Non-blocking I/O, event-driven architecture ideal for real-time apps | Runtime for the entire backend server | Deno, Bun |
| **Express** | Web framework for Node.js | Minimal, flexible, vast ecosystem | HTTP server, routing, middleware pipeline | Fastify, Koa, NestJS |
| **MongoDB** | NoSQL document database | Schema flexibility, JSON-like documents, easy scaling | Primary database via Mongoose ODM | PostgreSQL, MySQL |
| **Mongoose** | MongoDB ODM for Node.js | Schema validation, middleware, query building | All database models: User, Job, Application, Company, Message, etc. | Prisma (with MongoDB), native driver |
| **Socket.IO** | Real-time bidirectional communication library | Reliable WebSocket with fallback, rooms, events | Real-time messaging, admin conversation monitoring | WebSocket (raw), Pusher |
| **JWT (jsonwebtoken)** | JSON Web Token library | Stateless authentication, widely adopted | Access tokens (15min) and refresh tokens (7d) | Passport.js sessions, OAuth |
| **Bcryptjs** | Password hashing library | Industry-standard bcrypt algorithm | Password hashing (salt rounds: 12 for register, 10 for seed) | Argon2, scrypt |
| **Axios** | HTTP client for Node.js | Promise-based, interceptors, browser-compatible | Fetching PDF from Cloudinary URL for text extraction | node-fetch, got |
| **Cloudinary** | Cloud media management SDK | Built-in transformation, CDN, reliable upload streams | Resume PDF upload and company logo image upload | AWS S3, Google Cloud Storage |
| **Multer** | Multipart form data parser | Essential for file uploads in Express | Resume (PDF) and company logo (image) upload middleware | formidable, busboy |
| **OpenAI SDK** | Official OpenAI/OpenRouter client | Unified API for LLM providers | Resume analysis via OpenRouter API | LangChain, direct REST |
| **pdf-parse** | PDF text extraction library | Pure JavaScript, no native dependencies | Extracting text from PDF resumes for AI analysis | pdf.js, pdf2json |
| **Helmet** | Security header middleware | Sets secure HTTP headers easily | Applied globally for XSS, content-type sniffing, etc. | lusca |
| **CORS** | Cross-Origin Resource Sharing middleware | Required for frontend-backend separation | Strict origin checking with localhost dev allowances | Custom middleware |
| **Morgan** | HTTP request logger | Simple, configurable, popular | `dev` format logs during development | winston, pino |
| **Compression** | Response compression middleware | Reduces bandwidth, improves load times | Gzip compression on all responses (commented in app.js) | shrink-ray |
| **Cookie-Parser** | Cookie parsing middleware | Required for HttpOnly refresh token cookies | Parsing `refreshToken` cookie on refresh/logout | express-session |
| **Dotenv** | Environment variable loader | Industry standard, zero-config | Loads `.env` at server startup (`import "dotenv/config"`) | cross-env |
| **Nodemon** | Development auto-restart utility | Automatic server restart on file changes | `dev` script runs `nodemon src/server.js` | ts-node-dev, supervisor |

### Frontend

| Technology | What It Is | Why Chosen | How Used | Alternatives |
|---|---|---|---|---|
| **React 19** | UI component library | Component model, huge ecosystem, concurrent features | Entire frontend UI built with functional components and hooks | Vue, Svelte, Solid |
| **Vite** | Build tool and dev server | Fast HMR, native ESM, optimized builds | Build tool with React plugin and Tailwind CSS v4 plugin | Webpack, Parcel |
| **Redux Toolkit** | State management library | Predictable state, middleware ecosystem, devtools | Auth state management with Redux Persist | Zustand, Context API, Jotai |
| **React Router v7** | Declarative routing | Nested routes, loaders, URL params | All page routing with protected/role-based routes | TanStack Router, wouter |
| **Tailwind CSS v4** | Utility-first CSS framework | Rapid prototyping, consistent design, small bundles | All styling via utility classes with custom CSS variables | Bootstrap, Material UI |
| **Axios** | HTTP client | Interceptors for token refresh, request/response transforms | API calls with automatic auth header injection | fetch, ky |
| **React Hook Form** | Form management library | Performant, minimal re-renders, easy validation | Form state management and validation | Formik, Final Form |
| **Zod** | Schema validation library | TypeScript-first, composable schemas | Form validation schemas with @hookform/resolvers | Yup, Joi |
| **Framer Motion** | Animation library | Declarative, spring animations, gesture support | Page transitions, component animations (AuthTopNav, buttons) | react-spring, GSAP |
| **React Icons** | Icon library | Tree-shakeable, popular icon sets (Font Awesome) | Sidebar navigation icons, buttons, toggles | Heroicons, Lucide |
| **React Hot Toast** | Toast notification library | Lightweight, customizable, promise support | Success/error notifications for API actions | sonner, react-toastify |
| **React Spinners** | Loading spinner library | Simple, CSS-only spinners | Loading states (used via FaSpinner from react-icons) | react-loader-spinner |
| **Chart.js + react-chartjs-2** | Charting library | Lightweight, responsive, well-supported | Admin dashboard line chart for monthly user analytics | Recharts, Nivo |
| **Socket.IO Client** | Real-time client library | Matches server-side Socket.IO | Real-time messaging in ChatPage | EventSource, WebSocket |
| **ESLint** | Code linting | Catch errors, enforce consistency | Frontend linting with react-hooks and react-refresh plugins | Prettier, Biome |

---

## 5. Project Folder Structure

```
job_portal/
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── server.js                  # Entry point: HTTP server, Socket.IO setup, DB connection
│       ├── app.js                     # Express app: middleware, routes, error handler
│       ├── config/
│       │   ├── cloudinary.js          # Cloudinary SDK configuration
│       │   └── openrouter.js          # OpenAI/OpenRouter client configuration
│       ├── constants/
│       │   └── role.js                # Role enum constants (ADMIN, RECRUITER, JOB_SEEKER)
│       ├── controllers/
│       │   ├── auth.controller.js     # Register, login, refresh token, logout
│       │   ├── job.controller.js      # CRUD jobs with pagination and search/filter
│       │   ├── application.controller.js  # Apply, list, status update, recruiter view
│       │   ├── user.controller.js     # Resume upload, profile get/update
│       │   ├── profile.controller.js  # Job seeker profile CRUD (onboarding)
│       │   ├── company.controller.js  # Company CRUD for recruiters
│       │   ├── message.controller.js  # Conversation list, get, delete
│       │   ├── admin.controller.js    # Dashboard, users, jobs, conversations, audit logs
│       │   └── ai.controller.js       # Resume analysis trigger and retrieval
│       ├── database/
│       │   └── db.js                  # Mongoose connection with MONGO_URI
│       ├── middleware/
│       │   ├── auth.middleware.js     # JWT verification, user fetch, block check
│       │   ├── role.middleware.js     # Role-based authorization
│       │   ├── error.middleware.js    # Global error handler (status + message)
│       │   └── upload.middleware.js   # Multer config for PDF and image uploads
│       ├── models/
│       │   ├── User.js               # User: name, email, password, role, block status, resume
│       │   ├── Job.js                # Job: title, description, company, location, salary, skills
│       │   ├── Application.js        # Application: applicant, job, status, resumeUrl
│       │   ├── Company.js            # Company: name, logo, website, GST, recruiter ref
│       │   ├── Message.js            # Message: sender, receiver, content, soft-delete
│       │   ├── JobSeekerProfile.js   # Profile: education, experience, projects, certifications, skills
│       │   ├── ResumeAnalysis.js     # AI analysis: score, strengths, weaknesses, suggestions
│       │   ├── ConversationLock.js   # Lock: conversationKey, isLocked, flagged, archived
│       │   └── AuditLog.js           # Log: action, adminId, targetUserId, conversationId, metadata
│       ├── routes/
│       │   ├── auth.routes.js        # POST /register, /login, /logout, /refresh-token
│       │   ├── health.routes.js      # GET / (health check)
│       │   ├── job.routes.js         # GET /, GET /:id, POST /create-job, PUT /:id, DELETE /:id
│       │   ├── application.routes.js # POST /jobs/:id/apply, GET /me, PUT /:id/status, etc.
│       │   ├── user.routes.js        # GET /me, PUT /profile, PUT /upload-resume, GET /:id
│       │   ├── profile.routes.js     # POST /, GET /me, PUT /me
│       │   ├── company.routes.js     # POST /register, GET /me, PUT /me, DELETE /me
│       │   ├── message.routes.js     # GET /conversations, GET /:userId, DELETE /conversations/:userId
│       │   ├── ai.routes.js          # GET /resume-analysis, POST /resume-analysis
│       │   └── admin.routes.js       # Dashboard, users, jobs, conversations, audit logs
│       ├── services/
│       │   ├── auth.service.js       # User registration with bcrypt, login with block check
│       │   ├── job.service.js        # Job create, get all with filters/pagination, get by id, update, delete
│       │   ├── application.service.js # Create application, get my applications, delete
│       │   ├── user.service.js       # Update resume URL
│       │   ├── company.service.js    # CRUD operations for company
│       │   ├── message.service.js    # Save message to database
│       │   ├── admin.service.js      # Dashboard stats, monthly users, audit logs, conversation details
│       │   ├── ai.service.js         # Resume text → AI analysis via OpenRouter
│       │   └── cache.service.js      # Redis caching placeholder (not wired)
│       ├── sockets/
│       │   └── socket.js             # Socket.IO event handlers and emit helpers
│       ├── utils/
│       │   ├── token.js              # JWT access and refresh token generators
│       │   ├── customError.js        # Placeholder (empty)
│       │   ├── cloudinaryUpload.js   # Stream-based upload to Cloudinary
│       │   └── pdfTextExtractor.js   # Download PDF from URL, extract text
│       └── seed/
│           └── seedAdmin.js          # Seed admin user script
│
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js                # Vite config with React + Tailwind plugins
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── main.jsx                  # Entry: Provider (Redux) → ThemeProvider → App
│       ├── index.css                 # Tailwind import + CSS variable theme (light/dark)
│       ├── App.jsx                   # Router with all routes, route guards, Toaster
│       ├── App.css                   # Empty stylesheet
│       ├── api/
│       │   └── axios.js              # Axios instance with interceptors, token refresh queue
│       ├── services/
│       │   ├── authService.js        # loginUser, registerUser, refreshToken, logoutUser
│       │   ├── profileService.js     # createProfile, getMyProfile, updateProfile
│       │   ├── companyService.js     # registerCompany, getMyCompany, updateCompany, deleteCompany
│       │   └── jobService.js         # Empty (placeholder)
│       ├── redux/
│       │   ├── store.js              # Redux store with auth persistence in localStorage
│       │   └── slices/
│       │       └── authSlice.js      # Auth state: setCredentials, setCompany, logout, etc.
│       ├── hooks/
│       │   └── useRefreshToken.js    # Custom hook for token refresh
│       ├── contexts/
│       │   └── ThemeContext.jsx       # Dark/light theme context with system preference
│       ├── layouts/
│       │   └── DashboardLayout.jsx   # Sidebar + header + main content wrapper
│       ├── components/
│       │   ├── ProtectedRoutes.jsx   # Redirect to /login if no accessToken
│       │   ├── RoleRoutes.jsx        # Restrict by role (admin, recruiter, job_seeker)
│       │   ├── PersistLogin.jsx      # Auto-refresh token on app load
│       │   ├── ProfileGuard.jsx      # Redirect job_seekers to onboarding
│       │   ├── CompanyGuard.jsx      # Redirect recruiters without company to register
│       │   ├── Sidebar.jsx           # Role-based navigation sidebar with logout
│       │   ├── AuthTopNav.jsx        # Top navigation bar (public pages)
│       │   ├── ThemeToggle.jsx       # Dark/light mode toggle button
│       │   ├── DashboardChart.jsx    # Chart.js Line wrapper for admin analytics
│       │   ├── StatCard.jsx          # Simple stat card display
│       │   └── ConfirmModal.jsx      # Reusable confirmation dialog
│       └── pages/
│           ├── HomePage.jsx          # Landing page
│           ├── LoginPage.jsx         # Login form
│           ├── RegisterPage.jsx      # Registration form
│           ├── ForgotPasswordPage.jsx # Placeholder
│           ├── ResetPasswordPage.jsx # Placeholder
│           ├── DashboardPage.jsx     # Role-based redirect to respective dashboard
│           ├── JobSeekerDashboard.jsx # Job seeker dashboard
│           ├── RecruiterDashboard.jsx # Recruiter dashboard
│           ├── AdminDashboard.jsx    # Admin dashboard with stats and charts
│           ├── JobPage.jsx           # Job search/browse page
│           ├── JobDetailsPage.jsx    # Single job detail with apply button
│           ├── ApplicationsPage.jsx  # Job seeker's applications
│           ├── ManageJobsPage.jsx    # Recruiter's job management
│           ├── CreateJobPage.jsx     # Create new job form
│           ├── EditJobPage.jsx       # Edit existing job form
│           ├── ManageApplicationsPage.jsx # Recruiter's application management
│           ├── JobApplicantsPage.jsx # Recruiter's applicants per job
│           ├── CandidateProfilePage.jsx # View candidate profile
│           ├── ProfilePage.jsx       # User profile (resume upload)
│           ├── ChatPage.jsx          # Real-time messaging interface
│           ├── OnboardingPage.jsx    # Job seeker profile creation wizard
│           ├── CompanyRegisterPage.jsx # Recruiter company registration
│           ├── ManageCompanyPage.jsx # Recruiter company management
│           ├── ResumeAnalyzerPage.jsx # AI resume analysis results
│           ├── AdminUsersPage.jsx    # Admin user management
│           ├── AdminJobsPage.jsx     # Admin job moderation
│           ├── AdminConversationsPage.jsx # Admin conversation monitoring
│           ├── AdminAuditLogsPage.jsx # Admin audit log viewer
│           └── NotFoundPage.jsx     # 404 page
│
├── AGENT_RULES.md                   # AI agent behavior rules for this codebase
├── API_TESTING.md                   # API testing documentation
├── FRONTEND_IMPLEMENTATION_PLAN.md  # Frontend implementation plan
├── implementation_plan.md           # Project implementation plan
├── PROJECT_AUDIT.md                 # Project audit report
├── TODO.md                          # Task tracking
└── TOD0.md                          # Duplicate task tracking
```

### Key Folder Explanations

| Directory | Purpose |
|---|---|
| `backend/src/config/` | External service configurations (Cloudinary, OpenRouter API) |
| `backend/src/constants/` | Shared constants (roles enum) |
| `backend/src/controllers/` | Request handlers — parse input, call services, send responses |
| `backend/src/database/` | Database connection setup |
| `backend/src/middleware/` | Express middleware — auth, role, error, upload |
| `backend/src/models/` | Mongoose schemas and models (8 collections) |
| `backend/src/routes/` | Express route definitions mapping HTTP methods to controllers |
| `backend/src/services/` | Business logic layer between controllers and models (9 services) |
| `backend/src/sockets/` | Socket.IO event handlers and emit helpers |
| `backend/src/utils/` | Utility functions — JWT tokens, Cloudinary upload, PDF extraction |
| `backend/src/seed/` | Database seeding scripts |
| `frontend/src/api/` | Axios instance with interceptors and refresh token queue |
| `frontend/src/components/` | Reusable UI components (guards, sidebar, modals, charts) |
| `frontend/src/contexts/` | React contexts (theme) |
| `frontend/src/hooks/` | Custom React hooks (useRefreshToken) |
| `frontend/src/layouts/` | Layout components (DashboardLayout) |
| `frontend/src/pages/` | Route-level page components (28 pages) |
| `frontend/src/redux/` | Redux store configuration and slices |
| `frontend/src/services/` | API service modules for backend endpoints |

---

## 6. Architecture

### Layered Architecture (Backend)

```
HTTP Request
    │
    ▼
app.js (Global Middleware: Helmet → Compression → Morgan → CORS → JSON → CookieParser)
    │
    ▼
Routes (auth.routes.js, job.routes.js, ...)
    │
    ▼
Middleware (authenticate → authorize)
    │
    ▼
Controllers (parse request, call service, send response)
    │
    ▼
Services (business logic, data operations)
    │
    ▼
Models (Mongoose schemas → MongoDB)
```

### Frontend Architecture

```
main.jsx (Redux Provider → ThemeProvider → App)
    │
    ▼
App.jsx (BrowserRouter → Toaster → PersistLogin → Routes)
    │
    ├── Public Routes (/, /login, /register)
    ├── Protected Routes (ProtectedRoute → RoleRoute → Guard → Page)
    └── * → NotFoundPage
```

### Request Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Axios as Axios Interceptor
    participant Express as Express Backend
    participant Middleware as Auth/Role Middleware
    participant Controller
    participant Service
    participant MongoDB

    User->>Browser: Click/Submit
    Browser->>Axios: API call
    Axios->>Axios: Attach Bearer token from Redux
    Axios->>Express: HTTP Request
    Express->>Express: Global middleware (helmet, cors, etc.)
    Express->>Middleware: authenticate (verify JWT)
    Middleware-->>Express: 401 if invalid
    Express->>Middleware: authorize (check role)
    Middleware-->>Express: 403 if wrong role
    Express->>Controller: Route handler
    Controller->>Service: Business logic
    Service->>MongoDB: Database operation
    MongoDB-->>Service: Result
    Service-->>Controller: Data
    Controller-->>Express: JSON response
    Express-->>Axios: HTTP Response
    Axios->>Axios: Check 401 → refresh token
    Axios-->>Browser: Response data
    Browser->>User: UI update
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant MongoDB

    Client->>Server: POST /auth/login (email, password)
    Server->>MongoDB: Find user (+password)
    MongoDB-->>Server: User document
    Server->>Server: bcrypt.compare(password, hash)
    alt Invalid credentials
        Server-->>Client: 401 "Invalid credentials"
    else Blocked user
        Server-->>Client: 403 "Account blocked"
    else Success
        Server->>Server: Generate accessToken (15m) + refreshToken (7d)
        Server->>MongoDB: Save refreshToken to user
        Server-->>Client: Set HttpOnly cookie (refreshToken) + JSON (accessToken, user, role)
    end

    Note over Client,Server: Every subsequent request
    Client->>Server: Authorization: Bearer <accessToken>
    Server->>Server: jwt.verify(token, JWT_ACCESS_SECRET)
    alt Token expired
        Client->>Server: POST /auth/refresh-token (cookie)
        Server->>Server: jwt.verify(refreshToken, JWT_REFRESH_SECRET)
        Server->>MongoDB: Verify refreshToken match
        Server-->>Client: New accessToken
    end
```

### Socket.IO Flow

```mermaid
sequenceDiagram
    participant Client
    participant SocketIO as Socket.IO Server
    participant DB as MongoDB

    Client->>SocketIO: connect
    Client->>SocketIO: join(userId)
    SocketIO->>DB: Verify user not blocked
    SocketIO-->>Client: In room (userId)

    Note over Client,SocketIO: Send Message
    Client->>SocketIO: send_message { sender, receiver, content }
    SocketIO->>DB: Check user blocked status
    SocketIO->>DB: Check conversation lock
    SocketIO->>DB: Message.create()
    SocketIO-->>Client: receive_message (to sender + receiver rooms)

    Note over Client,SocketIO: Admin Actions
    Admin->>SocketIO: admin_lock_conversation(conversationKey)
    SocketIO-->>All: conversation_locked { conversationKey }
```

---

## 7. Feature Documentation

### 7.1 User Registration

**Purpose:** Allow new users to create accounts with name, email, password, and role selection.

**Files:**
- `backend/src/services/auth.service.js` (registerUser)
- `backend/src/controllers/auth.controller.js` (register)
- `backend/src/routes/auth.routes.js` (POST /register)
- `frontend/src/services/authService.js` (registerUser)
- `frontend/src/pages/RegisterPage.jsx`

**Backend Implementation:**
The `registerUser` service checks for an existing email, hashes the password with bcrypt (12 salt rounds), creates a new User document, and returns it. The controller saves the user and responds with 201.

**Frontend Implementation:**
RegisterPage collects name, email, password, role via React Hook Form + Zod validation, calls `authService.registerUser()`, and redirects to login on success.

**API Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "job_seeker"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Error Responses:**
- 400 — Email already registered
- 500 — Internal server error

---

### 7.2 User Login

**Purpose:** Authenticate users with email and password, issue JWT tokens.

**Files:**
- `backend/src/services/auth.service.js` (loginUser)
- `backend/src/controllers/auth.controller.js` (login)
- `backend/src/utils/token.js` (generateAccessToken, generateRefreshToken)
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/services/authService.js` (loginUser)

**Backend Implementation:**
The login service finds user with `+password` select, checks blocked status, compares password with bcrypt. On success, generateAccessToken (15m) and generateRefreshToken (7d) are created. The refresh token is saved to the user document and set as an HttpOnly cookie. The response includes the accessToken, user info, role, hasCompany status, and onboarding status.

**Frontend Implementation:**
LoginPage submits credentials to `authService.loginUser()`, dispatches `setCredentials` to Redux with the received accessToken and user data, then redirects to the appropriate dashboard based on role.

---

### 7.3 Token Refresh

**Purpose:** Silently refresh expired access tokens without requiring re-login.

**Files:**
- `backend/src/controllers/auth.controller.js` (refreshAccessToken)
- `backend/src/utils/token.js`
- `frontend/src/hooks/useRefreshToken.js`
- `frontend/src/components/PersistLogin.jsx`
- `frontend/src/api/axios.js` (response interceptor)

**Backend Implementation:**
The refresh endpoint reads the `refreshToken` cookie, verifies it with `JWT_REFRESH_SECRET`, looks up the user, verifies token match, checks block status, and issues a new access token. If the recruiter has a company, `hasCompany` is included.

**Frontend Implementation:**
- **PersistLogin** calls `useRefreshToken` on app load (if no accessToken) to restore session from cookie.
- **Axios interceptor** catches 401 responses, queues concurrent requests, calls `/auth/refresh-token`, retries original request with new token. If refresh fails, dispatches `logout()`.

---

### 7.4 Logout

**Purpose:** Clear authentication state both server-side and client-side.

**Files:**
- `backend/src/controllers/auth.controller.js` (logout)
- `frontend/src/components/Sidebar.jsx`
- `frontend/src/services/authService.js`

**Backend Implementation:**
Finds user by refreshToken, sets it to null, clears the cookie.

**Frontend Implementation:**
Sidebar calls `authService.logoutUser()` → API call, then dispatches `logout()` to clear Redux state and localStorage.

---

### 7.5 Resume Upload

**Purpose:** Allow job seekers to upload PDF resumes stored on Cloudinary.

**Files:**
- `backend/src/controllers/user.controller.js` (uploadResume)
- `backend/src/middleware/upload.middleware.js`
- `backend/src/utils/cloudinaryUpload.js`
- `backend/src/config/cloudinary.js`

**Flow:**
1. Multer middleware parses `multipart/form-data` with PDF-only filter (5MB limit)
2. Controller checks for existing resumePublicId and deletes previous file from Cloudinary
3. New file buffer is streamed to Cloudinary via `cloudinaryUpload.js`
4. User document is updated with `resumeUrl` and `resumePublicId`

**Error Handling:**
- 400 — Resume required (no file)
- Only PDF files are allowed (Multer filter)
- 5MB file size limit

---

### 7.6 Job Seeker Profile (Onboarding)

**Purpose:** Allow job seekers to create detailed professional profiles.

**Files:**
- `backend/src/controllers/profile.controller.js`
- `backend/src/models/JobSeekerProfile.js`
- `backend/src/services/user.service.js`
- `frontend/src/pages/OnboardingPage.jsx`

**Features:**
- Personal details (phone, bio, location, linkedIn, github, website)
- Education (institution, degree, field, dates, grade)
- Work Experience (company, title, location, dates, current)
- Projects (title, description, technologies, url)
- Certifications (name, issuer, dates, url)
- Skills (array of strings)
- Resume URL

**Flow:**
1. `POST /api/v1/profile` — Create new profile (checks for existing)
2. `PUT /api/v1/profile/me` — Update existing profile
3. `GET /api/v1/profile/me` — Retrieve profile
4. Creating/updating profile sets `user.onboardingCompleted = true`
5. `ProfileGuard` component redirects un-onboarded job seekers to `/onboarding`

---

### 7.7 Job Management (Recruiter)

**Purpose:** Allow recruiters to create, read, update, and delete job listings.

**Files:**
- `backend/src/controllers/job.controller.js`
- `backend/src/services/job.service.js`
- `backend/src/models/Job.js`
- `frontend/src/pages/CreateJobPage.jsx`
- `frontend/src/pages/EditJobPage.jsx`
- `frontend/src/pages/ManageJobsPage.jsx`

**Details:**
- Recruiter must have a registered company before creating jobs
- Job fields: title, description, company (auto-filled), companyLogo (auto-filled), location, salaryMin, salaryMax, employmentType (full-time, part-time, contract, internship), skills
- Recruiter can only edit/delete their own jobs
- Jobs have `isActive` flag (default true)

**API Endpoints:**
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/jobs/create-job` | Recruiter | Create job |
| GET | `/api/v1/jobs/get-job` | Public | List jobs (paginated, filterable) |
| GET | `/api/v1/jobs/:id` | Public | Get job by ID |
| PUT | `/api/v1/jobs/:id` | Owner/Admin | Update job |
| DELETE | `/api/v1/jobs/:id` | Owner/Admin | Delete job |

**Query Parameters (GET /get-job):**
- `keyword` — Search in title (case-insensitive regex)
- `location` — Search in location (case-insensitive regex)
- `type` — Filter by employmentType
- `page` — Page number (default 1)
- `limit` — Items per page (default 10)

---

### 7.8 Job Applications

**Purpose:** Allow job seekers to apply to jobs and track status; recruiters to manage applications.

**Files:**
- `backend/src/controllers/application.controller.js`
- `backend/src/services/application.service.js`
- `backend/src/models/Application.js`
- `frontend/src/pages/JobDetailsPage.jsx`
- `frontend/src/pages/ApplicationsPage.jsx`
- `frontend/src/pages/ManageApplicationsPage.jsx`
- `frontend/src/pages/JobApplicantsPage.jsx`
- `frontend/src/pages/CandidateProfilePage.jsx`

**Application Status Flow:**
```
applied → reviewed → interview → hired
                      ↓
                   rejected
```

**API Endpoints:**
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/applications/jobs/:id/apply` | Job Seeker | Apply to job |
| GET | `/api/v1/applications/me` | Job Seeker | My applications |
| GET | `/api/v1/applications/recruiter` | Recruiter/Admin | All applications for recruiter's jobs |
| GET | `/api/v1/applications/:id` | Recruiter/Admin | Application detail + candidate profile |
| PUT | `/api/v1/applications/:id/status` | Recruiter/Admin | Update application status |
| DELETE | `/api/v1/applications/:id` | Job Seeker | Withdraw application |

**Duplicate Prevention:** A job seeker cannot apply to the same job twice (unique compound index on `{applicant, job}`).

---

### 7.9 Company Management

**Purpose:** Allow recruiters to register and manage their company profiles.

**Files:**
- `backend/src/controllers/company.controller.js`
- `backend/src/services/company.service.js`
- `backend/src/models/Company.js`
- `frontend/src/pages/CompanyRegisterPage.jsx`
- `frontend/src/pages/ManageCompanyPage.jsx`

**Fields:** companyName, companyLogo (image upload to Cloudinary), websiteUrl, socialLinks, gstNumber, uinNumber

**Guard:** `CompanyGuard` redirects recruiters without a company to `/recruiter/company/register`.

---

### 7.10 Real-Time Messaging

**Purpose:** Enable direct messaging between users with real-time delivery.

**Files:**
- `backend/src/controllers/message.controller.js`
- `backend/src/services/message.service.js`
- `backend/src/models/Message.js`
- `backend/src/models/ConversationLock.js`
- `backend/src/sockets/socket.js`
- `frontend/src/pages/ChatPage.jsx`

**Features:**
- Send/receive messages in real time via Socket.IO
- Conversation list with last message and partner info
- Message soft-delete (isDeleted flag)
- Conversation locking (admin feature)
- Blocked users cannot send messages

**Socket Events:**
| Event | Direction | Description |
|---|---|---|
| `join` | Client → Server | Join user-specific room |
| `send_message` | Client → Server | Send message to another user |
| `receive_message` | Server → Client | Deliver message to sender + receiver |
| `conversation_locked` | Server → Client | Admin locked a conversation |
| `conversation_unlocked` | Server → Client | Admin unlocked a conversation |
| `conversation_deleted` | Server → Client | Conversation soft-deleted |
| `message_deleted` | Server → Client | Specific message deleted |
| `user_blocked` | Server → Client | User was blocked |
| `user_unblocked` | Server → Client | User was unblocked |

---

### 7.11 AI Resume Analysis

**Purpose:** Analyze uploaded resumes using AI (OpenRouter) to provide a score, strengths, weaknesses, and suggestions.

**Files:**
- `backend/src/controllers/ai.controller.js`
- `backend/src/services/ai.service.js`
- `backend/src/models/ResumeAnalysis.js`
- `backend/src/utils/pdfTextExtractor.js`
- `frontend/src/pages/ResumeAnalyzerPage.jsx`

**Flow:**
1. User uploads resume (via user controller → Cloudinary)
2. User triggers analysis via `POST /api/v1/ai/resume-analysis`
3. Backend downloads PDF from Cloudinary URL
4. pdf-parse extracts text from PDF buffer
5. OpenRouter (via OpenAI SDK) analyzes text with a structured prompt
6. Response is parsed (JSON from markdown fences) and saved to ResumeAnalysis collection
7. User retrieves latest analysis via `GET /api/v1/ai/resume-analysis`

**AI Prompt Template:**
```
Analyze this resume.
Return JSON: { "score": 0-100, "strengths": [], "weaknesses": [], "suggestions": [] }
```

---

### 7.12 Admin Dashboard & Moderation

**Purpose:** Provide administrators with full platform oversight and moderation tools.

**Files:**
- `backend/src/controllers/admin.controller.js`
- `backend/src/services/admin.service.js`
- `backend/src/models/AuditLog.js`
- `backend/src/models/ConversationLock.js`
- `frontend/src/pages/AdminDashboard.jsx`
- `frontend/src/pages/AdminUsersPage.jsx`
- `frontend/src/pages/AdminJobsPage.jsx`
- `frontend/src/pages/AdminConversationsPage.jsx`
- `frontend/src/pages/AdminAuditLogsPage.jsx`

**Dashboard Stats:**
- Total users, recruiters, job seekers, jobs, applications
- Monthly user signup chart

**User Management:**
- List all users with roles
- Change user roles
- Block/unblock users (with reason + timestamp)
- Delete users

**Job Moderation:**
- List all jobs with recruiter info
- Admins can delete any job

**Conversation Monitoring:**
- View all conversations between users
- Send messages as admin into conversations
- Lock/unlock conversations (prevents messaging)
- Delete individual messages
- Delete entire conversations
- View conversation details (full message history)

**Audit Logging:**
Every admin action is logged with:
- Action type (user_blocked, user_unblocked, message_deleted, conversation_locked, etc.)
- Admin ID who performed the action
- Target user ID (if applicable)
- Conversation ID (if applicable)
- Metadata (reasons, counts, content excerpts)
- Timestamps
- Admins can view and purge audit logs

---

### 7.13 Theme Toggle (Dark/Light Mode)

**Purpose:** Allow users to switch between dark and light themes with persistence.

**Files:**
- `frontend/src/contexts/ThemeContext.jsx`
- `frontend/src/components/ThemeToggle.jsx`
- `frontend/src/index.css`

**Implementation:**
- ThemeContext uses `useState` initialized from localStorage or system preference
- Toggle adds/removes `dark` class on `<html>` element
- Tailwind's `dark:` variant is enabled via `@custom-variant dark (&:where(.dark, .dark *))`
- CSS custom properties define light and dark color palettes
- All colors transition smoothly via CSS `transition` on `background-color`, `border-color`, `color`

---

### 7.14 Health Check Endpoint

**Purpose:** Simple endpoint to verify the API is running.

**File:** `backend/src/routes/health.routes.js`

**Endpoint:** `GET /api/v1/health`

**Response (200):**
```json
{
  "success": true,
  "message": "API Running"
}
```

---

## 8. Authentication

### Complete Authentication Architecture

```mermaid
flowchart TD
    A[Client] -->|1. POST /auth/login| B[Login Controller]
    B --> C[auth.service: loginUser]
    C --> D{User exists?}
    D -->|No| E[401 Invalid credentials]
    D -->|Yes| F{Blocked?}
    F -->|Yes| G[403 Account blocked]
    F -->|No| H{Password match?}
    H -->|No| E
    H -->|Yes| I[Generate accessToken + refreshToken]
    I --> J[Save refreshToken to DB]
    J --> K[Set refreshToken as HttpOnly cookie]
    K --> L[Return accessToken + user]

    M[Client] -->|2. Request with Bearer token| N[auth.middleware]
    N --> O{Authorization header?}
    O -->|No| P[401 Unauthorized]
    O -->|Yes| Q[Verify JWT with ACCESS_SECRET]
    Q -->|Invalid| P
    Q -->|Valid| R[Find user in DB]
    R --> S{User blocked?}
    S -->|Yes| T[403 Account blocked]
    S -->|No| U[Set req.user with decoded data]
    U --> V[Next middleware]

    W[Client] -->|3. Token expired| X[Axios interceptor catches 401]
    X --> Y[POST /auth/refresh-token]
    Y --> Z[Read refreshToken cookie]
    Z --> AA[Verify with REFRESH_SECRET]
    AA -->|Invalid| AB[Clear auth state, redirect to login]
    AA -->|Valid| AC[Find user, verify token match]
    AC --> AD[Generate new accessToken]
    AD --> AE[Return new accessToken]
    AE --> AF[Retry original request]
```

### Token Strategy

| Token | Type | Lifetime | Storage | Purpose |
|---|---|---|---|---|
| Access Token | JWT | 15 minutes | Redux state (memory) + Authorization header | Authenticate API requests |
| Refresh Token | JWT | 7 days | HttpOnly cookie + Database | Obtain new access tokens |

### Key Security Considerations

- **Password Hashing:** bcrypt with 12 rounds (register), 10 rounds (seed)
- **HttpOnly Cookies:** refreshToken is HttpOnly, not accessible to JavaScript (XSS protection)
- **SameSite Lax:** Prevents CSRF for cookie-based refresh
- **Secure Flag:** Enabled in production (`NODE_ENV === "production"`)
- **Token Rotation:** Refresh token is stored in DB; if compromised, server-side invalidation is possible
- **Blocked User Check:** Performed on every authenticated request (middleware) and on login/refresh
- **Account Blocking:** Blocked users cannot authenticate or receive messages

### Protected Routes (Frontend)

```
Public: /, /login, /register, /forgot-password, /reset-password

Protected (any authenticated):
  /dashboard → Redirects to role-specific dashboard
  /profile
  /messages

Protected (job_seeker only, requires onboarding):
  /dashboard/job-seeker
  /jobs, /jobs/:id
  /applications
  /resume-analyzer, /resume/analyzer

Protected (recruiter only):
  /recruiter/company/register (no company check)
  /recruiter (requires company)
  /recruiter/jobs (requires company)
  /recruiter/jobs/new (requires company)
  /recruiter/jobs/:id/edit (requires company)
  /recruiter/applications (requires company)

Protected (admin only):
  /admin
  /admin/users
  /admin/jobs
  /admin/conversations
  /admin/audit-logs
```

---

## 9. Database Documentation

### Collections Overview

| Collection | Model | Documents Stored | Key Fields |
|---|---|---|---|
| `users` | User | All users | name, email, password, role, status, resumeUrl, refreshToken |
| `jobs` | Job | Job listings | title, description, company, location, salary, skills, recruiter |
| `applications` | Application | Job applications | applicant, job, status, resumeUrl |
| `companies` | Company | Recruiter companies | companyName, companyLogo, recruiter, gstNumber |
| `messages` | Message | Chat messages | sender, receiver, content, isDeleted, role |
| `jobseekerprofiles` | JobSeekerProfile | Seeker profiles | user, personalDetails, education, workExperience, skills |
| `resumeanalyses` | ResumeAnalysis | AI analysis results | user, score, strengths, weaknesses |
| `conversationlocks` | ConversationLock | Locked/flagged convos | conversationKey, isLocked, flaggedReason, lockedBy |
| `auditlogs` | AuditLog | Admin action history | action, adminId, targetUserId, metadata |

### User Schema

```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, select: false),
  resumeUrl: String,
  resumePublicId: String,
  role: String (enum: "admin" | "recruiter" | "job_seeker", default: "job_seeker"),
  status: String (enum: "active" | "blocked", default: "active"),
  isBlocked: Boolean (default: false),
  blockedAt: Date,
  blockedReason: String,
  blockedBy: ObjectId (ref: User),
  refreshToken: String,
  onboardingCompleted: Boolean (default: false),
  timestamps: true
}
```
- **Index:** `{ email: 1 }` (unique)

### Job Schema

```javascript
{
  title: String (required),
  description: String (required),
  company: String (required),
  companyLogo: String,
  location: String (required),
  salaryMin: Number,
  salaryMax: Number,
  employmentType: String (enum: "full-time" | "part-time" | "contract" | "internship"),
  skills: [String],
  recruiter: ObjectId (ref: User, required),
  isActive: Boolean (default: true),
  timestamps: true
}
```
- **Index:** `{ title: 1, location: 1, employmentType: 1 }`

### Application Schema

```javascript
{
  applicant: ObjectId (ref: User, required),
  job: ObjectId (ref: Job, required),
  status: String (enum: "applied" | "reviewed" | "interview" | "rejected" | "hired", default: "applied"),
  resumeUrl: String,
  timestamps: true
}
```
- **Index:** `{ applicant: 1, job: 1 }` (unique compound — prevents duplicate applications)

### Company Schema

```javascript
{
  companyName: String (required),
  companyLogo: String,
  companyLogoPublicId: String,
  websiteUrl: String,
  socialLinks: String,
  gstNumber: String,
  uinNumber: String,
  recruiter: ObjectId (ref: User, required, unique),
  timestamps: true
}
```

### Message Schema

```javascript
{
  sender: ObjectId (ref: User, required),
  receiver: ObjectId (ref: User, required),
  content: String (required),
  role: String (enum: "admin" | "user" | "recruiter" | "system", optional),
  isRead: Boolean (default: false),
  isDeleted: Boolean (default: false, indexed),
  deletedAt: Date,
  deletedBy: ObjectId (ref: User),
  timestamps: true
}
```

### JobSeekerProfile Schema

```javascript
{
  user: ObjectId (ref: User, required, unique),
  personalDetails: {
    phone, bio, location, dateOfBirth, linkedIn, github, website
  },
  education: [{
    institution, degree, fieldOfStudy, startDate, endDate, grade, description
  }],
  workExperience: [{
    company, title, location, startDate, endDate, current, description
  }],
  projects: [{
    title, description, technologies, url, startDate, endDate
  }],
  certifications: [{
    name, issuer, issueDate, expiryDate, url
  }],
  skills: [String],
  resumeUrl: String,
  resumePublicId: String,
  timestamps: true
}
```

### ResumeAnalysis Schema

```javascript
{
  user: ObjectId (ref: User, required),
  score: Number,
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  timestamps: true
}
```

### ConversationLock Schema

```javascript
{
  conversationKey: String (required, unique, indexed),
  participants: [ObjectId (ref: User)],
  isLocked: Boolean (default: false),
  isArchived: Boolean (default: false, indexed),
  archivedAt: Date,
  archivedBy: ObjectId (ref: User),
  isFlagged: Boolean (default: false, indexed),
  flaggedReason: String,
  flaggedAt: Date,
  flaggedBy: ObjectId (ref: User),
  lockedBy: ObjectId (ref: User),
  timestamps: true
}
```

### AuditLog Schema

```javascript
{
  action: String (enum: "user_blocked" | "user_unblocked" | "message_deleted" | "conversation_locked" | "conversation_unlocked" | "admin_message_sent" | "conversation_archived" | "conversation_flagged" | "conversation_deleted", required),
  adminId: ObjectId (ref: User, required),
  targetUserId: ObjectId (ref: User),
  conversationId: String,
  metadata: Mixed,
  timestamps: true
}
```
- **Indexes:** `{ action: 1, createdAt: -1 }`, `{ adminId: 1 }`, `{ targetUserId: 1 }`

---

## 10. API Documentation

All API endpoints are prefixed with `/api/v1`.

### Health

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/health` | No | Server health check |

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login and receive tokens |
| POST | `/api/v1/auth/logout` | No | Logout (clears cookie + DB token) |
| POST | `/api/v1/auth/refresh-token` | Cookie | Refresh access token |

### Jobs

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/jobs/get-job` | No | List jobs (paginated, with search/filter) |
| GET | `/api/v1/jobs/:id` | No | Get single job by ID |
| POST | `/api/v1/jobs/create-job` | Recruiter | Create a new job |
| PUT | `/api/v1/jobs/:id` | Owner/Admin | Update a job |
| DELETE | `/api/v1/jobs/:id` | Owner/Admin | Delete a job |

**GET /api/v1/jobs/get-job — Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `keyword` | String | Search in job title (case-insensitive) |
| `location` | String | Search in job location (case-insensitive) |
| `type` | String | Filter by employmentType |
| `page` | Number | Page number (default: 1) |
| `limit` | Number | Items per page (default: 10) |

**Example Request:**
```
GET /api/v1/jobs/get-job?keyword=developer&location=new+york&type=full-time&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "jobs": [
    {
      "_id": "...",
      "title": "Senior Developer",
      "description": "...",
      "company": "TechCorp",
      "companyLogo": "https://...",
      "location": "New York, NY",
      "salaryMin": 100000,
      "salaryMax": 150000,
      "employmentType": "full-time",
      "skills": ["React", "Node.js"],
      "recruiter": "...",
      "isActive": true,
      "createdAt": "..."
    }
  ],
  "page": 1,
  "totalPage": 5,
  "totalRecords": 42
}
```

### Applications

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/applications/jobs/:id/apply` | Job Seeker | Apply to a job |
| GET | `/api/v1/applications/me` | Job Seeker | Get my applications |
| GET | `/api/v1/applications/recruiter` | Recruiter/Admin | Get applications for recruiter's jobs |
| GET | `/api/v1/applications/:id` | Recruiter/Admin | Get application detail + candidate profile |
| PUT | `/api/v1/applications/:id/status` | Recruiter/Admin | Update application status |
| DELETE | `/api/v1/applications/:id` | Job Seeker | Withdraw/delete application |

### Users

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/users/me` | Any | Get current user profile |
| PUT | `/api/v1/users/profile` | Any | Update name/email |
| GET | `/api/v1/users/:id` | Any | Get user by ID (no password/refreshToken) |
| PUT | `/api/v1/users/upload-resume` | Job Seeker | Upload PDF resume (multipart) |

### Profile (Job Seeker)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/profile` | Any | Create job seeker profile |
| GET | `/api/v1/profile/me` | Any | Get my profile |
| PUT | `/api/v1/profile/me` | Any | Update my profile |

### Companies

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/companies/register` | Recruiter | Register company (multipart with logo) |
| GET | `/api/v1/companies/me` | Recruiter | Get my company |
| PUT | `/api/v1/companies/me` | Recruiter | Update company (multipart with logo) |
| DELETE | `/api/v1/companies/me` | Recruiter | Delete company |

### Messages

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/message/conversations` | Any | List conversations with last message |
| GET | `/api/v1/message/:userId` | Any | Get conversation with specific user |
| DELETE | `/api/v1/message/conversations/:userId` | Any | Soft-delete conversation |

### AI

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/ai/resume-analysis` | Job Seeker | Trigger AI resume analysis |
| GET | `/api/v1/ai/resume-analysis` | Job Seeker | Get latest analysis result |

### Admin

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/admin/dashboard` | Admin | Dashboard statistics |
| GET | `/api/v1/admin/monthly-users` | Admin | Monthly user registration data |
| **Users** | | | |
| GET | `/api/v1/admin/users` | Admin | List all users |
| PUT | `/api/v1/admin/users/:id/role` | Admin | Update user role |
| PUT | `/api/v1/admin/users/:id/block` | Admin | Block user (body: `{ reason }`) |
| PUT | `/api/v1/admin/users/:id/unblock` | Admin | Unblock user |
| DELETE | `/api/v1/admin/users/:id` | Admin | Delete user |
| **Jobs** | | | |
| GET | `/api/v1/admin/jobs` | Admin | List all jobs with recruiter info |
| **Conversations** | | | |
| GET | `/api/v1/admin/conversations` | Admin | List all conversations (with filters) |
| GET | `/api/v1/admin/conversations/:conversationId` | Admin | Get conversation messages |
| POST | `/api/v1/admin/conversations/:conversationKey/messages` | Admin | Send message as admin |
| PUT | `/api/v1/admin/conversations/:conversationKey/lock` | Admin | Lock conversation |
| PUT | `/api/v1/admin/conversations/:conversationKey/unlock` | Admin | Unlock conversation |
| DELETE | `/api/v1/admin/conversations/:conversationKey` | Admin | Delete conversation |
| **Messages** | | | |
| DELETE | `/api/v1/admin/messages/:messageId` | Admin | Delete specific message |
| **Audit Logs** | | | |
| GET | `/api/v1/admin/audit-logs` | Admin | Get audit logs (paginated) |
| DELETE | `/api/v1/admin/audit-logs` | Admin | Purge all audit logs |

---

## 11. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Example Value | Purpose | Used In |
|---|---|---|---|---|
| `PORT` | No (default: 5000) | `5000` | Server port | `server.js` |
| `MONGO_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/job_portal` | MongoDB connection string | `database/db.js` |
| `JWT_ACCESS_SECRET` | Yes | `your-access-secret-min-32-chars` | Signing access tokens (15m expiry) | `utils/token.js`, `middleware/auth.middleware.js` |
| `JWT_REFRESH_SECRET` | Yes | `your-refresh-secret-min-32-chars` | Signing refresh tokens (7d expiry) | `utils/token.js`, `controllers/auth.controller.js` |
| `CLIENT_URL` | Yes | `http://localhost:5173` | CORS origin + Socket.IO origin | `app.js`, `server.js` |
| `NODE_ENV` | No | `development` | Environment flag (secure cookies in production) | `controllers/auth.controller.js` |
| `CLOUDINARY_CLOUD_NAME` | Yes | `your-cloud-name` | Cloudinary cloud name | `config/cloudinary.js` |
| `CLOUDINARY_API_KEY` | Yes | `123456789012345` | Cloudinary API key | `config/cloudinary.js` |
| `CLOUDINARY_API_SECRET` | Yes | `your-api-secret` | Cloudinary API secret | `config/cloudinary.js` |
| `OPENROUTER_API_KEY` | Yes | `sk-or-v1-...` | OpenRouter API key for AI | `config/openrouter.js` |
| `OPENROUTER_BASE_URL` | Yes | `https://openrouter.ai/api/v1` | OpenRouter base URL | `config/openrouter.js` |
| `AI_MODEL` | Yes | `openai/gpt-4o-mini` | AI model identifier for resume analysis | `services/ai.service.js` |

### Frontend (`frontend/.env`)

| Variable | Required | Example Value | Purpose | Used In |
|---|---|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:5000/api/v1` | Backend API base URL | `api/axios.js` |

### Example `.env` (Backend)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/job_portal?retryWrites=true&w=majority

# JWT
JWT_ACCESS_SECRET=your-access-secret-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters-long

# Client URL
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# OpenRouter (AI)
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=openai/gpt-4o-mini
```

### Example `.env` (Frontend)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Security Considerations

- Never commit `.env` files to version control
- Use strong, unique secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (minimum 32 characters)
- Rotate Cloudinary and OpenRouter API keys regularly
- Restrict MongoDB Atlas IP access to trusted sources
- Use different secrets for development and production environments

---

## 12. Installation Guide

### Prerequisites

- **Node.js** v18 or later
- **MongoDB** — Local installation or [MongoDB Atlas](https://www.mongodb.com/atlas) account
- **Cloudinary** — [Free account](https://cloudinary.com) for file uploads
- **OpenRouter** — [Free account](https://openrouter.ai) for AI resume analysis

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/job_portal.git
cd job_portal
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs all backend dependencies defined in `backend/package.json`, including Express, Mongoose, Socket.IO, JWT, bcryptjs, Cloudinary, Multer, and others.

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This installs all frontend dependencies defined in `frontend/package.json`, including React 19, Redux Toolkit, React Router v7, Tailwind CSS v4, Axios, Framer Motion, Chart.js, and others.

### Step 4: Configure Environment Variables

**Backend:** Create `backend/.env` with all required variables (see [Environment Variables](#11-environment-variables)).

**Frontend:** Create `frontend/.env` with `VITE_API_URL`.

### Step 5: Configure MongoDB

**Option A — Local MongoDB:**
```bash
# Start MongoDB (if installed locally)
mongod
```

**Option B — MongoDB Atlas:**
1. Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist your IP address
4. Copy the connection string and set as `MONGO_URI`

### Step 6: Seed Admin User (Optional)

```bash
cd backend
npm run seed
```

This creates an admin user with:
- Email: `admindaddy@gmail.com`
- Password: `Daddy@123` (as configured in `seedAdmin.js`)

### Step 7: Run the Backend

```bash
cd backend
npm run dev
```

The server starts on port 5000 (or the configured `PORT`). You should see:
```
MongoDB connected: <host>
Server running on port 5000
```

### Step 8: Run the Frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

The Vite dev server starts on `http://localhost:5173`. Open this URL in your browser.

### Step 9: Build for Production

```bash
cd frontend
npm run build
```

This generates optimized static files in `frontend/dist/`.

---

## 13. Run Commands

### Backend (`backend/package.json`)

| Command | Script | What It Does | When to Use |
|---|---|---|---|
| `npm run dev` | `nodemon src/server.js` | Starts the backend server with auto-restart on file changes | Development |
| `npm start` | `node src/server.js` | Starts the backend server in production mode | Production |
| `npm test` | `echo "Error: no test specified"` | Placeholder (no tests implemented) | N/A |

### Frontend (`frontend/package.json`)

| Command | Script | What It Does | When to Use |
|---|---|---|---|
| `npm run dev` | `vite` | Starts Vite dev server with HMR on port 5173 | Development |
| `npm run build` | `vite build` | Creates optimized production build in `dist/` | Production deployment |
| `npm run preview` | `vite preview` | Locally preview the production build | Testing production build locally |
| `npm run lint` | `eslint .` | Lint all frontend source files with ESLint | Code quality check |

---

## 14. Deployment Guide

### Frontend (Vercel)

1. **Prepare the project:**
   - Ensure `vite.config.js` does not hardcode base URLs
   - The build command is `npm run build`; output directory is `dist`

2. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```
   Or connect your GitHub repository via [Vercel Dashboard](https://vercel.com/new).

3. **Environment Variables:**
   - Set `VITE_API_URL` to the production backend URL (e.g., `https://your-backend.onrender.com/api/v1`)

4. **Common Mistakes:**
   - Forgetting to set `VITE_API_URL` — API calls will fail silently
   - CORS errors if the backend `CLIENT_URL` doesn't match the Vercel domain

### Backend (Render)

1. **Prepare the project:**
   - Ensure `backend/package.json` has the `start` script: `node src/server.js`

2. **Deploy to Render:**
   - Create a new **Web Service** on [Render](https://render.com)
   - Connect your GitHub repository
   - Set **Root Directory** to `backend`
   - Set **Build Command** to `npm install`
   - Set **Start Command** to `npm start`
   - Choose a free or paid plan

3. **Environment Variables (set in Render Dashboard):**
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://...
   JWT_ACCESS_SECRET=...
   JWT_REFRESH_SECRET=...
   CLIENT_URL=https://your-frontend.vercel.app
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   OPENROUTER_API_KEY=...
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   AI_MODEL=openai/gpt-4o-mini
   ```

4. **Common Mistakes:**
   - Missing `NODE_ENV=production` breaks secure cookie flag
   - `CLIENT_URL` not matching the actual frontend domain causes CORS errors
   - Free tier cold starts can cause timeout on first request

### MongoDB Atlas

1. Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Configure **Network Access** → Add IP `0.0.0.0/0` (allows all connections — use IP whitelist for production)
3. Create a database user with read/write permissions
4. Get connection string → Set as `MONGO_URI` in backend environment variables

### CORS Configuration

The backend CORS is configured to:
- Allow requests from `CLIENT_URL`
- Allow localhost origins (any port) for development
- Allow credentials (cookies)

If your deployed frontend URL changes, update the `CLIENT_URL` environment variable.

### Production Checklist

- [ ] All environment variables set on hosting platform
- [ ] `NODE_ENV=production` set
- [ ] `CLIENT_URL` matches frontend domain exactly
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Frontend build successful
- [ ] CORS verified with deployed URLs
- [ ] JWT secrets are strong (32+ characters)
- [ ] Rate limiting considered for auth/AI endpoints

---

## 15. Security

### Implemented Security Features

| Feature | Implementation | Details |
|---|---|---|
| **Helmet** | Global Express middleware (`app.use(helmet())`) | Sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.) |
| **CORS** | Strict origin validation | Only allows `CLIENT_URL` and localhost origins |
| **Password Hashing** | bcryptjs with salt rounds 12 | Passwords never stored in plain text |
| **JWT Authentication** | Access + Refresh tokens | Stateless auth with short-lived access tokens (15m) |
| **HttpOnly Cookies** | Refresh token stored in HttpOnly cookie | Prevents XSS access to refresh tokens |
| **SameSite Lax** | Cookie same-site policy | Prevents CSRF attacks |
| **Secure Cookies** | Cookie secure flag in production | Ensures cookies only sent over HTTPS |
| **Role-Based Authorization** | Role middleware (`authorize()`) | Restricts endpoints to specific roles |
| **Blocked User Check** | Auth middleware + service layer | Blocked users cannot authenticate or use the platform |
| **Input Validation** | Mongoose schema validation | Type, required, enum, and unique constraints at database level |
| **File Type Validation** | Multer file filter | Only PDF for resumes, only JPEG/PNG/WebP/GIF for logos |
| **File Size Limits** | Multer limits | 5MB max for both resumes and images |
| **Soft Delete** | Messages use `isDeleted` flag | Data preserved for audit, not permanently removed |
| **Audit Logging** | Admin actions logged | Full trail of moderation actions |

### Missing Security Improvements (Recommended)

- **Rate Limiting:** No rate limiting on auth or AI endpoints (use `express-rate-limit`)
- **Request Validation:** No request body/query schema validation at route level (use `express-validator` or Zod on backend)
- **SQL Injection:** Not applicable (NoSQL), but MongoDB injection risks exist — consider input sanitization
- **CSRF Token:** Not implemented (partially mitigated by SameSite cookie)
- **Socket Authentication:** Socket.IO connections not authenticated at handshake
- **HTTPS Enforcement:** Not enforced in app (should be handled at reverse proxy level — Nginx, Render)
- **API Key Rotation:** No built-in key rotation mechanism
- **Security Headers Audit:** Review Helmet configuration for CSP (not set)

---

## 16. Error Handling

### Global Error Middleware

**File:** `backend/src/middleware/error.middleware.js`

```javascript
const errorHandler = (err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    })
}
```

All controllers call `next(err)` on exceptions, which propagates to this middleware. It returns a standardized JSON error response with the error's `statusCode` (or 500) and `message`.

### Error Types and Handling

| Error Type | Status Code | Source | Example |
|---|---|---|---|
| **Validation** | 400 | Controllers/Services | "Email already registered", "Resume required" |
| **Authentication** | 401 | Auth middleware | "Unauthorized" (missing/invalid token) |
| **Authorization** | 403 | Role middleware | "Forbidden" (wrong role) |
| **Blocked User** | 403 | Auth middleware + service | "Account blocked" |
| **Not Found** | 404 | Controllers | "Job not found", "User not found" |
| **Conflict** | 409 | Controllers | "Profile already exists. Use PUT to update." |
| **Locked** | 423 | Controllers | "Cannot delete a locked conversation" |
| **File Error** | 400 | Multer | "Only PDF files are allowed!" |
| **Server Error** | 500 | Global error handler | Mongoose connection errors, etc. |

### Frontend Error Handling

- **Axios interceptor** catches 401 responses and attempts token refresh
- **React Hot Toast** (`react-hot-toast`) displays success/error notifications
- **Route guards** redirect unauthorized users to login or home
- **No React Error Boundary** is implemented (future improvement)

### Logging

- **Morgan** logs HTTP requests in `dev` format (method, url, status, response time)
- **Console logs** for auth middleware failures (`[auth] Missing authorization header`, `[auth] JWT verification failed`)
- **Database connection errors** logged before process exit

---

## 17. Performance Optimizations

| Optimization | Implementation | Benefit |
|---|---|---|
| **Compression** | `compression` middleware (configured in `app.js`) | Reduces response size via gzip |
| **Database Indexing** | Compound indexes on jobs (`title, location, employmentType`), applications (`applicant, job` - unique) | Faster queries with common filters |
| **Pagination** | Jobs endpoint supports `page` and `limit` parameters | Prevents large data transfers |
| **Lean Queries** | Jobs fetched with `.lean()` | Returns plain JS objects, faster than Mongoose documents |
| **Sorting** | Jobs sorted by `createdAt: -1`, conversations by `lastMessageTime` | Most recent content first |
| **Select Projection** | User queries use `.select("-password -refreshToken")` or `.select("name email role")` | Minimizes data transfer |
| **Soft Delete** | Messages use `isDeleted` flag with index | Avoids expensive data migration on delete |
| **Frontend Build** | Vite production build with tree-shaking and code splitting | Smaller bundle, faster load |
| **CSS Variables** | Theme changes via CSS custom properties | No repaint of entire DOM |
| **LocalStorage Persistence** | Auth state persisted in localStorage | Avoids API call on page refresh |

---

## 18. Socket.IO

### Overview

Socket.IO enables real-time, bidirectional communication between the frontend and backend for instant messaging and admin moderation notifications.

### Server-Side (`backend/src/sockets/socket.js`)

**Connection Lifecycle:**
1. Client connects to the Socket.IO server
2. Client emits `join` with their `userId` — server verifies user is not blocked, then joins the room named after the userId
3. Client is now in their personal room and can send/receive messages

**Events:**

| Event | Trigger | Handler Logic |
|---|---|---|
| `join` | Client connects | Join room = userId; skip if user is blocked |
| `send_message` | User sends message | Validate sender/receiver/content; check blocked status for both; check conversation lock; save to DB; emit `receive_message` to both rooms |
| `admin_join_conversation` | Admin opens conversation | Join room `admin:{conversationKey}`; notify others in room |
| `admin_send_message` | Admin sends message | Parse conversationKey for participant IDs; save message with `role: "admin"`; emit to both participants and admin room |
| `disconnect` | Client disconnects | Leave all rooms except socket ID |

**Server-Side Emit Helpers:**

| Function | Event | Purpose |
|---|---|---|
| `emitConversationLocked(key)` | `conversation_locked` | Notify all users a conversation was locked |
| `emitConversationUnlocked(key)` | `conversation_unlocked` | Notify all users a conversation was unlocked |
| `emitConversationDeleted(key, by)` | `conversation_deleted` | Notify conversation participants it was deleted |
| `emitMessageDeleted(id, key)` | `message_deleted` | Notify users a message was removed |
| `emitUserBlocked(id, by, reason)` | `user_blocked` | Notify all users a user was blocked |
| `emitUserUnblocked(id, by)` | `user_unblocked` | Notify all users a user was unblocked |

### Client-Side

The frontend connects via `socket.io-client` (likely in `ChatPage.jsx`). Events mirror the server:

```
socket.on("receive_message", (data) => { ... })
socket.on("conversation_locked", (data) => { ... })
socket.on("conversation_unlocked", (data) => { ... })
socket.on("conversation_deleted", (data) => { ... })
socket.on("message_deleted", (data) => { ... })
socket.on("user_blocked", (data) => { ... })
socket.on("user_unblocked", (data) => { ... })
```

---

## 19. State Management

### Redux Toolkit

The application uses **Redux Toolkit** with a single slice for authentication state.

**Store Configuration (`frontend/src/redux/store.js`):**
- `configureStore` with `auth` reducer
- Preloaded state loaded from `localStorage` (key: `auth_state`)
- `subscribe` callback persists auth state on every change
- `injectStore(store)` is called to make the store available to the Axios interceptor (avoids circular dependencies)

**Auth Slice (`frontend/src/redux/slices/authSlice.js`):**

| State Field | Type | Description |
|---|---|---|
| `user` | Object/null | User profile (name, email, _id, role) |
| `accessToken` | String/null | JWT access token |
| `role` | String/null | User role (admin, recruiter, job_seeker) |
| `hasCompany` | Boolean/null | Whether recruiter has a registered company |
| `company` | Object/null | Company profile data |
| `onboardingCompleted` | Boolean | Whether job seeker completed onboarding |

**Reducers/Actions:**

| Action | Payload | Effect |
|---|---|---|
| `setCredentials` | `{ user, accessToken, role, hasCompany, onboardingCompleted }` | Sets user, token, role, hasCompany, onboardingCompleted |
| `setCompany` | `company` object | Sets company data and `hasCompany = true` |
| `clearCompany` | none | Clears company and sets `hasCompany = false` |
| `setOnboardingCompleted` | boolean | Updates onboarding status |
| `logout` | none | Resets all state to initial values |

### Theme Context

The theme (dark/light) is managed via React Context (`ThemeContext.jsx`), not Redux, because:
- Theme is a UI concern that doesn't need Redux DevTools
- No asynchronous operations involved
- Simpler API with `useContext` and `useTheme` hook

---

## 20. Code Flow

### Complete Application Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant React as React App
    participant Redux
    participant Axios
    participant API as Backend API
    participant MongoDB
    participant Socket as Socket.IO

    User->>Browser: Open localhost:5173
    Browser->>React: Load App
    React->>Redux: Configure store, load persisted state
    React->>React: PersistLogin checks for accessToken
    alt No accessToken
        React->>Axios: POST /auth/refresh-token (with cookie)
        Axios->>API: HTTP request
        API->>MongoDB: Find user by refresh token
        MongoDB-->>API: User with matching token
        API-->>Axios: New accessToken + user data
        Axios->>Redux: dispatch(setCredentials)
        Redux-->>React: Auth state updated
    end
    React-->>Browser: Render App (public routes)
    
    User->>Browser: Click Login
    Browser->>React: Navigate to /login
    React-->>Browser: Render LoginPage
    User->>Browser: Enter credentials, submit
    Browser->>React: Form submit
    React->>Axios: POST /auth/login
    Axios->>API: HTTP request
    API->>MongoDB: Find user (+password), verify
    MongoDB-->>API: User document
    API->>API: Generate JWT tokens
    API-->>Axios: Set cookie + JSON response
    Axios->>Redux: dispatch(setCredentials)
    Redux-->>React: Auth state updated (user, token, role)
    React-->>Browser: Redirect to dashboard (role-based)
    
    User->>Browser: Browse jobs
    Browser->>React: Navigate to /jobs
    React->>Axios: GET /jobs/get-job?page=1
    Axios->>API: Request with Bearer token
    API->>MongoDB: Find active jobs with filter
    MongoDB-->>API: Jobs + total count
    API-->>Axios: Paginated job list
    Axios->>React: Jobs data
    React-->>Browser: Render job list
    
    User->>Browser: Send message
    Browser->>React: Submit message form
    React->>Socket: send_message { sender, receiver, content }
    Socket->>MongoDB: Check blocked status, save message
    MongoDB-->>Socket: Saved message
    Socket-->>Browser: receive_message (to both sender & receiver)
    React-->>Browser: Update chat UI
    
    User->>Browser: Logout
    Browser->>React: Click Sign Out
    React->>Axios: POST /auth/logout
    Axios->>API: Clear refresh token
    API->>MongoDB: Set refreshToken = null
    API-->>Axios: Success
    Axios->>Redux: dispatch(logout)
    Redux-->>React: Auth state cleared
    React-->>Browser: Redirect to /login
```

---

## 21. Dependencies

### Backend Dependencies

| Package | Version | Purpose | Where Used |
|---|---|---|---|
| **express** | ^5.2.1 | HTTP server framework | `app.js`, all routes |
| **mongoose** | ^9.6.3 | MongoDB ODM | All models (`/models/*`), `database/db.js` |
| **socket.io** | ^4.8.3 | Real-time WebSocket server | `server.js`, `sockets/socket.js` |
| **jsonwebtoken** | ^9.0.3 | JWT generation and verification | `utils/token.js`, `middleware/auth.middleware.js` |
| **bcryptjs** | ^3.0.3 | Password hashing | `services/auth.service.js` |
| **bcrypt** | ^6.0.0 | Password hashing (alternative, not used in code) | package.json only |
| **dotenv** | ^17.4.2 | Environment variable loading | `server.js` (`import "dotenv/config"`) |
| **cors** | ^2.8.6 | CORS middleware | `app.js` |
| **helmet** | ^8.2.0 | Security headers | `app.js` |
| **cookie-parser** | ^1.4.7 | Cookie parsing | `app.js` |
| **morgan** | ^1.11.0 | HTTP request logging | `app.js` |
| **compression** | ^1.8.1 | Gzip response compression | `app.js` |
| **multer** | ^2.2.0 | Multipart form data (file uploads) | `middleware/upload.middleware.js` |
| **cloudinary** | ^2.10.0 | Cloud media management | `config/cloudinary.js`, `utils/cloudinaryUpload.js` |
| **openai** | ^6.44.0 | OpenAI/OpenRouter API client | `config/openrouter.js`, `services/ai.service.js` |
| **pdf-parse** | ^2.4.5 | PDF text extraction | `utils/pdfTextExtractor.js` |
| **axios** | ^1.18.0 | HTTP client | `utils/pdfTextExtractor.js` (fetching PDF from URL) |

### Frontend Dependencies

| Package | Version | Purpose | Where Used |
|---|---|---|---|
| **react** | ^19.2.6 | UI library | All components and pages |
| **react-dom** | ^19.2.6 | React DOM renderer | `main.jsx` |
| **react-router-dom** | ^7.18.0 | Client-side routing | `App.jsx`, all pages with navigation |
| **@reduxjs/toolkit** | ^2.12.0 | State management | `redux/store.js`, `redux/slices/authSlice.js` |
| **react-redux** | ^9.3.0 | React-Redux bindings | `main.jsx` (Provider), all components with useSelector/useDispatch |
| **axios** | ^1.18.0 | HTTP client | `api/axios.js`, all service files |
| **@hookform/resolvers** | ^5.4.0 | Form resolver integration | Forms with Zod validation |
| **react-hook-form** | ^7.80.0 | Form management | Forms throughout the app |
| **zod** | ^4.4.3 | Schema validation | Form validation schemas |
| **tailwindcss** | ^4.3.1 | Utility CSS framework | `index.css` (`@import "tailwindcss"`), all components |
| **@tailwindcss/vite** | ^4.3.1 | Tailwind CSS Vite plugin | `vite.config.js` |
| **chart.js** | ^4.5.1 | Charting library | `components/DashboardChart.jsx` |
| **react-chartjs-2** | ^5.3.1 | React Chart.js wrapper | `components/DashboardChart.jsx` |
| **framer-motion** | ^12.40.0 | Animation library | `components/AuthTopNav.jsx` |
| **react-icons** | ^5.6.0 | Icon components | Sidebar, ThemeToggle, PersistLogin, AuthTopNav |
| **react-hot-toast** | ^2.6.0 | Toast notifications | `App.jsx` (Toaster), all pages |
| **react-spinners** | ^0.17.0 | Loading spinners | Imported but uses FaSpinner from react-icons instead |
| **socket.io-client** | ^4.8.3 | Socket.IO client | Real-time messaging in ChatPage |

### Dev Dependencies (Frontend)

| Package | Version | Purpose |
|---|---|---|
| **vite** | ^8.0.12 | Build tool and dev server |
| **@vitejs/plugin-react** | ^6.0.1 | React plugin for Vite |
| **eslint** | ^10.3.0 | JavaScript linter |
| **@eslint/js** | ^10.0.1 | ESLint JS config |
| **eslint-plugin-react-hooks** | ^7.1.1 | React Hooks linting rules |
| **eslint-plugin-react-refresh** | ^0.5.2 | React Refresh linting |
| **globals** | ^17.6.0 | Global variable definitions for ESLint |
| **@types/react** | ^19.2.14 | React type definitions |
| **@types/react-dom** | ^19.2.3 | React DOM type definitions |

---

## 22. Scripts

All npm scripts found in the project.

### Backend Scripts (`backend/package.json`)

| Script | Command | Description |
|---|---|---|
| `dev` | `nodemon src/server.js` | Start backend in development mode with auto-restart on file changes |
| `start` | `node src/server.js` | Start backend in production mode (no auto-restart) |
| `test` | `echo "Error: no test specified" && exit 1` | Placeholder — no tests are currently implemented |
| `seed` (manual) | `node src/seed/seedAdmin.js` | Run the admin seed script to create a default admin user |

### Frontend Scripts (`frontend/package.json`)

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start the Vite development server with Hot Module Replacement on `http://localhost:5173` |
| `build` | `vite build` | Create an optimized production build in the `dist/` directory |
| `preview` | `vite preview` | Locally preview the production build (serves `dist/` directory) |
| `lint` | `eslint .` | Run ESLint on all frontend source files to check for code quality issues |

---

## 23. Troubleshooting

### MongoDB Connection Errors

**Error:** `MongoDB connection error` or `MongooseError: The uri parameter to openUri() must be a string`

**Causes & Solutions:**
- **Missing `MONGO_URI`** — Ensure `backend/.env` exists and `MONGO_URI` is set
- **Invalid connection string** — Verify username/password are URL-encoded (special characters like `@`, `:`, `/` must be percent-encoded)
- **IP not whitelisted** — In MongoDB Atlas, add your IP to Network Access
- **Database not responding** — Check cluster status in Atlas dashboard
- **Wrong database name** — Ensure the URI includes the correct database name (e.g., `job_portal`)

### CORS Errors

**Error:** `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`

**Causes & Solutions:**
- **`CLIENT_URL` mismatch** — Ensure `CLIENT_URL` in backend `.env` matches the frontend URL exactly (including trailing slash)
- **Port mismatch** — If frontend runs on a different port, it must be allowed by the CORS config
- **Deployed frontend not in allowed origins** — Update `CLIENT_URL` to the production frontend URL
- **Credentials issue** — Frontend must use `withCredentials: true` (configured in `api/axios.js`)

### JWT Issues

**Error:** `jwt malformed`, `jwt expired`, `invalid signature`

**Causes & Solutions:**
- **Missing secrets** — Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set
- **Expired token** — The access token expires after 15 minutes; the refresh flow should handle this automatically
- **Secret mismatch** — If secrets are changed, all existing tokens become invalid (users must re-login)
- **Token tampered** — The signature verification will fail if the token payload is modified

### Environment Variable Issues

**Error:** `undefined is not a function` or unexpected behavior with services

**Causes & Solutions:**
- **Missing `.env` file** — Create `backend/.env` and `frontend/.env` with all required variables
- **Typo in variable name** — Variable names are case-sensitive; `JWT_ACCESS_SECRET` != `jwt_access_secret`
- **Frontend variables not prefixed** — Only variables starting with `VITE_` are exposed to the frontend by Vite
- **Backend not restarted** — Changes to `.env` require restarting the server (nodemon does this automatically)

### Port Conflicts

**Error:** `Port 5000 is already in use` or `EADDRINUSE`

**Causes & Solutions:**
- **Another process on the same port** — The server handles this with `EADDRINUSE` error handler
- **Find and stop the process:**
  ```bash
  # Find process on port 5000
  netstat -ano | findstr :5000
  # Kill the process (replace PID)
  taskkill /PID <PID> /F
  ```
- **Change the port** — Set `PORT` in backend `.env` to a different value

### Build Failures

**Error:** Build fails with dependency errors

**Causes & Solutions:**
- **Node.js version mismatch** — Ensure Node.js v18 or later is installed (`node --version`)
- **Dependencies not installed** — Run `npm install` in both `backend/` and `frontend/`
- **npm cache issues** — Try `npm cache clean --force` and reinstall
- **Platform-specific issues** — Some packages (like `bcrypt`) may need native compilation; use `bcryptjs` as fallback

### Socket Connection Failures

**Error:** Socket.IO connection fails or messages not delivered in real time

**Causes & Solutions:**
- **CORS mismatch** — Socket.IO has its own CORS configuration in `server.js` that must match the frontend URL
- **User blocked** — Blocked users are rejected from joining rooms and sending messages
- **Conversation locked** — Locked conversations prevent message sending
- **Socket not connected** — Ensure the client connects after authentication
- **Wrong room** — Users must join their userId room; messages are emitted to both sender and receiver rooms

### Render Deployment Issues

**Error:** Application crashes after deployment

**Causes & Solutions:**
- **Missing environment variables** — All variables must be set in Render Dashboard
- **Build command not configured** — Set build command to `npm install` (with root directory `backend`)
- **Start command wrong** — Use `npm start` (which runs `node src/server.js`)
- **Free tier cold starts** — First request after inactivity may take 30+ seconds
- **Port binding** — Render sets `PORT` automatically; the app must use `process.env.PORT || 5000`

### Vercel Deployment Issues

**Error:** Frontend loads but API calls fail

**Causes & Solutions:**
- **Missing `VITE_API_URL`** — Set in Vercel Environment Variables
- **CORS error** — Ensure backend `CLIENT_URL` matches the Vercel domain
- **Client-side routing** — Configure `vercel.json` rewrites for SPA routing:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## 24. FAQ

**Q: Can I use the application without AI resume analysis?**
Yes. The AI analysis is an optional feature. You can skip setting `OPENROUTER_API_KEY` and still use all other features (jobs, applications, messaging, etc.).

**Q: How do I reset a user's password?**
Password reset is not implemented in the current codebase. ForgotPasswordPage and ResetPasswordPage exist as placeholders but have no backend implementation.

**Q: Can a job seeker be a recruiter?**
No. The role system assigns a single role per user (`admin`, `recruiter`, or `job_seeker`). Role changes can only be made by an admin.

**Q: How do I change my email?**
Go to your Profile page and update the email field. The system checks for duplicate emails before saving.

**Q: What happens if my access token expires?**
The frontend's Axios interceptor automatically attempts to refresh the token using the HttpOnly refresh token cookie. If refresh fails, you'll be redirected to login.

**Q: Can I delete my account?**
Users cannot self-delete. Only an admin can delete user accounts through the admin panel.

**Q: How do I report inappropriate messages?**
This feature is not exposed to regular users. Contact an administrator who can moderate conversations through the admin panel.

**Q: Is there a mobile app?**
No. The application is a responsive web application designed for desktop and mobile browsers.

**Q: Can I import/export data?**
No data import/export functionality is currently implemented.

**Q: Why was I logged out?**
Possible reasons:
- Your refresh token expired (7 days)
- An admin blocked your account
- Your session was manually cleared (localStorage)
- The server was restarted (tokens remain valid, but in-memory session may reset)

**Q: How do I report a bug or request a feature?**
This is an open-source project. Check the repository's issues page or submit a pull request.

---

## 25. Future Improvements

Based on the current codebase, the following enhancements are recommended:

### Backend

1. **Rate Limiting** — Add `express-rate-limit` on auth endpoints (login, register, refresh) and AI endpoints to prevent abuse
2. **Request Validation** — Implement Zod or Joi validation schemas at the route layer for all request bodies and query parameters
3. **Background Jobs** — Use a job queue (Bull, Agenda) for AI resume analysis and PDF extraction to prevent request timeouts
4. **Email Service** — Implement password reset flow with Nodemailer or SendGrid
5. **File Upload Enhancements** — Add support for DOCX and other resume formats; add virus scanning
6. **Socket Authentication** — Authenticate Socket.IO connections with JWT at handshake
7. **ElasticSearch** — Full-text search for jobs (MongoDB text indexes or Elasticsearch integration)
8. **Notification System** — In-app notifications for application status changes, new messages, etc.
9. **WebSocket Rooms for Job Applications** — Real-time notification to recruiters when someone applies
10. **Comprehensive Testing** — Unit tests (Jest), integration tests (Supertest), and E2E tests (Cypress/Playwright)

### Frontend

1. **TypeScript Migration** — Convert the entire frontend to TypeScript for better type safety
2. **React Error Boundary** — Add a top-level error boundary to catch render-time failures
3. **Lazy Loading** — Implement `React.lazy()` and `Suspense` for route-level code splitting
4. **Skeleton Loaders** — Replace spinner loading states with skeleton components for better UX
5. **Service Coverage** — Complete all frontend service modules (application, message, admin, AI, job)
6. **Advanced Search UI** — Add multi-criteria job search with skills filter, salary range, date posted
7. **Pagination UI** — Add pagination controls to all list pages (jobs, applications, conversations)
8. **Image Optimization** — Lazy load images with placeholder blur
9. **Accessibility** — Improve ARIA labels, keyboard navigation, and screen reader support
10. **i18n** — Internationalization support for multiple languages

### Infrastructure

1. **Docker** — Containerize the application with docker-compose (MongoDB, backend, frontend)
2. **CI/CD Pipeline** — GitHub Actions for automated testing, linting, and deployment
3. **Monitoring** — Add error tracking (Sentry) and performance monitoring
4. **Logging Service** — Replace console.log with structured logging (Winston, Pino) and a log aggregation service

---

## 26. Contributing Guide

### How to Contribute

1. **Fork the repository** on GitHub
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the code conventions (see below)
4. **Commit your changes** with clear, descriptive commit messages:
   ```bash
   git commit -m "feat: add XYZ feature"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** describing the changes and their purpose

### Code Conventions

- **Backend:** ES modules (`import`/`export`), async/await, layered architecture (routes → controllers → services → models)
- **Frontend:** Functional components with hooks, Redux for global auth state, Tailwind CSS for styling
- **Error Handling:** Use `next(err)` in controllers; throw `Error` in services
- **Naming:** PascalCase for components/models, camelCase for functions/variables, kebab-case for files
- **File Names:** `*.controller.js`, `*.service.js`, `*.routes.js`, `*.middleware.js`, `*.jsx` for React components

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include a clear description of what and why
- Reference any related issues
- Ensure the application still runs after your changes:
  ```bash
  cd backend && npm run dev
  cd frontend && npm run dev
  ```
- Run linting:
  ```bash
  cd frontend && npm run lint
  ```

### Development Setup

See the [Installation Guide](#12-installation-guide) for complete setup instructions.

---

## 27. License

This project is licensed under the **ISC License**.

```
ISC License

Copyright (c) 2024

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 28. Credits

### Frameworks & Libraries

- **React** — [https://react.dev](https://react.dev)
- **Vite** — [https://vite.dev](https://vite.dev)
- **Express** — [https://expressjs.com](https://expressjs.com)
- **MongoDB** — [https://www.mongodb.com](https://www.mongodb.com)
- **Mongoose** — [https://mongoosejs.com](https://mongoosejs.com)
- **Socket.IO** — [https://socket.io](https://socket.io)
- **Redux Toolkit** — [https://redux-toolkit.js.org](https://redux-toolkit.js.org)
- **Tailwind CSS** — [https://tailwindcss.com](https://tailwindcss.com)
- **Chart.js** — [https://www.chartjs.org](https://www.chartjs.org)
- **Framer Motion** — [https://www.framer.com/motion](https://www.framer.com/motion)
- **Zod** — [https://zod.dev](https://zod.dev)
- **React Hook Form** — [https://react-hook-form.com](https://react-hook-form.com)
- **Axios** — [https://axios-http.com](https://axios-http.com)
- **JWT (jsonwebtoken)** — [https://jwt.io](https://jwt.io)
- **Helmet** — [https://helmetjs.github.io](https://helmetjs.github.io)
- **Cloudinary** — [https://cloudinary.com](https://cloudinary.com)
- **OpenRouter** — [https://openrouter.ai](https://openrouter.ai)
- **React Icons** — [https://react-icons.github.io](https://react-icons.github.io)
- **pdf-parse** — [https://gitlab.com/autokent/pdf-parse](https://gitlab.com/autokent/pdf-parse)

### Acknowledgements

- Open source community for maintaining the libraries and frameworks used in this project
- MongoDB Atlas for providing free cloud database hosting
- Cloudinary for free tier media storage and CDN
- OpenRouter for accessible AI model API access
- All contributors who improve this project through issues, suggestions, and pull requests

---

*Generated documentation based on the actual codebase. For the most up-to-date information, refer to the repository's source code.*
