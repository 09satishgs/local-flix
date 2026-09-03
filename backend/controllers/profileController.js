const {
  config,
  getEnvPasskey,
  getAvailableDrives,
  getAdminBypassToken,
} = require("../config/security");

function getProfiles(req, res) {
  const profilesList = config.profiles.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    hasPin: !!p.pin,
    isAdmin: !!p.isAdmin,
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
  res.json({ token, id: profile.id, name: profile.name, isAdmin: !!profile.isAdmin });
}

function getMe(req, res) {
  res.json({
    id: req.profile.id,
    name: req.profile.name,
    allowedPaths: req.profile.allowedPaths || [],
    isAdmin: !!req.profile.isAdmin,
    isAdminBypass: !!req.profile.isAdminBypass,
  });
}

function unlockAdminBypass(req, res) {
  if (!req.profile.isAdmin) {
    return res.status(403).json({ error: "Unauthorized: Profile is not an admin" });
  }

  const { passkey } = req.body;
  const expectedPasskey = getEnvPasskey();

  if (!passkey || passkey !== expectedPasskey) {
    return res.status(401).json({ error: "Invalid admin passkey" });
  }

  const token = getAdminBypassToken(req.profile.id);
  const drives = getAvailableDrives();

  res.json({
    success: true,
    token,
    drives,
  });
}

module.exports = {
  getProfiles,
  loginProfile,
  getMe,
  unlockAdminBypass,
};
