# ADR 003: EIP-1271 Signature Standard and Expiration Mechanism for Multichain Minting

## Status

Accepted

## Context

In a multichain environment, the ability to verify signatures across different blockchain networks is crucial for maintaining security and integrity during the minting process. The EIP-1271 standard provides a method for smart contracts to verify signatures, which is essential for contracts that do not have private keys like Externally Owned Accounts (EOAs). However, the challenge arises when these signatures need to be recognized and validated across multiple chains, especially when considering the timing and expiration of minting permissions.

## Decision

We have decided to implement the EIP-1271 signature verification standard in our minting process, along with a custom expiration mechanism. This will allow us to handle signatures from smart contract wallets and ensure that they are valid before minting tokens. The expiration mechanism is designed to prevent replay attacks and ensure that minting permissions are current and have not been superseded by more recent permissions.

## Consequences

This decision will:

- Enable the use of smart contract wallets in the minting process, expanding our user base.
- Provide an additional layer of security by ensuring that only valid and current permissions are used for minting.
- Allow for flexibility in handling signatures across multiple blockchain networks, accommodating the dynamic nature of multichain environments.
- Introduce an expiration mechanism that adds a temporal dimension to minting permissions, enhancing the control over the minting process.

## Date

February 15th, 2024

## Authors

@psavelis
