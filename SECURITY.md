# Security Policy

MATA is an early prototype and **has not been audited**. Do not rely on it as your only protection for funds.

## Reporting a vulnerability in MATA

Please **do not** open a public issue. Report vulnerabilities privately using GitHub's "Report a vulnerability" feature (Security Advisories) on this repository. We aim to reply within 72 hours.

## Vulnerabilities found by MATA in Injective or third-party apps

If MATA (or anyone using it) finds an issue that has not been patched:

1. Do **not** publish details, exploit code or replays.
2. Report it privately to the affected team. For Injective, use their official bug bounty or security contact channel.
3. Add a replay to `replays/` only after a fix has shipped and the affected team agrees to disclosure.

## Scope of replays

Everything in `replays/` must:
- recreate **observable on-chain signals only**, never exploit code or attack transactions;
- cover a **patched** incident only, reviewed with the affected team before public use;
- use **synthetic data, a local fork or testnet only**, never mainnet;
- exist only to test detection, never to move real funds.
