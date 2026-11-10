import type { ThreatIntel } from '../../detectors/src/flaggedAddress.ts';

export type Verdict = 'ALLOW' | 'WARN' | 'BLOCK';

export interface CheckResult {
  verdict: Verdict;
  address: string;
  reasons: string[];
}

export interface CheckInput {
  /** Counterparty the agent is about to interact with. */
  address: string;
  /** Optional ERC-8004 agent risk score, 0 (safe) .. 100 (dangerous). */
  agentRiskScore?: number;
}

/**
 * Core logic behind the `mata_check` MCP tool.
 * Agents call this before signing; MATA never signs or holds keys itself.
 */
export function mataCheck(intel: ThreatIntel, input: CheckInput): CheckResult {
  const reasons: string[] = [];
  let verdict: Verdict = 'ALLOW';

  const flag = intel.lookup(input.address);
  if (flag) {
    if (flag.severity === 'warn') {
      if (verdict === 'ALLOW') verdict = 'WARN';
      reasons.push(`counterparty warning: ${flag.reason}`);
    } else {
      verdict = 'BLOCK';
      reasons.push(`counterparty flagged: ${flag.reason}`);
    }
  }

  if (input.agentRiskScore !== undefined) {
    if (input.agentRiskScore >= 80) {
      verdict = 'BLOCK';
      reasons.push(`agent risk score ${input.agentRiskScore}/100`);
    } else if (input.agentRiskScore >= 50 && verdict === 'ALLOW') {
      verdict = 'WARN';
      reasons.push(`agent risk score ${input.agentRiskScore}/100`);
    }
  }

  return { verdict, address: input.address, reasons };
}
