const express = require("express");
const Product = require("../models/products.js");
const upload = require('../middleware/upload.js');
const router = express.Router();


//   GET ALL PRODUCTS

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//   GET PRODUCT BY ID

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid product ID" });
  }
});



// CREATE PRODUCT
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "variantImages", maxCount: 20 }
  ]),
  async (req, res) => {
    try {
      const data = JSON.parse(req.body.data);

      const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        section: data.section,
        keywords: data.keywords || [],
        discount: data.discount || 0,

        // NEW: stock per size
        stockBySize: data.stockBySize || {},

        // NEW: variants with stock per size
        variants: data.variants || []
      };

      // Main product image
      if (req.files.image && req.files.image[0]) {
        const mainImage = req.files.image[0];
        productData.image = {
          url: `/images/${mainImage.filename}`,
          alt: data.image?.alt || data.name
        };
      }

      // Variant images
      if (req.files.variantImages && productData.variants.length > 0) {
        req.files.variantImages.forEach((file, index) => {
          if (productData.variants[index]) {
            productData.variants[index].Variantimage = {
              url: `/images/${file.filename}`,
              alt: productData.variants[index].variantName
            };
          }
        });
      }

      const product = await Product.create(productData);
      res.status(201).json(product);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// ADD VARIANT TO PRODUCT
router.post("/:id/variants", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = {
      variantName: req.body.variantName,
      Variantimage: req.body.Variantimage, // optional if uploading separately
      VariantStockBySize: req.body.VariantStockBySize || {}
    };

    product.variants.push(variant);
    await product.save();

    res.status(201).json(product.variants.at(-1));

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



//   GET VARIANT BY _id

router.get("/:id/variants/:variantId", async (req, res) => {
  try {
    const product = await Product.findOne(
      { id: req.params.id, "variants._id": req.params.variantId },
      { "variants.$": 1 }
    );

    if (!product || product.variants.length === 0) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.status(200).json(product.variants[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//   DELETE VARIANT

router.delete("/:id/variants/:variantId", async (req, res) => {
  try {
    const result = await Product.updateOne(
      { id: req.params.id },
      { $pull: { variants: { _id: req.params.variantId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.status(200).json({ message: "Variant deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(400).json({ message: "Invalid product ID" });
  }
});












module.exports = router;
