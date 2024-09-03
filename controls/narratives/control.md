---
name: Control Environment Narrative
acronym: CEN
satisfies:
  TSC:
    - CC2.1
    - CC2.2
    - CC2.3
    - CC4.1
    - CC4.2
    - CC5.1
    - CC5.2
    - CC5.3
majorRevisions:
  - date: Jun 1 2018
    comment: Initial document
---

The following provides a description of the control structure of {{organization.name}}.

The intent of this description is to enumerate the logical, policy, and procedural controls that serve to monitor {{organization.name}}'s application and data security. Changes uncovered by these procedures in the logical, policy, procedural, or customer environment are addressed by remediations specific to the noted change.

## Policy Controls

{{organization.name}} employs several policy controls to protect confidential data and ensure normal operation of its core product. The comprehensive listing of these policies is available for review at {{organization.name}}'s [Policy Listing](/controls/policies/) page.

## Procedural Controls

{{organization.name}} has numerous procedures to monitor and tune the effectiveness of ongoing security controls, and a series of event-driven procedures to respond to security-related events. These procedures are enumerated and available for review on {{organization.name}}'s [Procedure Listing](/controls/procedures/) page. These procedures generate tickets in {{organization.name}}'s procedural task management system to track and document the ongoing completion and management of controls.

## Logical Controls

In addition to the listed policies and procedures, {{organization.name}} also employs several logical controls to protect confidential data and ensure normal operation of its core product in accordance with the prescribed policies.

- Mandatory data encryption at rest and in motion per [Data Encryption Policy](/controls/policies/encryption.md)
- Multi-factor authentication for access to cloud infrastructure per [Remote Access Policy](/controls/policies/remote.md)
- Activity and anomaly monitoring on production systems per [Log Management Policy](/controls/policies/log.md)
- Vulnerability management program per [Software Development Lifecycle Policy](/controls/policies/development.md) and [Application Security Policy](/controls/policies/application.md)

## Remediations

{{organization.name}} uses the outcomes of the aforementioned controls and procedures to identify shortcomings in the existing control environment. Once identified, these shortcomings are remediated by improving existing controls and procedures, and creating new controls and procedures as needed.

## Communications

{{organization.name}} communicates relevant information regarding the functioning of the above controls with internal and external parties on an as-needed basis and according to statutory requirements.

### Internal

{{organization.name}} communicates control outcomes, anomalies, and remediations internally using the following channels:

- Slack
- Email
- GitHub ticketing

### External

{{organization.name}} communicates relevant control-related information to external parties including shareholders, customers, contractors, regulators, and government entities as needed according to contractual and regulatory/statutory obligation.
