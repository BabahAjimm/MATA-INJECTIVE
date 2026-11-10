import type { Alert, ChainEvent, Detector } from '../../core/src/types.ts';

/**
 * Flags validators that become jailed or get slashed.
 * Relevant to every INJ staker, including institutional products such as
 * staked-INJ ETFs, because slashing reduces delegated stake.
 */
export class ValidatorIncident implements Detector {
  readonly name = 'validator-incident';
  private readonly jailed = new Map<string, boolean>();

  inspect(event: ChainEvent): Alert[] {
    if (event.kind !== 'validator_status') return [];
    const alerts: Alert[] = [];
    const label = event.moniker ? `${event.moniker} (${event.validator})` : event.validator;
    const wasJailed = this.jailed.get(event.validator) ?? false;

    if (event.jailed && !wasJailed) {
      alerts.push({
        detector: this.name,
        severity: 'high',
        title: `Validator jailed: ${label}`,
        details: { validator: event.validator },
        height: event.height,
        time: event.time,
      });
    }
    if (!event.jailed && wasJailed) {
      alerts.push({
        detector: this.name,
        severity: 'info',
        title: `Validator unjailed: ${label}`,
        details: { validator: event.validator },
        height: event.height,
        time: event.time,
      });
    }
    if (event.slashedFraction && event.slashedFraction > 0) {
      alerts.push({
        detector: this.name,
        severity: 'critical',
        title: `Validator slashed ${(event.slashedFraction * 100).toFixed(2)}%: ${label}`,
        details: { validator: event.validator, slashedFraction: event.slashedFraction },
        height: event.height,
        time: event.time,
      });
    }

    this.jailed.set(event.validator, event.jailed);
    return alerts;
  }
}
