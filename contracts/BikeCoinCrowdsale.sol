pragma solidity ^0.4.24;

import './BikeCoin.sol';
import "../node_modules/openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import '../node_modules/openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';

contract BikeCoinCrowdsale is Crowdsale, MintedCrowdsale {
    constructor
        (
            uint256 _rate,
            address _wallet,
            address tokenAddress
        )
        public
        Crowdsale(_rate, _wallet, BikeCoin(tokenAddress))
        {}
}