<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/mata-logo-horizontal-dark.svg">
    <img src="docs/assets/mata-logo-horizontal-light.svg" alt="MATA" width="420">
  </picture>
</p>

<p align="center"><b>Eyes on Injective.</b> An open-source AI security agent that watches the chain and protects users and AI agents before they sign.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-1F6FD1" alt="License: Apache-2.0"></a>
  <img src="https://img.shields.io/badge/status-prototype-E8890F" alt="Status: prototype">
  <img src="https://img.shields.io/badge/node-%E2%89%A522.18-0E1726?logo=nodedotjs&logoColor=white" alt="Node.js 22.18 or later">
  <img src="https://img.shields.io/badge/tests-17%20passing-1F6FD1" alt="Tests: 17 passing">
  <a href="docs/pitch-deck.pdf"><img src="https://img.shields.io/badge/pitch%20deck-v4%20(PDF)-1F6FD1" alt="Pitch Deck"></a>
</p>

---

**MATA** stands for **M**onitoring **A**gent for **T**hreat **A**nalysis. In Malay, *mata* means "eye" and *mata-mata* means "the watchmen".

MATA works in two layers:

| Layer | Question it answers | What it does |
|---|---|---|
| **1. Watch** | "Is something going wrong on Injective right now?" | Watches Injective's native modules (exchange, insurance fund, oracle, staking), Injective EVM and ERC-8004 agents in real time, and flags exploit patterns, validator incidents and risky counterparties. |
| **2. Protect** | "Is it safe for me to sign this?" | Before a user, dApp or AI agent pays, `mata_check` answers **ALLOW**, **WARN** or **BLOCK**, using what Layer 1 has learned. |

> [!WARNING]
> **Early prototype, not audited.** MATA is being built for the Injective Hacker House in Bangkok (December 2026). Do not rely on it to protect funds yet.

## Why

- **Aug 31, 2026:** an incident in Injective's binary-options module, which Injective contained within hours, showed how much native-module monitoring matters. Generic EVM monitors do not understand Injective's native modules.
- **Oct 29, 2026:** a $6.3B exchange hack was carried out through social engineering. AI agents now move funds too, and they can be socially engineered through prompt injection.
- **Nov 5, 2026:** the INJC staked-INJ ETF launched on Nasdaq and stakes most of its INJ with validators. Validator and protocol security now matters to institutions as well.

Injective needs a **public, open, Injective-native** security layer. MATA aims to be that layer, alongside the core team's own monitoring.

## Quick start

Requires Node.js 22.18 or later. TypeScript runs natively, so there is no build step.

```bash
npm test          # run tests (engine, detectors, MCP server, pre-tx check)
npm run demo      # offline demo: feed sample events, print alerts
npm run replay    # incident replay: synthetic insurance fund drain
```

The demo uses synthetic data only and makes no network calls:

```text
MATA: eyes on Injective (offline demo)

[CRITICAL]  Insurance fund for DEMO-PERP fell 62.0% within 10 min  (block 103)
[HIGH]      Validator jailed: demo-validator (injvaloper1demo)  (block 104)
[HIGH]      Transfer to flagged address 0xBAD0000000000000000000000000000000000001: synthetic drainer (demo)  (block 105)

An AI agent asks mata_check before paying the drainer address:
{
  verdict: 'BLOCK',
  address: '0xBAD0000000000000000000000000000000000001',
  reasons: [ 'counterparty flagged: synthetic drainer (demo)' ]
}
```

## Architecture

```text
Injective (native modules + EVM + ERC-8004 registries)
        |  indexer / chain stream / JSON-RPC
        v
  ingest --> detectors (rules, anomaly, threat intel) --> triage (AI)
                          |                                   |
                          v                                   v
            mcp-server: mata_check                  alerter (Telegram, webhook)
            (pre-transaction check)                 dashboard
```

| Package | What it does | Status |
|---|---|---|
| `packages/core` | Shared types (`ChainEvent`, `Alert`, `Detector`) and the detection engine | Working |
| `packages/detectors` | Insurance-fund drain, validator jailing/slashing, flagged-address/burn-address check | Working (first 3 rules) |
| `packages/mcp-server` | `mata_check(address)` pre-transaction safety check over Model Context Protocol | Working (stdio MCP server) |
| `apps/alerter` | Formats alerts and runs the offline demo | Working (demo) |
| `packages/ingest` | Injective EVM JSON-RPC client connected to live testnet | Working |
| `replays` | Patched incident replay simulation (synthetic insurance fund drain) | Working |
| `packages/triage` | Builds prompts for plain-language incident reports; the LLM is called only for flagged events | In progress |
| `apps/dashboard` | Public live view of incidents, markets and agents | Planned |

See [docs/threat-model.md](docs/threat-model.md) for the threats MATA covers and the detector for each, and the [MATA Pitch Deck (PDF)](docs/pitch-deck.pdf) for the hacker house onboarding presentation.

## Design principles

1. **Rules first, AI second.** Critical detection is deterministic and fast. AI filters false positives, explains incidents in plain language and helps find new patterns.
2. **Read-only.** MATA never holds funds or keys and cannot halt the chain. It only watches and advises.
3. **Responsible disclosure.** Unpatched vulnerabilities go privately to the Injective team first.
4. **Signals, never exploits.** Scenarios in `replays/` recreate only the observable on-chain signals of patched incidents, using synthetic data or a local fork. There is no exploit code in this repo.
5. **Alongside, not instead.** MATA is built to complement the monitoring Injective already has.

## Roadmap

- [x] Detection engine and first 3 detectors, with tests
- [x] `mata_check` core logic, with tests
- [x] Stdio MCP server wiring (`mata_check` pre-transaction check)
- [x] Signal replay of an incident (`npm run replay`, synthetic data)
- [x] Injective testnet EVM JSON-RPC connectivity check
- [ ] Stream native module events (exchange, insurance fund, oracle, staking)
- [ ] AI triage with plain-language incident reports
- [ ] ERC-8004 agent risk scoring that writes to the Reputation Registry
- [ ] Register MATA itself as an ERC-8004 agent
- [ ] Public dashboard

## Security

Found a vulnerability in MATA or in Injective? Please report it privately. See [SECURITY.md](SECURITY.md).

## License

[Apache-2.0](LICENSE). See [NOTICE](NOTICE) for attribution. Built in Malaysia by [TALEtech](https://taletech.my).

"MATA", "MATA Labs" and the MATA logo are trademarks of TALEtech (Triple A Legacy Empire Sdn. Bhd.). The license covers the code, not the name. Forks must use a different name.
