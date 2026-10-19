import { findDoctor, type Doctor, type Specialty } from './data/doctors'
import { DAY_MS, addMonths, canCancel, dayKey, parseDayKey, withTime } from './dates'

export interface Patient {
  fullName: string
  pesel: string
  birthDate: string
  phone: string
  email: string
  reason: string
}

export interface Appointment {
  id: string
  doctorId: string
  day: string
  time: string
  patient: Patient
}

export interface Hold {
  doctorId: string
  date: Date
  time: string
  duration: number
}

interface Confirmation {
  appointment: Appointment
  rescheduled: boolean
}

const STORAGE_KEY = 'medora:v1'
export const HOLD_SECONDS = 300

export function slotKey(doctorId: string, day: string, time: string): string {
  return `${doctorId}|${day}|${time}`
}

function seedAppointments(now: Date): Appointment[] {
  return [
    {
      id: 'appt-seed-1',
      doctorId: 'nowak',
      day: dayKey(new Date(now.getTime() + DAY_MS)),
      time: '08:00',
      patient: {
        fullName: 'Jan Kowalski',
        pesel: '85031501234',
        birthDate: '1985-03-15',
        phone: '600123456',
        email: 'jan.kowalski@example.com',
        reason: 'Follow-up after blood pressure check',
      },
    },
  ]
}

function load(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw).appointments as Appointment[]
    const seeded = seedAppointments(new Date())
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ appointments: seeded }))
    return seeded
  } catch {
    return seedAppointments(new Date())
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ appointments: app.appointments }))
  } catch {
    // storage unavailable; state stays in memory
  }
}

export const app = $state({
  specialty: null as Specialty | null,
  doctorId: null as string | null,
  viewDate: new Date(),
  selectedDay: null as Date | null,
  hold: null as Hold | null,
  appointments: load(),
  confirmation: null as Confirmation | null,
  reschedulingId: null as string | null,
})

// Slots that already have a visit, keyed by doctor, day and time.
export const booked = $state(new Set<string>())
for (const a of app.appointments) booked.add(slotKey(a.doctorId, a.day, a.time))

export function appointmentDate(a: Appointment): Date {
  return withTime(parseDayKey(a.day), a.time)
}

export function selectSpecialty(s: Specialty) {
  app.specialty = s
  const current = findDoctor(app.doctorId)
  if (current && current.specialty !== s) app.doctorId = null
}

export function selectDoctor(id: string) {
  app.doctorId = id
}

export function selectDay(d: Date) {
  app.selectedDay = d
  app.viewDate = d
}

export function shiftMonth(n: number) {
  app.viewDate = addMonths(app.viewDate, n)
}

export function holdSlot(doctor: Doctor, date: Date, time: string) {
  app.hold = { doctorId: doctor.id, date, time, duration: HOLD_SECONDS }
}

export function releaseHold() {
  app.hold = null
}

export function expireHold(hold: Hold) {
  if (app.hold === hold) app.hold = null
}

export function startReschedule(id: string) {
  const appt = app.appointments.find((a) => a.id === id)
  const doctor = appt && findDoctor(appt.doctorId)
  if (!appt || !doctor) return
  app.reschedulingId = id
  app.specialty = doctor.specialty
  app.doctorId = doctor.id
  app.viewDate = appointmentDate(appt)
  app.selectedDay = null
  app.hold = null
}

export function stopReschedule() {
  app.reschedulingId = null
  app.hold = null
}

export function book(patient: Patient) {
  const hold = app.hold
  if (!hold) return
  const day = dayKey(hold.date)
  const existing = app.appointments.find((a) => a.id === app.reschedulingId)

  let appointment: Appointment
  if (existing) {
    booked.delete(slotKey(existing.doctorId, existing.day, existing.time))
    existing.doctorId = hold.doctorId
    existing.day = day
    existing.time = hold.time
    existing.patient = patient
    appointment = existing
  } else {
    appointment = {
      id: `appt-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      doctorId: hold.doctorId,
      day,
      time: hold.time,
      patient,
    }
    app.appointments.push(appointment)
  }

  booked.add(slotKey(appointment.doctorId, appointment.day, appointment.time))
  app.confirmation = { appointment: $state.snapshot(appointment), rescheduled: !!existing }
  app.reschedulingId = null
  app.hold = null
  save()
}

export function cancelAppointment(id: string): boolean {
  const index = app.appointments.findIndex((a) => a.id === id)
  if (index < 0) return false
  const appt = app.appointments[index]
  if (!canCancel(appointmentDate(appt), new Date())) return false

  booked.delete(slotKey(appt.doctorId, appt.day, appt.time))
  app.appointments.splice(index, 1)
  if (app.reschedulingId === id) app.reschedulingId = null
  save()
  return true
}

export function closeConfirmation() {
  app.confirmation = null
}

export function resetDemoData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ appointments: seedAppointments(new Date()) }))
  } catch {
    // storage unavailable; the reload below restores the defaults
  }
  location.reload()
}
