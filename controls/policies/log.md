---
name: Log Management Policy
acronym: LMP
satisfies:
  TSC:
    - CC7.2
majorRevisions:
  - date: Jun 1 2018
    comment: Initial document
---

## Purpose and Scope

1. This log management and review policy defines specific requirements for information systems to generate, store, process, and aggregate appropriate audit logs across the organization’s entire environment in order to provide key information and detect indicators of potential compromise.
2. This policy applies to all information systems within the organization’s production network.
3. This policy applies to all employees, contractors, and partners of the organization that administer or provide maintenance on the organization’s production systems. Throughout this policy, these individuals are referred to as system administrators.

## Background

1. In order to measure an information system’s level of security through confidentiality, integrity, and availability, the system must collect audit data that provides key insights into system performance and activities. This audit data is collected in the form of system logs. Logging from critical systems, applications, and services provides information that can serve as a starting point for metrics and incident investigations. This policy provides specific requirements and instructions for how to manage such logs.

## Policy

1. All production systems within the organization shall record and retain audit-logging information that includes the following information:

   1. Activities performed on the system.
   2. The user or entity (i.e., system account) that performed the activity, including the system that the activity was performed from.
   3. The file, application, or other object that the activity was performed on.
   4. The time that the activity occurred.
   5. The tool that the activity was performed with.
   6. The outcome (e.g., success or failure) of the activity.

2. Specific activities to be logged must include, at a minimum:

   1. Information (including authentication information such as usernames or passwords) is created, read, updated, or deleted.
   2. Accepted or initiated network connections.
   3. User authentication and authorization to systems and networks.
   4. Granting, modification, or revocation of access rights, including adding a new user or group; changing user privileges, file permissions, database object permissions, firewall rules, and passwords.
   5. System, network, or services configuration changes, including software installation, patches, updates, or other installed software changes.
   6. Startup, shutdown, or restart of an application.
   7. Application process abort, failure, or abnormal end, especially due to resource exhaustion or reaching a resource limit or threshold (such as CPU, memory, network connections, network bandwidth, disk space, or other resources), the failure of network services such as DHCP or DNS, or hardware fault.
   8. Detection of suspicious and/or malicious activity from a security system such as an Intrusion Detection or Prevention System (IDS/IPS), anti-virus system, or anti-spyware system.

3. Unless technically impractical or infeasible, all logs must be aggregated in a central system so that activities across different systems can be correlated, analyzed, and tracked for similarities, trends, and cascading effects. Log aggregation systems must have automatic and timely log ingest, event and anomaly tagging and alerting, and ability for manual review.

4. Logs must be manually reviewed on a regular basis:

   1. The activities of users, administrators, and system operators must be reviewed on at least a monthly basis.
   2. Logs related to PII must be reviewed on at least a monthly basis in order to identify unusual behavior.

5. When using an outsourced cloud environment, logs must be kept on cloud environment access and use, resource allocation and utilization, and changes to PII. Logs must be kept for all administrators and operators performing activities in cloud environments.

6. All information systems within the organization must synchronize their clocks by implementing Network Time Protocol (NTP) or a similar capability. All information systems must synchronize with the same primary time source.
