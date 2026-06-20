# clockforclaude-mcp

> Give Claude a window to the world — real-time **date, time, timezone and weather** as MCP tools.

By default, Claude has no idea what time it is, what the weather is like, or whether
you're talking to it at 3pm or 3am. This [Model Context Protocol](https://modelcontextprotocol.io)
server gives Claude four tools to fetch that context on demand.

## Tools

| Tool | What it returns |
|------|-----------------|
| `get_current_datetime` | Current date, time, timezone, day of week, season, part of day |
| `get_weather` | Temperature, conditions, wind, humidity, sunset (via [Open-Meteo](https://open-meteo.com), free, no key) |
| `get_full_context` | A single `[System timestamp]` block combining all of the above |

## Install

No install needed — run it straight from npm with `npx`.

### Claude Desktop

Add to your config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "clockforclaude": {
      "command": "npx",
      "args": ["-y", "clockforclaude-mcp"]
    }
  }
}
```

Restart Claude Desktop — a plug icon confirms the tools are connected.

### Claude Code

```bash
claude mcp add clockforclaude -- npx -y clockforclaude-mcp
```

## Usage

Ask Claude things like *"what time is it for me?"* or *"what's the weather where I am?"*.
For weather, Claude needs your approximate coordinates (it will ask, or you can tell it your city).

## Requirements

- Node.js >= 18 (uses the built-in global `fetch`)

## Notes

- Weather data comes from Open-Meteo and is cached for 10 minutes.

## License

MIT © ClockForClaude
