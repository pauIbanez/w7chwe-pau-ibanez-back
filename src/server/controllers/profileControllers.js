const User = require("../../database/models/User");

const listProfiles = async (req, res, next) => {
  try {
    const profiles = await User.find();
    const profilesToShare = profiles.map((profile) => {
      const newProfile = {
        name: profile.name,
        lastName: profile.lastName,
        username: profile.username,
        friends: profile.friends.length,
      };
      return newProfile;
    });

    res.json({ profiles: profilesToShare });
  } catch (error) {
    const newError = { ...error };
    newError.message = "There was an error while getting the user profiles";
    next(newError);
  }
};

const getProfile = async (req, res, next) => {
  const { id } = req.params;

  const friends = await User.findById(id).populate();
};

const updateProfile = (req, res, next) => {};

module.exports = { listProfiles, getProfile, updateProfile };
