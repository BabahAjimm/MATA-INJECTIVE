# MATA 👁️ Eyes on Injective

**MATA** is short for **M**onitoring **A**gent for **T**hreat **A**nalysis. In Malay, *mata* means "eye" and *mata-mata* means "the watchmen".

MATA is an open-source AI security agent for [Injective](https://injective.com). It does four things:

- **Watches** Injective's native modules (exchange, insurance fund, oracle, staking) and Injective EVM in real time.
- **Detects** exploit patterns, validator incidents and risky counterparties. Detection uses deterministic rules first and AI triage second.
- **Scores** the risk of ERC-8004 AI agents operating on Injective.
- **Answers** "is this safe?" for other agents before they sign a transaction, through an MCP tool (`mata_check`).

> ⚠️ **Status: early prototype, not audited.** It is being built for the Injective Hacker House in Bangkok (Dec 2026). Do not rely on it to protect funds yet.

## Why

- **Aug 31, 2026:** an exploit in Injective's binary-options module drained about $4.9M and stopped block production for about 4 hours. Generic EVM monitors don't understand Injective's native modules.
- **Oct 29, 2026:** a $6.3B exchange hack was carried out through social engineering. AI agents now move funds too, and they can be socially engineered through prompt injection.
- **Nov 5, 2026:** the INJC staked-INJ ETF launched on Nasdaq and stakes 90%+ of its INJ. Validator and protocol security now matters to institutions as well.

Injective needs a **public, open, Injective-native** security layer. MATA aims to be that layer, complementing the core team's own monitoring.

## Architecture

```
Injective (native modules + EVM + ERC-8004 registries)
        │  indexer / chain stream / JSON-RPC
        ▼
  ingest ──► detectors (rules → anomaly → threat intel) ──► triage (AI)
                                   │                          │
                                   ▼                          ▼
                     mcp-server: mata_check           alerter (Telegram/webhook)
                     (pre-transaction check)          dashboard
```

| Package | What it does | Status |
|---|---|---|
| `packages/core` | Shared types (`ChainEvent`, `Alert`, `Detector`) and the detection engine | ✅ |
| `packages/detectors` | Insurance-fund drain, validator jailing/slashing, flagged-address interaction | ✅ first 3 rules |
| `packages/ingest` | Injective EVM JSON-RPC poller (native module streaming coming next) | 🚧 |
| `packages/triage` | Builds prompts for LLM incident reports; LLM is called only for flagged events | 🚧 |
| `packages/mcp-server` | `mata_check(address)` pre-transaction safety check | 🚧 core logic |
| `apps/alerter` | Formats alerts; runs an offline demo | ✅ demo |
| `apps/dashboard` | Live view of incidents, markets and agents | 📋 planned |

## Quick start

Requires Node.js 22.18 or later. TypeScript runs natively, so there is no build step.

```bash
npm test          # run detector tests
npm run demo      # offline demo: feed sample events, print alerts
```

## Design principles

1. **Rules first, AI second.** Critical detection is deterministic and fast. AI filters false positives, explains incidents in plain language and helps find new patterns.
2. **Read-only.** MATA never holds funds or keys and cannot halt the chain. It only watches and warns.
3. **Responsible disclosure.** Unpatched vulnerabilities go privately to Injective first. Replays in `replays/` cover patched incidents only, and run on testnet or a local fork only.

## Roadmap

- [ ] Stream native module events (exchange, insurance, oracle, staking)
- [ ] Replay of a patched exploit pattern on testnet/fork
- [ ] AI triage with incident reports
- [ ] ERC-8004 agent risk scoring that writes to the Reputation Registry
- [ ] MCP server wiring (`mata_check`, `mata_incidents`, `mata_agent_score`)
- [ ] Register MATA itself as an ERC-8004 agent
- [ ] Dashboard

## Security

See [SECURITY.md](SECURITY.md).

## License

[Apache-2.0](LICENSE). Built in Malaysia by [TALEtech](https://taletech.my).
