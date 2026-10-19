export function validatePhone(phone: string): boolean {
  return /^\d{9}$/.test(phone.trim())
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
