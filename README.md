# EduTrack LMS.

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

| Layer         | Technology                                 |
| ------------- | ------------------------------------------ |
| Frontend      | React 18, TypeScript, Tailwind CSS 3, Vite |
| Backend       | Node.js, Express.js, TypeScript            |
| Database      | MongoDB with Mongoose ODM                  |
| Auth          | JWT + bcrypt                               |
| UI Icons      | Lucide React                               |
| Notifications | React Hot Toast                            |

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
   └── src/
        ├── assets/        # Static files (images, icons)
        ├── components/    # Reusable UI components
        ├── context/       # Global state (Auth context provider)
        ├── pages/         # Route pages
        ├── services/      # API call functions (Axios)
        ├── types/         # TypeScript interfaces for the client
        └── utils/         # Helper functions and formatters

```

## Getting Started

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

| Method | Endpoint                            | Auth    | Description              |
| ------ | ----------------------------------- | ------- | ------------------------ |
| POST   | /api/auth/register                  |         | Register user            |
| POST   | /api/auth/login                     |         | Login                    |
| GET    | /api/auth/me                        |         | Get profile              |
| GET    | /api/courses                        |         | List courses (paginated) |
| POST   | /api/courses                        | Teacher | Create course            |
| GET    | /api/courses/:id                    |         | Course details           |
| POST   | /api/enrollments/courses/:id/enroll | Student | Enroll                   |
| POST   | /api/quizzes/:id/attempt            | Student | Submit quiz              |
| GET    | /api/quizzes/:id/results            |         | View results             |

## 🎨 Design Patterns

- **MVC** — Controllers → Services → Models
- **Singleton** — MongoDB connection (`db.ts`)
- **Context Provider** — React auth state management
- **Protected Routes** — HOC with role-based guarding

## 🏛️ Architecture Explanation

EduTrack follows a modern **N-Tier Layered Architecture** with a clear separation of concerns, ensuring scalability and maintainability:

1.  **Presentation Layer (Frontend)**: A React-based Single Page Application (SPA) utilizing **Context API** for state management and **Axios** for asynchronous communication with the backend.
2.  **API Gateway / Routing Layer**: Express.js routes that handle request entry points and apply cross-cutting concerns like authentication and role-based validation.
3.  **Business Logic Layer (Services)**: The core engine of the application where all domain rules are encapsulated (e.g., enrollment logic, quiz scoring).
4.  **Data Access Layer (Models)**: Mongoose schemas that define the data structures and handle interactions with MongoDB.
5.  **Cross-Cutting Utilities**: Centralized error handling (`ApiError`), logging (`Logger`), and an asynchronous **EventBus** for decoupled communication between modules.

## 🛠️ Design Patterns & SOLID Principles

The codebase is built on professional software engineering principles:

- **Singleton Pattern**: Used for the Database connection and the global `EventBus` instance.
- **Observer Pattern**: Implemented via the `EventBus` to handle decoupled notifications (e.g., notifying students when new materials are added).
- **Factory Pattern**: Used in the `Logger` utility to instantiate specialized logging instances.
- **SOLID Implementation**:
  - **Single Responsibility**: Each service (Course, User, Quiz) handles only one domain area.
  - **Dependency Inversion**: High-level modules (Services) depend on abstractions (Interfaces) rather than concrete implementations.

## 👨‍💻 Created By

- Satyam Kumar.
- Kavya Saraswat.
- Mausam Kumar Dwivedi.
- Rachit Singh.
- Himank Kaushik.|

## 📊 UML Diagrams

We have documented the system design through the following diagrams:

1.  **System Architecture**: High-level overview of the tech stack integration.
2.  **Use Case Diagram**: Defines the interactions between Students, Teachers, and Admins.
3.  **Class Diagram**: Illustrates the OOP relationships between Users, Courses, and Quizzes.
4.  **Sequence Diagram**: Details the step-by-step workflow for Course Creation.

> [!TIP]
> All UML diagrams are hosted and can be viewed in high resolution here: [Excalidraw Project Link](https://excalidraw.com/#json=7oc-BxltuuVsF1y2HszDs,S1L-gM7lTGApBxzTbKnCWg)

---

### 🚀 How to Run

1.  **Clone the Repository**.
2.  **Run Backend**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```
3.  **Run Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
4.  **Database Seeding** (Optional):
    ```bash
    cd backend
    npm run seed
    ```
