<script lang="ts">
  import { SPECIALTIES } from '../lib/data/doctors'
  import { app, selectSpecialty } from '../lib/state.svelte'
</script>

<section class="card" aria-labelledby="specialty-heading">
  <h2 id="specialty-heading"><span class="step">1</span> Choose a specialty</h2>
  <div class="chips">
    {#each SPECIALTIES as specialty (specialty)}
      <button
        type="button"
        class="chip"
        class:active={app.specialty === specialty}
        aria-pressed={app.specialty === specialty}
        onclick={() => selectSpecialty(specialty)}
      >
        {specialty}
      </button>
    {/each}
  </div>
</section>

<style>
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .chip {
    border: 1px solid var(--line);
    background: var(--sage);
    color: var(--ink);
    border-radius: 999px;
    padding: 8px 18px;
    font-weight: 600;
  }

  .chip:hover {
    border-color: var(--teal);
  }

  .chip.active {
    background: var(--teal);
    border-color: var(--teal);
    color: #fff;
  }
</style>
