// Test setup file to handle known issues with broker cleanup
// This suppresses ENOENT errors for .weave/types files that occur during cleanup

// Store original unhandledRejection listeners
const originalListeners = process.listeners("unhandledRejection");

// Remove all existing listeners
process.removeAllListeners("unhandledRejection");

// Add our custom handler
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  // Ignore ENOENT errors for .weave/types files (known broker cleanup issue)
  if (reason?.code === "ENOENT" && reason?.path?.includes(".weave/types")) {
    return;
  }
  
  // For other errors, call original handlers or throw
  if (originalListeners.length > 0) {
    originalListeners.forEach((listener) => {
      (listener as any)(reason, promise);
    });
  } else {
    // If no original handlers, log the error
    console.error("Unhandled Rejection:", reason);
    process.exit(1);
  }
});
