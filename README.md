# SyncWrite

A collaborative markdown editor. Several people can open the same document, type together, see a live preview, and save versions to restore later.

Stack: React, Node.js, Express, Socket.io, MongoDB, Tailwind CSS.

## What you need

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Run it

Server:

```
cd server
npm install
copy .env.example .env
npm run dev
```

Client, in a second terminal:

```
cd client
npm install
copy .env.example .env
npm run dev
```

Open http://localhost:5173, enter a name and create a document. Share the page link and open it in another browser window to edit together.

## How syncing works

Each keystroke sends the full document text to the server, which relays it to everyone else in the room and saves it to MongoDB a moment later. If two people type at the exact same moment the last edit wins. A proper fix would use operational transforms or a CRDT.

## Features

- Live editing over WebSockets
- Markdown preview, sanitised before display
- People currently in the document
- Save a version, browse history, restore an older one
- Works on phone-sized screens with a Write / Preview switch
