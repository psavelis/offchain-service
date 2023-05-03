
<p align="center">
    <img src="https://kannacoin.wpenginepowered.com/wp-content/uploads/2023/01/knn-green@2x.png" width="60%" alt="Kanna">
</p>

<p align="center">
<img src="https://img.shields.io/badge/language-typescript-blue.svg?style=flat" alt="Typescript">
<img src="https://img.shields.io/badge/v16.16-node%20js-yellowgreen.svg?style=flat" alt="NodeJS">
<img src="https://img.shields.io/badge/v9.1.6-nest%20js-critical.svg?style=flat" alt="NestJS">
<img src="https://img.shields.io/badge/v5.7.2-ethers-blueviolet.svg?style=flat" alt="Ethers">
<br/>
<img src="https://img.shields.io/badge/powered%20by-chainlink-darkblue.svg?style=flat" alt="Powered by Chainlink">
</p>
<hr/>

Welcome to the Offchain Purchase Service repository! This repository contains a NodeJS API created on top of NestJS framework using ports and adapters architecture and integrated to Ethereum and Polygon blockchains. The API is responsible for offering order and reservation of KNN Token (ERC20) through Brazilian Pix Payment system and it is designed to be easy to use and customize.

# Roadmap
- [x] Public API and Open to integrate
- [x] Oracle-based quotations for Fiduciary(BRL/USD), Crypto(ETH/MATIC/KNN) and network **Gas** fees powered by **Chainlink**
- [x] Blockchain Integrated
- [x] BaaS integration for Brazillian instant payment identification of purchases
- [x] LGPD Compliant (Brazilian law of data protection)
- [x] Layer 1 Ethereum support
- [x] Layer 2 Polygon
- [x] NFT Minting

# Features
- [x] ECDSA Signing
- [x] Aes256 based Crytography
- [x] JSON Rpc Client
- [x] SmartContract integration
- [x] Multiple inbound ports/driving adapters (API, Worker, CLI)


# Getting Started

To get started with the Offchain Purchase Service API, you will need to have Node.js (16.16/NVM) and npm installed on your machine. After cloning the repository, navigate to the project directory and run the following command to install the necessary dependencies:

```sh
# toggle correct node version
nvm use

# alternatively, you can install it by using:
# nvm install 16

# install dependencies
npm install
```

## Local Development
You will also need to create a .env file in the root of the project directory, with the following variables:

Once you have installed the dependencies and set up the environment variables, you can start the API by running the following command:

```sh
npm run start:dev
```

## Or using Docker 🐳
```sh
docker-compose up --build
```

# Available Scripts

In the project directory, you can run the following commands:
### `npm test`

Runs the Jest test runner to execute all unit tests.
### `npm run build`

Builds the project. The build artifacts will be stored in the dist/ directory.
### `npm start`

Starts the NestJS server.
### `npm run start:dev`

Starts the NestJS server in watch mode.
### `npm run start:debug`

Starts the NestJS server in debug mode.

### `npm run migrations:create`

Rolls back all database migrations using Knex.
### `npm run migrations`

Runs all pending database migrations in production mode using Knex.
### `npm run healthcheck`

Runs a healthcheck on the API in production mode using the CLI.


# 🤝 Contributing

We welcome contributions to our API! If you find any issues or have any suggestions, please open an issue or a pull request.

Thank you for taking the time to check out the Offchain Purchase Service repository! If you have any questions or feedback, please don't hesitate to reach out.
