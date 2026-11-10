import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mataCheck } from '../src/check.ts';
import { ThreatIntel } from '../../detectors/src/flaggedAddress.ts';

const intel = new ThreatIntel([{ address: '0xBAD0000000000000000000000000000000000001', reason: 'drainer' }]);

test('clean address → ALLOW', () => {
  assert.equal(mataCheck(intel, { address: '0x1111111111111111111111111111111111111111' }).verdict, 'ALLOW');
});

test('flagged address → BLOCK', () => {
  const r = mataCheck(intel, { address: '0xbad0000000000000000000000000000000000001' });
  assert.equal(r.verdict, 'BLOCK');
  assert.match(r.reasons[0], /drainer/);
});

test('medium agent risk → WARN, high → BLOCK', () => {
  const a = '0x1111111111111111111111111111111111111111';
  assert.equal(mataCheck(intel, { address: a, agentRiskScore: 60 }).verdict, 'WARN');
  assert.equal(mataCheck(intel, { address: a, agentRiskScore: 90 }).verdict, 'BLOCK');
});

test('burn address → WARN, not BLOCK', () => {
  const customIntel = new ThreatIntel([
    { address: '0x000000000000000000000000000000000000dead', reason: 'known burn address', severity: 'warn' },
  ]);
  const r = mataCheck(customIntel, { address: '0x000000000000000000000000000000000000dead' });
  assert.equal(r.verdict, 'WARN');
  assert.match(r.reasons[0], /burn address/);
});
