# ADR 003: Synchronization of Onchain Data to Offchain Storage

## Status

Accepted

## Context

Our application requires real-time access to onchain data for various entities, which is essential for maintaining up-to-date state information and providing users with the latest data. However, directly querying the blockchain for every piece of data can be inefficient and may not scale well with increased user demand. Additionally, the immutable nature of onchain data presents challenges for flexible data management and complex queries.

## Decision

We have decided to synchronize onchain data to an offchain storage system. This will involve capturing events from the blockchain, such as those related to audit pool events, and storing them in a more flexible offchain database. The synchronization process will be managed by interactors like `GenerateAuditFingerprint`, which will handle the retrieval, processing, and storage of onchain data.

## Consequences

This decision will:

- Improve the scalability of our application by reducing the load on the blockchain and enabling efficient data retrieval from offchain storage.
- Increase the flexibility of data management, allowing for complex queries and the application of business logic that may not be feasible onchain.
- Enhance the user experience by providing faster access to data and reducing latency in data presentation.

## Date

December 6th, 2022

## Authors

@psavelis
