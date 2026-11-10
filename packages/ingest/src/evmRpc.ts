/**
 * Minimal Injective EVM JSON-RPC client (no dependencies).
 * Endpoint comes from INJ_EVM_RPC_URL. Verify it against docs.injective.network.
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

// `node packages/ingest/src/evmRpc.ts` → quick connectivity check.
if (import.meta.url === `file://${process.argv[1]}`) {
  const rpc = new EvmRpc(process.env.INJ_EVM_RPC_URL ?? '');
  console.log({ chainId: await rpc.chainId(), block: await rpc.blockNumber() });
}
