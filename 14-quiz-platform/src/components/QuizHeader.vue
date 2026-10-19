<script setup>
import { useQuizStore } from '../composables/useQuizStore'
import { useTimer } from '../composables/useTimer'

const store = useQuizStore()
const { label } = useTimer()
const { answeredCount } = store
</script>

<template>
  <header class="card quiz-header">
    <div>
      <p class="eyebrow">{{ store.quiz.category }}</p>
      <h1>{{ store.quiz.title }}</h1>
    </div>
    <p class="progress-pill">Answered {{ answeredCount }}/{{ store.total }}</p>
    <p class="timer" role="timer" aria-label="Time remaining">{{ label }}</p>
  </header>
</template>
