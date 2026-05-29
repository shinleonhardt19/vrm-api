import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// REST API
app.post("/api/expression", (req, res) => {
  const data = req.body;
  broadcast({
    type: "expression",
    payload: data,
  });
  res.json({ ok: true });
});

const server = app.listen(7419, "0.0.0.0", () => {
  console.log("API running on 0.0.0.0:7419");
});

// WebSocket
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const ws of clients) {
    ws.send(data);
  }
}
