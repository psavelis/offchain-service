# Offchain-Service

<p align="center">
  <img src="https://kannacoin.wpenginepowered.com/wp-content/uploads/2023/01/knn-green@2x.png" width="300px" alt="Kanna Logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/language-typescript-blue.svg?style=flat" alt="Typescript Badge">
  <img src="https://img.shields.io/badge/v16.16-node%20js-yellowgreen.svg?style=flat" alt="NodeJS Badge">
  <img src="https://img.shields.io/badge/v9.1.6-nest%20js-critical.svg?style=flat" alt="NestJS Badge">
  <img src="https://img.shields.io/badge/v5.7.2-ethers-blueviolet.svg?style=flat" alt="Ethers Badge">
  <img src="https://img.shields.io/badge/powered%20by-chainlink-darkblue.svg?style=flat" alt="Chainlink Badge">
</p>

---

## Introduction

The **Offchain-Service** is built upon a robust Node.js backend, utilizing the NestJS framework and adopting a monolith-first architecture as recommended by Martin Fowler. This strategic approach lays a solid foundation for our application, accommodating multiple primary adapters including an API, worker processes, and a command-line interface (CLI). This design choice ensures a comprehensive understanding of the system's capabilities and provides a clear pathway for a future transition to microservices.

Our service is structured around several key operational domains:

- **Authentication & Authorization**: Ensuring secure system access and permissions management.
- **Clearing & Settlement**: Streamlining transaction processing and fund distribution.
- **Healthcheck & Monitoring**: Overseeing system health and performance metrics.
- **Payment & Ledger**: Handling financial transactions and maintaining accurate records.
- **Price & Statistics**: Delivering data analytics and real-time market pricing.
- **Supply & Order**: Managing the distribution of tokens and the processing of orders.
- **Transaction & Badge**: Documenting transactional activities and rewarding user engagement.

Collaboration with external upstream domains further extends our capabilities, enhancing our service offerings.

Informed by Domain-Driven Design (DDD), our architecture emphasizes core domains such as **Impactful Cultivation** and **Presale (Legacy)**. The forthcoming Impactful Cultivation domain module will integrate various components, including audit pools, audit modules, entry manifests, evaluation metrics, compliance checklists, and regulatory benchmarks. This integration will significantly improve our service's ability to manage and verify governance aspects within cultivation practices.

We are dedicated to evolving our service in alignment with industry best practices and standards, ensuring scalability and maintainability for a reliable and efficient platform.

## Architectural Decisions

Interactors are designed to be the middleman between the presentation layer and the data layer, ensuring that the business rules are applied correctly and that the data is presented in a format suitable for primary or driving adapters.

The term “interactor” is high level abstraction of “use case”, this pattern helps in decoupling the core logic of the application from external concerns in order to produce a more maintainable and testable code.

## Roadmap

Here's our progress on key milestones:

- [x] Oracle-based quotations powered by Chainlink for fiat (BRL/USD), crypto (ETH/MATIC/KNN), and network gas fees
- [x] Security audit completed by CoinFabrik
- [x] Public API endpoints available
- [x] Support for multiple blockchains and bridge functionalities
- [x] Compliance with various EIP standards for enhanced functionality and security
- [x] Integration with BaaS for instant payment verification in Brazil
- [x] Adherence to LGPD for data protection
- [x] Layer 1 and Layer 2 support for Ethereum and Polygon
- [x] NFT minting feature
- [x] Integration with the Impactful Cultivation Program
- [x] Implementation of role-based access control (RBAC)

## Features

- Secure ECDSA signature implementation
- AES-256 encryption for data security
- Efficient JSON RPC communication
- Seamless smart contract interactions
- Diverse inbound ports and driving adapters including API, Worker, and CLI

## Getting Started

### Prerequisites

- Node.js (v16.16)
- npm (Node Package Manager)

We recommend using NVM (Node Version Manager) for seamless Node.js version management.

### Installation

Follow these steps to set up the project locally:

```bash
# Ensure you're using the correct Node.js version
nvm use

# Install Node.js v16 if not already installed
nvm install 16

# Install dependencies
npm install
```

### Configuration

Populate a `.env` file with the required environment variables in the project's root directory.

### Running the Service

- **Development Mode:**

  ```bash
  npm run start:dev
  ```

- **Docker:**

  ```bash
  docker-compose up --build
  ```

## Scripts

- `npm test`: Run unit tests with Jest.
- `npm run build`: Compile the project. Output is in the `dist/` directory.
- `npm start`: Start the NestJS server.
- `npm run start:dev`: Launch the server in development mode with hot reload.
- `npm run start:debug`: Debug the server.
- `npm run migrations:create`: Manage database migrations.
- `npm run migrations`: Apply database migrations in production.
- `npm run healthcheck`: Conduct a health check on the API.

## Contributing

Your contributions make our service better! Issues and pull requests are welcome to explore the path to blockchain efficiency.

## Contact

Reach out to @Kanna-Coin for any queries or feedback about this project.
