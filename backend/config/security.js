const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const configPath = path.join(__dirname, "..", "config.json");
let config = { profiles: [] };
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (err) {
  console.error("Error loading config.json:", err);
}

// Read ADMIN_BYPASS_PASSKEY from .env
function getEnvPasskey() {
  if (process.env.ADMIN_BYPASS_PASSKEY) {
    return process.env.ADMIN_BYPASS_PASSKEY;
  }
  const envPaths = [
    path.join(__dirname, "..", ".env"),
    path.join(__dirname, "..", "..", ".env"),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...valParts] = trimmed.split("=");
          if (key && key.trim() === "ADMIN_BYPASS_PASSKEY") {
            return valParts.join("=").trim().replace(/^["']|["']$/g, "");
          }
        }
      }
    }
  }
  return "admin123";
}

// Detect all available system drives
function getAvailableDrives() {
  const drives = [];
  if (process.platform === "win32") {
    try {
      const output = execSync("wmic logicaldisk get caption", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
      const lines = output.split(/[\r\n]+/).map(l => l.trim()).filter(l => /^[A-Z]:$/i.test(l));
      for (const line of lines) {
        drives.push(line.toUpperCase() + "\\");
      }
    } catch (e) {
      // Fallback: probe drive letters A-Z
      for (let i = 65; i <= 90; i++) {
        const driveLetter = String.fromCharCode(i) + ":\\";
        try {
          if (fs.existsSync(driveLetter)) {
            drives.push(driveLetter);
          }
        } catch (err) {}
      }
    }
    if (drives.length === 0 && fs.existsSync("C:\\")) {
      drives.push("C:\\");
    }
  } else {
    drives.push("/");
  }
  return drives;
}

// Helper to check path boundaries
function isPathAllowed(requestedPath, allowedPaths) {
  if (!requestedPath || !Array.isArray(allowedPaths)) return false;
  try {
    let resolvedRequested = path.resolve(requestedPath).toLowerCase();
    return allowedPaths.some((allowed) => {
      let resolvedAllowed = path.resolve(allowed).toLowerCase();
      if (resolvedRequested === resolvedAllowed) return true;
      
      // If allowed path is a drive root like 'c:\' or folder
      const sep = path.sep.toLowerCase();
      const prefix = resolvedAllowed.endsWith(sep) ? resolvedAllowed : resolvedAllowed + sep;
      if (resolvedRequested.startsWith(prefix)) return true;

      const relative = path.relative(resolvedAllowed, resolvedRequested);
      return (
        relative && !relative.startsWith("..") && !path.isAbsolute(relative)
      );
    });
  } catch (err) {
    return false;
  }
}

// Helper to generate and verify admin bypass token
function getAdminBypassToken(profileId) {
  const passkey = getEnvPasskey();
  return Buffer.from(`admin_bypass:${profileId}:${passkey}`).toString("base64");
}

function verifyAdminBypassToken(profileId, token) {
  if (!token) return false;
  return String(token).trim() === getAdminBypassToken(profileId);
}

// Authentication Middleware
function verifyProfile(req, res, next) {
  const profileId = req.headers['x-profile-id'] || req.query.profileId;
  if (!profileId) {
    return res.status(401).json({ error: 'Profile ID required' });
  }

  // Reload config dynamically if updated
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (e) {}

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

  // Check for Admin Bypass Token
  const rawBypassToken = req.headers['x-admin-bypass-token'] || req.query.adminBypassToken;
  const bypassToken = rawBypassToken ? String(rawBypassToken).trim() : null;

  if (bypassToken && profile.isAdmin && verifyAdminBypassToken(profile.id, bypassToken)) {
    req.profile = {
      ...profile,
      allowedPaths: getAvailableDrives(),
      isAdminBypass: true,
    };
  } else {
    req.profile = profile;
  }

  next();
}

module.exports = {
  config,
  getEnvPasskey,
  getAvailableDrives,
  getAdminBypassToken,
  verifyAdminBypassToken,
  isPathAllowed,
  verifyProfile,
};
