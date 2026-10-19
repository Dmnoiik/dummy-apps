<script setup>
import { useSettings } from '../composables/useSettings'
import { TIME_LIMIT_SECONDS } from '../composables/useTimer'

const { settings, setShuffle } = useSettings()

const minutes = TIME_LIMIT_SECONDS / 60
</script>

<template>
  <section class="card" aria-labelledby="settings-title">
    <h2 id="settings-title">Settings</h2>
    <div class="field">
      <label for="question-count">Number of questions</label>
      <select id="question-count" v-model.number="settings.questionCount">
        <option :value="5">5</option>
        <option :value="10">10</option>
      </select>
    </div>
    <label class="check">
      <input type="checkbox" :checked="settings.shuffle" @change="setShuffle($event.target.checked)" />
      <span>Shuffle questions</span>
    </label>
    <p class="muted small">Time limit: {{ minutes }} min</p>
  </section>
</template>
