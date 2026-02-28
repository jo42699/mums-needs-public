const express = require("express");
const Product = require("../models/products.js");
const upload = require('../middleware/upload.js'); 
const cloudinary = require("../config/clouddinary.js"); 
const router = express.Router();

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });

//  GET ALL PRODUCTS 
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  GET PRODUCT BY ID 
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid product ID" });
  }
});

//  CREATE PRODUCT 
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
        stockBySize: data.stockBySize || {},
        variants: data.variants || []
      };

      // Upload main image
      if (req.files.image?.[0]) {
        const result = await uploadToCloudinary(req.files.image[0].buffer, "products");
        productData.image = {
          url: result.secure_url,
          public_id: result.public_id,
          alt: data.image?.alt || data.name
        };
      }

      // Upload variant images
      if (req.files.variantImages?.length) {
        for (let i = 0; i < req.files.variantImages.length; i++) {
          const result = await uploadToCloudinary(req.files.variantImages[i].buffer, "products/variants");
          if (productData.variants[i]) {
            productData.variants[i].Variantimage = {
              url: result.secure_url,
              public_id: result.public_id,
              alt: productData.variants[i].variantName
            };
          }
        }
      }

      const product = await Product.create(productData);
      res.status(201).json(product);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

//  ADD VARIANT 
router.post(
  "/:id/variants",
  upload.single("variantImage"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      let imageData = {};
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, "products/variants");
        imageData = { url: result.secure_url, public_id: result.public_id };
      }

      const variant = {
        variantName: req.body.variantName,
        Variantimage: imageData,
        VariantStockBySize: req.body.VariantStockBySize || {}
      };

      product.variants.push(variant);
      await product.save();

      res.status(201).json(product.variants.at(-1));

    } catch (error) {
      console.error("VARIANT UPLOAD ERROR:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

//  GET VARIANT BY ID 
router.get("/:id/variants/:variantId", async (req, res) => {
  try {
    const product = await Product.findOne(
      { _id: req.params.id, "variants._id": req.params.variantId },
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

//  DELETE VARIANT 
router.delete("/:id/variants/:variantId", async (req, res) => {
  try {
    const result = await Product.updateOne(
      { _id: req.params.id },
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

//  DELETE PRODUCT BY ID 
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid product ID" });
  }
});

module.exports = router;