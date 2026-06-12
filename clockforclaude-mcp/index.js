#!/usr/bin/env node
/**
 * ClockForClaude MCP Server
 * "Give Claude a window to the world"
 * 
 * Gives Claude real-time: time, date, timezone, weather, off-peak status
 * Compatible with: Claude Desktop, Claude Code
 * 
 * Install: npx clockforclaude-mcp
 * Claude Desktop config: { "mcpServers": { "clockforclaude": { "command": "npx", "args": ["-y", "clockforclaude-mcp"] } } }
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");

const tools = require("./tools/datetime");
const weatherTools = require("./tools/weather");
const offpeakTools = require("./tools/offpeak");
const contextTools = require("./tools/context");

const server = new Server(
  { name: "clockforclaude", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ─── List available tools ─────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_current_datetime",
      description: "Get current date, time, timezone, day of week, and season. Use this to know the exact current time for the user.",
      inputSchema: { type: "object", properties: {}, required: [] }
    },
    {
      name: "get_weather",
      description: "Get current local weather: temperature, conditions, wind, sunset time. Requires user's approximate location.",
      inputSchema: {
        type: "object",
        properties: {
          latitude: { type: "number", description: "User latitude (e.g. 43.6047 for Toulouse)" },
          longitude: { type: "number", description: "User longitude (e.g. 1.4442 for Toulouse)" },
          city: { type: "string", description: "City name for display (e.g. 'Toulouse')" }
        },
        required: ["latitude", "longitude"]
      }
    },
    {
      name: "get_offpeak_status",
      description: "Check if Claude is currently in off-peak hours (usage limits doubled). Returns status and next peak/offpeak transition.",
      inputSchema: {
        type: "object",
        properties: {
          timezone: { type: "string", description: "IANA timezone string, e.g. 'Europe/Paris'" }
        },
        required: []
      }
    },
    {
      name: "get_full_context",
      description: "Get the complete [Horodatage système] context block with datetime + weather + offpeak status. Inject this at the start of any conversation for full temporal awareness.",
      inputSchema: {
        type: "object",
        properties: {
          latitude: { type: "number" },
          longitude: { type: "number" },
          city: { type: "string" }
        },
        required: []
      }
    }
  ]
}));

// ─── Handle tool calls ────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_current_datetime":
        return { content: [{ type: "text", text: tools.getCurrentDatetime() }] };

      case "get_weather":
        const weather = await weatherTools.getWeather(args.latitude, args.longitude, args.city);
        return { content: [{ type: "text", text: weather }] };

      case "get_offpeak_status":
        return { content: [{ type: "text", text: offpeakTools.getOffpeakStatus(args.timezone) }] };

      case "get_full_context":
        const ctx = await contextTools.getFullContext(args.latitude, args.longitude, args.city);
        return { content: [{ type: "text", text: ctx }] };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
  }
});

// ─── Start server ─────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
