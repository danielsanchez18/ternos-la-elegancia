export class AppointmentNotFoundError extends Error {
  constructor() {
    super("Appointment not found");
    this.name = "AppointmentNotFoundError";
  }
}

export class AppointmentCustomerNotFoundError extends Error {
  constructor() {
    super("Customer not found for appointment");
    this.name = "AppointmentCustomerNotFoundError";
  }
}

export class AppointmentSlotUnavailableError extends Error {
  constructor() {
    super("Appointment slot is unavailable");
    this.name = "AppointmentSlotUnavailableError";
  }
}

export class AppointmentOutsideBusinessHoursError extends Error {
  constructor() {
    super("Appointment is outside business hours");
    this.name = "AppointmentOutsideBusinessHoursError";
  }
}

export class AppointmentDeadlineExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppointmentDeadlineExceededError";
  }
}

export class AppointmentTransitionNotAllowedError extends Error {
  constructor() {
    super("Appointment status transition is not allowed");
    this.name = "AppointmentTransitionNotAllowedError";
  }
}

export class AppointmentScheduleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppointmentScheduleValidationError";
  }
}

export class AppointmentSpecialScheduleNotFoundError extends Error {
  constructor() {
    super("Special schedule not found");
    this.name = "AppointmentSpecialScheduleNotFoundError";
  }
}
