export const APPOINTMENT_CONFIG = {
  // Minimum payment required for appointment request
  MIN_APPOINTMENT_FEE: 10, // 10 HCOIN

  // Maximum wait time for appointment approval (in hours)
  MAX_APPROVAL_WAIT_TIME: 48,

  // Specialization-based fee multipliers
  SPECIALIZATION_FEE_MULTIPLIERS: {
    'General Practice': 1.0,
    'Cardiology': 1.5,
    'Neurology': 1.7,
    'Pediatrics': 1.3,
    'Orthopedics': 1.4,
    'Oncology': 2.0
  } as Record<string, number>,

  // Validation rules
  VALIDATION_RULES: {
    PATIENT_NAME_MIN_LENGTH: 2,
    PATIENT_NAME_MAX_LENGTH: 50,
    MAX_ACTIVE_APPOINTMENTS_PER_PATIENT: 3,
    MAX_PENDING_APPOINTMENTS_PER_DOCTOR: 10
  },

  // Appointment status
  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Refund policies
  REFUND_POLICY: {
    // Refund percentage based on cancellation time
    EARLY_CANCELLATION_REFUND_PERCENTAGE: 80,
    LATE_CANCELLATION_REFUND_PERCENTAGE: 50,
    CANCELLATION_THRESHOLD_HOURS: 24
  }
};

export const validateAppointmentRequest = (requestDetails: {
  patientName: string;
  specialization: string;
  fee: number;
}) => {
  const errors: string[] = [];

  // Validate patient name
  if (
    requestDetails.patientName.length < 2 ||
    requestDetails.patientName.length > 50
  ) {
    errors.push('Patient name must be between 2 and 50 characters');
  }

  // Validate specialization
  const validSpecializations = Object.keys(APPOINTMENT_CONFIG.SPECIALIZATION_FEE_MULTIPLIERS);
  if (!validSpecializations.includes(requestDetails.specialization)) {
    errors.push('Invalid specialization selected');
  }

  // Validate fee
  const feeMultiplier = APPOINTMENT_CONFIG.SPECIALIZATION_FEE_MULTIPLIERS[requestDetails.specialization] || 1;
  const minFee = APPOINTMENT_CONFIG.MIN_APPOINTMENT_FEE * feeMultiplier;
  
  if (requestDetails.fee < minFee) {
    errors.push(`Minimum fee for this specialization is ${minFee} HCOIN`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};