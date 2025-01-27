// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// add share functionality means if there are more then 1 benificiary
// genrate events

contract DigitalWill {

    address deployer;

    struct UserInfo {
        address user;
        address recipient;
        uint lastAction;
        uint256 balance;
    }
    mapping(address => UserInfo) public users;

    function adduser(address _recipient) external payable {
        require(msg.value > 0, "You must send some Ether to deposit.");
        require(users[msg.sender].user == address(0), "User already exists");

        users[msg.sender] = UserInfo({
            user: msg.sender,
            recipient: _recipient,
            lastAction: block.timestamp,
            balance: msg.value
        });
    }

    function withdraw(address parent) external {
        require(users[parent].user != address(0), "User does not exist");

        require(
            users[parent].user == parent && users[parent].recipient == msg.sender,
            "Invalid user or recipient"
        );

        require(
            (block.timestamp - users[parent].lastAction) >= 52 weeks,
            "Withdrawal not allowed yet"
        );

        (bool success, ) = users[parent].recipient.call{value: users[parent].balance }("");
        require(success, "Transfer to recipient failed");

        users[parent].balance = 0;

        removeUser(parent);
    }

    // add revert transection means it will transfer the amount back to the wallet.
    function revertToOwner() external {
        require(
            msg.sender == users[msg.sender].user,
            "Only owner can call this function"
        );

        (bool success, ) = users[msg.sender].user.call{ value: users[msg.sender].balance }("");

        require(success, "Transfer to recipient failed");

        users[msg.sender].balance = 0;

        removeUser(msg.sender);
    }

    function ping() external {
        require(
            msg.sender == users[msg.sender].user,
            "Only the user can call this function"
        );
        users[msg.sender].lastAction = block.timestamp;
    }

    function viewUserBalance() external view returns (uint) {
        return users[msg.sender].balance;
    }

    function viewUserRecipeint() external view returns (address) {
        return users[msg.sender].recipient;
    }

    function viewUserLastAction() external view returns (uint) {
        return users[msg.sender].lastAction;
    }

     function removeUser(address userAddress) internal {
        require(users[userAddress].user != address(0), "User does not exist");
        require( users[userAddress].balance == 0,
            " User can't be remvoed Because User has not withdrawn yet" );

        users[userAddress] = UserInfo(address(0), address(0), 0, 0);
    }

    constructor() {
        deployer = msg.sender;
    }
}
