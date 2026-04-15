# EduTrack LMS

A full-stack Learning Management System built with React, Node.js, Express, TypeScript, and MongoDB.

## 🌐 Live Deployment

- **Frontend (UI)**: [https://edutrack-lms.netlify.app](https://edutrack-lms.netlify.app)
- **Backend (API)**: [https://edutrack-lms-api.onrender.com](https://edutrack-lms-api.onrender.com)

## 🚀 Features

- **JWT Authentication** with role-based access control (Student / Teacher / Admin)
- **Course Management** — Browse, create, update, delete courses with search & pagination
- **Study Materials** — Text content, PDF links, and external resource links
- **Quiz System** — Multiple-choice quizzes with auto-scoring and timed attempts
- **Role-based Dashboards** — Separate views for students and teachers
- **Dark Mode** — System-preference aware with manual toggle
- **Responsive Design** — Mobile-first, works on all screen sizes

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS 3, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcrypt |
| UI Icons | Lucide React |
| Notifications | React Hot Toast |

## 📦 Project Structure

```
edutrack-lms/
├── backend/
│   └── src/
│       ├── config/        # DB connection (singleton), env config
│       ├── controllers/   # Request handlers
│       ├── interfaces/    # TypeScript definitions for strong typing
│       ├── middleware/    # Auth, role guard, error handler, validation
│       ├── models/        # Mongoose schemas (User, Course, Quiz, etc.)
│       ├── patterns/      # Custom design patterns (EventBus, Strategies)
│       ├── repositories/  # Data access layer for DB queries
│       ├── routes/        # Express route definitions
│       ├── services/      # Business logic layer
│       └── utils/         # ApiError class, seed data script
├── frontend/
│   └── src/
│       ├── assets/        # Static files (images, icons)
│       ├── components/    # Reusable UI components
│       ├── context/       # Global state (Auth context provider)
│       ├── pages/         # Route pages
│       ├── services/      # API call functions (Axios)
│       ├── types/         # TypeScript interfaces for the client
│       └── utils/         # Helper functions and formatters
└── .env.example
```

##  Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
# Edit .env with your MongoDB URI
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Seed Database

```bash
cd backend
npm run seed
```


## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register |  | Register user |
| POST | /api/auth/login |  | Login |
| GET | /api/auth/me |  | Get profile |
| GET | /api/courses |  | List courses (paginated) |
| POST | /api/courses |  Teacher | Create course |
| GET | /api/courses/:id |  | Course details |
| POST | /api/enrollments/courses/:id/enroll |  Student | Enroll |
| POST | /api/quizzes/:id/attempt |  Student | Submit quiz |
| GET | /api/quizzes/:id/results | | View results |

## 🎨 Design Patterns

- **MVC** — Controllers → Services → Models
- **Singleton** — MongoDB connection (`db.ts`)
- **Context Provider** — React auth state management
- **Protected Routes** — HOC with role-based guarding

## UML Diagrams

- Link - https://excalidraw.com/#json=aUNErciWaETx_aOou_Ead,uBZ_KB_Qcm8CD9oNOPsUOQ

1. EduTrack LMS — High-Level System Architecture

<img width="813" height="693" alt="Screenshot 2026-04-15 at 8 54 14 PM" src="https://github.com/user-attachments/assets/5af94d79-a2c5-4c56-acb2-a18ef68d6060" />


2. EduTrack LMS system
  
<img width="1253" height="198" alt="Screenshot 2026-04-15 at 8 55 19 PM" src="https://github.com/user-attachments/assets/1d2f8c7e-1e9f-4c14-a219-ec8f6737f8a5" />


3. Use Case
  
<img width="748" height="687" alt="Screenshot 2026-04-15 at 8 55 52 PM" src="https://github.com/user-attachments/assets/0f417dbc-2a5f-413b-a8a9-ddef29f19792" />

4. Class Diagram
  
<img width="801" height="684" alt="Screenshot 2026-04-15 at 8 56 55 PM" src="https://github.com/user-attachments/assets/cebaca9d-994d-47d5-9828-b2ec5d534efa" />


5. EduTrack LMS — Sequence Diagram
  
<img width="564" height="729" alt="Screenshot 2026-04-15 at 8 58 39 PM" src="https://github.com/user-attachments/assets/1914912c-91ba-434a-a9fb-51cf7b32b118" />



## 👨‍💻 Created By

- Satyam Kumar.
- Kavya Saraswat.
- Mausam Kumar Dwivedi.
- Rachit Singh.
- Himank Kaushik.
