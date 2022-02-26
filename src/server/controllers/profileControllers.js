const User = require("../../database/models/User");

const listProfiles = async (req, res, next) => {
  try {
    const profiles = await User.find().select("-password");

    res.json({ profiles });
  } catch (error) {
    const newError = { ...error };
    newError.message = "There was an error while getting the user profiles";
    next(newError);
  }
};

const getProfile = async (req, res, next) => {
  const { id } = req.params;
  try {
    const profile = await User.findById(id)
      .select("-password")
      .populate("friends", "-password");

    res.json(profile);
  } catch (error) {
    const newError = { ...error };
    newError.message =
      "There was an error while getting the user profile, please make sure you input a valid ID";
    next(newError);
  }
};

const updateProfile = (req, res, next) => {};

module.exports = { listProfiles, getProfile, updateProfile };
