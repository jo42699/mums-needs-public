const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    provider: { type: String }, // google | password
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
