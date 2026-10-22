# Online Checkers v2.1

An online and offline checkers game built with a Spring Boot backend and a
vanilla HTML, CSS, and JavaScript frontend.

This project started as a way to learn and work in a Linux environment. While
refreshing it, I also updated several parts of the application and its
infrastructure.

## What changed

- Moved persistence from PostgreSQL to MongoDB.
- Simplified registration: accounts are created directly without email
  verification.
- Removed the email-code password reset flow.
- Moved real-time Socket.IO handling into the Spring Boot application, replacing
  the separate Node.js socket server.
- Updated the backend and frontend as part of the Linux development refresh.

Existing PostgreSQL data is not migrated automatically. The application starts
with MongoDB and uses a new database unless you migrate your data separately.

## Features

- Play offline or create and join online games.
- Synchronize online game moves with Socket.IO.
- Register and log in with an email address and password.
- Review offline game history and navigate through moves.
- Use the desktop or mobile-friendly frontend.

## Technology

| Area | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Java 21, Spring Boot |
| Real-time communication | Socket.IO with `netty-socketio` |
| Database | MongoDB |
| Authentication | Spring Security, JWT |
| Build | Maven |

## Run locally on Linux

### Prerequisites

- Java 21
- MongoDB running locally, or a MongoDB connection URI
- A web browser
- Internet access for loading the Socket.IO client script from its CDN

### 1. Start MongoDB

Start your local MongoDB service, or prepare a MongoDB connection URI. By
default, the backend connects to:

```text
mongodb://localhost:27017/checker_db
```

To use a different MongoDB instance, set `MONGODB_URI` before launching the
backend:

```bash
export MONGODB_URI='mongodb://<host>:<port>/<database>'
```

### 2. Start the backend

From the repository root:

```bash
cd CheckerServer
./mvnw spring-boot:run
```

The REST API listens on port `9090`, and the Socket.IO server listens on port
`3002`.

### 3. Serve the frontend

In a second terminal, from the repository root:

```bash
python3 -m http.server 8000 --directory public
```

Open [http://localhost:8000](http://localhost:8000) for the desktop version or
[http://localhost:8000/mobile.html](http://localhost:8000/mobile.html) for the
mobile-friendly version.

The frontend currently connects to the backend at `127.0.0.1`, so this setup is
for running the browser and backend on the same machine. To play from another
device, update the frontend API and Socket.IO addresses to use the backend
machine's reachable address.

## Project layout

```text
Online-checkers-v2.1/
├── CheckerServer/
│   ├── src/main/java/    # Spring Boot API, persistence, auth, Socket.IO
│   └── src/main/resources/
│       └── application.properties
└── public/
    ├── index.html        # Desktop frontend
    ├── mobile.html       # Mobile-friendly frontend
    └── js/               # Frontend game, auth, routing, and socket logic
```

## Notes

- Email verification and email-code password recovery are disabled.
- MongoDB collections and records are separate from the previous PostgreSQL
  database; no automatic data migration is included.
- This is a learning project and is not presented as a production-ready
  authentication or deployment setup.
