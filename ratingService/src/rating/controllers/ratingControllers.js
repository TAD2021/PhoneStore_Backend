const axios = require("axios");
const Rating = require("../models/Rating");

const ratingController = {
  createRating: async (req, res) => {
    try {
      const { userId, productId, username, comment, rating } = req.body;

      const oldRating = await Rating.find({userId, productId});
      if (oldRating.length > 0) {
        return res.status(208).json({ message: "User has rating this product", oldRating });
      }

      if (!userId || !productId) {
        return res.status(400).json({ message: "User and products are required" });
      }

      const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/${userId}`);
      if (userResponse.status !== 200) {
        return res.status(userResponse.status).json({ message: "Failed to get user data", error: userResponse.data });
      }
      const userData = userResponse.data;

      const productResponse = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/${productId}`);
      if (productResponse.status !== 200) {
        return res.status(productResponse.status).json({ message: "Failed to get product data", error: productResponse.data });
      }
      const productData = productResponse.data;

      const today = new Date();
      const date = today.getDate() +  '/' + (today.getMonth()+1) + '/' + today.getFullYear();
      let time;
      if(today.getHours() < 10 && today.getMinutes() < 10){
        time = "0" + today.getHours() + ": 0" + today.getMinutes();
      }else if(today.getHours() < 10){
        time = "0" + today.getHours() + ":" + today.getMinutes();
      }else if(today.getMinutes() < 10){
        time = today.getHours() + ": 0" + today.getMinutes();
      }else{
        time = today.getHours() + ":" + today.getMinutes();
      }

      const ratingComment = new Rating({
        userId: userData._id,
        productId: productData._id,
        username,
        comment,
        rating,
        date, 
        time
      });

      ratingComment.save()
  
      return res.status(200).json({ message: "Create new ratingComment", ratingComment});
    } catch (error) {
      res.status(500).json({ message: "Create rating error", error });
    }
  },
  getRatingByProduct: async (req, res) => {
    try {
      const rating = await Rating.find({productId: req.params.id});
      if (!rating) {
        return res.status(404).json({ message: "Get rating not found" });
      }
      return res.status(200).json({ message: " Get rating successfully", rating });
    } catch (error) {
      res.status(500).json({ message: "Get rating not found", error });
    }
  },
  getAllRating: async (req, res) => {
    try {
      const rating = await Rating.find();
      if (rating.length === 0) {
        return res.status(404).json({ message: "No rating found" });
      }
      return res.status(200).json({ message: " Get all rating successfully", rating });
    } catch (error) {
      res.status(500).json({ message: "Error occurred", error });
    }
  }
};

module.exports = ratingController;
