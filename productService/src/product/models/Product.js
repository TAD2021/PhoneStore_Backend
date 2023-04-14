const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    nameProduct: {
      type: String,
      require: true,
      unique: true,
    },
    description: String,
    price: {
      type: Number,
      require: true
    },
    quantity: {
      type: Number,
      require: true
    },
    ram: {
      type: String,
      require: true,
    },
    chipset: {
      type: String,
      require: true,
    },
    pin: {
      type: String,
      require: true,
    },
    os: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    memory: {
      type: String,
      require: true,
    },
    screen: {
      type: String,
      require: true,
    },
    color: {
      type: String,
      require: true,
    },
    discount: {
      type: Number,
    },
    trademark: {
      type: String,
    },
    screenTech: {
      type: String,
    },
    frontCamera: {
      type: String,
    },
    backCamera: {
      type: String,
    },
    sim: {
      type: String,
    },
    screenResolution: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
