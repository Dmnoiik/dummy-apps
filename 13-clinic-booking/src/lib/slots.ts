import type { Doctor } from './data/doctors'

export const SLOT_MINUTES = 30

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function toTime(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}

/** Whether a slot starting at `start` falls inside the doctor's break. */
export function overlapsBreak(start: string, brk: { from: string; to: string }): boolean {
  const s = toMinutes(start)
  return s > toMinutes(brk.from) && s < toMinutes(brk.to)
}

/** Half-hour start times for one day; weekends are closed. */
export function generateSlots(doctor: Doctor, day: Date): string[] {
  const weekday = day.getDay()
  if (weekday === 0 || weekday === 6) return []

  const brk = { from: doctor.breakFrom, to: doctor.breakTo }
  const end = toMinutes(doctor.end)
  const slots: string[] = []
  let t = toMinutes(doctor.start)
  while (t <= end) {
    const time = toTime(t)
    if (!overlapsBreak(time, brk)) slots.push(time)
    t += SLOT_MINUTES
  }
  return slots
}
