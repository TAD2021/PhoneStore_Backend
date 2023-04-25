const axios = require("axios");
const Order = require("../models/Order");

const orderController = {
  createOrder: async (req, res) => {
    try {
      const { user, products, name, phone, address } = req.body;
  
      if (!products) {
        return res.status(400).json({ message: "Products are required" });
      }

      let userData ={};

      if(user){
        const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/${user}`);
  
        if (userResponse.status !== 200) {
          return res.status(userResponse.status).json({ message: "Failed to get user data", error: userResponse.data });
        }
        userData = userResponse.data;
      }
      console.log(userData)

      const productsData = []
      for (const product of products) {
        const productResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/${product.id}`);
        if (productResponse.status !== 200) {
          return res.status(productResponse.status).json({ message: "Failed to get product data", error: productResponse.data });
        }
        productResponse.data !==null && product.quantity <= productResponse.data.quantity && productsData.push({...productResponse.data, quantityInOrder: product.quantity})
      }

      const order = new Order({
        userId: userData?._id,
        products: productsData.map((productData)=>({
          id: productData._id,
          name: productData.nameProduct,
          quantity: productData.quantityInOrder,
          price: (productData.price - productData.discount) || productData.price,
          image: productData.image,
        })),
        totalPrice: productsData.reduce((acc, current) => acc + ((current.price - current.discount) || current.price)*current.quantityInOrder,0),
        name: name,
        phone: phone,
        address: address,
        status: "CHỜ XÁC NHẬN"
      });
      console.log("order", order);

      order.save()
  
      return res.status(200).json({ message: "Create new orders", order});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create orders", error });
    }
  },
  
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find();
      if (!orders) {
        return res.status(404).json({ message: "Get all order not found" });
      }
      return res.status(200).json({ message: " Get all order", orders });
    } catch (error) {
      res.status(500).json({ message: "Get all order not found", error });
    }
  },
  getOrderUser: async (req, res) => {
    try {
      const orders = await Order.find({userId: req.params.id});
      if (!orders) {
        return res.status(404).json({ message: "Get order not found" });
      }
      return res.status(200).json({ message: " Get all order", orders });
    } catch (error) {
      res.status(500).json({ message: "Get order not found", error });
    }
  },
  updateOrder: async (req, res) => {
    try {
      const { products, status } = req.body;
      const productsData = []
      for (const product of products) {
        const productResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/${product.id}`);
        if (productResponse.status !== 200) {
          return res.status(productResponse.status).json({ message: "Failed to get product data", error: productResponse.data });
        }
        productResponse.data !==null && product.quantity <= productResponse.data.quantity && productsData.push({...productResponse.data, quantityInOrder: parseInt(product.quantity)})
      }

      console.log(productsData)

      if(status === 'ĐÃ HỦY' || status === 'TRẢ HÀNG/HOÀN TIỀN'){
        for (const product of productsData) {
          await axios.put(`${process.env.PRODUCT_SERVICE_URL}/${product._id}`, {quantity: product.quantity + product.quantityInOrder});
        }
      }else if(status === 'ĐÃ XÁC NHẬN'){
        for (const product of productsData) {
          await axios.put(`${process.env.PRODUCT_SERVICE_URL}/${product._id}`, {quantity: product.quantity - product.quantityInOrder});
        }
      }

      const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      return res.status(200).json({message: "successfully", order});
    } catch (error) {
      res.status(500).json({ message: "Order not found", error });
    }
  },
  deleteOrder: async (req, res) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: "Delete a order successfully" });
    } catch (error) {
      res.status(500).json({ message: "Delete a order not found" });
    }
  },
};

module.exports = orderController;
