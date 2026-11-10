import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleMcpMessage, defaultIntel } from '../src/server.ts';

test('MCP initialize returns server info and tool capabilities', () => {
  const res = handleMcpMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
  });

  assert.equal(res?.id, 1);
  const result = res?.result as { serverInfo: { name: string }; capabilities: object };
  assert.equal(result.serverInfo.name, 'mata-mcp');
  assert.ok(result.capabilities);
});

test('MCP tools/list includes mata_check definition', () => {
  const res = handleMcpMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
  });

  assert.equal(res?.id, 2);
  const result = res?.result as { tools: Array<{ name: string; inputSchema: { properties: object } }> };
  assert.equal(result.tools.length, 1);
  assert.equal(result.tools[0].name, 'mata_check');
  assert.ok(result.tools[0].inputSchema.properties);
});

test('MCP tools/call mata_check returns ALLOW for clean address', () => {
  const res = handleMcpMessage({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'mata_check',
      arguments: {
        address: '0x1111111111111111111111111111111111111111',
      },
    },
  });

  assert.equal(res?.id, 3);
  const result = res?.result as { content: Array<{ text: string }>; isError: boolean };
  assert.equal(result.isError, false);
  const parsed = JSON.parse(result.content[0].text);
  assert.equal(parsed.verdict, 'ALLOW');
});

test('MCP tools/call mata_check returns BLOCK and isError for flagged address', () => {
  const res = handleMcpMessage({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'mata_check',
      arguments: {
        address: '0xbad0000000000000000000000000000000000001',
      },
    },
  });

  assert.equal(res?.id, 4);
  const result = res?.result as { content: Array<{ text: string }>; isError: boolean };
  assert.equal(result.isError, true);
  const parsed = JSON.parse(result.content[0].text);
  assert.equal(parsed.verdict, 'BLOCK');
  assert.match(parsed.reasons[0], /synthetic drainer/);
});

test('MCP returns error for unknown method', () => {
  const res = handleMcpMessage({
    jsonrpc: '2.0',
    id: 5,
    method: 'unknown_method',
  });

  assert.equal(res?.id, 5);
  assert.equal(res?.error?.code, -32601);
});

