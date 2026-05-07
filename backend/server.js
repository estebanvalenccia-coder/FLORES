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
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3001;
const XAI_MODEL = process.env.XAI_MODEL || "grok-4.3";
const NANO_BANANA_MODEL = process.env.NANO_BANANA_MODEL || "nano-banana";

function broadcast(payload) {
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(message);
  });
}

function buildBouquetPrompt({ occasion, style, budget, colors, flowers }) {
  const flowerList = Array.isArray(flowers) && flowers.length ? flowers.join(", ") : "flores de temporada";
  const colorList = Array.isArray(colors) && colors.length ? colors.join(", ") : "tonos elegantes y naturales";

  return `Crea una propuesta profesional para una floristería. El cliente quiere un ramo para ${occasion || "una ocasión especial"}, estilo ${style || "elegante"}, presupuesto aproximado ${budget || "flexible"} euros, colores ${colorList}, usando estas flores si encajan: ${flowerList}. Devuelve SOLO JSON válido con esta estructura: {"title":"nombre comercial del ramo","description":"descripción bonita para mostrar al cliente","imagePrompt":"prompt ultra realista para generar una imagen del ramo sobre fondo elegante, sin texto, sin logos, sin manos, sin florero si no se pide","recommendedFlowers":["flor"],"sellingTips":"frase breve de venta"}.`;
}

app.get("/api/status", (_, res) => {
  res.json({
    ok: true,
    mode: "LAN",
    grok: Boolean(process.env.XAI_API_KEY),
    nanoBanana: Boolean(process.env.NANO_BANANA_API_KEY),
  });
});

app.post("/api/grok/bouquet", async (req, res) => {
  if (!process.env.XAI_API_KEY) {
    return res.status(400).json({ error: "XAI_API_KEY no configurada" });
  }

  try {
    const prompt = buildBouquetPrompt(req.body || {});

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: XAI_MODEL,
        stream: false,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "Eres un director creativo experto en floristería premium. Respondes en español y en JSON válido.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: `Error de Grok: ${detail}` });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(clean);

    broadcast({ type: "bouquet:proposal", payload: result });
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error generando propuesta con Grok" });
  }
});

app.post("/api/nano-banana/generate", async (req, res) => {
  if (!process.env.NANO_BANANA_API_KEY) {
    return res.status(400).json({ error: "NANO_BANANA_API_KEY no configurada" });
  }

  const { prompt, aspectRatio = "1:1" } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "Falta prompt para generar la imagen" });
  }

  try {
    const response = await fetch("https://www.nananobanana.com/api/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NANO_BANANA_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        selectedModel: NANO_BANANA_MODEL,
        aspectRatio,
        mode: "sync",
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: `Error de Nano Banana: ${detail}` });
    }

    const data = await response.json();
    const imageUrl = data?.data?.outputImageUrls?.[0] || data?.outputImageUrls?.[0] || data?.imageUrl || data?.url || "";

    const payload = { imageUrl, raw: data };
    broadcast({ type: "bouquet:image", payload });
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message || "Error generando imagen" });
  }
});

app.post("/api/bouquet/full", async (req, res) => {
  const baseUrl = `http://127.0.0.1:${PORT}`;

  try {
    const grokResponse = await fetch(`${baseUrl}/api/grok/bouquet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {}),
    });
    const grokData = await grokResponse.json();

    if (!grokResponse.ok) return res.status(grokResponse.status).json(grokData);

    const imagePrompt = grokData.result?.imagePrompt;
    const imageResponse = await fetch(`${baseUrl}/api/nano-banana/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: imagePrompt, aspectRatio: req.body?.aspectRatio || "1:1" }),
    });
    const imageData = await imageResponse.json();

    if (!imageResponse.ok) return res.status(imageResponse.status).json({ proposal: grokData.result, imageError: imageData.error });

    res.json({ proposal: grokData.result, image: imageData });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error creando ramo completo" });
  }
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
