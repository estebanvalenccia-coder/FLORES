import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get("/api/status", (_, res) => {
  res.json({
    ok: true,
    mode: "LAN",
    grok: Boolean(process.env.XAI_API_KEY),
  });
});

app.post("/api/grok", async (req, res) => {
  const { prompt } = req.body;

  if (!process.env.XAI_API_KEY) {
    return res.status(400).json({
      error: "XAI_API_KEY no configurada",
    });
  }

  return res.json({
    success: true,
    message: "Endpoint preparado para Grok/xAI",
    prompt,
  });
});

wss.on("connection", (socket) => {
  console.log("Nuevo dispositivo conectado en LAN");

  socket.send(JSON.stringify({
    type: "connected",
    message: "Conectado al servidor FLORES",
  }));

  socket.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message.toString());
      }
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor FLORES activo en puerto ${PORT}`);
});
