// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract HospitalCoin is ERC20("HXLiuCoin", "HLX"), Ownable, ReentrancyGuard {
  
    // Coin details
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18;  // 10 million tokens
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;  // 1 million initial supply

  constructor() {
        _mint(msg.sender, INITIAL_SUPPLY); // Owner is auto-set to deployer
    }
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

    // Hospital fee mechanism
    uint256 public hospitalFeePercentage = 200; // 2.00% (percentage * 100)
    address public feeCollector;

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
    event FeeCollectorUpdated(address newFeeCollector);
    event FeePercentageUpdated(uint256 newPercentage);

   
    // Burn tokens from caller's address
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    // Owner can burn tokens from any address (requires approval)
    function burnFrom(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }

    // Set fee collector address
    function setFeeCollector(address _feeCollector) public onlyOwner {
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(_feeCollector);
    }

    // Set hospital fee percentage
    function setHospitalFeePercentage(uint256 _feePercentage) public onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%"); // Safety limit
        hospitalFeePercentage = _feePercentage;
        emit FeePercentageUpdated(_feePercentage);
    }

    // Request an appointment
    function requestAppointment(
        address doctor, 
        uint256 appointmentFee
    ) public nonReentrant returns (uint256) {
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

    // Pay for appointment with fee mechanism
    function payForAppointment(uint256 appointmentId) public nonReentrant {
        Appointment storage appointment = appointments[appointmentId];
        
        // Validate appointment
        require(
            appointment.patient == msg.sender, 
            "Only patient can pay for this appointment"
        );
        require(!appointment.isPaid, "Appointment already paid");
        
        // Calculate hospital fee
        uint256 hospitalFee = (appointment.fee * hospitalFeePercentage) / 10000;
        uint256 doctorPayment = appointment.fee - hospitalFee;
        
        // Transfer coins for doctor fee
        require(
            transfer(appointment.doctor, doctorPayment), 
            "Doctor payment transfer failed"
        );
        
        // Transfer hospital fee if fee collector is set
        if (feeCollector != address(0) && hospitalFee > 0) {
            require(
                transfer(feeCollector, hospitalFee),
                "Hospital fee transfer failed"
            );
        }

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
    function approveAppointment(uint256 appointmentId) public nonReentrant {
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
    ) public onlyOwner nonReentrant {
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

    // Emergency token recovery (in case tokens get stuck)
    function recoverERC20(address tokenAddress, uint256 tokenAmount) public onlyOwner nonReentrant {
        IERC20(tokenAddress).transfer(owner(), tokenAmount);
    }
}