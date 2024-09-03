---
name: Software Development Lifecycle Policy
acronym: SDLCP
satisfies:
  TSC:
    - CC8.1
majorRevisions:
  - date: Jun 1 2018
    comment: Initial document
---

## Purpose and Scope

1. The purpose of this policy is to define requirements for establishing and maintaining baseline protection standards for company software, network devices, servers, and desktops.
2. This policy applies to all users performing software development, system administration, and management of these activities within the organization. This typically includes employees and contractors, as well as any relevant external parties involved in these activities (hereinafter referred to as “users”). This policy must be made readily available to all users.
3. This policy also applies to enterprise-wide systems and applications developed by the organization or on behalf of the organization for production implementation.

## Background

1. The intent of this policy is to ensure a well-defined, secure, and consistent process for managing the entire lifecycle of software and information systems, from initial requirements analysis until system decommission. The policy defines the procedure, roles, and responsibilities for each stage of the software development lifecycle.
2. Within this policy, the software development lifecycle consists of requirements analysis, architecture and design, development, testing, deployment/implementation, operations/maintenance, and decommission. These processes may be followed in any form; in a waterfall model, it may be appropriate to follow the process linearly, while in an agile development model, the process can be repeated in an iterative fashion.

## References

1. Risk Assessment Policy

## Policy

### Software Development Life Cycle (SDLC) Phases

1. The organization’s SDLC includes the following phases:

   1. Requirements Analysis
   2. Architecture and Design
   3. Development
   4. Testing
   5. Deployment/Implementation
   6. Operations/Maintenance
   7. Decommission

2. During all phases of the SDLC where a system is not in production, the system must not have live data sets that contain information identifying actual people or corporate entities, actual financial data such as account numbers, security codes, routing information, or any other financially identifying data. Information that would be considered sensitive must never be used outside of production environments.

### Requirements Analysis Phase

1. Analyze business requirements.
2. Perform a risk assessment. More information on risk assessments is discussed in the [Risk Assessment Policy](/controls/policies/risk.md).
3. Discuss aspects of security (e.g., confidentiality, integrity, availability) and how they might apply to this requirement.
4. Review regulatory requirements and the organization’s policies, standards, procedures, and guidelines.
5. Review future business goals.
6. Review current business and information technology operations.
7. Incorporate program management items, including:
   1. Analysis of current system users/customers.
   2. Understand customer-partner interface requirements (e.g., business-level, network).
   3. Discuss project timeframe.
8. Develop and prioritize security solution requirements.
9. Assess cost and budget constraints for security solutions, including development and operations.
10. Approve security requirements and budget.
11. Make “buy vs. build” decisions for security services based on the information above.

### Architecture and Design Phase

1. Educate development teams on how to create a secure system.
2. Develop and/or refine infrastructure security architecture.
3. List technical and non-technical security controls.
4. Perform architecture walkthrough.
5. Create a system-level security design.
6. Create high-level non-technical and integrated technical security designs.
7. Perform a cost/benefit analysis for design components.
8. Document the detailed technical security design.
9. Perform a design review, which must include, at a minimum, technical reviews of application and infrastructure, as well as a review of high-level processes.
10. Describe detailed security processes and procedures, including segregation of duties and segregation of development, testing, and production environments.
11. Design initial end-user training and awareness programs.
12. Design a general security test plan.
13. Update the organization’s policies, standards, and procedures, if appropriate.
14. Assess and document how to mitigate residual application and infrastructure vulnerabilities.
15. Design and establish separate development and test environments.

### Development Phase

1. Set up a secure development environment (e.g., servers, storage).
2. Train infrastructure teams on installation and configuration of applicable software, if required.
3. Develop code for application-level security components.
4. Install, configure, and integrate the test infrastructure.
5. Set up security-related vulnerability tracking processes.
6. Develop a detailed security test plan for current and future versions (i.e., regression testing).
7. Conduct unit testing and integration testing.

### Testing Phase

1. Perform a code and configuration review through both static and dynamic analysis of code to identify vulnerabilities.
2. Test configuration procedures.
3. Perform system tests.
4. Conduct performance and load tests with security controls enabled.
5. Perform usability testing of application security controls.
6. Conduct independent vulnerability assessments of the system, including the infrastructure and application.

### Deployment/Implementation Phase

1. Conduct pilot deployment of the infrastructure, application, and other relevant components.
2. Conduct transition between pilot and full-scale deployment.
3. Perform integrity checking on system files to ensure authenticity.
4. Deploy training and awareness programs to train administrative personnel and users in the system’s security functions.
5. Require participation of at least two developers to conduct full-scale deployment to the production environment.

### Operations/Maintenance Phase

1. Several security tasks and activities must be routinely performed to operate and administer the system, including but not limited to:
   1. Administering users and access.
   2. Tuning performance.
   3. Performing backups according to requirements defined in the System Availability Policy.
   4. Performing system maintenance (i.e., testing and applying security updates and patches).
   5. Conducting training and awareness.
   6. Conducting periodic system vulnerability assessments.
   7. Conducting annual risk assessments.
2. Operational systems must:
   1. Be reviewed to ensure that the security controls, both automated and manual, are functioning correctly and effectively.
   2. Have logs that are periodically reviewed to evaluate the security of the system and validate audit controls.
   3. Implement ongoing monitoring of systems and users to ensure detection of security violations and unauthorized changes.
   4. Validate the effectiveness of the implemented security controls through security training as required by the Procedure For Executing Incident Response.
   5. Have a software application and/or hardware patching process that is performed regularly to eliminate software bug and security problems being introduced into the organization’s technology environment. Patches and updates must be applied within ninety (90) days of release to provide for adequate testing and propagation of software updates. Emergency, critical, break-fix, and zero-day vulnerability patch releases must be applied as quickly as possible.

### Decommission Phase

1. Conduct unit testing and integration testing on the system after component removal.
2. Conduct operational transition for component removal/replacement.
3. Determine data retention requirements for application software and systems data.
4. Document the detailed technical security design.
5. Update the organization’s policies, standards, and procedures, if appropriate.
6. Assess and document how to mitigate residual application and infrastructure vulnerabilities.
