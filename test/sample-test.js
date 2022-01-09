const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WagmiTable", function () {
  it("Should award an item to a player", async function () {
    const WagmiTable = await ethers.getContractFactory("WagmiTable");
    const wagmiTable = await WagmiTable.deploy();
    await wagmiTable.deployed();

    // Get user addresses
    const [ owner, user1, ...addrs ] = await ethers.getSigners()

    expect(await wagmiTable.awardItem(user1.address))
      .to.emit(wagmiTable, 'Transfer')
      .withArgs(ethers.constants.AddressZero, user1.address, 1)
  });
});
