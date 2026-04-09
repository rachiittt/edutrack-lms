# EduTrack LMS

A full-stack Learning Management System built with React, Node.js, Express, TypeScript, and MongoDB.

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
│       ├── middleware/     # Auth, role guard, error handler, validation
│       ├── models/        # Mongoose schemas (User, Course, Quiz, etc.)
│       ├── routes/        # Express route definitions
│       ├── services/      # Business logic layer
│       └── utils/         # ApiError class, seed data script
├── frontend/
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── context/       # Auth context provider
│       ├── pages/         # Route pages
│       ├── services/      # API call functions (Axios)
│       └── types/         # TypeScript interfaces
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

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Teacher | sarah@edutrack.com | password123 |
| Teacher | james@edutrack.com | password123 |
| Student | alex@student.com | password123 |
| Student | maria@student.com | password123 |
| Admin | admin@edutrack.com | password123 |

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

## 👨‍💻 Created By

- Satyam Kumar  
- Kavya Saraswat  
- Mausam Kumar  
- Rachit Singh  
- Himank Kaushik  
