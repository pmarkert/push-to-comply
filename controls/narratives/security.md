---
name: Security Architecture Narrative
acronym: SEN
satisfies:
  TSC:
    - CC6.6
    - CC6.7
    - CC7.1
    - CC7.2
majorRevisions:
  - date: Jun 1 2018
    comment: Initial document
---

Here we narrate why our org satisfies the control keys listed in the YML block

## {{organization.name}} Product Architecture

Describe product architecture here, emphasizing security implications

## {{organization.name}} Infrastructure

### Product Infrastructure

Describe product infrastructure, emphasizing security measures

#### Authorized Personnel

- **AWS root account** access is granted only to the CTO and CEO
- **AWS IAM** access is granted to to a limited group of **Operators**
- **{{organization.name}} SSH** access is granted to a limited group of **Operators**
- **{{organization.name}} DB** access is granted to a limited group of **Data Operators**

### IT Infrastructure

{{organization.name}} uses the following cloud services for its internal infrastructure:

- List cloud services

Access to these cloud services is limited according to the role of the {{organization.name}} employee and is reviewed quarterly as well as via regular onboarding/offboarding tasks for new and departing employees.

## {{organization.name}} Workstations

{{organization.name}} workstations are hardened against logical and physical attack by the following measures:

- operating system must be within one generation of current
- full-disk encryption
- onboard antivirus/antimalware software
- OS and AV automatically updated

Workstation compliance with these measures is evaluated on a quarterly basis.

### Remote Access

Many {{organization.name}} employees work remotely on a regular basis and connect to production and internal IT systems via the same methods as those employees connecting from the {{organization.name}} physical office, i.e., direct encrypted access to cloud services. It is the employee's responsibility to ensure that only authorized personnel use {{organization.name}} resources and access {{organization.name}} systems.

## Access Review

Access to {{organization.name}} infrastructure, both internal and product, is reviewed quarterly and inactive users are removed. Any anomalies are reported to the security team for further investigation. When employees start or depart, an onboarding/offboarding procedure is followed to provision or deprovision appropriate account access.

## Penetration Testing

{{organization.name}} commissions an external penetration test on an annual basis. All findings are immediately reviewed and addressed to the satisfaction of the CTO/CEO.

## {{organization.name}} Physical Security

{{organization.name}} has one physical location, in San Francisco, CA. Key issuance is tracked by the Office Physical Security Policy Ledger. Office keys are additionally held by the lessor, property management, and custodial staff. These keys are not tracked by the Office Physical Security Policy Ledger. {{organization.name}} managers regularly review physical access privileges.

{{organization.name}} infrastructure is located within AWS. {{organization.name}} does not have physical access to AWS infrastructure.

## Risk Assessment

{{organization.name}} updates its Cyber Risk Assessment on an annual basis in order to keep pace with the evolving threat landscape. The following is an inventory of adversarial and non-adversarial threats assessed to be of importance to {{organization.name}}.

### Adversarial Threats

The following represents the inventory of adversarial threats:

|Threat|Source|Vector|Target|Likelihood|Severity|
|----------------------------+--------------+------------+-----------------+----------+------|
| | | | | | |

### Non-Adversarial Threats

The following represents the inventory of non-adversarial threats:

|Threat|Vector|Target|Likelihood|Severity|
|----------------------------+--------------+-------------+----------+------|
| | | | | |

## References

### Narratives

- [Products and Services Narrative](/controls/narratives/products.md)
- [System Architecture Narrative](/controls/narratives/system.md)

### Policies

- [Encryption Policy](/controls/policies/encryption.md)
- [Log Management Policy](/controls/policies/log.md)
- [Office Security Policy](/controls/policies/office.md)
- [Remote Access Policy](/controls/policies/remote.md)
- [Security Incident Response Policy](/controls/policies/incident.md)
- [Workstation Policy](/controls/policies/workstation.md)

### Procedures

- [Apply OS Patches](/controls/procedures/patch.md)
- Review & Clear Low-Priority Alerts
- Review Access
- [Review Devices & Workstations](/controls/procedures/workstation.md)
