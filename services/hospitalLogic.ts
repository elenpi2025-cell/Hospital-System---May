/**
 * This service simulates the backend logic for the 4 sub-agents.
 * In a real app, these would be API calls to the hospital's database.
 */

// --- Mock Data ---
const MOCK_PATIENTS = [
  { id: 'P-1024', name: 'John Doe', dob: '1985-04-12', address: '123 Maple Ave' },
  { id: 'P-9921', name: 'Jane Smith', dob: '1992-08-23', address: '456 Oak Ln' },
];

const MOCK_APPOINTMENTS = [
  { id: 'APT-55', patient: 'John Doe', date: '2023-11-15', time: '10:00 AM', doctor: 'Dr. Emily Chen' },
];

// --- Sub-Agent Logic ---

export const patientInformationHandler = (action: string, details: any): string => {
  console.log(`[PIH] Action: ${action}`, details);
  
  if (action === 'register') {
    const newId = `P-${Math.floor(Math.random() * 10000)}`;
    return JSON.stringify({
      status: 'success',
      message: 'Patient registered successfully.',
      patientId: newId,
      details: details
    });
  } else if (action === 'get') {
    const patient = MOCK_PATIENTS.find(p => p.name.toLowerCase().includes(details?.name?.toLowerCase()));
    if (patient) {
      return JSON.stringify({ status: 'found', data: patient });
    }
    return JSON.stringify({ status: 'not_found', message: 'Patient not found in registry.' });
  } else if (action === 'update') {
    return JSON.stringify({ status: 'success', message: 'Patient details updated.', changes: details });
  }
  return JSON.stringify({ status: 'error', message: 'Unknown PIH action.' });
};

export const appointmentScheduler = (action: string, details: any): string => {
  console.log(`[AS] Action: ${action}`, details);

  if (action === 'check_availability') {
    return JSON.stringify({
      status: 'available',
      slots: ['Mon 10:00 AM', 'Mon 2:00 PM', 'Tue 9:00 AM', 'Wed 11:30 AM']
    });
  } else if (action === 'schedule') {
    return JSON.stringify({
      status: 'confirmed',
      appointmentId: `APT-${Math.floor(Math.random() * 1000)}`,
      details: details,
      note: 'Confirmation email sent.'
    });
  } else if (action === 'reschedule') {
     return JSON.stringify({
      status: 'rescheduled',
      oldAppointment: 'Previous Slot',
      newAppointment: details,
      message: 'Appointment moved successfully.'
    });
  } else if (action === 'cancel') {
    return JSON.stringify({ status: 'cancelled', appointmentId: details.appointmentId || 'Unknown' });
  }
  return JSON.stringify({ status: 'error', message: 'Unknown AS action.' });
};

export const medicalRecordsAssistant = (action: string, patientName: string): string => {
  console.log(`[MRA] Action: ${action}, Patient: ${patientName}`);
  
  // Simulate a privacy check or record retrieval
  if (action === 'get_summary') {
    return JSON.stringify({
      patient: patientName,
      history: 'Hypertension (diagnosed 2019), Type 2 Diabetes (managed).',
      recentVisits: ['2023-10-01: Routine Checkup', '2023-08-15: Lab Work'],
      allergies: 'Penicillin'
    });
  } else if (action === 'generate_document') {
    return JSON.stringify({
      status: 'generated',
      docType: 'Medical Report PDF',
      url: 'http://hospital-sys.internal/docs/report-2921.pdf', // Mock URL
      content_preview: `MEDICAL REPORT FOR ${patientName.toUpperCase()}... [Confidential]`
    });
  }
  return JSON.stringify({ status: 'error', message: 'Unknown MRA action.' });
};

export const billingSupport = (queryType: string, details: any): string => {
  console.log(`[BIS] Query: ${queryType}`, details);

  if (queryType === 'check_bill') {
    return JSON.stringify({
      status: 'outstanding',
      amount: '$150.00',
      dueDate: '2023-11-30',
      items: ['Consultation - $100', 'Lab Fee - $50']
    });
  } else if (queryType === 'insurance') {
    return JSON.stringify({
      status: 'active',
      provider: 'BlueCross',
      copay: '$20.00',
      coverage: '80% on specialist visits.'
    });
  }
  return JSON.stringify({ 
    status: 'info', 
    message: 'Billing department is open Mon-Fri 9AM-5PM. Payment plans are available for bills over $500.' 
  });
};