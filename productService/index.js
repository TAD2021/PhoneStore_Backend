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
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  credentials: true,
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(morgan("common"));

///ROUTES
app.use("/", productRouter);

app.listen(4000, () => {
  console.log("Server productService is running...");
});
