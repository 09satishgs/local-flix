import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

interface DebugMessage {
  id: number;
  text: string;
  count: number;
}

const toastContainerSx: SxProps<Theme> = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 99999,
  pointerEvents: "none",
  display: "flex",
  flexDirection: "column",
  gap: 1,
  maxWidth: "90vw",
  width: 440,
};

const toastCardSx: SxProps<Theme> = {
  bgcolor: "rgba(10, 10, 15, 0.94)",
  border: "2px solid #ffcc00",
  borderRadius: 2,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 204, 0, 0.4)",
  p: 1.5,
  color: "#fff",
  backdropFilter: "blur(8px)",
  animation: "debugFadeIn 0.15s ease-out",
  "@keyframes debugFadeIn": {
    from: { opacity: 0, transform: "translateY(-10px) scale(0.95)" },
    to: { opacity: 1, transform: "translateY(0) scale(1)" },
  },
};

const headerSx: SxProps<Theme> = {
  color: "#ffcc00",
  fontWeight: 900,
  fontSize: "0.85rem",
  fontFamily: "monospace",
  letterSpacing: 1.5,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mb: 0.5,
};

const messageTextSx: SxProps<Theme> = {
  color: "#39ff14",
  fontFamily: "Consolas, 'Courier New', monospace",
  fontSize: "0.85rem",
  wordBreak: "break-all",
  lineHeight: 1.4,
  fontWeight: 600,
};

const counterBadgeSx: SxProps<Theme> = {
  bgcolor: "rgba(255, 204, 0, 0.2)",
  color: "#ffcc00",
  px: 0.8,
  py: 0.2,
  borderRadius: 1,
  fontSize: "0.75rem",
  fontWeight: 700,
};

export const DebugToast: React.FC = () => {
  const [messages, setMessages] = useState<DebugMessage[]>([]);
  const clearTimerRef = useRef<any>(null);

  useEffect(() => {
    const handleDebugEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      const newText = customEvent.detail?.message || "";
      if (!newText) return;

      setMessages((prev) => {
        const last = prev[0];
        if (last && last.text === newText) {
          return [{ ...last, count: last.count + 1 }, ...prev.slice(1)];
        }
        return [{ id: Date.now(), text: newText, count: 1 }, ...prev.slice(0, 2)];
      });

      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => {
        setMessages([]);
      }, 4000);
    };

    window.addEventListener("localflix-debug-log", handleDebugEvent);
    return () => {
      window.removeEventListener("localflix-debug-log", handleDebugEvent);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  if (messages.length === 0) return null;

  return (
    <Box sx={toastContainerSx}>
      {messages.map((msg) => (
        <Box key={msg.id} sx={toastCardSx}>
          <Box sx={headerSx}>
            <Typography component="span" sx={{ fontWeight: 900, fontFamily: "monospace", fontSize: "0.85rem" }}>
              [DEBUGGING]
            </Typography>
            {msg.count > 1 && (
              <Box sx={counterBadgeSx}>x{msg.count}</Box>
            )}
          </Box>
          <Typography sx={messageTextSx}>{msg.text}</Typography>
        </Box>
      ))}
    </Box>
  );
};
