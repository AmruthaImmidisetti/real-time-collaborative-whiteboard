# Real-Time Collaborative Whiteboard

## Project Overview

This project is a **real-time collaborative whiteboard application** where multiple users can draw on the same canvas simultaneously. The application uses **WebSockets with Socket.IO** to synchronize drawing actions between users in real time.

The system is built using a **React frontend**, **Node.js + Express backend**, and **PostgreSQL database**, and the entire project is containerized using **Docker and Docker Compose**.

This project demonstrates real-time communication, canvas drawing, state management, and collaborative application design.

---

# Features

### Real-Time Collaboration

Multiple users can join the same board and see each other's drawings instantly.

### Drawing Tools

Users can draw on the canvas using:

* Pen tool
* Rectangle tool

### Cursor Tracking

Users can see other users’ cursors moving in real time.

### Active User List

The application shows all users currently connected to the board.

### Undo / Redo

Users can undo or redo their own drawing actions.

### Board Persistence

Whiteboard data can be saved and loaded using backend APIs.

### Dockerized Infrastructure

The entire application runs using a single command:

```
docker-compose up
```

---

# Technology Stack

## Frontend

* React
* Vite
* HTML Canvas API
* Socket.IO Client

## Backend

* Node.js
* Express.js
* Socket.IO
* Passport.js (OAuth authentication)

## Database

* PostgreSQL

## DevOps

* Docker
* Docker Compose

---

# Project Architecture

```
Frontend (React + Canvas)
        |
        | WebSocket
        v
Backend (Express + Socket.IO)
        |
        | REST API
        v
PostgreSQL Database
```

### Frontend

Handles:

* Canvas drawing
* UI interactions
* WebSocket communication

### Backend

Handles:

* WebSocket room management
* API endpoints
* Authentication
* Board persistence

### Database

Stores:

* Board state
* Canvas objects

---

# Project Structure

```
collaborative-whiteboard
│
├ docker-compose.yml
├ README.md
├ .env.example
├ submission.json
│
├ backend
│   ├ Dockerfile
│   ├ package.json
│   ├ src
│   │   ├ server.js
│   │   ├ routes
│   │   └ controllers
│   └ seeds
│
└ frontend
    ├ Dockerfile
    ├ package.json
    └ src
        ├ pages
        ├ services
        └ components
```

---

# Installation and Setup

## 1. Clone the Repository

```
git clone <repository-url>
cd collaborative-whiteboard
```

---

## 2. Configure Environment Variables

Create a `.env` file using `.env.example`.

Example:

```
DATABASE_URL=postgresql://user:password@db:5432/whiteboard
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=whiteboard
PORT=3001
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-secret
```

---

## 3. Run the Application

Start all services using Docker Compose:

```
docker-compose up
```

This will start:

* Frontend → http://localhost:3000
* Backend → http://localhost:3001
* PostgreSQL database

---

## Accessing the Whiteboard

After starting the application, open the whiteboard in your browser.

### Home Page

http://localhost:3000

This page displays the main entry of the application.

### Collaborative Whiteboard Room

http://localhost:3000/board/test-room

When a user navigates to `/board/:boardId`, the frontend connects to the
WebSocket server and joins a collaborative room corresponding to the
board ID.

Inside this room, multiple users can:

-   Draw on the canvas using the **pen tool**
-   Create **rectangle shapes**
-   See **real-time cursor movements**
-   View **active users in the room**
-   Perform **undo and redo actions**

All drawing actions and object creations are synchronized in real-time
using **Socket.IO**.

---

# API Endpoints

## Health Check

```
GET /health
```

Response:

```
{
  "status": "ok",
  "timestamp": "ISO timestamp"
}
```

---

## Create Board

```
POST /api/boards
```

Response:

```
{
  "boardId": "unique-board-id"
}
```

---

## Save Board

```
POST /api/boards/:boardId
```

Request body:

```
{
  "objects": []
}
```

---

## Load Board

```
GET /api/boards/:boardId
```

---

# WebSocket Events

### Join Room

```
joinRoom
```

Payload:

```
{ boardId }
```

---

### Draw

```
draw
drawUpdate
```

Used to synchronize pen drawing between users.

---

### Rectangle Object

```
addObject
objectAdded
```

Used to synchronize rectangle shapes.

---

### Cursor Movement

```
cursorMove
cursorUpdate
```

Broadcasts user cursor positions.

---

# Undo / Redo

Undo and redo actions are implemented using two stacks:

* **Undo Stack** – stores previous actions
* **Redo Stack** – stores undone actions

Undo removes the last action and redraws the canvas.

Redo restores the previously undone action.

---

# Testing

To test the collaborative features:

1. Open two browser tabs
2. Navigate to the same board URL

```
http://localhost:3000/board/test-room
```

Draw in one tab and observe the updates in the other tab.

---

# Future Improvements

Possible improvements include:

* Advanced drawing tools
* Board sharing permissions
* Real-time text annotations
* Canvas object editing
* Performance optimizations

---

# Conclusion

This project demonstrates how to build a **real-time collaborative application** using modern web technologies. It showcases WebSocket communication, canvas rendering, Docker containerization, and scalable system design.

The project can be extended into applications such as:

* Online classrooms
* Collaborative design tools
* Team brainstorming platforms
* Remote whiteboarding solutions
