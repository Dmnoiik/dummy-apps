<script lang="ts">
  import { MONTHS, isSameDay, startOfDay } from '../lib/dates'
  import { app, selectDay, shiftMonth } from '../lib/state.svelte'

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const year = $derived(app.viewDate.getFullYear())
  const month = $derived(app.viewDate.getMonth())

  const cells = $derived.by(() => {
    const leading = (new Date(year, month, 1).getDay() + 6) % 7
    const count = new Date(year, month + 1, 0).getDate()
    const days: (Date | null)[] = Array.from({ length: leading }, () => null)
    for (let d = 1; d <= count; d++) days.push(new Date(year, month, d))
    return days
  })

  const today = $derived(startOfDay(new Date()))
</script>

<section class="card" aria-labelledby="calendar-heading">
  <h2><span class="step">3</span> Pick a day</h2>
  <div class="nav">
    <button type="button" class="btn secondary" aria-label="Previous month" onclick={() => shiftMonth(-1)}>‹</button>
    <h3 id="calendar-heading" aria-live="polite">{MONTHS[month]} {year}</h3>
    <button type="button" class="btn secondary" aria-label="Next month" onclick={() => shiftMonth(1)}>›</button>
  </div>
  <div class="grid">
    {#each weekdays as name (name)}
      <span class="weekday">{name}</span>
    {/each}
    {#each cells as date, i (i)}
      {#if date}
        <button
          type="button"
          class="day"
          class:selected={app.selectedDay !== null && isSameDay(app.selectedDay, date)}
          class:today={isSameDay(today, date)}
          disabled={date < today}
          onclick={() => selectDay(date)}
        >
          {date.getDate()}
        </button>
      {:else}
        <span></span>
      {/if}
    {/each}
  </div>
</section>

<style>
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .nav .btn {
    padding: 4px 12px;
    font-size: 1.1rem;
    line-height: 1.2;
  }

  h3 {
    font-size: 1rem;
    font-weight: 650;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
  }

  .weekday {
    text-align: center;
    font-size: 0.72rem;
    color: var(--muted);
    padding-bottom: 4px;
  }

  .day {
    aspect-ratio: 1;
    min-height: 32px;
    border: 1px solid transparent;
    border-radius: 9px;
    background: transparent;
    color: var(--ink);
    font-size: 0.9rem;
  }

  .day:hover:not(:disabled) {
    background: var(--teal-soft);
  }

  .day:disabled {
    color: #a9bcbc;
    cursor: default;
  }

  .day.today {
    border-color: var(--teal);
  }

  .day.selected {
    background: var(--teal);
    color: #fff;
  }
</style>
