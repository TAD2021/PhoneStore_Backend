const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const proxy = require('express-http-proxy')
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors({credentials: true, origin: process.env.FRONTEND_URL}));
app.use(morgan("common"));

///ROUTES
app.use('/user',proxy(process.env.USER_SERVICE_URL))
app.use('/product',proxy(process.env.PRODUCT_SERVICE_URL))
app.use('/rating',proxy(process.env.RATING_SERVICE_URL))
app.use('/order',proxy(process.env.ORDER_SERVICE_URL))

app.listen(8001, () => {
  console.log("API gateway is running...");
});