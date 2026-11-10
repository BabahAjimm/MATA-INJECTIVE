import { Engine } from '../packages/core/src/engine.ts';
import type { ChainEvent } from '../packages/core/src/types.ts';
import { InsuranceFundDrain } from '../packages/detectors/src/insuranceFundDrain.ts';
import { FlaggedAddress, ThreatIntel } from '../packages/detectors/src/flaggedAddress.ts';
import { ValidatorIncident } from '../packages/detectors/src/validatorIncident.ts';
import { mataCheck } from '../packages/mcp-server/src/check.ts';

const intel = new ThreatIntel([
  { address: '0xBAD0000000000000000000000000000000000001', reason: 'synthetic drainer (demo)' },
]);

const engine = new Engine([
  new InsuranceFundDrain({ windowMs: 10 * 60 * 1000, dropFraction: 0.5 }),
  new FlaggedAddress(intel),
  new ValidatorIncident(),
]);

console.log('================================================================');
console.log(' MATA REPLAY: Native Module Anomaly & Agent Pre-Tx Guard');
console.log(' Scenario: Insurance Fund Rapid Drain + Counterparty Block');
console.log('================================================================\n');

const scenario: { step: string; event: ChainEvent; description: string }[] = [
  {
    step: '1. Baseline Health',
    description: 'Normal perpetual market operations on Injective testnet.',
    event: {
      kind: 'insurance_fund_balance',
      marketId: 'INJ-USDT-PERP',
      balance: 5_000_000,
      time: 1_000_000,
      height: 50_001,
    },
  },
  {
    step: '2. Normal Market Volatility',
    description: 'Minor liquidation absorption, balance remains within normal bounds.',
    event: {
      kind: 'insurance_fund_balance',
      marketId: 'INJ-USDT-PERP',
      balance: 4_850_000,
      time: 1_200_000,
      height: 50_020,
    },
  },
  {
    step: '3. Rapid Settlement Anomaly',
    description: 'Sudden 66% drop in insurance fund balance within 8 minutes.',
    event: {
      kind: 'insurance_fund_balance',
      marketId: 'INJ-USDT-PERP',
      balance: 1_700_000,
      time: 1_480_000,
      height: 50_045,
    },
  },
];

for (const s of scenario) {
  console.log(`[Step] ${s.step}`);
  console.log(`       ${s.description}`);
  const alerts = engine.process(s.event);
  if (alerts.length === 0) {
    console.log('       [STATUS] Normal. No alerts raised.\n');
  } else {
    for (const a of alerts) {
      console.log(`       [ALERT] [${a.severity.toUpperCase()}] ${a.title}`);
      console.log(`               Block Height: ${a.height}\n`);
    }
  }
}

console.log('----------------------------------------------------------------');
console.log('[Step] 4. Autonomous Agent Protection (mata_check via MCP)');
console.log('       An AI arbitrage agent evaluates a transaction to a flagged address:');
const checkTarget = '0xBAD0000000000000000000000000000000000001';
console.log(`       Target Counterparty: ${checkTarget}`);

const verdict = mataCheck(intel, { address: checkTarget, agentRiskScore: 40 });
console.log('       [mata_check Result]:');
console.log(`         Verdict: ${verdict.verdict}`);
console.log(`         Reasons: ${verdict.reasons.join(', ')}`);

if (verdict.verdict === 'BLOCK') {
  console.log('\n[RESULT] Transaction safely BLOCKED before broadcast. Threat mitigated.');
} else {
  console.log('\n[RESULT] Transaction permitted.');
}
console.log('================================================================\n');
