/**
 * Temporary Debugging Logger & Settings
 * Dispatches a UI toast with heading [DEBUGGING] and the given message when enabled.
 */
export const isDebugToastEnabled = (): boolean => {
  return localStorage.getItem("debugToastEnabled") === "true";
};

export const setDebugToastEnabled = (enabled: boolean) => {
  localStorage.setItem("debugToastEnabled", enabled ? "true" : "false");
  window.dispatchEvent(
    new CustomEvent("localflix-debug-toggle", { detail: { enabled } })
  );
};

export const logDebug = (message: string) => {
  if (!isDebugToastEnabled()) return;
  window.dispatchEvent(
    new CustomEvent("localflix-debug-log", {
      detail: {
        message: String(message),
        timestamp: Date.now(),
      },
    })
  );
};
