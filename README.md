# Daily Task Manager

A full-stack task management application built with **FastAPI**, **MySQL**, **SQLAlchemy**, and **Firebase Authentication**.

The project provides a secure backend API where users authenticate with Firebase and manage their own personal tasks.

## Features

### Authentication

- Firebase email/password authentication
- Firebase ID token verification with Firebase Admin SDK
- Protected API routes
- User account synchronization between Firebase and MySQL
- Per-user task ownership

### Task Management

- Create tasks
- View tasks
- Update tasks
- Delete tasks
- Restrict task access to the owning user

### Backend

- FastAPI REST API
- SQLAlchemy ORM
- MySQL database
- Pydantic request validation
- Dependency injection
- Docker containerization
- Swagger API documentation

## Tech Stack

### Backend

- Python 3.12
- FastAPI
- SQLAlchemy
- MySQL 8.4
- Pydantic
- Alembic

### Authentication

- Firebase Authentication
- Firebase Admin SDK

### Development Tools

- Docker
- Docker Compose
- Git

## Project Structure

```text
daily-task-manager/
├── app/
│   ├── core/
│   │   ├── auth.py
│   │   └── firebase.py
│   ├── database/
│   │   ├── database.py
│   │   └── dependencies.py
│   ├── models/
│   │   ├── user.py
│   │   └── task.py
│   ├── routers/
│   │   └── tasks.py
│   ├── schemas/
│   │   └── task.py
│   └── main.py
├── alembic/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## Setup Instructions

### Clone the Repository

```bash
git clone <repository-url>
cd daily-task-manager
```

### Configure Environment Variables

Create a `.env` file and add your database connection string:

```env
DATABASE_URL=mysql+pymysql://username:password@db:3306/database_name
```

### Run the Application

Using Docker:

```bash
docker compose up --build
```

After the application starts, the API will be available at:

```text
http://127.0.0.1:8000
```

Swagger documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Database Design

### Users Table

Stores user information:

- `id`
- `username`
- `email`
- `firebase_uid`

### Tasks Table

Stores user tasks:

- `id`
- `title`
- `description`
- `user_id`

### Relationship

```text
User
└── Tasks
```

Each user can have many tasks, and each task belongs to one user.

## License

This project is for educational and portfolio purposes.
