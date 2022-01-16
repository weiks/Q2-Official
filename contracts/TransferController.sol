// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./Ownable.sol";
import "./ITransferController.sol";

//implementation to control transfer of q2

contract TransferController is ITransferController, Ownable {
    mapping(address => bool) public whitelistedAddresses;

    mapping(address => bool) moderator;

    // add addresss to transfer q2
    function addAddressToWhiteList(address _user, bool status)
        public
        override
        returns (bool)
    {
        require(msg.sender == owner() || moderator[msg.sender]);
        whitelistedAddresses[_user] = status;
        return true;
    }

    function isWhiteListed(address _user) public view override returns (bool) {
        return whitelistedAddresses[_user];
    }

    function addModerator(address _user, bool status) public onlyOwner {
        moderator[_user] = status;
    }
}
