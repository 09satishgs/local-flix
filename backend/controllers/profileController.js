const { config } = require("../config/security");

function getProfiles(req, res) {
  const profilesList = config.profiles.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    hasPin: !!p.pin,
  }));
  res.json(profilesList);
}

function loginProfile(req, res) {
  const { profileId, pin } = req.body;
  const profile = config.profiles.find((p) => p.id === profileId);
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  // Pin authentication
  if (profile.pin && profile.pin !== pin) {
    return res.status(400).json({ error: "Invalid PIN" });
  }

  const token = Buffer.from(`${profileId}:${profile.pin || ""}`).toString("base64");
  res.json({ token, id: profile.id, name: profile.name });
}

function getMe(req, res) {
  res.json({
    id: req.profile.id,
    name: req.profile.name,
    allowedPaths: req.profile.allowedPaths || [],
  });
}

module.exports = {
  getProfiles,
  loginProfile,
  getMe,
};
