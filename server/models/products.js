const mongoose = require("mongoose");

//
// VARIANT SCHEMA
//
const variantSchema = new mongoose.Schema(
  {
    variantName: {
      type: String,
      required: true,
      trim: true
    },

    Variantimage: {
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        trim: true
      }
    },

    // Stock per size for this variant
    VariantStockBySize: {
      type: Map,
      of: Number,
      required: true
    }
  },
  { _id: true }
);


//
// PRODUCT SCHEMA
//
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String,
        trim: true
      }
    },

    description: {
      type: String,
      required: true
    },

    keywords: {
      type: [String],
      index: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    section: {
      type: String,
      required: true,
      trim: true
    },

    // Stock per size for the main product
    stockBySize: {
      type: Map,
      of: Number,
      required: true
    },

    // Product variants
    variants: {
      type: [variantSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);
