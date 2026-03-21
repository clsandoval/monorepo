import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function encodeWizardData(data: unknown): string {
  return btoa(JSON.stringify(data));
}

export function decodeWizardData<T = unknown>(encoded: string): T {
  return JSON.parse(atob(encoded)) as T;
}
