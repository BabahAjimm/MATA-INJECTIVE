import type { Alert, ChainEvent, Detector } from '../../core/src/types.ts';

export interface FlagEntry {
  address: string;
  reason: string; // e.g. "linked to Oct 2026 exchange hack", "sanctioned", "drainer"
}

/** Normalizes addresses so EVM hex comparisons are case-insensitive. */
export const norm = (a: string) => a.trim().toLowerCase();

/** Shared threat-intel list. Used by the detector and by the mata_check MCP tool. */
export class ThreatIntel {
  private readonly flags = new Map<string, string>();

  constructor(entries: FlagEntry[] = []) {
    for (const e of entries) this.add(e);
  }

  add(e: FlagEntry) {
    this.flags.set(norm(e.address), e.reason);
  }

  lookup(address: string): string | undefined {
    return this.flags.get(norm(address));
  }
}

/** Flags any transfer to or from an address on the threat-intel list. */
export class FlaggedAddress implements Detector {
  readonly name = 'flagged-address';
  private readonly intel: ThreatIntel;

  constructor(intel: ThreatIntel) {
    this.intel = intel;
  }

  inspect(event: ChainEvent): Alert[] {
    if (event.kind !== 'transfer') return [];
    const alerts: Alert[] = [];
    for (const [side, addr] of [['from', event.from], ['to', event.to]] as const) {
      const reason = this.intel.lookup(addr);
      if (!reason) continue;
      alerts.push({
        detector: this.name,
        severity: 'high',
        title: `Transfer ${side} flagged address ${addr}: ${reason}`,
        details: { txHash: event.txHash, side, address: addr, reason, amount: event.amount, denom: event.denom },
        height: event.height,
        time: event.time,
      });
    }
    return alerts;
  }
}
