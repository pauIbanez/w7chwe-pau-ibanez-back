const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const User = require("../../database/models/User");

const secret = process.env.TOKEN_SECRET;

const userRegister = async (req, res, next) => {
  const { name, lastName, username, password } = req.body;
  const avatar = req.file;

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

    const { id } = await User.create({
      name,
      lastName,
      username,
      password: hashedPassword,
      avatar: avatar.filename,
    });

    req.user = {
      username,
      password,
      id,
    };

    res.status(201).json({});
  } catch (error) {
    runErrors(error);
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
