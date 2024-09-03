---
name: Business Continuity Policy
acronym: BCP
satisfies:
  TSC:
    - CC9.1
majorRevisions:
  - date: Jun 1 2018
    comment: Initial document
---

## Purpose and Scope

1. The purpose of this policy is to ensure that the organization establishes objectives, plans, and procedures such that a major disruption to the organization’s key business activities is minimized.
2. This policy applies to all infrastructure and data within the organization’s information security program.
3. This policy applies to all management, employees, and suppliers involved in decisions and processes affecting the organization’s business continuity. This policy must be made readily available to all whom it applies to.

## Background

1. The success of the organization is reliant upon the preservation of critical business operations and essential functions used to deliver key products and services. The purpose of this policy is to define the criteria for continuing business operations for the organization in the event of a disruption. Specifically, this document defines:

   - The structure and authority to ensure business resilience of key processes and systems.
   - The requirements for efforts to manage through a disaster or other disruptive event when the need arises.
   - The criteria to efficiently and effectively resume normal business operations after a disruption.

2. Within this document, the following definitions apply:
   - **Business impact analysis/assessment**: An exercise that determines the impact of losing the support of any resource to an enterprise, establishes the escalation of that loss over time, identifies the minimum resources needed to return to a normal level of operation, and prioritizes recovery of processes and the supporting system.
   - **Disaster recovery plan**: A set of human, physical, technical, and procedural resources to return to a normal level of operation, within a defined time and cost, when an activity is interrupted by an emergency or disaster.
   - **Recovery time objective**: The amount of time allowed for the recovery of a business function or resource to a normal level after a disaster or disruption occurs.
   - **Recovery point objective**: Determined based on the acceptable data loss in the case of disruption of operations.

## Policy

### Business Risk Assessment and Business Impact Analysis

1. Each manager is required to perform a business risk assessment and business impact analysis for each key business system within their area of responsibility.
2. The business risk assessment must identify and define the criticality of key business systems and the repositories that contain the relevant and necessary data for the key business system.
3. The business risk assessment must define and document the Disaster Recovery Plan (DRP) for their area of responsibility. Each DRP shall include:
   - Key business processes.
   - Applicable risk to availability.
   - Prioritization of recovery.
   - Recovery Time Objectives (RTOs).
   - Recovery Point Objectives (RPOs).

### Disaster Recovery Plan

1. Each key business system must have a documented DRP to provide guidance when hardware, software, or networks become critically dysfunctional or cease to function (short and long term outages).
2. Each DRP must include an explanation of the magnitude of information or system unavailability in the event of an outage and the process that would be implemented to continue business operations during the outage. Where feasible, the DRP must consider the use of alternative, off-site computer operations (cold, warm, hot sites).
3. Each plan must be reviewed against the organization’s strategy, objectives, culture, and ethics, as well as policy, legal, statutory, and regulatory requirements.
4. Each DRP must include:
   - An emergency mode operations plan for continuing operations in the event of temporary hardware, software, or network outages.
   - A recovery plan for returning business functions and services to normal on-site operations.
   - Procedures for periodic testing, review, and revisions of the DRP for all affected business systems, as a group and/or individually.

### Data Backup and Restoration Plans

1. Each system owner must implement a data backup and restoration plan.
2. Each data backup and restoration plan must identify:
   - The data custodian for the system.
   - The backup schedule of each system.
   - Where backup media is to be stored and secured, as well as how access is maintained.
   - Who may remove backup media and transfer it to storage.
   - Appropriate restoration procedures to restore key business system data from backup media to the system.
   - The restoration testing plan and frequency of testing to confirm the effectiveness of the plan.
   - The method for restoring encrypted backup media.
