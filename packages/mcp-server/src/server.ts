import * as readline from 'node:readline';
import { ThreatIntel } from '../../detectors/src/flaggedAddress.ts';
import { mataCheck, type CheckInput } from './check.ts';

/**
 * Standard default threat intelligence list for MATA MCP server.
 * Can be augmented dynamically via API or on-chain feeds.
 */
export const defaultIntel = new ThreatIntel([
  { address: '0xBAD0000000000000000000000000000000000001', reason: 'synthetic drainer (demo)' },
  { address: '0x000000000000000000000000000000000000dead', reason: 'burn address' },
]);

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: number | string;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id?: number | string;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

/**
 * Dispatches an MCP JSON-RPC message.
 */
export function handleMcpMessage(req: JsonRpcRequest, intel: ThreatIntel = defaultIntel): JsonRpcResponse | null {
  if (req.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'mata-mcp',
          version: '0.1.0',
        },
      },
    };
  }

  if (req.method === 'notifications/initialized') {
    // Notifications do not return responses
    return null;
  }

  if (req.method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        tools: [
          {
            name: 'mata_check',
            description:
              'Pre-transaction safety check for AI agents on Injective. Verifies counterparty addresses against flagged drainers, exploiters, and ERC-8004 agent risk scores before signing.',
            inputSchema: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                  description: 'The destination or contract address to evaluate before signing.',
                },
                agentRiskScore: {
                  type: 'number',
                  description: 'Optional ERC-8004 agent risk score (0 = safe, 100 = malicious).',
                },
              },
              required: ['address'],
            },
          },
        ],
      },
    };
  }

  if (req.method === 'tools/call') {
    const params = req.params as { name?: string; arguments?: Record<string, unknown> } | undefined;
    if (params?.name === 'mata_check') {
      const args = (params.arguments ?? {}) as unknown as CheckInput;
      if (!args.address || typeof args.address !== 'string') {
        return {
          jsonrpc: '2.0',
          id: req.id,
          error: { code: -32602, message: 'Invalid params: "address" string is required' },
        };
      }
      const checkResult = mataCheck(intel, args);
      return {
        jsonrpc: '2.0',
        id: req.id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(checkResult, null, 2),
            },
          ],
          isError: checkResult.verdict === 'BLOCK',
        },
      };
    }

    return {
      jsonrpc: '2.0',
      id: req.id,
      error: { code: -32601, message: `Tool not found: ${params?.name}` },
    };
  }

  return {
    jsonrpc: '2.0',
    id: req.id,
    error: { code: -32601, message: `Method not found: ${req.method}` },
  };
}

/**
 * Starts the stdio JSON-RPC loop for Claude Desktop, Cursor, or agent runners.
 */
export function startStdioServer(intel: ThreatIntel = defaultIntel): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const req = JSON.parse(trimmed) as JsonRpcRequest;
      const res = handleMcpMessage(req, intel);
      if (res) {
        process.stdout.write(JSON.stringify(res) + '\n');
      }
    } catch (err) {
      const errRes: JsonRpcResponse = {
        jsonrpc: '2.0',
        error: { code: -32700, message: 'Parse error', data: String(err) },
      };
      process.stdout.write(JSON.stringify(errRes) + '\n');
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startStdioServer();
}

