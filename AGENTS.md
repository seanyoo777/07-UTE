# AGENTS.md

## PROJECT OVERVIEW

Project Number:
07 = UTE (Universal Trading Exchange)

Current Role:
- Unified trading platform
- Multi-market architecture
- TGX-CEX integration layer
- OneAI integration bridge
- Universal market dashboard
- Future global unified platform

---

## GLOBAL SELF-TEST & VALIDATION

All work must follow **`docs/GLOBAL_SELF_TEST_VALIDATION.md`**:

- Self-Test Center, Diagnostics Panel, append-only mock Audit Trail, feature-flag checks, documented smoke (`test` / `lint` / `build`).
- Verdicts: **PASS / WARN / FAIL**; show **issue count**, **last checked**, **mock only** on diagnostics UI.
- **Additive only** — no live execution, settlement, on-chain, or uncontrolled realtime loops.

07-UTE: `runUteSelfTestSuite()`, `AdminSelfTestCenterPanel` on `/admin`.

---

## CORE RULES

- Do NOT remove existing features
- Keep build/lint passing
- mock/demo mode first
- No real trading API
- No live order execution
- Reusable architecture first
- UI/UX first
- Multi-market compatibility required

---

## REQUIRED DOCUMENT RULE

Whenever:
- architecture changes
- market structure changes
- integration structures change
- adapters/vendors change
- new systems/folders are added

You MUST also update:
- MASTER_MANUAL.md
- docs/*.md

---

## CURRENT PRIORITIES

1. Universal market architecture
2. TGX-CEX reusable integration
3. OneAI bridge structure
4. Unified selectedSymbol system
5. Multi-market dashboard
6. Mobile trading UX
7. Future scalable architecture

---

## IMPORTANT

Update documentation together with architecture changes.
