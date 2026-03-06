import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import boardRoutes from "./routes/boardRoutes.js";
import passport from "../auth/passport.js";
import session from "express-session";

dotenv.config();

const app = express();
const server = http.createServer(app);
/* ---------------------
   SOCKET SERVER
--------------------- */

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3001;

/* ---------------------
   Middleware
--------------------- */

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "whiteboard-secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

/* ---------------------
   Routes
--------------------- */

app.use("/api", boardRoutes);

/* ---------------------
   Health API
--------------------- */

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000");
  }
);

app.get("/api/auth/session", (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.status(200).json({
    user: req.user
  });

});
/* ---------------------
   ACTIVE USERS STORAGE
--------------------- */

const rooms = {};

/* ---------------------
   SOCKET CONNECTION
--------------------- */

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  /* JOIN ROOM */
  socket.on("draw", (data) => {

  socket.broadcast.emit("drawUpdate", data);

});
  socket.on("joinRoom", ({ boardId }) => {

    socket.join(boardId);

    if (!rooms[boardId]) {
      rooms[boardId] = [];
    }

    const user = {
      id: socket.id,
      name: "User-" + socket.id.slice(0, 5),
    };

    rooms[boardId].push(user);

    /* SEND USER LIST */

    io.to(boardId).emit("roomUsers", {
      users: rooms[boardId],
    });
  });

  /* CURSOR MOVEMENT */

  socket.on("cursorMove", ({ boardId, x, y }) => {

    socket.to(boardId).emit("cursorUpdate", {
      userId: socket.id,
      x,
      y,
    });

  });

  /* DISCONNECT */

  socket.on("disconnect", () => {

    for (const boardId in rooms) {

      rooms[boardId] = rooms[boardId].filter(
        user => user.id !== socket.id
      );

      io.to(boardId).emit("roomUsers", {
        users: rooms[boardId],
      });

    }

    console.log("User disconnected:", socket.id);

  });

  socket.on("addObject", (data) => {

  socket.broadcast.emit("objectAdded", data);

});

});

/* ---------------------
   START SERVER
--------------------- */

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});