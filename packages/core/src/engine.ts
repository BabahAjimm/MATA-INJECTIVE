import type { Alert, ChainEvent, Detector } from './types.ts';

const ORDER = { info: 0, low: 1, medium: 2, high: 3, critical: 4 } as const;

/** Runs every detector over each event and returns alerts, most severe first. */
export class Engine {
  private readonly detectors: Detector[];

  constructor(detectors: Detector[]) {
    this.detectors = detectors;
  }

  process(event: ChainEvent): Alert[] {
    const alerts: Alert[] = [];
    for (const d of this.detectors) {
      try {
        alerts.push(...d.inspect(event));
      } catch (err) {
        // A broken detector must never take the whole pipeline down.
        alerts.push({
          detector: d.name,
          severity: 'low',
          title: `Detector error: ${(err as Error).message}`,
          details: {},
          height: event.height,
          time: event.time,
        });
      }
    }
    return alerts.sort((a, b) => ORDER[b.severity] - ORDER[a.severity]);
  }
}
