<script lang="ts">
  import { findDoctor } from '../lib/data/doctors'
  import { formatDay } from '../lib/dates'
  import { app, appointmentDate, cancelAppointment, startReschedule } from '../lib/state.svelte'

  let blockedId = $state<string | null>(null)

  const sorted = $derived(
    [...app.appointments].sort((a, b) => appointmentDate(a).getTime() - appointmentDate(b).getTime()),
  )

  function cancel(id: string) {
    blockedId = cancelAppointment(id) ? null : id
  }
</script>

<section class="card" aria-labelledby="appointments-heading">
  <h2 id="appointments-heading">My appointments</h2>
  {#if sorted.length === 0}
    <p class="empty">You have no upcoming appointments.</p>
  {:else}
    <ul>
      {#each sorted as appt (appt.id)}
        <li>
          <div class="details">
            <strong>{formatDay(appointmentDate(appt))}, {appt.time}</strong>
            <span>{findDoctor(appt.doctorId)?.name} · {findDoctor(appt.doctorId)?.specialty}</span>
          </div>
          <div class="actions">
            <button type="button" class="btn secondary" onclick={() => startReschedule(appt.id)}>Reschedule</button>
            <button type="button" class="btn danger" onclick={() => cancel(appt.id)}>Cancel appointment</button>
          </div>
          {#if blockedId === appt.id}
            <p class="error" role="alert">Appointments can only be cancelled more than 24 hours in advance</p>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 12px;
  }

  li {
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 12px 14px;
    display: grid;
    gap: 10px;
  }

  .details {
    display: grid;
  }

  .details span {
    color: var(--muted);
    font-size: 0.85rem;
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .actions .btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .error {
    color: var(--danger);
    font-size: 0.85rem;
  }
</style>
