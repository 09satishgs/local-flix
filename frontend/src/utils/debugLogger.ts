/**
 * Temporary Debugging Logger
 * Dispatches a UI toast with heading [DEBUGGING] and the given message.
 */
export const logDebug = (message: string) => {
  window.dispatchEvent(
    new CustomEvent("localflix-debug-log", {
      detail: {
        message: String(message),
        timestamp: Date.now(),
      },
    })
  );
};
