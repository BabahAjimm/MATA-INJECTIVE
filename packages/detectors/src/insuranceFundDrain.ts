import type { Alert, ChainEvent, Detector } from '../../core/src/types.ts';

export interface InsuranceFundDrainOptions {
  /** Alert when the balance drops by at least this fraction within the window (0..1). */
  dropFraction: number;
  /** Sliding window length in ms. */
  windowMs: number;
}

const DEFAULTS: InsuranceFundDrainOptions = { dropFraction: 0.2, windowMs: 10 * 60_000 };

/**
 * Flags a sharp fall in a market's insurance fund balance.
 * Insurance funds back Injective derivative markets; a sudden drain is a
 * classic signal of a settlement/pricing exploit.
 */
export class InsuranceFundDrain implements Detector {
  readonly name = 'insurance-fund-drain';
  private readonly opts: InsuranceFundDrainOptions;
  private readonly history = new Map<string, { time: number; balance: number }[]>();

  constructor(opts: Partial<InsuranceFundDrainOptions> = {}) {
    this.opts = { ...DEFAULTS, ...opts };
  }

  inspect(event: ChainEvent): Alert[] {
    if (event.kind !== 'insurance_fund_balance') return [];

    const points = (this.history.get(event.marketId) ?? []).filter(
      (p) => event.time - p.time <= this.opts.windowMs,
    );
    points.push({ time: event.time, balance: event.balance });
    this.history.set(event.marketId, points);

    const peak = Math.max(...points.map((p) => p.balance));
    if (peak <= 0) return [];
    const drop = (peak - event.balance) / peak;
    if (drop < this.opts.dropFraction) return [];

    return [
      {
        detector: this.name,
        severity: drop >= 0.5 ? 'critical' : 'high',
        title: `Insurance fund for ${event.marketId} fell ${(drop * 100).toFixed(1)}% within ${Math.round(this.opts.windowMs / 60_000)} min`,
        details: { marketId: event.marketId, peak, current: event.balance, drop },
        height: event.height,
        time: event.time,
      },
    ];
  }
}
