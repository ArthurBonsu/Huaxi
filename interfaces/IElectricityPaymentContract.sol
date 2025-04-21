// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IElectricityPaymentContract
 * @dev Interface for the Electricity Payment Contract
 */
interface IElectricityPaymentContract {
    // Structs
    struct Payment {
        string houseId;
        address payer;
        uint256 amount;
        uint256 timestamp;
        string meterReading;
        bool isPaid;
        string paymentHash;
    }
    
    struct Bill {
        string billId;
        string houseId;
        uint256 amount;
        uint256 dueDate;
        uint256 creationDate;
        bool isPaid;
        string meterReadingStart;
        string meterReadingEnd;
    }
    
    // Events
    event PaymentCreated(string houseId, address payer, uint256 amount, string paymentHash);
    event BillCreated(string billId, string houseId, uint256 amount, uint256 dueDate);
    event BillPaid(string billId, string houseId, address payer, uint256 amount);
    event HouseRegistered(string houseId, address owner);
    
    // Functions
    function registerHouse(string memory _houseId, address _owner) external;
    
    function createBill(
        string memory _billId,
        string memory _houseId,
        uint256 _amount,
        uint256 _dueDate,
        string memory _meterReadingStart,
        string memory _meterReadingEnd
    ) external;
    
    function payBill(string memory _billId, string memory _meterReading) external;
    
    function getHousePayments(string memory _houseId) external view returns (Payment[] memory);
    
    function getHouseCount() external view returns (uint256);
    
    function updateUtilityCompanyAddress(address _newAddress) external;
    
    function updatePaymentToken(address _newTokenAddress) external;
    
    function houseOwners(string memory _houseId) external view returns (address);
    
    function bills(string memory _billId) external view returns (
        string memory billId,
        string memory houseId,
        uint256 amount,
        uint256 dueDate,
        uint256 creationDate,
        bool isPaid,
        string memory meterReadingStart,
        string memory meterReadingEnd
    );
    
    function allHouseIds(uint256 index) external view returns (string memory);
}