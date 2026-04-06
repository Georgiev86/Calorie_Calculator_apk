import express from "express";
import OpenAI from "openai";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 8787;
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "store.json");

app.use(express.json());

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(
    dataFile,
    JSON.stringify(
      {
        users: [],
      },
      null,
      2
    )
  );
}

function readStore() {
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeStore(store) {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

function getSessionUser(req) {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return null;
  }

  const store = readStore();
  const user = store.users.find((entry) => entry.sessionToken === token);
  return user ?? null;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, date: new Date().toISOString() });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: "email_and_password_min_8_required" });
  }

  const store = readStore();
  const existingUser = store.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
  if (existingUser) {
    return res.status(409).json({ error: "user_already_exists" });
  }

  const user = {
    id: crypto.randomUUID(),
    email: String(email).toLowerCase(),
    passwordHash: hashPassword(password),
    sessionToken: createToken(),
    profile: null,
    progress: [],
  };

  store.users.push(user);
  writeStore(store);

  return res.json({
    token: user.sessionToken,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  const store = readStore();
  const user = store.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());

  if (!user || user.passwordHash !== hashPassword(String(password ?? ""))) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  user.sessionToken = createToken();
  writeStore(store);

  return res.json({
    token: user.sessionToken,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

app.get("/api/cloud", (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }

  return res.json({
    profile: user.profile,
    progress: user.progress ?? [],
  });
});

app.put("/api/cloud", (req, res) => {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { profile, progress } = req.body ?? {};
  const store = readStore();
  const target = store.users.find((entry) => entry.id === user.id);

  if (!target) {
    return res.status(404).json({ error: "user_not_found" });
  }

  target.profile = profile ?? null;
  target.progress = Array.isArray(progress) ? progress : [];
  writeStore(store);

  return res.json({ ok: true });
});

app.post("/api/coach", async (req, res) => {
  const { message, profile, progress } = req.body ?? {};

  if (!message || !profile) {
    return res.status(400).json({ error: "message and profile are required" });
  }

  if (!client) {
    return res.json({
      reply:
        "Backend endpoint е активен, но липсва OPENAI_API_KEY. Добави ключ в server environment, за да получиш истински AI отговори.",
    });
  }

  try {
    const latestProgress = Array.isArray(progress) && progress.length > 0 ? progress[0] : null;

    const response = await client.responses.create({
      model: "gpt-5",
      reasoning: { effort: "low" },
      instructions:
        "You are a helpful nutrition coach for a Bulgarian calorie calculator app. Keep replies concise, practical, and safe. Do not diagnose conditions. Use metric units and answer in Bulgarian.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                profile,
                latestProgress,
                userMessage: message,
              }),
            },
          ],
        },
      ],
    });

    return res.json({
      reply: response.output_text || "Не успях да генерирам отговор в момента.",
    });
  } catch (error) {
    return res.status(500).json({
      error: "coach_request_failed",
      details: error instanceof Error ? error.message : "unknown_error",
    });
  }
});

app.listen(port, () => {
  console.log(`Calorie Coach backend listening on http://localhost:${port}`);
});
