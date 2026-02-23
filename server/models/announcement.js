const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  sections: [
    {
      title: String,
      description: String
    }
  ]
});

module.exports = mongoose.model("Sections", SectionSchema);
