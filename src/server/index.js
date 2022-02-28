const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { default: helmet } = require("helmet");
const { initializeApp } = require("firebase/app");
const { notFoundError, errorHandler } = require("./middlewares/errorHandlers");
const usersRouter = require("./routers/usersRouter");
const profilesRouter = require("./routers/profileRouter");
const auth = require("./middlewares/auth");
const firebaseBackupCatcher = require("./controllers/firebaseBackupCatcher");

const app = express();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "redsocial-d7b8b.firebaseapp.com",
  projectId: "redsocial-d7b8b",
  storageBucket: "redsocial-d7b8b.appspot.com",
  messagingSenderId: "778147784801",
  appId: "1:778147784801:web:8ea849e736d1dedd172220",
};

const fireBaseApp = initializeApp(firebaseConfig);

app.use(express.static("public"));
app.get("/avatars/:avatar", firebaseBackupCatcher);
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/users", usersRouter);
app.use("/profiles", auth, profilesRouter);

app.use(notFoundError);
app.use(errorHandler);

module.exports = { app, fireBaseApp };
