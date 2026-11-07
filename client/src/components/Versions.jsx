const formatTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

const firstLine = (text) => {
  const line = text.split("\n").find((l) => l.trim()) || "Empty document";
  return line.replace(/^#+\s*/, "").slice(0, 48);
};

export default function Versions({ versions, onRestore, onClose }) {
  return (
    <aside className="w-full md:w-72 bg-white border-l border-slate-200 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="font-semibold">Version history</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-ink text-sm">
          Close
        </button>
      </div>
      {versions.length === 0 ? (
        <p className="p-4 text-sm text-slate-500">
          Nothing saved yet. Use "Save version" to keep a copy you can come back to.
        </p>
      ) : (
        <ul className="overflow-y-auto divide-y divide-slate-100">
          {versions.map((v) => (
            <li key={v.id} className="px-4 py-3">
              <p className="text-sm font-medium truncate">{firstLine(v.content)}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {v.author} · {formatTime(v.savedAt)}
              </p>
              <button
                onClick={() => onRestore(v.id)}
                className="mt-2 text-xs font-semibold text-brand hover:underline"
              >
                Restore this version
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
