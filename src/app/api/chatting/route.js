// app/chatting/route.js
import { getSocket } from "../../../../libs/socket";

export async function POST(req) {

//   const body = await req.json();
//   const { receiverId, message } = body;

    const io = getSocket();
    console.log(io)
    return;
    // "dev": "concurrently \"next dev\" \"node server.js\"",

  if (!io) {
    return new Response(JSON.stringify({ error: "Socket not ready" }), {
      status: 500,
    });
  }

  // Send message to specific room
  io.to(receiverId).emit("receive_message", {
    message,
    from: "API",
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
