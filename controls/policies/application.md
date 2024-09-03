---
name: Application Security Policy
acronym: ASP
satisfies:
  TSC:
    - CC6.2
majorRevisions:
  - date: Jun 1 2018
    comment: Initial document
---

## Purpose and Scope

1. This application security policy defines the security framework and requirements for applications, notably web applications, within the organization’s production environment.
2. This document also provides implementing controls and instructions for web application security, including periodic vulnerability scans and other types of evaluations and assessments.
3. This policy applies to all applications within the organization’s production environment, as well as administrators and users of these applications. This typically includes employees and contractors.

## Background

1. Application vulnerabilities typically account for the largest number of initial attack vectors after malware infections. As a result, it is important that applications are designed with security in mind, and that they are scanned and continuously monitored for malicious activity that could indicate a system compromise. Discovery and subsequent mitigation of application vulnerabilities will limit the organization’s attack surface and ensure a baseline level of security across all systems.
2. In addition to scanning guidance, this policy also defines technical requirements and procedures to ensure that applications are properly hardened in accordance with security best practices.

## Policy

1. The organization must ensure that all applications it develops and/or acquires are securely configured and managed.
2. The following security best practices must be considered and, if feasible, applied as a matter of the application’s security design:

   - Data handled and managed by the application must be classified in accordance with the [Data Classification Policy](/controls/policies/classification.md).
   - If the application processes confidential information, a confidential record banner must be prominently displayed which highlights the type of confidential data being accessed (e.g., personally-identifiable information (PII), protected health information (PHI), etc.).
   - Sensitive data, especially data specifically restricted by law or policy (e.g., social security numbers, passwords, and credit card data), should not be displayed in plaintext.
   - Ensure that applications validate input properly and restrictively, allowing only those types of input that are known to be correct. Examples include, but are not limited to, cross-site scripting, buffer overflow errors, and injection flaws.
   - Ensure that applications execute proper error handling so that errors will not provide detailed system information to an unprivileged user, deny service, impair security mechanisms, or crash the system.
   - Where possible, authorize access to applications by affiliation, membership, or employment, rather than by individual. Provide an automated review of authorizations on a regular basis, where possible.
   - Ensure that applications encrypt data at rest and in transit.
   - Implement application logging to the extent practical. Retain logs of all users and access events for at least 14 days.
   - Qualified peers conduct security reviews of code for all new or significantly modified applications, particularly those that affect the collection, use, and/or display of confidential data. Document all actions taken.
   - Implement a change management process for changes to existing software applications.
   - Standard configuration of the application must be documented.
   - Default passwords used within the application, such as for administrative control panels or integration with databases, must be changed immediately upon installation.
   - Applications must require complex passwords in accordance with current security best practices (at least 8 characters in length, combination of alphanumeric upper/lowercase characters and symbols).
   - During development and testing, applications must not have access to live data.

3. Where applications are acquired from a third party, such as a vendor:

   - Only applications that are supported by an approved vendor shall be procured and used.
   - Full support contracts must be arranged with the application vendor for full life-cycle support.
   - No custom modifications may be applied to the application without confirmation that the vendor can continue to provide support.
   - Updates, patches, and configuration changes issued by the vendor shall be implemented as soon as possible.
   - A full review of applications and licenses shall be completed at least annually, as part of regular software reviews.

4. Web applications must be assessed according to the following criteria:

   - New or major application releases must have a full assessment prior to approval of the change control documentation and/or release into the production environment.
   - Third-party or acquired applications must have a full assessment prior to deployment.
   - Software releases must have an appropriate assessment, as determined by the organization’s information security manager, with specific evaluation criteria based on the security risks inherent in the changes made to the application’s functionality and/or architecture.
   - Emergency releases may forego security assessments and carry the assumed risk until a proper assessment can be conducted. Emergency releases must be approved by the Chief Information Officer or designee.

5. Vulnerabilities that are discovered during application assessments must be mitigated based upon the following risk levels, which are based on the Open Web Application Security Project [OWASP Risk Rating Methodology](https://owasp.org/www-community/OWASP_Risk_Rating_Methodology):

   - **High**: Issues categorized as high risk must be fixed immediately. If immediate fixes are not possible, alternate mitigation strategies must be implemented to limit exposure before deployment. Applications with high-risk issues are subject to being taken offline or denied release into the production environment.
   - **Medium**: Issues categorized as medium risk must be reviewed to determine specific items to be mitigated. Actions to implement mitigations must be scheduled. Applications with medium-risk issues may be taken offline or denied release into the production environment based on the number of issues; multiple issues may increase the risk to an unacceptable level. Issues may be fixed in patch releases unless better mitigation options are present.
   - **Low**: Issues categorized as low risk must be reviewed to determine specific items to be mitigated. Actions to implement mitigations must be scheduled.

6. Testing is required to validate fixes and/or mitigation strategies for any security vulnerabilities classified as Medium risk or greater.

7. The following security assessment types may be leveraged to perform an application security assessment:

   - **Full**: Comprised of tests for all known web application vulnerabilities using both automated and manual tools based on the [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/). A full assessment must leverage manual penetration testing techniques to validate discovered vulnerabilities and determine the overall risk of any and all discovered issues.
   - **Quick**: Consists of an automated scan of an application for, at a minimum, the [OWASP Top Ten Project](https://owasp.org/www-project-top-ten/).
   - **Targeted**: Verifies vulnerability remediation changes or new application functionality.

8. To counter the risk of unauthorized access, the organization maintains a [Data Center Security Policy](/controls/policies/datacenter.md).

9. Security requirements for the software development life cycle, including system development, acquisition, and maintenance, are defined in the [Software Development Lifecycle Policy](/controls/policies/development.md).

10. Security requirements for handling information security incidents are defined in the [Security Incident Response Policy](/controls/policies/incident.md).

11. Disaster recovery and business continuity management policy is defined in the [Disaster Recovery Policy](/controls/policies/disaster.md).

12. Requirements for information system availability and redundancy are defined in the [System Availability Policy](/controls/policies/availability.md).
