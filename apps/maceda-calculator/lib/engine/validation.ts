import { isValid, parseISO } from "date-fns";
import type { MacedaInput, ValidationResult, ValidationError } from "./types";

function isValidIsoDate(s: string): boolean {
  return isValid(parseISO(s));
}

export function validateInput(input: MacedaInput): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input.contractPrice || input.contractPrice <= 0) {
    errors.push({ field: "contractPrice", message: "Contract price must be greater than zero" });
  }
  if (input.downPayment < 0) {
    errors.push({ field: "downPayment", message: "Down payment cannot be negative" });
  }
  if (!input.monthlyInstallment || input.monthlyInstallment <= 0) {
    errors.push({ field: "monthlyInstallment", message: "Monthly installment must be greater than zero" });
  }
  if (!input.contractStartDate || !isValidIsoDate(input.contractStartDate)) {
    errors.push({ field: "contractStartDate", message: "Valid contract start date is required" });
  }
  if (!input.payments || input.payments.length === 0) {
    errors.push({ field: "payments", message: "At least one payment is required" });
  }
  if (input.previousGracePeriod && !input.previousGracePeriodDate) {
    errors.push({ field: "previousGracePeriodDate", message: "Date is required when grace period was previously exercised" });
  }

  return { valid: errors.length === 0, errors };
}
