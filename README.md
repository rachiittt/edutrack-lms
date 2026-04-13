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
│       ├── interfaces/    # Request handlers
│       ├── middleware/    # Auth, role guard, error handler, validation
│       ├── models/        # Mongoose schemas (User, Course, Quiz, etc.)
│       ├── patterns/      # Request handlers
│       ├── repositories/  # Request handlers
│       ├── routes/        # Express route definitions
│       ├── services/      # Business logic layer
│       └── utils/         # ApiError class, seed data script
├── frontend/
│   └── src/
│       ├── assets/        # Request handlers
│       ├── components/    # Reusable UI components
│       ├── context/       # Auth context provider
│       ├── pages/         # Route pages
│       ├── services/      # API call functions (Axios)
│       ├── types/         # TypeScript interfaces
│       └── utils/         # TypeScript interfaces
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

- EduTrack LMS — High-Level System Architecture
  
  <img width="804" height="503" alt="Screenshot 2026-04-09 at 11 17 57 PM" src="https://github.com/user-attachments/assets/5f762091-ecca-49f7-9779-8e0cc920a749" />

- EduTrack LMS system
  
  <img width="651" height="533" alt="Screenshot 2026-04-09 at 11 22 18 PM" src="https://github.com/user-attachments/assets/c194a29d-10ad-40f0-8be5-00d46d78802c" />

- Use Case
  
  <img width="1410" height="1302" alt="image" src="https://github.com/user-attachments/assets/e49906b9-e805-43da-b04e-383002e67655" />

- Class Diagram
  
  <img width="747" height="677" alt="Screenshot 2026-04-09 at 11 24 27 PM" src="https://github.com/user-attachments/assets/aed47be5-48e4-42d8-8002-feaf5f269001" />

- ERD
  
  <img width="671" height="566" alt="Screenshot 2026-04-09 at 11 25 09 PM" src="https://github.com/user-attachments/assets/df4df06c-3fca-47c2-bdee-fbe6a0bb90b9" />

- EduTrack LMS — Sequence Diagram
  
  <img width="616" height="616" alt="Screenshot 2026-04-09 at 11 27 04 PM" src="https://github.com/user-attachments/assets/23ffbff0-f2a1-416a-9826-9d1895638c14" />


## 👨‍💻 Created By

- Satyam Kumar.
- Kavya Saraswat.
- Mausam Kumar Dwivedi.
- Rachit Singh.
- Himank Kaushik.