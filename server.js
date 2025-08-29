// server.js
const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const PASSWORD = "superSecret"; // change this!

const wss = new WebSocket.Server({ port: PORT });
console.log(`Server running on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("New connection");

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "auth") {
      if (data.password !== PASSWORD) {
        ws.send(JSON.stringify({ type: "error", message: "Wrong password" }));
        ws.close();
        return;
      }
      ws.isAuthed = true;
      ws.send(JSON.stringify({ type: "success", message: "Authenticated" }));
      return;
    }

    if (!ws.isAuthed) return;

    // forward messages to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });
});
