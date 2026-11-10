import { test } from 'node:test';
import assert from 'node:assert/strict';
import { InsuranceFundDrain, ValidatorIncident, FlaggedAddress, ThreatIntel } from '../src/index.ts';
import { Engine } from '../../core/src/engine.ts';

const t0 = 1_780_000_000_000;

test('insurance fund: steady balance → no alert', () => {
  const d = new InsuranceFundDrain();
  for (let i = 0; i < 5; i++) {
    const a = d.inspect({ kind: 'insurance_fund_balance', height: i, time: t0 + i * 1000, marketId: 'm1', balance: 1_000_000 - i * 100 });
    assert.equal(a.length, 0);
  }
});

test('insurance fund: 60% drop within window → critical', () => {
  const d = new InsuranceFundDrain();
  d.inspect({ kind: 'insurance_fund_balance', height: 1, time: t0, marketId: 'm1', balance: 1_000_000 });
  const a = d.inspect({ kind: 'insurance_fund_balance', height: 2, time: t0 + 60_000, marketId: 'm1', balance: 400_000 });
  assert.equal(a.length, 1);
  assert.equal(a[0].severity, 'critical');
});

test('insurance fund: same drop spread beyond window → no alert', () => {
  const d = new InsuranceFundDrain({ windowMs: 60_000 });
  d.inspect({ kind: 'insurance_fund_balance', height: 1, time: t0, marketId: 'm1', balance: 1_000_000 });
  const a = d.inspect({ kind: 'insurance_fund_balance', height: 2, time: t0 + 120_000, marketId: 'm1', balance: 700_000 });
  assert.equal(a.length, 0);
});

test('insurance fund: markets tracked independently', () => {
  const d = new InsuranceFundDrain();
  d.inspect({ kind: 'insurance_fund_balance', height: 1, time: t0, marketId: 'm1', balance: 1_000_000 });
  const a = d.inspect({ kind: 'insurance_fund_balance', height: 2, time: t0 + 1000, marketId: 'm2', balance: 10 });
  assert.equal(a.length, 0);
});

test('validator: jail alerts once, unjail is info, slash is critical', () => {
  const d = new ValidatorIncident();
  const base = { kind: 'validator_status' as const, validator: 'injvaloper1abc', moniker: 'val-A' };
  assert.equal(d.inspect({ ...base, height: 1, time: t0, jailed: false }).length, 0);
  const jailed = d.inspect({ ...base, height: 2, time: t0, jailed: true });
  assert.equal(jailed[0].severity, 'high');
  assert.equal(d.inspect({ ...base, height: 3, time: t0, jailed: true }).length, 0);
  assert.equal(d.inspect({ ...base, height: 4, time: t0, jailed: false })[0].severity, 'info');
  const slashed = d.inspect({ ...base, height: 5, time: t0, jailed: false, slashedFraction: 0.0001 });
  assert.equal(slashed[0].severity, 'critical');
});

test('flagged address: case-insensitive match on either side', () => {
  const intel = new ThreatIntel([{ address: '0xAbCdEf0000000000000000000000000000000001', reason: 'test drainer' }]);
  const d = new FlaggedAddress(intel);
  const a = d.inspect({
    kind: 'transfer', height: 1, time: t0, txHash: '0x1', denom: 'USDC', amount: 5,
    from: '0x1111111111111111111111111111111111111111', to: '0xabcdef0000000000000000000000000000000001',
  });
  assert.equal(a.length, 1);
  assert.equal(a[0].details.side, 'to');
});

test('engine: sorts by severity and survives a broken detector', () => {
  const broken = { name: 'broken', inspect: () => { throw new Error('boom'); } };
  const e = new Engine([broken, new ValidatorIncident()]);
  const out = e.process({ kind: 'validator_status', height: 1, time: t0, validator: 'v', jailed: false, slashedFraction: 0.01 });
  assert.equal(out[0].severity, 'critical');
  assert.equal(out[1].detector, 'broken');
});
