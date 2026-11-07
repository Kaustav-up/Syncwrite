import { useLayoutEffect, useRef, useState } from "react";
import useCollab from "../hooks/useCollab.js";
import Preview from "./Preview.jsx";
import Versions from "./Versions.jsx";

const colors = ["bg-rose-500", "bg-amber-500", "bg-emerald-600", "bg-sky-600", "bg-violet-600"];

export default function Editor({ docId, name, onLeave }) {
  const { content, users, versions, connected, ready, error, edit, saveVersion, restore } =
    useCollab(docId, name);
  const [showHistory, setShowHistory] = useState(false);
  const [view, setView] = useState("write");
  const [copied, setCopied] = useState(false);
  const areaRef = useRef(null);
  const selection = useRef({ start: 0, end: 0 });

  useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area || document.activeElement !== area) return;
    const max = area.value.length;
    area.setSelectionRange(
      Math.min(selection.current.start, max),
      Math.min(selection.current.end, max)
    );
  }, [content]);

  const handleChange = (e) => {
    selection.current = { start: e.target.selectionStart, end: e.target.selectionEnd };
    edit(e.target.value);
  };

  const handleSelect = (e) => {
    selection.current = { start: e.target.selectionStart, end: e.target.selectionEnd };
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center gap-3">
        <button onClick={onLeave} className="font-bold tracking-tight">
          SyncWrite
        </button>
        <span className="text-sm text-slate-500 font-mono">{docId}</span>
        <span
          className={
            "text-xs font-medium px-2 py-0.5 rounded-full " +
            (connected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")
          }
        >
          {connected ? "Live" : "Reconnecting"}
        </span>

        <div className="flex -space-x-2 ml-auto">
          {users.map((u, i) => (
            <span
              key={i}
              title={u}
              className={
                "w-8 h-8 rounded-full text-white text-xs font-semibold grid place-items-center border-2 border-white " +
                colors[i % colors.length]
              }
            >
              {u.slice(0, 1).toUpperCase()}
            </span>
          ))}
        </div>

        <button
          onClick={copyLink}
          className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50"
        >
          {copied ? "Link copied" : "Copy link"}
        </button>
        <button
          onClick={() => saveVersion(content)}
          className="text-sm bg-brand text-white font-semibold rounded-lg px-3 py-1.5 hover:bg-blue-700"
        >
          Save version
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50"
        >
          History
        </button>
      </header>

      {error && <p className="bg-rose-50 text-rose-700 text-sm px-4 py-2">{error}</p>}

      <div className="md:hidden flex border-b border-slate-200 bg-white">
        {["write", "preview"].map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={
              "flex-1 py-2 text-sm font-medium capitalize " +
              (view === tab ? "border-b-2 border-brand text-brand" : "text-slate-500")
            }
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
        <main className="flex-1 grid md:grid-cols-2 min-h-0">
          <section className={(view === "write" ? "block" : "hidden") + " md:block min-h-0"}>
            {ready ? (
              <textarea
                ref={areaRef}
                value={content}
                onChange={handleChange}
                onSelect={handleSelect}
                spellCheck={false}
                className="w-full h-full resize-none bg-white p-5 font-mono text-sm leading-6 focus:outline-none md:border-r border-slate-200"
              />
            ) : (
              <p className="p-5 text-slate-500 text-sm">Opening document...</p>
            )}
          </section>
          <section
            className={
              (view === "preview" ? "block" : "hidden") +
              " md:block overflow-y-auto bg-white p-6 min-h-0"
            }
          >
            <Preview content={content} />
          </section>
        </main>

        {showHistory && (
          <Versions
            versions={versions}
            onRestore={restore}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>

      <footer className="bg-white border-t border-slate-200 px-4 py-1.5 text-xs text-slate-500 flex justify-between">
        <span>{words} words</span>
        <span>{users.length} {users.length === 1 ? "person" : "people"} here</span>
      </footer>
    </div>
  );
}
