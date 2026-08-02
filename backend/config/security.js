const path = require("path");
const fs = require("fs");

const configPath = path.join(__dirname, "..", "config.json");
let config = { profiles: [] };
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (err) {
  console.error("Error loading config.json:", err);
}

// Helper to check path boundaries
function isPathAllowed(requestedPath, allowedPaths) {
  try {
    const resolvedRequested = path.resolve(requestedPath);
    return allowedPaths.some((allowed) => {
      const resolvedAllowed = path.resolve(allowed);
      if (resolvedRequested === resolvedAllowed) return true;
      const relative = path.relative(resolvedAllowed, resolvedRequested);
      return (
        relative && !relative.startsWith("..") && !path.isAbsolute(relative)
      );
    });
  } catch (err) {
    return false;
  }
}

// Authentication Middleware
function verifyProfile(req, res, next) {
  const profileId = req.headers['x-profile-id'] || req.query.profileId;
  if (!profileId) {
    return res.status(401).json({ error: 'Profile ID required' });
  }

  const profile = config.profiles.find(p => p.id === profileId);
  if (!profile) {
    return res.status(401).json({ error: 'Profile not found' });
  }

  // Verify PIN if set
  if (profile.pin) {
    const token = req.headers['x-profile-token'] || req.query.profileToken;
    const expectedToken = Buffer.from(`${profileId}:${profile.pin}`).toString('base64');
    if (token !== expectedToken) {
      return res.status(403).json({ error: 'PIN verification required' });
    }
  }

  req.profile = profile;
  next();
}

module.exports = {
  config,
  isPathAllowed,
  verifyProfile,
};
