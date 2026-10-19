<script setup>
import { useQuizStore } from '../composables/useQuizStore'

const store = useQuizStore()

function describe(question, answer) {
  if (answer == null || answer === '' || (Array.isArray(answer) && answer.length === 0)) return 'No answer'
  if (question.type === 'numeric') return String(answer)
  const ids = Array.isArray(answer) ? answer : [answer]
  return ids
    .map((id) => {
      const option = question.options.find((o) => o.id === id)
      if (!option) return id
      return question.type === 'boolean' ? option.text : `${option.id}. ${option.text}`
    })
    .join(', ')
}

function describeCorrect(question) {
  return describe(question, question.answer)
}
</script>

<template>
  <section class="results">
    <div class="card score-card" :class="store.passed ? 'is-pass' : 'is-fail'">
      <p class="eyebrow">{{ store.quiz.title }}</p>
      <p v-if="store.timedOut" class="notice">Time is up. Your answers were submitted automatically.</p>
      <p class="score">{{ store.percent }}%</p>
      <p class="verdict-banner">{{ store.passed ? 'Passed' : 'Not passed' }}</p>
      <p class="muted">The pass mark is {{ store.quiz.passMark }}%.</p>
      <div class="actions center">
        <button type="button" class="btn btn-primary" @click="store.retake()">Retake</button>
        <button type="button" class="btn" @click="store.backToCatalog()">Back to catalog</button>
      </div>
    </div>

    <div class="card">
      <h2>Review your answers</h2>
      <ol class="review">
        <li v-for="item in store.review" :key="item.question.id" class="review-item">
          <div class="review-head">
            <h3>{{ item.number }}. {{ item.question.text }}</h3>
            <span class="verdict" :class="item.correct ? 'good' : 'bad'">{{ item.correct ? 'Correct' : 'Incorrect' }}</span>
          </div>
          <p>Your answer: {{ describe(item.question, item.answer) }}</p>
          <p v-if="!item.correct" class="muted small">Right answer: {{ describeCorrect(item.question) }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
