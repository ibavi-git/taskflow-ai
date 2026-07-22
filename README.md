<div align="center">

# 🚀 TaskFlow AI

### Smart AI-Powered Project Management Platform

*A full-stack Kanban-style project management system powered by React, Spring Boot, PostgreSQL, and the Gemini AI API.*

[![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gemini](https://img.shields.io/badge/Gemini_API-AI_Powered-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Roadmap](#-roadmap)

</div>

> To view Mermaid diagrams in VS Code, install the [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension, or view this file on GitHub.

---

## 📌 Project Overview

**TaskFlow AI** is a modern, collaborative project management platform that goes beyond simple task tracking. It combines the visual clarity of Kanban boards with the intelligence of Google's Gemini AI to help students, developers, and teams plan smarter, collaborate better, and ship faster.

> Think Trello, but with an AI project assistant built in.

---

## ✨ Features

### 🗂 Core Project Management
- **Workspaces** — Organize teams and projects under a shared workspace with role-based access
- **Kanban boards** — Drag-and-drop task cards across Backlog → To Do → In Progress → Testing → Completed
- **Task management** — Rich tasks with checklists, labels, attachments, comments, priority, and due dates
- **Team collaboration** — Assign members, @mention teammates, comment on tasks, view activity timelines

### 🤖 AI Features (Gemini API)

| Feature | Description |
|---|---|
| **Project breakdown** | Type a project idea — AI generates a full task list instantly |
| **Task descriptions** | Short title → AI writes a detailed, professional task description |
| **Priority suggestions** | AI evaluates task context and recommends a priority level |
| **Deadline estimation** | AI estimates completion time based on scope and team size |
| **Sprint planner** | AI splits your project into structured weekly sprints |
| **Daily summary** | AI summarizes completed work, upcoming deadlines, and at-risk items |
| **Health score** | AI rates overall project health and explains contributing factors |

### 📅 Google Calendar Integration
- Task due dates automatically create Google Calendar events
- Calendar events update or delete when tasks change
- View upcoming deadlines directly on the dashboard

### 📊 Dashboard & Analytics
- Project and task counts, productivity percentage, completion rate
- Bar, pie, and line charts for weekly and monthly progress
- Workload distribution across team members

### 🔔 Notifications
- Task assigned, deadline tomorrow, comment mention, AI plan ready

---

## 🏗 Architecture

### High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        UI[React Frontend<br/>Vite + Tailwind CSS<br/>Port: 5173]
    end

    subgraph API["API Layer"]
        subgraph Backend["Spring Boot Backend<br/>Port: 8080"]
            Auth[Auth Service<br/>JWT + Spring Security]
            ProjectAPI[Project API<br/>Workspace / Projects / Tasks]
            AI[AI Service<br/>Gemini API Proxy]
            Calendar[Calendar Service<br/>Google Calendar Proxy]
            Notif[Notification Service<br/>Alerts and Events]
        end
    end

    subgraph External["External Services"]
        Gemini[Google Gemini API<br/>AI Planning]
        GCal[Google Calendar API<br/>Deadline Sync]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL<br/>Primary Database<br/><br/>• users<br/>• workspaces<br/>• projects<br/>• tasks<br/>• ai_history)]
    end

    UI -->|REST API / JSON| Backend
    AI -->|HTTPS| Gemini
    Calendar -->|OAuth2 / HTTPS| GCal
    Backend -->|Spring Data JPA| PG
```

---

### Data Flow

```mermaid
flowchart LR
    User([User]) --> React[React Frontend]
    React -->|JWT Bearer Token| Auth[Auth Service]
    Auth -->|Validated Request| ProjectAPI[Project API]

    ProjectAPI --> PG[(PostgreSQL)]
    ProjectAPI -->|Task Created with Due Date| CalSvc[Calendar Service]
    CalSvc -->|Create Event| GCal[Google Calendar]

    ProjectAPI -->|AI Request| AISvc[AI Service]
    AISvc -->|Gemini API Call| Gemini[Gemini API]
    Gemini -->|Generated Tasks / Text| AISvc
    AISvc -->|Store History| PG
    AISvc -->|Response| React

    PG -->|Cron Job| Notif[Notification Service]
    Notif -->|Deadline / Assignment Alert| React
```

---

### User Workflow

```mermaid
flowchart TD
    A([Register / Login]) --> B[Create Workspace]
    B --> C[Invite Team Members]
    C --> D[Create Project]
    D --> E{Use AI?}

    E -->|Yes| F[AI Project Breakdown<br/>Gemini generates task list]
    E -->|No| G[Manually Create Tasks]

    F --> H[Tasks Created on Board]
    G --> H

    H --> I[Assign Members + Set Due Dates]
    I --> J[Sync to Google Calendar]
    J --> K[Work on Kanban Board<br/>Drag cards across columns]
    K --> L[Team Collaboration<br/>Comments, @mentions, labels]
    L --> M[Track Progress on Dashboard]
    M --> N{Project Done?}
    N -->|No| K
    N -->|Yes| O[Generate Report<br/>PDF / CSV Export]
    O --> P([Project Completed ✅])
```

---

### Database Schema

```mermaid
erDiagram
    USERS {
        uuid id PK
        string name
        string email
        string password_hash
        timestamp created_at
    }

    WORKSPACES {
        uuid id PK
        string name
        uuid owner_id FK
        timestamp created_at
    }

    WORKSPACE_MEMBERS {
        uuid workspace_id FK
        uuid user_id FK
        enum role
    }

    PROJECTS {
        uuid id PK
        uuid workspace_id FK
        string name
        date deadline
        enum status
        int progress_pct
    }

    BOARDS {
        uuid id PK
        uuid project_id FK
    }

    LISTS {
        uuid id PK
        uuid board_id FK
        string name
        int position
    }

    TASKS {
        uuid id PK
        uuid list_id FK
        uuid assignee_id FK
        string name
        text description
        enum priority
        date due_date
        int estimated_hours
        int actual_hours
    }

    LABELS {
        uuid id PK
        uuid project_id FK
        string name
        string color
    }

    TASK_LABELS {
        uuid task_id FK
        uuid label_id FK
    }

    COMMENTS {
        uuid id PK
        uuid task_id FK
        uuid user_id FK
        text content
        timestamp created_at
    }

    CHECKLISTS {
        uuid id PK
        uuid task_id FK
        string item
        boolean done
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string type
        string message
        boolean read
        timestamp created_at
    }

    CALENDAR_EVENTS {
        uuid id PK
        uuid task_id FK
        string google_event_id
    }

    AI_HISTORY {
        uuid id PK
        uuid user_id FK
        string feature
        text prompt
        text response
        timestamp created_at
    }

    ACTIVITY_LOGS {
        uuid id PK
        uuid user_id FK
        string entity_type
        uuid entity_id
        string action
        timestamp created_at
    }

    USERS ||--o{ WORKSPACE_MEMBERS : "belongs to"
    WORKSPACES ||--o{ WORKSPACE_MEMBERS : "has"
    WORKSPACES ||--o{ PROJECTS : "contains"
    PROJECTS ||--|| BOARDS : "has"
    BOARDS ||--o{ LISTS : "has"
    LISTS ||--o{ TASKS : "contains"
    TASKS ||--o{ TASK_LABELS : "tagged with"
    LABELS ||--o{ TASK_LABELS : "applied to"
    TASKS ||--o{ COMMENTS : "has"
    TASKS ||--o{ CHECKLISTS : "has"
    TASKS ||--o| CALENDAR_EVENTS : "syncs to"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AI_HISTORY : "generates"
    USERS ||--o{ ACTIVITY_LOGS : "creates"
```

---

### AI Feature Flow

```mermaid
flowchart LR
    subgraph Input["User Input"]
        I1[Project Idea]
        I2[Task Title]
        I3[Task Context]
        I4[Deadline + Team Size]
    end

    subgraph Gemini["Gemini API"]
        G[gemini-pro model]
    end

    subgraph Output["AI Output"]
        O1[Task Breakdown List]
        O2[Task Description]
        O3[Priority Level]
        O4[Estimated Timeline]
        O5[Sprint Plan by Week]
        O6[Daily Summary]
        O7[Health Score %]
    end

    I1 --> G
    I2 --> G
    I3 --> G
    I4 --> G

    G --> O1
    G --> O2
    G --> O3
    G --> O4
    G --> O5
    G --> O6
    G --> O7
```

---

### Development Roadmap

```mermaid
gantt
    title TaskFlow AI — Development Phases
    dateFormat  YYYY-MM-DD
    section Phase 1 · Foundation
    JWT Authentication       :done, p1a, 2025-01-01, 14d
    Workspace Management     :done, p1b, after p1a, 7d
    Project CRUD             :done, p1c, after p1b, 7d
    Kanban Board + DnD       :done, p1d, after p1c, 14d
    Task CRUD                :done, p1e, after p1d, 7d

    section Phase 2 · Collaboration
    Team Members and Roles   :active, p2a, after p1e, 10d
    Comments and Labels      :p2b, after p2a, 7d
    Notifications            :p2c, after p2b, 7d
    Activity Logs            :p2d, after p2c, 5d
    Dashboard Widgets        :p2e, after p2d, 7d

    section Phase 3 · Smart Features
    Gemini AI Integration    :p3a, after p2e, 14d
    Google Calendar Sync     :p3b, after p3a, 10d

    section Phase 4 · Advanced
    Analytics and Charts     :p4a, after p3b, 10d
    File Attachments         :p4b, after p4a, 7d
    PDF / CSV Export         :p4c, after p4b, 5d
    Dark Mode                :p4d, after p4c, 5d
    WebSockets               :p4e, after p4d, 14d
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Spring Boot 3, Spring MVC |
| Authentication | Spring Security + JWT |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL 14+ |
| AI | Google Gemini API |
| Calendar | Google Calendar API |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |
| Build Tool | Maven |

---

## 📁 Project Structure

```
taskflow-ai/
├── backend/                    # Spring Boot application
│   ├── src/main/java/
│   │   └── com/taskflow/
│   │       ├── auth/           # JWT auth, security config
│   │       ├── workspace/      # Workspace and members
│   │       ├── project/        # Project CRUD
│   │       ├── board/          # Kanban lists
│   │       ├── task/           # Task management
│   │       ├── ai/             # Gemini API integration
│   │       ├── calendar/       # Google Calendar sync
│   │       └── notification/   # Notification service
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── services/           # Axios API service files
│   │   ├── hooks/              # Custom React hooks
│   │   └── types/              # TypeScript interfaces
│   └── vite.config.ts
│
└── attached_assets/            # Project documentation and diagrams
```

---

## ⚡ Getting Started

### Prerequisites

| Software | Version | Purpose |
|---|---|---|
| Java | 17+ | Spring Boot runtime |
| Node.js | 18+ | React frontend |
| PostgreSQL | 14+ | Primary database |
| Maven | 3.8+ | Backend build tool |
| Git | 2.30+ | Version control |

You will also need:
- A [Google Gemini API key](https://ai.google.dev/)
- A [Google Cloud project](https://console.cloud.google.com/) with Calendar API enabled

---

### 1. Clone the repository

```bash
git clone https://github.com/ibavi-git/taskflow-ai.git
cd taskflow-ai
```

---

### 2. Database setup

```bash
psql -U postgres
CREATE DATABASE taskflow_db;
```

Spring Boot will auto-create all tables on first run via JPA.

---

### 3. Configure the backend

Copy the environment template in the backend directory:
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and configure your credentials:
```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/taskflow_db
SPRING_DATASOURCE_USERNAME=your_db_username
SPRING_DATASOURCE_PASSWORD=your_db_password

JWT_SECRET=your_secure_jwt_secret_key_at_least_32_characters
GEMINI_API_KEY=your_google_gemini_api_key
```

> ⚠️ **IMPORTANT:** Never commit your `.env` files. They are automatically ignored by `.gitignore`.

---

### 4. Configure the frontend

Copy the environment template in the frontend directory:
```bash
cp frontend/.env.example frontend/.env
```
Configure backend url (or keep default local):
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

### 5. Run the backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend API will start running at `http://localhost:8080/api`

---

### 6. Run the frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend development server will run at `http://localhost:5173`

---

### Service Ports

| Service | Port | URL |
|---|---|---|
| Spring Boot API | 8080 | http://localhost:8080/api |
| React Frontend | 5173 | http://localhost:5173 |
| PostgreSQL | 5432 | localhost:5432 |

---

## 🐳 Docker & Containerization

### Running Locally with Docker Compose

Build and run all services (PostgreSQL, Spring Boot Backend, and Nginx Frontend) with a single command:

```bash
# Create a root-level .env if you wish to override parameters
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **Postgres Database:** localhost:5432 (mapped to persistent volume `postgres_data`)

---

## 🚀 Production Deployment

### 1. Backend Deployment (Spring Boot)
- **Engine:** Docker multi-stage build.
- **Port:** Configurable via `PORT` or `SERVER_PORT` environment variables (defaults to 8080).
- **Required Env Vars:**
  - `SPRING_DATASOURCE_URL`: PostgreSQL JDBC url (`jdbc:postgresql://<host>:<port>/<db>`)
  - `SPRING_DATASOURCE_USERNAME`: database username
  - `SPRING_DATASOURCE_PASSWORD`: database password
  - `JWT_SECRET`: strong cryptographically random key (min. 32 characters)
  - `GEMINI_API_KEY`: Google Gemini api key
  - `CORS_ALLOWED_ORIGINS`: comma-separated allowed origins (no spaces, e.g. `https://your-frontend.com`)
  - `SPRING_PROFILES_ACTIVE`: `prod`

### 2. Frontend Deployment (React + Vite)
- **Engine:** Docker multi-stage Nginx-alpine image.
- **Port:** 3000 (standardized).
- **Required Env Vars (Build-Time):**
  - `VITE_API_BASE_URL`: Fully qualified production domain endpoint (e.g. `https://api.yourdomain.com/api`)

### Supported Cloud Platforms
- **Render:** Set root directories to `backend` and `frontend`, use Docker runtime.
- **Railway:** Connect repo, setup Postgres service, map variables.
- **DigitalOcean / AWS / GCP:** Deploy standard containers via Docker Compose or Kubernetes manifests.


---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |

### Workspaces

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workspaces` | Get all workspaces |
| `POST` | `/api/workspaces` | Create workspace |
| `POST` | `/api/workspaces/{id}/invite` | Invite member |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | Get all projects |
| `POST` | `/api/projects` | Create project |
| `PUT` | `/api/projects/{id}` | Update project |
| `DELETE` | `/api/projects/{id}` | Delete project |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks/{boardId}` | Get tasks for a board |
| `POST` | `/api/tasks` | Create task |
| `PUT` | `/api/tasks/{id}` | Update task |
| `PATCH` | `/api/tasks/{id}/move` | Move task to list |

### AI Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/breakdown` | Generate task breakdown from project idea |
| `POST` | `/api/ai/describe` | Generate task description from title |
| `POST` | `/api/ai/priority` | Suggest priority for a task |
| `POST` | `/api/ai/sprint-plan` | Generate sprint plan |
| `GET` | `/api/ai/health/{projectId}` | Get AI project health score |
| `GET` | `/api/ai/daily-summary` | Get today's AI summary |

> All endpoints except `/api/auth/**` require `Authorization: Bearer <token>` header.

---

## 🔧 Troubleshooting

<details>
<summary><strong>PostgreSQL connection refused</strong></summary>

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify credentials
psql -U YOUR_USERNAME -d taskflow_db

# Confirm datasource URL in application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/taskflow_db
```
</details>

<details>
<summary><strong>JWT authentication errors</strong></summary>

```bash
# Ensure jwt.secret is at least 32 characters
# Generate a strong secret:
openssl rand -base64 32
```
</details>

<details>
<summary><strong>Gemini API returning 403</strong></summary>

- Verify your API key at [https://ai.google.dev/](https://ai.google.dev/)
- Check that the Generative Language API is enabled in your Google Cloud project
- Confirm `gemini.api.key` is correctly set in `application.properties`
</details>

<details>
<summary><strong>Google Calendar events not syncing</strong></summary>

- Confirm the Calendar API is enabled in Google Cloud Console
- Check OAuth2 consent screen is configured
- Verify `client-id` and `client-secret` values
- Ensure the authenticated user has granted calendar permissions
</details>

<details>
<summary><strong>CORS errors on the frontend</strong></summary>

```java
// In your Spring Boot CORS config, ensure the frontend origin is allowed:
@CrossOrigin(origins = "http://localhost:5173")
```
</details>

---

## 📅 Development Roadmap

- [x] **Phase 1 — Foundation**
  - [x] JWT authentication
  - [x] Workspace and project management
  - [x] Kanban board with drag-and-drop
  - [x] Task CRUD

- [ ] **Phase 2 — Collaboration**
  - [ ] Team members and roles
  - [ ] Comments and @mentions
  - [ ] Labels and notifications
  - [ ] Activity logs and dashboard

- [ ] **Phase 3 — Smart Features**
  - [ ] Gemini AI integration (breakdown, descriptions, sprints, health)
  - [ ] Google Calendar sync

- [ ] **Phase 4 — Advanced**
  - [ ] Analytics dashboard
  - [ ] File attachments
  - [ ] PDF/CSV export
  - [ ] Dark mode
  - [ ] Real-time collaboration (WebSockets)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

Please follow conventional commit messages and write clean, documented code.

---

## 👤 Author

**Bavi** — [@ibavi-git](https://github.com/ibavi-git)

> Built as a full-stack portfolio and hackathon project demonstrating React, Spring Boot, PostgreSQL, JWT authentication, Gemini AI integration, and Google Calendar API design.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>If you found this useful, give it a ⭐ on GitHub!</sub>
</div>
