const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = !dev ? process.env.HOSTNAME : "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.io
  const io = new Server(httpServer, {
    path: "/api/socket",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Store io instance globally
  global.io = io;

  // Setup socket handlers
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join game room
    socket.on("join-game", async (gameId) => {
      socket.join(`game:${gameId}`);
      console.log(`Client ${socket.id} joined game: ${gameId}`);
      socket.emit("joined-game", { gameId });
    });

    // Leave game room
    socket.on("leave-game", async (gameId) => {
      socket.leave(`game:${gameId}`);
      console.log(`Client ${socket.id} left game: ${gameId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(
        `> Socket.io available at http://${hostname}:${port}/api/socket`
      );
    });
});
