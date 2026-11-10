# mcp-server

`mata-mcp` exposes pre-transaction threat analysis over the standard [Model Context Protocol (MCP)](https://modelcontextprotocol.io).

## Tools

### `mata_check`
Evaluates a target counterparty or contract address before an autonomous agent signs a transaction on Injective.

**Input:**
- `address` (string, required): The counterparty or contract address.
- `agentRiskScore` (number, optional): An ERC-8004 on-chain agent risk score (0 = safe, 100 = malicious).

**Output:**
- `verdict`: `ALLOW` | `WARN` | `BLOCK`
- `address`: Echoes evaluated address
- `reasons`: Array of human-readable warnings if flagged

## Running the Server

Run directly with Node 22+:
```bash
node packages/mcp-server/src/server.ts
```

Or configure inside Claude Desktop or Cursor (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "mata": {
      "command": "node",
      "args": ["<PATH_TO_REPO>/packages/mcp-server/src/server.ts"]
    }
  }
}
```
