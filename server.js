// server.js
const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");
const { default: connectMongoDB } = require("./libs/dbConnect");
const { default: Chat } = require("./models/Chat");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3001;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("message", (data) => {
      console.log(data);
      const { senderId, receiverId, message } = data;

      if (!senderId || !receiverId || !message) {
        return socket.emit(
          "error",
          "Missing fields: senderId, receiverId, message"
        );
      }

      try {
        // Connect to MongoDB
        connectMongoDB();

        // Save the chat message to MongoDB
        const newMessage = new Chat({
          senderId,
          receiverId,
          message,
          timestamp: new Date(),
        });

        newMessage.save();
        console.log("Message saved:", newMessage);

        // Broadcast the message to the receiver (or all clients, as you wish)
        io.to(receiverId).emit("message", data);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", "Failed to save message");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  httpServer.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Socket.io is running on http://${hostname}:${port}`);
  });
});
