import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export default function useCollab(docId, name) {
  const socketRef = useRef(null);
  const [content, setContent] = useState("");
  const [users, setUsers] = useState([]);
  const [versions, setVersions] = useState([]);
  const [connected, setConnected] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", { docId, name });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("init", (data) => {
      setContent(data.content);
      setVersions(data.versions);
      setReady(true);
    });
    socket.on("remote-edit", (data) => setContent(data.content));
    socket.on("restored", (data) => setContent(data.content));
    socket.on("presence", setUsers);
    socket.on("versions", setVersions);
    socket.on("failure", setError);

    return () => socket.disconnect();
  }, [docId, name]);

  const edit = useCallback((value) => {
    setContent(value);
    socketRef.current?.emit("edit", { content: value });
  }, []);

  const saveVersion = useCallback((value) => {
    socketRef.current?.emit("save-version", { content: value });
  }, []);

  const restore = useCallback((versionId) => {
    socketRef.current?.emit("restore", { versionId });
  }, []);

  return { content, users, versions, connected, ready, error, edit, saveVersion, restore };
}
