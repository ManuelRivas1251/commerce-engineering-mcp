import pino from "pino";

// MCP servers communicate over stdout — logs MUST go to stderr to avoid
// corrupting the JSON-RPC stream that Claude Code reads.
const transport = (() => {
  if (process.env.NODE_ENV !== "production") {
    try {
      require.resolve("pino-pretty");
      return {
        target: "pino-pretty",
        options: { colorize: true, destination: 2 }, // 2 = stderr
      };
    } catch {
      // pino-pretty not installed — fall through to raw stderr
    }
  }
  // Production and fallback: raw JSON to stderr
  return { target: "pino/file", options: { destination: 2 } }; // 2 = stderr
})();

export const logger = pino({
  name: "commerce-engineering-mcp",
  level: process.env.LOG_LEVEL ?? "info",
  transport,
});
