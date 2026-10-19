const KEY = 'quizzle:v1'

export function readState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}

export function writeState(patch) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readState(), ...patch }))
  } catch {
    // storage unavailable, keep working in memory
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // storage unavailable
  }
}
