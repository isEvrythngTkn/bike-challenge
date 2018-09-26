
# Bike Share

Bike share is a collection of smart contracts to facilitate the creation of a bicycle sharing dapp.

## Requirements
- NodeJS v9+
- Truffle
- Ganache

## Installation
1. Clone the repo
2. From the root directory of the project, run `npm install`

## Test Suite
1. Start ganache
2. Run `truffle test` from the project root

## Workflow
1. Migrate the contracts.
2. Send some ETH to the crowdsale contract, which in turn will give you BIKE in the token contract.
3. Use the approveAndCall method of the BIKE token contract to rent a bike. Pass the address of the Bike contract, along with the amount required for escrow (in this case 3 * RENTAL_FEE = 9000 BIKE). The bike is now rented to that address.
4. Now that the bike is rented, you can transfer the bike using the Bike contract.
5. Whoever is the current renter can then return the bike. If it is returned within the time limit, 2/3 of the escrowed BIKE credits are returned to the payer's address. If it is past the rental time limit, then the BIKE credits are retained by the Bike contract.
