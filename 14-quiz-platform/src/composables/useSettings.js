import { ref, watch } from 'vue'
import { readState, writeState } from '../lib/storage'

const DEFAULTS = { shuffle: false, questionCount: 10 }

const settings = ref({ ...DEFAULTS, ...readState().settings })

watch(settings, (value) => writeState({ settings: value }))

function setShuffle(enabled) {
  settings.value = { ...settings.value, shuffle: enabled }
}

function resetSettings() {
  settings.value = { ...DEFAULTS }
}

export function useSettings() {
  return { settings, setShuffle, resetSettings }
}
