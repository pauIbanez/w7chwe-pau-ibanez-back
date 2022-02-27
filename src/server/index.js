const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { default: helmet } = require("helmet");
const { notFoundError, errorHandler } = require("./middlewares/errorHandlers");
const usersRouter = require("./routers/usersRouter");
const profilesRouter = require("./routers/profileRouter");
const auth = require("./middlewares/auth");

const app = express();

app.use(express.static("public"));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/users", usersRouter);
app.use("/profiles", auth, profilesRouter);

app.use(notFoundError);
app.use(errorHandler);

module.exports = app;
