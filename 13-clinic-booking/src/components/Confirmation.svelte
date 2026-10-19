<script lang="ts">
  import { findDoctor } from '../lib/data/doctors'
  import { formatDay } from '../lib/dates'
  import { appointmentDate, closeConfirmation, type Appointment } from '../lib/state.svelte'

  let { confirmation }: { confirmation: { appointment: Appointment; rescheduled: boolean } } = $props()

  const appt = $derived(confirmation.appointment)
  const doctor = $derived(findDoctor(appt.doctorId))
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && closeConfirmation()} />

<div class="backdrop">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-heading">
    <span class="tick" aria-hidden="true">✓</span>
    <h2 id="confirm-heading">{confirmation.rescheduled ? 'Appointment rescheduled' : 'Appointment confirmed'}</h2>
    <p class="lead">A confirmation was sent to {appt.patient.email}.</p>
    <dl>
      <dt>Doctor</dt>
      <dd>{doctor?.name}</dd>
      <dt>When</dt>
      <dd>{formatDay(appointmentDate(appt))}, {appt.time}</dd>
      <dt>Patient</dt>
      <dd>{appt.patient.fullName}</dd>
    </dl>
    <button type="button" class="btn" onclick={closeConfirmation}>Close</button>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(21, 51, 58, 0.45);
    display: grid;
    place-items: center;
    padding: 16px;
    z-index: 10;
  }

  .modal {
    background: var(--surface);
    border-radius: 18px;
    padding: 28px;
    width: min(420px, 100%);
    box-shadow: 0 20px 50px rgba(21, 51, 58, 0.25);
  }

  .tick {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--teal-soft);
    color: var(--teal-dark);
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  h2 {
    font-size: 1.2rem;
  }

  .lead {
    color: var(--muted);
    margin: 4px 0 16px;
    overflow-wrap: anywhere;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 16px;
    margin: 0 0 20px;
  }

  dt {
    color: var(--muted);
  }

  dd {
    margin: 0;
    font-weight: 600;
  }
</style>
