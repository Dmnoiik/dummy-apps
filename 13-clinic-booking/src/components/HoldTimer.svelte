<script lang="ts">
  import { HOLD_SECONDS, expireHold, type Hold } from '../lib/state.svelte'

  let { hold }: { hold: Hold } = $props()

  let seconds = $state(HOLD_SECONDS)

  $effect(() => {
    const current = hold
    seconds = current.duration
    setInterval(() => {
      seconds = Math.max(0, seconds - 1)
      if (seconds === 0) expireHold(current)
    }, 1000)
  })

  const mm = $derived(String(Math.floor(seconds / 60)).padStart(2, '0'))
  const ss = $derived(String(seconds % 60).padStart(2, '0'))
</script>

<p class="timer">Held for {mm}:{ss}</p>

<style>
  .timer {
    display: inline-block;
    background: var(--teal-soft);
    color: var(--teal-dark);
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    border-radius: 999px;
    padding: 4px 14px;
    margin-bottom: 14px;
  }
</style>
