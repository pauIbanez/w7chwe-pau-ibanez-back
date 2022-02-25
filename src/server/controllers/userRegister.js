const bcrypt = require("bcrypt");
const User = require("../../database/models/User");

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

    res.json({ id });
  } catch (error) {
    next(error);
  }
};

module.exports = { userRegister };
