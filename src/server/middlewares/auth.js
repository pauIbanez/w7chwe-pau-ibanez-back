const jwt = require("jsonwebtoken");

const secret = process.env.TOKEN_SECRET;

const auth = (req, res, next) => {
  const headerAuth = req.header("Authorization");
  if (!headerAuth) {
    const error = new Error("Token missing");
    error.code = 401;
    next(error);
    return;
  }
  const token = headerAuth.replace("Bearer ", "");
  try {
    const { username, id } = jwt.verify(token, secret);
    req.user = {
      username,
      id,
    };
    next();
  } catch (error) {
    const eror = new Error("Invalid token");
    eror.code = 401;
    next(eror);
  }
};

module.exports = auth;
