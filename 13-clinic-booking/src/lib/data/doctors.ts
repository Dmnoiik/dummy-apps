export type Specialty = 'Cardiology' | 'Dermatology' | 'Pediatrics'

export interface Doctor {
  id: string
  name: string
  specialty: Specialty
  start: string
  end: string
  breakFrom: string
  breakTo: string
}

export const SPECIALTIES: Specialty[] = ['Cardiology', 'Dermatology', 'Pediatrics']

export const DOCTORS: Doctor[] = [
  { id: 'nowak', name: 'Dr. Anna Nowak', specialty: 'Cardiology', start: '08:00', end: '16:00', breakFrom: '12:00', breakTo: '12:30' },
  { id: 'wisniewski', name: 'Dr. Piotr Wiśniewski', specialty: 'Dermatology', start: '09:00', end: '15:00', breakFrom: '12:00', breakTo: '12:30' },
  { id: 'lis', name: 'Dr. Ewa Lis', specialty: 'Dermatology', start: '10:00', end: '18:00', breakFrom: '12:00', breakTo: '12:30' },
  { id: 'zajac', name: 'Dr. Marek Zając', specialty: 'Pediatrics', start: '08:00', end: '14:00', breakFrom: '12:00', breakTo: '12:30' },
]

export function findDoctor(id: string | null): Doctor | undefined {
  return DOCTORS.find((d) => d.id === id)
}
