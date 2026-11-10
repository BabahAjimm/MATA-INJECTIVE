/**
 * Offline demo: feeds synthetic events through MATA and prints alerts,
 * then runs a pre-transaction check the way an AI agent would.
 * All data here is synthetic. No network calls are made.
 */
import { Engine } from '../../../packages/core/src/engine.ts';
import type { Alert, ChainEvent } from '../../../packages/core/src/types.ts';
import { InsuranceFundDrain, ValidatorIncident, FlaggedAddress, ThreatIntel } from '../../../packages/detectors/src/index.ts';
import { mataCheck } from '../../../packages/mcp-server/src/check.ts';

const fmt = (a: Alert) => `[${a.severity.toUpperCase()}]`.padEnd(11) + ` ${a.title}  (block ${a.height})`;

const DRAINER = '0xBAD0000000000000000000000000000000000001';
const intel = new ThreatIntel([{ address: DRAINER, reason: 'synthetic drainer (demo)' }]);
const engine = new Engine([new InsuranceFundDrain(), new ValidatorIncident(), new FlaggedAddress(intel)]);

const t = Date.now();
const events: ChainEvent[] = [
  { kind: 'insurance_fund_balance', height: 100, time: t, marketId: 'DEMO-PERP', balance: 1_000_000 },
  { kind: 'validator_status', height: 101, time: t + 1_000, validator: 'injvaloper1demo', moniker: 'demo-validator', jailed: false },
  { kind: 'insurance_fund_balance', height: 102, time: t + 30_000, marketId: 'DEMO-PERP', balance: 950_000 },
  { kind: 'insurance_fund_balance', height: 103, time: t + 60_000, marketId: 'DEMO-PERP', balance: 380_000 },
  { kind: 'validator_status', height: 104, time: t + 61_000, validator: 'injvaloper1demo', moniker: 'demo-validator', jailed: true },
  { kind: 'transfer', height: 105, time: t + 62_000, txHash: '0xdemo', from: '0x1111111111111111111111111111111111111111', to: DRAINER, amount: 250_000, denom: 'USDC' },
];

console.log('MATA: eyes on Injective (offline demo)\n');
for (const e of events) for (const a of engine.process(e)) console.log(fmt(a));

console.log('\nAn AI agent asks mata_check before paying the drainer address:');
console.log(mataCheck(intel, { address: DRAINER }));
