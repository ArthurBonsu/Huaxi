// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HospitalCoin is ERC20("HXLiuCoin", "HLX"), Ownable(msg.sender) {
    // Coin details
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18;  // 10 million tokens
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;  // 1 million initial supply

    // Appointment-specific structures
    struct Appointment {
        address patient;
        address doctor;
        uint256 fee;
        bool isPaid;
        bool isApproved;
    }

    // Mappings
    mapping(address => uint256) public patientAppointmentCount;
    mapping(address => uint256) public doctorConsultationCount;
    mapping(uint256 => Appointment) public appointments;
    uint256 public totalAppointments;

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

   
  constructor() {
    _mint(msg.sender, INITIAL_SUPPLY);
  }


    // Request an appointment
    function requestAppointment(
        address doctor, 
        uint256 appointmentFee
    ) public returns (uint256) {
        // Increment total appointments
        totalAppointments++;

        // Create new appointment
        appointments[totalAppointments] = Appointment({
            patient: msg.sender,
            doctor: doctor,
            fee: appointmentFee,
            isPaid: false,
            isApproved: false
        });

        // Emit event
        emit AppointmentRequested(
            totalAppointments, 
            msg.sender, 
            doctor, 
            appointmentFee
        );

        return totalAppointments;
    }

    // Pay for appointment
    function payForAppointment(uint256 appointmentId) public {
        Appointment storage appointment = appointments[appointmentId];
        
        // Validate appointment
        require(
            appointment.patient == msg.sender, 
            "Only patient can pay for this appointment"
        );
        require(!appointment.isPaid, "Appointment already paid");
        
        // Transfer coins for appointment fee
        require(
            transfer(appointment.doctor, appointment.fee), 
            "Payment transfer failed"
        );

        // Mark as paid
        appointment.isPaid = true;

        // Increment counts
        patientAppointmentCount[msg.sender]++;

        // Emit event
        emit AppointmentPaid(
            appointmentId, 
            msg.sender, 
            appointment.fee
        );
    }

    // Doctor approves appointment
    function approveAppointment(uint256 appointmentId) public {
        Appointment storage appointment = appointments[appointmentId];
        
        // Validate approval
        require(
            appointment.doctor == msg.sender, 
            "Only assigned doctor can approve"
        );
        require(appointment.isPaid, "Appointment must be paid first");
        
        // Mark as approved
        appointment.isApproved = true;
        doctorConsultationCount[msg.sender]++;

        // Emit event
        emit AppointmentApproved(appointmentId, msg.sender);
    }

    // Mint tokens for hospital rewards
    function mintHospitalRewards(
        address recipient, 
        uint256 amount
    ) public onlyOwner {
        require(
            totalSupply() + amount <= MAX_SUPPLY, 
            "Exceeds maximum supply"
        );
        _mint(recipient, amount);
    }

    // Get appointment details
    function getAppointmentDetails(uint256 appointmentId) 
        public 
        view 
        returns (Appointment memory) 
    {
        return appointments[appointmentId];
    }
}
