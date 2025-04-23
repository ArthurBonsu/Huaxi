// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IHospitalCoin is IERC20 {
    // Structs
    struct Appointment {
        address patient;
        address doctor;
        uint256 fee;
        bool isPaid;
        bool isApproved;
    }
    
    // Constants
    function MAX_SUPPLY() external view returns (uint256);
    function INITIAL_SUPPLY() external view returns (uint256);
    
    // State variables
    function patientAppointmentCount(address patient) external view returns (uint256);
    function doctorConsultationCount(address doctor) external view returns (uint256);
    function appointments(uint256 appointmentId) external view returns (
        address patient,
        address doctor,
        uint256 fee,
        bool isPaid,
        bool isApproved
    );
    function totalAppointments() external view returns (uint256);
    
    // Functions
    function requestAppointment(address doctor, uint256 appointmentFee) external returns (uint256);
    function payForAppointment(uint256 appointmentId) external;
    function approveAppointment(uint256 appointmentId) external;
    function mintHospitalRewards(address recipient, uint256 amount) external;
    function getAppointmentDetails(uint256 appointmentId) external view returns (Appointment memory);
    
    // Events
    event AppointmentRequested(
        uint256 indexed appointmentId, 
        address indexed patient, 
        address indexed doctor, 
        uint256 fee
    );
    event AppointmentPaid(
        uint256 indexed appointmentId, 
        address patient, 
        uint256 amount
    );
    event AppointmentApproved(
        uint256 indexed appointmentId, 
        address doctor
    );
}