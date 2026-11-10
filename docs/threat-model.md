# Threat model (draft)

| Threat | Signal | Detector | Status |
|---|---|---|---|
| Derivative/settlement exploit (e.g. Aug 31, 2026 binary options) | Insurance fund drops fast | `insurance-fund-drain` | ✅ |
| Validator failure / misbehaviour | Jailing, slashing, double-sign | `validator-incident` | ✅ |
| Stolen-fund movement / drainers | Transfers touching flagged addresses | `flagged-address` | ✅ |
| Oracle manipulation | Oracle price deviates from reference | `oracle-deviation` | 📋 |
| Abnormal market settlement | Settlement price outlier vs. history | `settlement-outlier` | 📋 |
| Malicious / compromised AI agent (ERC-8004) | Agent interacts with flagged entities, sudden behaviour change | `agent-scoring` | 📋 |
| Prompt-injected agent paying attacker | Pre-tx check on counterparty | `mata_check` (MCP) | 🚧 |

## Out of scope
- MATA does not hold keys, sign, or halt the chain.
- MATA does not give investment advice.
