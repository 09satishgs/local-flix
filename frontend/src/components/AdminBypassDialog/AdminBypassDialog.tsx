import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
  AdminPanelSettings,
  Visibility,
  VisibilityOff,
  Key,
} from "@mui/icons-material";
import { api } from "../../api";

interface AdminBypassDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (drives: string[]) => void;
}

const dialogPaperSx: SxProps<Theme> = {
  bgcolor: "#181818",
  color: "#fff",
  border: "2px solid #ffaa00",
  borderRadius: 3,
  p: 1.5,
  maxWidth: 440,
  width: "90vw",
  boxShadow: "0 10px 40px rgba(0,0,0,0.8), 0 0 25px rgba(255, 170, 0, 0.3)",
};

const dialogTitleSx: SxProps<Theme> = {
  color: "#ffaa00",
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  fontSize: "1.25rem",
};

const submitBtnSx: SxProps<Theme> = {
  bgcolor: "#ffaa00",
  color: "#000",
  fontWeight: 700,
  "&:hover, &:focus": {
    bgcolor: "#e69900",
    outline: "none",
  },
  py: 1,
  px: 3,
};

export const AdminBypassDialog: React.FC<AdminBypassDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setPasskey("");
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passkey.trim()) {
      setError("Please enter the admin passkey");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.unlockAdminBypass(passkey);
      handleClose();
      if (onSuccess) {
        onSuccess(res.drives);
      }
    } catch (err: any) {
      setError(err.message || "Failed to unlock admin bypass");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{ sx: dialogPaperSx }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={dialogTitleSx}>
          <AdminPanelSettings sx={{ fontSize: 32, color: "#ffaa00" }} />
          Admin Bypass
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
            Enter the secure admin passkey to temporarily unlock and browse all available system drives.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ bgcolor: "rgba(211, 47, 47, 0.2)", color: "#ff8080" }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            label="Secure Passkey"
            type={showPasskey ? "text" : "password"}
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            disabled={loading}
            placeholder="Enter passkey..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Key sx={{ color: "#ffaa00" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasskey(!showPasskey)}
                    edge="end"
                    sx={{ color: "var(--text-secondary)" }}
                  >
                    {showPasskey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#222",
                color: "#fff",
                "& fieldset": { borderColor: "#444" },
                "&:hover fieldset": { borderColor: "#ffaa00" },
                "&.Mui-focused fieldset": { borderColor: "#ffaa00" },
              },
              "& .MuiInputLabel-root": { color: "var(--text-secondary)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#ffaa00" },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            sx={{ color: "var(--text-secondary)", "&:hover": { color: "#fff" } }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !passkey.trim()}
            sx={submitBtnSx}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#000" }} /> : "Unlock Drives"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
