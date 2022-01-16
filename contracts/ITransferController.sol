// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//Interface to control transfer of q2
interface ITransferController {
    function addAddressToWhiteList(address _user, bool status) 
        external
        returns (bool);

    function isWhiteListed(address _user) external view returns (bool);
}