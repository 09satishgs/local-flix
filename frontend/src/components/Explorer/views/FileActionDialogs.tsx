import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
  IconButton,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
  DeleteOutline,
  DriveFileRenameOutline,
  DriveFileMove,
  Folder,
  ArrowBack,
  WarningAmber,
} from "@mui/icons-material";
import { api } from "../../../api";
import type { ExplorerItem } from "../../../api";

const dialogPaperSx: SxProps<Theme> = {
  bgcolor: "var(--bg-card)",
  color: "#fff",
  border: "1px solid #333",
  borderRadius: 3,
  p: 1,
  maxWidth: 480,
  width: "92vw",
};

const deleteDialogPaperSx: SxProps<Theme> = {
  ...dialogPaperSx,
  border: "2px solid rgba(229, 9, 20, 0.6)",
};

const moveDialogPaperSx: SxProps<Theme> = {
  ...dialogPaperSx,
  maxWidth: 580,
};

// ==========================================
// 1. DELETE CONFIRMATION DIALOG
// ==========================================
interface DeleteConfirmDialogProps {
  open: boolean;
  item?: ExplorerItem | null;
  items?: ExplorerItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  item,
  items,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetItems = items && items.length > 0 ? items : item ? [item] : [];

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
    }
  }, [open]);

  if (targetItems.length === 0) return null;

  const isBulk = targetItems.length > 1;
  const singleItem = targetItems[0];
  const allVideos = targetItems.every((it) => !it.isDirectory);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isBulk) {
        await api.deleteItems(targetItems.map((it) => it.path));
      } else {
        await api.deleteItem(singleItem.path);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete item(s)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: deleteDialogPaperSx }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "var(--localflix-red)", fontWeight: 700 }}>
        <DeleteOutline fontSize="large" />
        {isBulk
          ? `Delete ${targetItems.length} ${allVideos ? "Videos" : "Items"}`
          : `Delete ${singleItem.isDirectory ? "Folder" : "Video"}`}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body1" sx={{ color: "#fff" }}>
          {isBulk ? (
            <>
              Are you sure you want to permanently delete these{" "}
              <strong>{targetItems.length} items</strong>?
            </>
          ) : (
            <>
              Are you sure you want to permanently delete <strong>"{singleItem.name}"</strong>?
            </>
          )}
        </Typography>

        {isBulk && (
          <Box
            sx={{
              maxHeight: 140,
              overflowY: "auto",
              bgcolor: "#181818",
              p: 1.5,
              borderRadius: 1.5,
              border: "1px solid #333",
            }}
          >
            {targetItems.map((it, idx) => (
              <Typography
                key={idx}
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  py: 0.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                • {it.name}
              </Typography>
            ))}
          </Box>
        )}

        <Alert severity="warning" icon={<WarningAmber />} sx={{ bgcolor: "rgba(255, 170, 0, 0.15)", color: "#ffaa00" }}>
          {isBulk
            ? `This will permanently remove all ${targetItems.length} selected items from your storage disk. This action cannot be undone.`
            : `This will permanently remove the ${singleItem.isDirectory ? "folder and all its contents" : "video file"} from your storage disk. This action cannot be undone.`}
        </Alert>

        {error && (
          <Alert severity="error" sx={{ bgcolor: "rgba(211, 47, 47, 0.2)", color: "#ff8080" }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: "var(--text-secondary)" }}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={loading}
          variant="contained"
          sx={{
            bgcolor: "var(--localflix-red)",
            color: "#fff",
            fontWeight: 700,
            "&:hover": { bgcolor: "var(--localflix-dark-red)" },
          }}
        >
          {loading ? (
            <CircularProgress size={22} sx={{ color: "#fff" }} />
          ) : isBulk ? (
            `Permanently Delete (${targetItems.length})`
          ) : (
            "Permanently Delete"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ==========================================
// 2. RENAME DIALOG
// ==========================================
interface RenameDialogProps {
  open: boolean;
  item: ExplorerItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
  open,
  item,
  onClose,
  onSuccess,
}) => {
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && item) {
      setNewName(item.name);
      setError(null);
      setLoading(false);
    }
  }, [open, item]);

  if (!item) return null;

  const handleRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    if (/[\\/:*?"<>|]/.test(trimmed)) {
      setError('Name cannot contain: \\ / : * ? " < > |');
      return;
    }
    if (trimmed === item.name) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.renameItem(item.path, trimmed);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to rename item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: dialogPaperSx }}>
      <form onSubmit={handleRename}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#fff", fontWeight: 700 }}>
          <DriveFileRenameOutline sx={{ color: "var(--localflix-red)", fontSize: 30 }} />
          Rename {item.isDirectory ? "Folder" : "Video"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)" }}>
            Enter a new name for <strong>{item.name}</strong>:
          </Typography>

          {error && (
            <Alert severity="error" sx={{ bgcolor: "rgba(211, 47, 47, 0.2)", color: "#ff8080" }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={loading}
            placeholder="New name..."
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#222",
                color: "#fff",
                "& fieldset": { borderColor: "#444" },
                "&:hover fieldset": { borderColor: "var(--localflix-red)" },
                "&.Mui-focused fieldset": { borderColor: "var(--localflix-red)" },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={loading} sx={{ color: "var(--text-secondary)" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !newName.trim()}
            variant="contained"
            sx={{
              bgcolor: "var(--localflix-red)",
              color: "#fff",
              fontWeight: 700,
              "&:hover": { bgcolor: "var(--localflix-dark-red)" },
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Rename"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// ==========================================
// 3. MOVE DIALOG (FOLDER BROWSER)
// ==========================================
interface MoveDialogProps {
  open: boolean;
  item?: ExplorerItem | null;
  items?: ExplorerItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export const MoveDialog: React.FC<MoveDialogProps> = ({
  open,
  item,
  items,
  onClose,
  onSuccess,
}) => {
  const [currentNavPath, setCurrentNavPath] = useState("");
  const [folders, setFolders] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetItems = items && items.length > 0 ? items : item ? [item] : [];

  // Extract initial parent directory of the first item
  const itemParentDir = targetItems.length > 0
    ? targetItems[0].path.replace(/\\/g, "/").split("/").slice(0, -1).join("/")
    : "";

  const loadFolders = useCallback(async (pathQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getFolders(pathQuery);
      setCurrentNavPath(res.currentPath);
      setFolders(res.folders || []);
    } catch (err: any) {
      setError(err.message || "Failed to list folders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && targetItems.length > 0) {
      setError(null);
      setMoving(false);
      // Start at root level
      loadFolders("");
    }
  }, [open, targetItems.length, loadFolders]);

  if (targetItems.length === 0) return null;

  const isBulk = targetItems.length > 1;
  const singleItem = targetItems[0];
  const allVideos = targetItems.every((it) => !it.isDirectory);

  const handleNavigateUp = () => {
    if (!currentNavPath) return;
    const normalized = currentNavPath.replace(/\\/g, "/");
    const segments = normalized.split("/").filter(Boolean);
    if (segments.length <= 1) {
      loadFolders("");
    } else {
      const parent = segments.slice(0, -1).join("/");
      loadFolders(parent);
    }
  };

  const handleMove = async () => {
    if (!currentNavPath) {
      setError("Please select a specific destination folder");
      return;
    }

    const normTarget = currentNavPath.replace(/\\/g, "/").toLowerCase();
    const normParent = itemParentDir.toLowerCase();

    if (normTarget === normParent) {
      setError("Destination is the same as the current folder");
      return;
    }

    if (!isBulk) {
      const normItem = singleItem.path.replace(/\\/g, "/").toLowerCase();
      if (normTarget === normItem) {
        setError("Cannot move a folder into itself");
        return;
      }
    }

    setMoving(true);
    setError(null);
    try {
      if (isBulk) {
        await api.moveItems(targetItems.map((it) => it.path), currentNavPath);
      } else {
        await api.moveItem(singleItem.path, currentNavPath);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to move item(s)");
    } finally {
      setMoving(false);
    }
  };

  // Build breadcrumbs for navigation
  const breadcrumbSegments = currentNavPath
    ? currentNavPath.replace(/\\/g, "/").split("/").filter(Boolean)
    : [];

  const isCurrentSameAsParent =
    Boolean(currentNavPath) &&
    currentNavPath.replace(/\\/g, "/").toLowerCase() === itemParentDir.toLowerCase();

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: moveDialogPaperSx }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "#fff", fontWeight: 700 }}>
        <DriveFileMove sx={{ color: "var(--localflix-red)", fontSize: 30 }} />
        {isBulk
          ? `Move ${targetItems.length} ${allVideos ? "Videos" : "Items"}`
          : `Move "${singleItem.name}"`}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, minHeight: 340 }}>
        {/* Breadcrumb path navigation */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#1b1b1b", p: 1, borderRadius: 1.5, border: "1px solid #333" }}>
          <IconButton
            size="small"
            disabled={!currentNavPath || loading || moving}
            onClick={handleNavigateUp}
            sx={{ color: "var(--text-secondary)", "&:hover": { color: "#fff" } }}
          >
            <ArrowBack fontSize="small" />
          </IconButton>
          <Breadcrumbs maxItems={4} sx={{ color: "#fff", fontSize: "0.85rem", overflow: "hidden" }}>
            <Link
              underline="hover"
              color={!currentNavPath ? "var(--localflix-red)" : "inherit"}
              sx={{ cursor: "pointer", fontWeight: !currentNavPath ? 700 : 500 }}
              onClick={() => loadFolders("")}
            >
              Root
            </Link>
            {breadcrumbSegments.map((seg, idx) => {
              const segPath = breadcrumbSegments.slice(0, idx + 1).join("/");
              const isLast = idx === breadcrumbSegments.length - 1;
              return (
                <Link
                  key={idx}
                  underline="hover"
                  color={isLast ? "var(--localflix-red)" : "inherit"}
                  sx={{ cursor: "pointer", fontWeight: isLast ? 700 : 500 }}
                  onClick={() => loadFolders(segPath)}
                >
                  {seg}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ bgcolor: "rgba(211, 47, 47, 0.2)", color: "#ff8080" }}>
            {error}
          </Alert>
        )}

        {isBulk && (
          <Box
            sx={{
              maxHeight: 100,
              overflowY: "auto",
              bgcolor: "#181818",
              p: 1,
              borderRadius: 1.5,
              border: "1px solid #333",
            }}
          >
            <Typography variant="caption" sx={{ color: "var(--text-secondary)", display: "block", mb: 0.5 }}>
              Moving {targetItems.length} items:
            </Typography>
            {targetItems.map((it, idx) => (
              <Typography
                key={idx}
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                • {it.name}
              </Typography>
            ))}
          </Box>
        )}

        {/* Folders List */}
        <Box
          sx={{
            flexGrow: 1,
            maxHeight: 220,
            overflowY: "auto",
            bgcolor: "#161616",
            borderRadius: 2,
            border: "1px solid #282828",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 160 }}>
              <CircularProgress size={30} sx={{ color: "var(--localflix-red)" }} />
            </Box>
          ) : folders.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 160, color: "var(--text-secondary)" }}>
              <Typography variant="body2">No subfolders found in this directory</Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {folders.map((f, i) => (
                <ListItemButton
                  key={i}
                  onClick={() => loadFolders(f.path)}
                  sx={{
                    py: 1,
                    px: 2,
                    borderBottom: "1px solid #222",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "var(--localflix-red)" }}>
                    <Folder />
                  </ListItemIcon>
                  <ListItemText
                    primary={f.name}
                    primaryTypographyProps={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        {/* Selected Destination Summary */}
        <Typography variant="caption" sx={{ color: "var(--text-secondary)" }}>
          Destination:{" "}
          <strong style={{ color: "#fff" }}>
            {currentNavPath || "Root (Select a destination folder above)"}
          </strong>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={moving} sx={{ color: "var(--text-secondary)" }}>
          Cancel
        </Button>
        <Button
          onClick={handleMove}
          disabled={moving || !currentNavPath || isCurrentSameAsParent}
          variant="contained"
          sx={{
            bgcolor: "var(--localflix-red)",
            color: "#fff",
            fontWeight: 700,
            "&:hover": { bgcolor: "var(--localflix-dark-red)" },
            "&.Mui-disabled": { bgcolor: "#333", color: "#666" },
          }}
        >
          {moving ? (
            <CircularProgress size={22} sx={{ color: "#fff" }} />
          ) : isBulk ? (
            `Move ${targetItems.length} Items Here`
          ) : (
            "Move Here"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
