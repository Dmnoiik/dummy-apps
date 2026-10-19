<script setup>
import { computed } from 'vue'
import { useQuizStore } from '../composables/useQuizStore'
import { isPassed } from '../lib/scoring'

const store = useQuizStore()

const topScores = computed(() => {
  const scores = store.history.map((attempt) => attempt.percent)
  return scores.sort().reverse().slice(0, 5)
})

const recent = computed(() =>
  [...store.history].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8),
)

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <section class="card" aria-labelledby="history-title">
    <h2 id="history-title">History</h2>

    <h3>Top scores</h3>
    <ol class="top-scores" aria-label="Top scores">
      <li v-for="(score, i) in topScores" :key="i">{{ score }}%</li>
    </ol>

    <h3>Recent attempts</h3>
    <p v-if="recent.length === 0" class="muted small">No attempts yet.</p>
    <ul v-else class="attempts">
      <li v-for="attempt in recent" :key="attempt.id">
        <span class="attempt-title">{{ attempt.quizTitle }}</span>
        <span class="muted small">{{ formatDate(attempt.date) }}</span>
        <span class="attempt-score" :class="isPassed(attempt.percent) ? 'good' : 'bad'">{{ attempt.percent }}%</span>
      </li>
    </ul>
  </section>
</template>
