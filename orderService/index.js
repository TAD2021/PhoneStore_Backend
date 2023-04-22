const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const orderRouter = require("./src/order/routes/order");

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
app.use(cors({credentials: true, origin: process.env.FRONTEND_URL}));
app.use(morgan("common"));

///ROUTES
app.use("/", orderRouter);

app.listen(5000, () => {
  console.log("Server orderService is running...");
});
