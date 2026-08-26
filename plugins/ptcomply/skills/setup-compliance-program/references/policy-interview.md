# Per-policy interview question bank

For each policy the template ships, ask the minimum set that decides
whether the text matches reality, then edit the policy to the truthful
answer. Weaker-but-true beats stronger-but-false, always. When the org
*wants* to adopt the stronger practice, record it as an explicit decision
with an owner and date — don't silently leave aspirational text.

Common policies (adapt to what's in `controls/policies/`):

- **Access / onboarding-termination**: Who grants accounts, and is there a
  checklist? How fast is access revoked on departure — is that verified?
  How often are access reviews *actually* performed, by whom?
- **Password / authentication**: Actual requirements (length, manager,
  MFA)? Enforced by tooling or by policy only? Any shared accounts —
  where, and how are they controlled?
- **Encryption**: TLS everywhere externally? Disk/storage encryption at
  rest — which systems? Key management: who holds keys, where?
- **Change management / SDLC**: Are PR reviews required (branch
  protection?) and by whom? How do emergency changes work? Test/staging
  environments real or nominal?
- **Incident response**: Has an incident occurred; was the process
  followed? Who is on call? Are post-mortems written? Customer
  notification commitments (contractual SLAs)?
- **Backup / availability / DR**: What is backed up, how often, where?
  Has a restore ever been *tested*? RTO/RPO promises vs reality.
- **Vendor management**: Is there a vendor list? Who approves new vendors?
  Are vendor security reviews (SOC 2 reports collected?) actually done?
- **Data classification / retention**: Are classification levels used in
  practice or just defined? What actually gets deleted, on what schedule,
  and does anything enforce it?
- **Log management**: What is logged centrally? Who looks at logs, ever?
  Alerting on what? Retention period of logs (matches the policy?).
- **Workstation / remote work**: Disk encryption and screen lock enforced
  (MDM?) or requested? Personal-device policy in practice?
- **Risk assessment**: Has one ever been performed? Cadence the org can
  really sustain (annual is typical and sufficient for most).
- **Training / policy acknowledgment**: Do employees actually acknowledge
  policies (where is that recorded?) and receive security training (what,
  when)?

For each answer, also capture *where evidence would come from* (system,
export, report). Feed procedures: any practice with a cadence ("monthly",
"quarterly", "annually") should exist as a `cron` procedure so the
scheduler generates its evidence trail; propose `automation: assist`
blocks for agent-collectible ones.
