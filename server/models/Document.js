import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
  author: { type: String, default: "Anonymous" },
  content: { type: String, default: "" },
  savedAt: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true, unique: true, index: true },
    content: { type: String, default: "" },
    versions: [versionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
