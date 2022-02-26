const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes } = require("firebase/storage");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const User = require("../../database/models/User");

const secret = process.env.TOKEN_SECRET;

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "redsocial-d7b8b.firebaseapp.com",
  projectId: "redsocial-d7b8b",
  storageBucket: "redsocial-d7b8b.appspot.com",
  messagingSenderId: "778147784801",
  appId: "1:778147784801:web:8ea849e736d1dedd172220",
};

const fireBaseApp = initializeApp(firebaseConfig);

const userRegister = async (req, res, next) => {
  const { name, lastName, username, password } = req.body;
  const avatar = req.file;

  const storage = getStorage(fireBaseApp);
  const avatarRef = ref(storage, avatar.path);

  const runErrors = (error) => {
    fs.unlink(path.join("public/profiles", avatar.filename), () => {
      next(error);
    });
  };

  if (!name || !lastName || !username || !password || !avatar) {
    const error = {
      code: 400,
      message: "Missing user data",
    };
    runErrors(error);
    return;
  }

  const userExists = await User.findOne({ username });

  if (userExists) {
    const error = {
      code: 409,
      message: "Username already taken",
    };
    runErrors(error);
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // await uploadBytes(avatarRef, "bla", {
    //   contentType: avatar.mimetype,
    // });

    await User.create({
      name,
      lastName,
      username,
      password: hashedPassword,
      avatar: avatar.filename,
    });

    res.status(201).json({});
  } catch (error) {
    const newError = { ...error };
    newError.message =
      "There was an issue creating your user, please try again later";
    runErrors(newError);
  }
};

const loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const error = {
      code: 400,
      message: "User data not provided",
    };
    next(error);
    return;
  }

  const userExists = await User.findOne({ username });

  const error = {
    message: "Invalid username or password",
    code: 401,
  };

  if (!userExists) {
    next(error);
    return;
  }

  const validPassword = await bcrypt.compare(password, userExists.password);

  if (!validPassword) {
    next(error);
    return;
  }

  // eslint-disable-next-line no-underscore-dangle
  const token = jwt.sign({ username, id: userExists.id }, secret);

  res.json({ token });
};

module.exports = { userRegister, loginUser };
