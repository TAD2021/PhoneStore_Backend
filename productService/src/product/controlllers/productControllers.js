const Product = require("../models/Product");

const productController = {
  createProduct: async (req, res) => {
    try {
      const newProduct = await new Product({
        nameProduct: req.body.nameProduct,
        description: req.body.description,
        price: req.body.price,
        quantity: req.body.quantity,
        ram: req.body.ram,
        chipset: req.body.chipset,
        pin: req.body.pin,
        os: req.body.os,
        image: req.body.image,
        memory: req.body.memory,
        screen: req.body.screen,
        color: req.body.color,
        discount: req.body.discount,
        trademark: req.body.trademark,
        screenTech: req.body.screenTech,
        frontCamera: req.body.frontCamera,
        backCamera: req.body.backCamera,
        sim: req.body.sim,
        screenResolution: req.body.screenResolution,
      })
      const product = await newProduct.save();
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: "Create product not found"});
    }
  },
  getAllProduct: async (req, res) => {
    try {
      const searchQuery = req.query.q;
      let product;
  
      if (searchQuery) {
        const regex = new RegExp(`.*${searchQuery}.*`, "i");
        product = await Product.find({
          $or: [
            { nameProduct: regex },
            { description: regex },
            { trademark: regex }
          ]
        });
      } else {
        product = await Product.find();
      }
  
      if (product.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
  
      return res.status(200).json(product);
  
    } catch (error) {
      res.status(500).json({ message: "Error occurred" });
    }
  },
  getAProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      return res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: "Get a product not found" });
    }
  },
  updateProduct: async (req, res) => {
    console.log(req.params.id)
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      return res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: "Update a product not found" });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: "Delete a  successfully" });
    } catch (error) {
      res.status(500).json({ message: "Delete a product not found" });
    }
  }
};

module.exports = productController;
