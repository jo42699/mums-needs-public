const express = require("express");
const router = express.Router();
const Sections = require("../models/announcement.js");


// GET ALL SECTIONS

router.get ('/', async (req, res) => {
    try{
        const sections = await Sections.findOne();
        res.json(sections);
    }catch (err){
        res.status(500).json({ error: err.message });
    }

});





// UPDATE SECTIONS
router.post("/", async (req, res) => {
  try {
    const { sections } = req.body;

    const updated = await Sections.findOneAndUpdate(
      {},                 // find the only document
      { sections },       // update the sections array
      { upsert: true, new: true }
    );

    res.json({
      message: "Sections updated successfully",
      updated
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// DELETE SECTIONS By ID
router.delete("/:id", async (req, res) => {
  try {
    await Sections.deleteOne({ _id: req.params.id });
    res.json({ message: "Sections deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    }
}); 




module.exports = router;
