<script lang="ts">
  import type { Doctor } from '../lib/data/doctors'
  import { dayKey, formatDay } from '../lib/dates'
  import { generateSlots } from '../lib/slots'
  import { app, booked, holdSlot, slotKey } from '../lib/state.svelte'
  import { slotInteraction } from '../lib/actions/slotInteraction'

  let { doctor }: { doctor: Doctor } = $props()

  const day = $derived(app.selectedDay)
  const slots = $derived(day ? generateSlots(doctor, day) : [])

  function isHeld(time: string): boolean {
    const hold = app.hold
    return !!day && !!hold && hold.doctorId === doctor.id && hold.time === time && dayKey(hold.date) === dayKey(day)
  }
</script>

<section class="card" aria-labelledby="slots-heading">
  <h2 id="slots-heading"><span class="step">4</span> Available times</h2>
  {#if !day}
    <p class="empty">Select a day to see free times with {doctor.name}.</p>
  {:else}
    <p class="when">{doctor.name} · {formatDay(day)}</p>
    {#if slots.length === 0}
      <p class="empty">No appointments available on this day</p>
    {:else}
      <div class="slots">
        {#each slots as time (time)}
          {@const key = slotKey(doctor.id, dayKey(day), time)}
          <div
            class="slot"
            class:booked={booked.has(key)}
            class:held={isHeld(time)}
            use:slotInteraction={{ disabled: booked.has(key), onSelect: () => holdSlot(doctor, day, time) }}
          >
            {time}
          </div>
        {/each}
      </div>
      <ul class="legend">
        <li><span class="swatch free"></span>Free</li>
        <li><span class="swatch held"></span>Held for you</li>
        <li><span class="swatch booked"></span>Booked</li>
      </ul>
    {/if}
  {/if}
</section>

<style>
  .when {
    color: var(--muted);
    font-size: 0.9rem;
    margin-bottom: 12px;
  }

  .slots {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
    gap: 8px;
  }

  .slot {
    text-align: center;
    padding: 9px 0;
    border-radius: 9px;
    background-color: #cfeae6;
    cursor: pointer;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  .slot:hover {
    background-color: #b6ddd7;
  }

  .slot.held {
    background-color: #5eb8ae;
  }

  .slot.booked {
    background-color: #e3e8e8;
    cursor: default;
  }

  .legend {
    list-style: none;
    margin: 14px 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    font-size: 0.8rem;
    color: var(--muted);
  }

  .swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 3px;
    margin-right: 6px;
    vertical-align: -1px;
  }

  .swatch.free {
    background-color: #cfeae6;
  }

  .swatch.held {
    background-color: #5eb8ae;
  }

  .swatch.booked {
    background-color: #e3e8e8;
  }
</style>
