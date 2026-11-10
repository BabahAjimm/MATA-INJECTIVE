# Replays

Scenarios that test whether MATA's detectors catch the **observable on-chain signals** of an incident.

Rules (see ../SECURITY.md):
- **Signals, never attacks.** A replay recreates what an incident *looked like* on-chain (balance drops, abnormal settlements, outflows) as synthetic data or on a local fork. This repo never contains exploit code or attack transactions.
- **Patched incidents only.**
- **Ask first.** Any scenario based on a real incident is reviewed with the affected team before it's shown publicly. If they prefer, it's presented as a generic scenario without naming the incident.
- **Testnet, local fork or synthetic data only.** Never mainnet.

Planned: an insurance-fund drain scenario modelled on the signals of the Aug 31, 2026 incident, which Injective contained within hours. It will be named only with the Injective core team's agreement.
