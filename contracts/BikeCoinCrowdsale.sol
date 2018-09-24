pragma solidity ^0.4.24;

import './BikeCoin.sol';
import '../node_modules/openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';

contract BikeCoinCrowdsale is MintedCrowdsale {
    constructor
        (
            uint256 _rate,
            address _wallet,
            MintableToken _token
        )
        public
        Crowdsale(_rate, _wallet, _token)
        {}
}