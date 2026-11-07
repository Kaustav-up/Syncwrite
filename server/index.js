import "dotenv/config";
import http from "http";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import Document from "./models/Document.js";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/syncwrite";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const STARTER = "# Untitled\n\nStart writing here. Anyone with this link can edit along with you.";

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_URL } });

const rooms = new Map();
const saveTimers = new Map();

const serializeVersions = (doc) =>
  doc.versions
    .map((v) => ({
      id: v._id.toString(),
      author: v.author,
      content: v.content,
      savedAt: v.savedAt,
    }))
    .reverse();

const listUsers = (docId) => {
  const room = rooms.get(docId);
  return room ? [...room.values()] : [];
};

const queueSave = (docId, content) => {
  clearTimeout(saveTimers.get(docId));
  saveTimers.set(
    docId,
    setTimeout(async () => {
      try {
        await Document.updateOne({ docId }, { content });
      } catch (err) {
        console.error("Could not save", docId, err.message);
      }
    }, 700)
  );
};

io.on("connection", (socket) => {
  socket.on("join", async ({ docId, name }) => {
    if (!docId) return;
    const userName = (name || "Guest").slice(0, 24);

    try {
      const doc = await Document.findOneAndUpdate(
        { docId },
        { $setOnInsert: { docId, content: STARTER } },
        { upsert: true, new: true }
      );

      socket.data.docId = docId;
      socket.data.name = userName;
      socket.join(docId);

      if (!rooms.has(docId)) rooms.set(docId, new Map());
      rooms.get(docId).set(socket.id, userName);

      socket.emit("init", { content: doc.content, versions: serializeVersions(doc) });
      io.to(docId).emit("presence", listUsers(docId));
    } catch (err) {
      socket.emit("failure", "Could not open this document.");
    }
  });

  socket.on("edit", ({ content }) => {
    const { docId } = socket.data;
    if (!docId || typeof content !== "string") return;
    socket.to(docId).emit("remote-edit", { content });
    queueSave(docId, content);
  });

  socket.on("save-version", async ({ content }) => {
    const { docId, name } = socket.data;
    if (!docId || typeof content !== "string") return;
    try {
      const doc = await Document.findOneAndUpdate(
        { docId },
        {
          content,
          $push: { versions: { $each: [{ author: name, content }], $slice: -30 } },
        },
        { new: true }
      );
      io.to(docId).emit("versions", serializeVersions(doc));
    } catch (err) {
      socket.emit("failure", "Could not save this version.");
    }
  });

  socket.on("restore", async ({ versionId }) => {
    const { docId } = socket.data;
    if (!docId) return;
    try {
      const doc = await Document.findOne({ docId });
      const version = doc && doc.versions.id(versionId);
      if (!version) return;
      doc.content = version.content;
      await doc.save();
      io.to(docId).emit("restored", { content: version.content });
    } catch (err) {
      socket.emit("failure", "Could not restore that version.");
    }
  });

  socket.on("disconnect", () => {
    const { docId } = socket.data;
    if (!docId || !rooms.has(docId)) return;
    const room = rooms.get(docId);
    room.delete(socket.id);
    if (room.size === 0) rooms.delete(docId);
    io.to(docId).emit("presence", listUsers(docId));
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    server.listen(PORT, () => console.log("Server running on port " + PORT));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
