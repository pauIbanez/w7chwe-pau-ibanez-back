const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { default: helmet } = require("helmet");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());

module.exports = app;
