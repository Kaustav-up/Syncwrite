import { useState } from "react";
import Editor from "./components/Editor.jsx";

const randomId = () => Math.random().toString(36).slice(2, 8);

export default function App() {
  const [session, setSession] = useState(null);
  const [name, setName] = useState("");
  const [docId, setDocId] = useState(window.location.hash.replace("#", "") || "");

  const join = (e) => {
    e.preventDefault();
    const id = docId.trim() || randomId();
    window.location.hash = id;
    setSession({ name: name.trim() || "Guest", docId: id });
  };

  if (session) {
    return <Editor docId={session.docId} name={session.name} onLeave={() => setSession(null)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">SyncWrite</h1>
        <p className="text-slate-500 mt-1 mb-6 text-sm">
          Write markdown with other people and watch the preview update as you type.
        </p>
        <form onSubmit={join} className="space-y-4">
          <label className="block text-sm font-medium">
            Your name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kaustav"
              maxLength={24}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </label>
          <label className="block text-sm font-medium">
            Document ID
            <input
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="Leave empty to start a new one"
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </label>
          <button className="w-full bg-brand text-white font-semibold rounded-lg py-2.5 hover:bg-blue-700 transition-colors">
            {docId.trim() ? "Join document" : "Create document"}
          </button>
        </form>
      </div>
    </div>
  );
}
