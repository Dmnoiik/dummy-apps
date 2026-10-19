const WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]

export function validatePesel(p: string): { ok: boolean; birthDate?: string } {
  if (!/^\d{11}$/.test(p)) return { ok: false }

  const digits = p.split('').map(Number)
  const sum = WEIGHTS.reduce((acc, w, i) => acc + w * digits[i], 0)
  if ((10 - (sum % 10)) % 10 !== digits[10]) return { ok: false }

  const year = 1900 + Number(p.slice(0, 2))
  const month = Number(p.slice(2, 4))
  const day = Number(p.slice(4, 6))
  const date = new Date(year, month - 1, day)
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return { ok: false }

  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return { ok: true, birthDate: `${year}-${mm}-${dd}` }
}
