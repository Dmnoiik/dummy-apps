import { computed, ref } from 'vue'

export const TIME_LIMIT_SECONDS = 300

const remaining = ref(TIME_LIMIT_SECONDS)

const label = computed(() => {
  const minutes = Math.floor(remaining.value / 60)
  const seconds = remaining.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function start(onExpire) {
  remaining.value = TIME_LIMIT_SECONDS
  setInterval(() => {
    if (remaining.value > 0) {
      remaining.value -= 1
      if (remaining.value === 0) onExpire()
    }
  }, 1000)
}

export function useTimer() {
  return { remaining, label, start }
}
