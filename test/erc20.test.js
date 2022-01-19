const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');

describe("Q2", function () {

  const name = 'Q2';
  const symbol = 'Q2';

  let deployedQ2Token;

  const initialSupply = BigNumber(15000000000 * (10 ** 18));

  beforeEach(async function () {
    const Q2 = await ethers.getContractFactory("Q2");
    deployedQ2Token = await Q2.deploy(name, symbol);
  })

  it("has a name", async function () {
    expect(await deployedQ2Token.name()).to.equal(name);
  });

  it('has a symbol', async function () {
    expect(await deployedQ2Token.symbol()).to.equal(symbol);
  });

  it('has 18 decimals', async function () {
    expect(await deployedQ2Token.decimals()).to.equal(18);
  });

  it('can change controller', async function () {
    expect(await deployedQ2Token.transferController()).to.equal('0x99f2b1D5350D9Db28F8a7f4aeB08aB76bC7F9942');
    const TransferController = await ethers.getContractFactory("TransferController");
    const deployedTransferController = await TransferController.deploy();
    await deployedQ2Token.changeControllerAddress(deployedTransferController.address);
    expect(await deployedQ2Token.transferController()).to.equal(deployedTransferController.address);
  });

  it('can change everyoneaccept', async function () {
    expect(await deployedQ2Token.everyoneAccept()).to.equal(false);
    await deployedQ2Token.changeEveryoneAccept(true);
    expect(await deployedQ2Token.everyoneAccept()).to.equal(true);
  });

  it('can tranfer Ownership', async function () {
    const [owner, addr1] = await ethers.getSigners();
    expect(await deployedQ2Token.owner()).to.equal(owner.address);
    await deployedQ2Token.transferOwnership(addr1.address);
    expect(await deployedQ2Token.owner()).to.equal(addr1.address);
  });

  describe('transfer token', async function () {

    let deployedTransferController;
    let owner;
    let addr1;

    beforeEach(async function () {
      [owner, addr1] = await ethers.getSigners();
      const TransferController = await ethers.getContractFactory("TransferController");
      deployedTransferController = await TransferController.deploy();
      await deployedQ2Token.changeControllerAddress(deployedTransferController.address);
    })

    it('revert transaction if address is not whitelisted', async function () {
      await expect(
        deployedQ2Token.transfer(addr1.address, 10000)
      ).to.be.revertedWith("Receiver address is not whitelisted");
    });

    it('cannot send token to zero address', async function () {
      await expect(
        deployedQ2Token.transfer('0x0000000000000000000000000000000000000000', 10000)
      ).to.be.revertedWith("Receiver address is not whitelisted");
    });

    it('can send tokens to contract address without whitelisting', async function () {

      expect(await deployedQ2Token.balanceOf(deployedTransferController.address)).to.equal(0);
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal(initialSupply.toString(10));
      await deployedQ2Token.transfer(deployedTransferController.address, "1000000000000000000");
      expect(Number(await deployedQ2Token.balanceOf(deployedTransferController.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('1000000000000000000');
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('14999999999000000000000000000');
    });

    it('can send tokens to any address if everyone accept is on', async function () {

      await deployedQ2Token.changeEveryoneAccept(true);
      expect(await deployedQ2Token.balanceOf(addr1.address)).to.equal(0);
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal(initialSupply.toString(10));
      await deployedQ2Token.transfer(addr1.address, "1000000000000000000");
      expect(Number(await deployedQ2Token.balanceOf(addr1.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('1000000000000000000');
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('14999999999000000000000000000');
    });

    it('can send tokens to whitelisted address', async function () {

      await deployedTransferController.addAddressToWhiteList(addr1.address, true);
      expect(await deployedQ2Token.balanceOf(addr1.address)).to.equal(0);
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal(initialSupply.toString(10));
      await deployedQ2Token.transfer(addr1.address, "1000000000000000000");
      expect(Number(await deployedQ2Token.balanceOf(addr1.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('1000000000000000000');
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('14999999999000000000000000000');
    });
  });

  describe('burn token', async function () {

    let deployedTransferController;
    let owner;
    let addr1;

    beforeEach(async function () {
      [owner, addr1] = await ethers.getSigners();
      const TransferController = await ethers.getContractFactory("TransferController");
      deployedTransferController = await TransferController.deploy();
      await deployedQ2Token.changeControllerAddress(deployedTransferController.address);
    })

    it('Burning token from zero address', async function () {
      await expect(
        deployedQ2Token._burn("0x0000000000000000000000000000000000000000", 10000)
      ).to.be.revertedWith("ERC20: burn from the zero address");
    });

    it('Burning token from other address', async function () {
      await expect(
        deployedQ2Token._burn(addr1.address, 10000)
      ).to.be.revertedWith("ERC20: burn from other account");
    });

    it('Cannot burn token more than balance', async function () {
      await expect(
        deployedQ2Token._burn(addr1.address, 10000)
      ).to.be.revertedWith("ERC20: burn from other account");
    });



    it('Burning token decreases supply and balance', async function () {
      await deployedQ2Token._burn(owner.address, '1000000000000000000');
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('14999999999000000000000000000');
      expect(Number(await deployedQ2Token.totalSupply()).toLocaleString('fullwide', { useGrouping: false })).to.equal('14999999999000000000000000000');
    });
  });

  describe('give allowance and tranfers token from account', async function () {

    let deployedTransferController;
    let owner;
    let addr1;

    beforeEach(async function () {
      [owner, addr1] = await ethers.getSigners();
      const TransferController = await ethers.getContractFactory("TransferController");
      deployedTransferController = await TransferController.deploy();
      await deployedQ2Token.changeControllerAddress(deployedTransferController.address);
    })

    it('revert transaction if address is not whitelisted', async function () {
      await expect(
        deployedQ2Token.transferFrom(owner.address, addr1.address, 10000)
      ).to.be.revertedWith("Receiver address is not whitelisted");
    });

    it('revert transaction if allowance is not provided', async function () {
      await deployedTransferController.addAddressToWhiteList(addr1.address, true);
      await expect(
        deployedQ2Token.transferFrom(owner.address, addr1.address, 10000)
      ).to.be.revertedWith("transfer amount exceeds allowance");
    });

    it('send tokens to any address and decreases allowance if everyone accept is on', async function () {

      await deployedQ2Token.changeEveryoneAccept(true);
      expect(await deployedQ2Token.balanceOf(addr1.address)).to.equal(0);
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal(initialSupply.toString(10));
      expect(await deployedQ2Token.allowance(owner.address, addr1.address)).to.equal(0);
      await deployedQ2Token.approve(addr1.address, "1000000000000000000");
      expect(await deployedQ2Token.allowance(owner.address, addr1.address)).to.equal('1000000000000000000');
      await deployedQ2Token.connect(addr1).transferFrom(owner.address, addr1.address, '1000000000000000000');
      expect(await deployedQ2Token.allowance(owner.address, addr1.address)).to.equal(0);
      expect(Number(await deployedQ2Token.balanceOf(addr1.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('1000000000000000000');
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('14999999999000000000000000000');
    });

    it('can send tokens to whitelisted address and decreases allowance when everyone accept is off', async function () {

      await deployedTransferController.addAddressToWhiteList(addr1.address, true);
      expect(await deployedQ2Token.balanceOf(addr1.address)).to.equal(0);
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal(initialSupply.toString(10));
      expect(await deployedQ2Token.allowance(owner.address, addr1.address)).to.equal(0);
      await deployedQ2Token.approve(addr1.address, "1000000000000000000");
      expect(await deployedQ2Token.allowance(owner.address, addr1.address)).to.equal('1000000000000000000');
      await deployedQ2Token.connect(addr1).transferFrom(owner.address, addr1.address, '1000000000000000000');
      expect(await deployedQ2Token.allowance(owner.address, addr1.address)).to.equal(0);
      expect(Number(await deployedQ2Token.balanceOf(addr1.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('1000000000000000000');
      expect(Number(await deployedQ2Token.balanceOf(owner.address)).toLocaleString('fullwide', { useGrouping: false })).to.equal('14999999999000000000000000000');
    });
  });
});
