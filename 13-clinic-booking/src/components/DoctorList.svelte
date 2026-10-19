<script lang="ts">
  import { DOCTORS } from '../lib/data/doctors'
  import { app, selectDoctor } from '../lib/state.svelte'

  const doctors = $derived(DOCTORS.filter((d) => d.specialty === app.specialty))

  function initials(name: string): string {
    return name
      .replace('Dr. ', '')
      .split(' ')
      .map((part) => part[0])
      .join('')
  }
</script>

<section class="card" aria-labelledby="doctor-heading">
  <h2 id="doctor-heading"><span class="step">2</span> Choose a doctor</h2>
  {#if !app.specialty}
    <p class="empty">Pick a specialty to see our doctors.</p>
  {:else}
    <ul>
      {#each doctors as doctor (doctor.id)}
        <li class:selected={app.doctorId === doctor.id}>
          <span class="avatar" aria-hidden="true">{initials(doctor.name)}</span>
          <div class="info">
            <strong>{doctor.name}</strong>
            <span>{doctor.specialty} · Mon–Fri {doctor.start}–{doctor.end}</span>
          </div>
          <button
            type="button"
            class="btn"
            class:secondary={app.doctorId !== doctor.id}
            aria-pressed={app.doctorId === doctor.id}
            onclick={() => selectDoctor(doctor.id)}
          >
            Choose {doctor.name}
          </button>
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
    gap: 10px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: 12px;
    flex-wrap: wrap;
  }

  li.selected {
    border-color: var(--teal);
    background: var(--sage);
  }

  .avatar {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--teal-soft);
    color: var(--teal-dark);
    font-weight: 700;
    font-size: 0.9rem;
  }

  .info {
    display: grid;
    flex: 1;
    min-width: 160px;
  }

  .info span {
    color: var(--muted);
    font-size: 0.85rem;
  }
</style>
