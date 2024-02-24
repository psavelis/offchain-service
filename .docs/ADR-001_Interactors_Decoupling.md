# ADR 001: Use of Interactors for Decoupling Usecases from Primary/Driving Adapters

## Status

Accepted

## Context

In our application, the business logic is encapsulated within use cases that need to interact with various primary or driving adapters such as APIs, workers, and CLIs. To maintain a clean architecture, we require a mechanism to decouple these use cases from the adapters.

## Decision

We have decided to implement interactors as a means to achieve this decoupling. Interactors in our project are defined as files containing an interface type and a symbol for dependency injection. They serve as a contract between the use cases and the adapters, ensuring that the core logic can evolve independently from the adapter implementations.

## Consequences

By adopting interactors, we expect to:

- Enhance the maintainability of our codebase by keeping our use cases agnostic of the primary adapters.
- Improve testability by allowing use cases to be tested in isolation from their adapters.
- Facilitate a potential future transition to a microservices architecture, as the use cases will already be decoupled from direct adapter logic.

## Date

December 6th, 2022

## Authors

@psavelis
