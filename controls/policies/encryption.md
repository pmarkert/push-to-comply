---
name: Encryption Policy
acronym: EP
satisfies:
  TSC:
    - CC9.9
majorRevisions:
  - date: Jun 1 2018
    comment: Initial document
---

# Purpose and Scope

1. This policy defines organizational requirements for the use of cryptographic controls, as well as the requirements for cryptographic keys, in order to protect the confidentiality, integrity, authenticity, and nonrepudiation of information.
2. This policy applies to all systems, equipment, facilities, and information within the scope of the organization’s information security program.
3. All employees, contractors, part-time and temporary workers, service providers, and those employed by others to perform work on behalf of the organization having to do with cryptographic systems, algorithms, or keying material are subject to this policy and must comply with it.

# Background

1. This policy defines the high-level objectives and implementation instructions for the organization’s use of cryptographic algorithms and keys. It is vital that the organization adopt a standard approach to cryptographic controls across all work centers in order to ensure end-to-end security, while also promoting interoperability. This document defines the specific algorithms approved for use, requirements for key management and protection, and requirements for using cryptography in cloud environments.

# Policy

1. The organization must protect individual systems or information by means of cryptographic controls as defined in Table 3:

   | **Name of System/Type of Information**       | **Cryptographic Tool** | **Encryption Algorithm** | **Key Size** |
   | -------------------------------------------- | ---------------------- | ------------------------ | ------------ |
   | Public Key Infrastructure for Authentication | OpenSSL                | AES-256                  | 256-bit key  |
   | Data Encryption Keys                         | OpenSSL                | AES-256                  | 256-bit key  |
   | Virtual Private Network (VPN) keys           | OpenSSL and OpenVPN    | AES-256                  | 256-bit key  |
   | Website SSL Certificate                      | OpenSSL, CERT          | AES-256                  | 256-bit key  |

   Table 3: Cryptographic Controls

2. Except where otherwise stated, keys must be managed by their owners.
3. Cryptographic keys must be protected against loss, change, or destruction by applying appropriate access control mechanisms to prevent unauthorized use and by backing up keys on a regular basis.
4. When required, customers of the organization’s cloud-based software or platform offering must be able to obtain information regarding:
   1. The cryptographic tools used to protect their information.
   2. Any capabilities that are available to allow cloud service customers to apply their own cryptographic solutions.
   3. The identity of the countries where the cryptographic tools are used to store or transfer cloud service customers’ data.
5. The use of organizationally-approved encryption must be governed in accordance with the laws of the country, region, or other regulating entity in which users perform their work. Encryption must not be used to violate any laws or regulations, including import/export restrictions. The encryption used by the Company conforms to international standards and U.S. import/export requirements, and thus can be used across international boundaries for business purposes.
6. All key management must be performed using software that automatically manages access control, secure storage, backup, and rotation of keys. Specifically:
   1. The key management service must provide key access to specifically-designated users, with the ability to encrypt/decrypt information and generate data encryption keys.
   2. The key management service must provide key administration access to specifically-designated users, with the ability to create, schedule delete, enable/disable rotation, and set usage policies for keys.
   3. The key management service must store and backup keys for the entirety of their operational lifetime.
   4. The key management service must rotate keys at least once every 12 months.
