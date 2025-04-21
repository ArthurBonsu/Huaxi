interface ITransactionContract {
    // Events
    event TransactionProposed(bytes32 indexed transactionHash, address indexed proposer);
    event TransactionApproved(bytes32 indexed transactionHash, address indexed approver);
    event TransactionRejected(bytes32 indexed transactionHash, address indexed rejecter);
    event TransactionExecuted(bytes32 indexed transactionHash, address indexed executor);
    event TransactionStatusUpdated(bytes32 indexed transactionHash, string status);

    // Functions
    function proposeTransaction(address to, uint256 value, bytes memory data, uint256 threshold) external;
    function approveTransaction(bytes32 transactionHash) external;
    function rejectTransaction(bytes32 transactionHash) external;
    function executeTransaction(bytes32 transactionHash) external;
    function updateTransactionStatus(bytes32 transactionHash, string memory status) external;
    function storeTransaction(bytes32 transactionHash, address to, uint256 value, bytes memory data, uint256 threshold) external;
    function getAllTransactions() external view returns (bytes32[] memory);
    function isTxnExecutable(bytes32 transactionHash) external view returns (bool);
    function checkIsSigned(bytes32 transactionHash) external view returns (bool);
    function checkIfTxnExecutable(bytes32 transactionHash) external view returns (bool);
    function refetch(bytes32 transactionHash) external;
}