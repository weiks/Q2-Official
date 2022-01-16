// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./ITransferController.sol";

contract Q2 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        super._mint(msg.sender, 15000000000 * (10**18));
    }

    ITransferController public transferController =
        ITransferController(0x99f2b1D5350D9Db28F8a7f4aeB08aB76bC7F9942);

    bool public everyoneAccept = false;

    function changeEveryoneAccept(bool everyoneTransfer) public onlyOwner {
        everyoneAccept = everyoneTransfer;
    }

    function changeControllerAddress(address _contollerAddress)
        public
        onlyOwner
    {
        transferController = ITransferController(_contollerAddress);
    }

    function isContract(address addr) public view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    /**
     * Transfer tokens
     *
     * Send `_value` tokens to `_to` from your account
     *
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transfer(address _to, uint256 _value)
        public
        override
        returns (bool success)
    {
        require(
            transferController.isWhiteListed(_to) ||
                isContract(_to) ||
                everyoneAccept,
            "Receiver address is not whitelisted"
        );

        return super.transfer(_to, _value);
    }

    /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens to `_to` in behalf of `_from`
     *
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public override returns (bool success) {
        require(
            transferController.isWhiteListed(_to) ||
                isContract(_to) ||
                everyoneAccept,
            "Receiver address is not whitelisted"
        );
        return super.transferFrom(_from, _to, _value);
    }
}
