const { expect } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require('bignumber.js');

describe("TransferController", function () {

    let deployedTransferController;

    beforeEach(async function () {
        const TransferController = await ethers.getContractFactory("TransferController");
        deployedTransferController = await TransferController.deploy();
    })

    describe('addOrChangeModeratorStatus', async function () {

        let owner;
        let addr1;

        beforeEach(async function () {
            [owner, addr1] = await ethers.getSigners();
        })

        it('cannot add or modify moderator status with non-owner address', async function () {
            await expect(
                deployedTransferController.connect(addr1).addOrChangeModeratorStatus(addr1.address, true)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it('add moderator', async function () {
            await expect(deployedTransferController.addOrChangeModeratorStatus(addr1.address, true)).to.emit(deployedTransferController, 'AddOrChangeModeratorStatus').withArgs(addr1.address, true);
        });

    });

    describe('addOrChangeUserStatus', async function () {

        let owner;
        let addr1;

        beforeEach(async function () {
            [owner, addr1] = await ethers.getSigners();
        })

        it('cannot add or change user status with non-owner/moderator address', async function () {
            await expect(
                deployedTransferController.connect(addr1).addOrChangeUserStatus(addr1.address, true)
            ).to.be.revertedWith("Not an Owner or Moderator");
        });

        it('add moderator', async function () {
            await expect(deployedTransferController.addOrChangeUserStatus(addr1.address, true)).to.emit(deployedTransferController, 'AddOrChangeUserStatus').withArgs(addr1.address, true);
        });
    });
});


