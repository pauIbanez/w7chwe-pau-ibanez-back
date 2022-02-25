const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../database/models/User");

const secret = process.env.TOKEN_SECRET;

const userRegister = async (req, res, next) => {
  const { name, lastName, username, password } = req.body;

  if (!name || !lastName || !username || !password) {
    const error = {
      code: 400,
      message: "Missing user data",
    };
    next(error);
    return;
  }

  const userExists = await User.findOne({ username });

  if (userExists) {
    const error = {
      code: 409,
      message: "Username already taken",
    };
    next(error);
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
    });

    req.user = {
      username,
      password,
      id,
    };

    next();
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  let user;
  let code = 200;
  if (req.user) {
    user = req.user;
    code = 201;
  } else {
    const { username, password } = req.body;
    if (!username || !password) {
      const error = {
        code: 400,
        message: "User data not provided",
      };
      next(error);
      return;
    }
    user = {
      username,
      password,
    };
  }

  const userExists = await User.findOne({ username: user.username });

  const error = {
    message: "Invalid username or password",
    code: 401,
  };

  if (!userExists) {
    next(error);
    return;
  }

  const validPassword = await bcrypt.compare(
    user.password,
    userExists.password
  );

  if (!validPassword) {
    next(error);
    return;
  }

  // eslint-disable-next-line no-underscore-dangle
  const token = jwt.sign(
    { username: user.username, id: userExists.id },
    secret
  );

  res.status(code).json({ token });
};

module.exports = { userRegister, loginUser };
