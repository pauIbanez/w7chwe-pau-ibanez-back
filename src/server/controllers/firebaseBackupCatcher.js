const { getStorage, ref, getBytes } = require("firebase/storage");
const fs = require("fs");
const path = require("path");
const User = require("../../database/models/User");

const firebaseBackupCatcher = async (req, res, next) => {
  const { avatar } = req.params;
  const user = await User.findOne({ avatar });

  if (!user) {
    const error = {
      message: "Not found",
      code: 404,
    };
    next(error);
    return;
  }

  const storage = getStorage();
  const avatarRef = ref(storage, user.firebaseBackup);

  const avatarData = await getBytes(avatarRef);
  const avatarBuffer = Buffer.from(avatarData);
  fs.appendFile(`public/avatars/${user.avatar}`, avatarBuffer, (error) => {
    if (error) {
      const newError = {
        message: "Not found",
        code: 404,
      };
      next(newError);
      return;
    }
    const route = path.join(__dirname, "../../../public/avatars/", user.avatar);
    res.sendFile(route);
  });
};

module.exports = firebaseBackupCatcher;
