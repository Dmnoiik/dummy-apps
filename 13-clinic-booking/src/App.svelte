<script lang="ts">
  import SpecialtyPicker from './components/SpecialtyPicker.svelte'
  import DoctorList from './components/DoctorList.svelte'
  import MiniCalendar from './components/MiniCalendar.svelte'
  import SlotGrid from './components/SlotGrid.svelte'
  import HoldTimer from './components/HoldTimer.svelte'
  import PatientForm from './components/PatientForm.svelte'
  import Confirmation from './components/Confirmation.svelte'
  import MyAppointments from './components/MyAppointments.svelte'
  import { findDoctor } from './lib/data/doctors'
  import { app, resetDemoData, stopReschedule } from './lib/state.svelte'

  const doctor = $derived(findDoctor(app.doctorId))
  const heldDoctor = $derived(findDoctor(app.hold?.doctorId ?? null))
</script>

<header class="top">
  <div class="brand">
    <span class="logo" aria-hidden="true">+</span>
    <div>
      <h1>Medora Clinic</h1>
      <p>Book a visit in a few steps</p>
    </div>
  </div>
  <button type="button" class="btn secondary" onclick={resetDemoData}>Reset demo data</button>
</header>

<main class="layout">
  <div class="flow">
    {#if app.reschedulingId}
      <div class="banner" role="status">
        <span>Pick a new time for your appointment.</span>
        <button type="button" class="btn secondary" onclick={stopReschedule}>Keep current time</button>
      </div>
    {/if}
    <SpecialtyPicker />
    <DoctorList />
    {#if doctor}
      <div class="pick">
        <MiniCalendar />
        <SlotGrid {doctor} />
      </div>
    {/if}
  </div>

  <aside class="side">
    {#if app.hold && heldDoctor}
      <section class="card hold" aria-label="Your booking">
        <HoldTimer hold={app.hold} />
        <PatientForm hold={app.hold} doctor={heldDoctor} />
      </section>
    {/if}
    <MyAppointments />
  </aside>
</main>

{#if app.confirmation}
  <Confirmation confirmation={app.confirmation} />
{/if}

<style>
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 16px clamp(16px, 4vw, 40px);
    background: var(--surface);
    border-bottom: 1px solid var(--line);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: var(--teal);
    color: #fff;
    font-size: 1.7rem;
    font-weight: 300;
  }

  h1 {
    font-size: 1.25rem;
    letter-spacing: 0.01em;
  }

  .brand p {
    color: var(--muted);
    font-size: 0.85rem;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
    gap: 20px;
    max-width: 1180px;
    margin: 0 auto;
    padding: 24px clamp(16px, 4vw, 40px) 48px;
    align-items: start;
  }

  .flow,
  .side {
    display: grid;
    gap: 20px;
    min-width: 0;
  }

  .pick {
    display: grid;
    grid-template-columns: minmax(0, 300px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    background: var(--amber-soft);
    border: 1px solid #ecd2a4;
    color: #6b3a07;
    border-radius: var(--radius);
    padding: 12px 16px;
  }

  .hold {
    border-color: #9ccfc8;
    background: #fbfefd;
  }

  @media (max-width: 900px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 640px) {
    .pick {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
