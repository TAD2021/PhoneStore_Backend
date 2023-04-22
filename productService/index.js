const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const productRouter = require("./src/product/routes/product");

dotenv.config();
///CONNECT DATABASE
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error(error);
  });

const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(morgan("common"));

///ROUTES
app.use("/", productRouter);

app.listen(4000, () => {
  console.log("Server productService is running...");
});
