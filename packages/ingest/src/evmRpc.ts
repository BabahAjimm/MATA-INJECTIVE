import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Minimal Injective EVM JSON-RPC client (no dependencies).
 * Endpoint comes from INJ_EVM_RPC_URL. Default: Injective testnet (Chain ID 1439).
 *
 * Next: native module streaming (exchange, insurance, oracle, staking) via the
 * Injective indexer / chain stream API, normalized into ChainEvent.
 */

export class EvmRpc {
  private readonly url: string;
  private id = 0;

  constructor(url: string) {
    if (!url) throw new Error('INJ_EVM_RPC_URL is not set');
    this.url = url;
  }

  async call<T>(method: string, params: unknown[] = []): Promise<T> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++this.id, method, params }),
    });
    if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
    const body = (await res.json()) as { result?: T; error?: { message: string } };
    if (body.error) throw new Error(`RPC error: ${body.error.message}`);
    return body.result as T;
  }

  async chainId(): Promise<number> {
    return Number.parseInt(await this.call<string>('eth_chainId'), 16);
  }

  async blockNumber(): Promise<number> {
    return Number.parseInt(await this.call<string>('eth_blockNumber'), 16);
  }
}

// `node packages/ingest/src/evmRpc.ts` -> live connectivity check against Injective testnet.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const defaultTestnet = 'https://k8s.testnet.json-rpc.injective.network/';
  const url = process.env.INJ_EVM_RPC_URL || defaultTestnet;
  console.log(`Checking connection to Injective EVM RPC (${url})...`);
  const rpc = new EvmRpc(url);
  const [chainId, blockNumber] = await Promise.all([rpc.chainId(), rpc.blockNumber()]);
  console.log({ chainId, blockNumber, status: 'CONNECTED' });
}
