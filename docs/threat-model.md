# Threat model (draft)

| Threat | Signal | Detector | Status |
|---|---|---|---|
| Derivative/settlement exploit (e.g. the Aug 31, 2026 incident) | Insurance fund drops fast | `insurance-fund-drain` | Working |
| Validator failure / misbehaviour | Jailing, slashing, double-sign | `validator-incident` | Working |
| Stolen-fund movement / drainers | Transfers touching flagged addresses | `flagged-address` | Working |
| Oracle manipulation | Oracle price deviates from reference | `oracle-deviation` | Planned |
| Abnormal market settlement | Settlement price outlier vs. history | `settlement-outlier` | Planned |
| Malicious / compromised AI agent (ERC-8004) | Agent interacts with flagged entities, sudden behaviour change | `agent-scoring` | Planned |
| Prompt-injected agent paying attacker | Pre-tx check on counterparty | `mata_check` (MCP) | In progress |

## Out of scope
- MATA does not hold keys, sign, or halt the chain.
- MATA does not give investment advice.
