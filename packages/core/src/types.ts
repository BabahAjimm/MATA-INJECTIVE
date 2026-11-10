/**
 * Core types shared across MATA packages.
 * Events are normalized from Injective native modules and Injective EVM
 * so detectors don't care where the data came from.
 */

export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type ChainEvent =
  | {
      kind: 'insurance_fund_balance';
      height: number;
      time: number; // unix ms
      marketId: string;
      balance: number; // in quote units (e.g. USDT/USDC)
    }
  | {
      kind: 'validator_status';
      height: number;
      time: number;
      validator: string; // operator address
      moniker?: string;
      jailed: boolean;
      slashedFraction?: number; // 0..1, if a slash happened in this event
    }
  | {
      kind: 'transfer';
      height: number;
      time: number;
      txHash: string;
      from: string;
      to: string;
      amount: number;
      denom: string;
    };

export interface Alert {
  detector: string;
  severity: Severity;
  title: string;
  details: Record<string, unknown>;
  height: number;
  time: number;
}

export interface Detector {
  readonly name: string;
  /** Inspect one event; return zero or more alerts. Detectors may keep internal state. */
  inspect(event: ChainEvent): Alert[];
}
