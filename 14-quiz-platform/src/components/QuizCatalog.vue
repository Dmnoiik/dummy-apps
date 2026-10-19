<script setup>
import { useQuizStore } from '../composables/useQuizStore'
import { useSettings } from '../composables/useSettings'
import { TIME_LIMIT_SECONDS } from '../composables/useTimer'

const store = useQuizStore()
const { settings } = useSettings()

const minutes = TIME_LIMIT_SECONDS / 60
</script>

<template>
  <section class="catalog" aria-labelledby="catalog-title">
    <div class="section-head">
      <h1 id="catalog-title">Pick a quiz</h1>
      <p class="muted">Pass mark is 70%. You have {{ minutes }} minutes per attempt.</p>
    </div>
    <ul class="quiz-cards">
      <li v-for="item in store.quizzes" :key="item.id" class="card quiz-card" :data-category="item.category">
        <span class="quiz-icon" aria-hidden="true">{{ item.icon }}</span>
        <div class="quiz-body">
          <span class="chip">{{ item.category }}</span>
          <h2>{{ item.title }}</h2>
          <p class="muted">{{ item.description }}</p>
          <p class="meta">{{ Math.min(settings.questionCount, item.questions.length) }} questions &middot; {{ minutes }} min</p>
        </div>
        <button type="button" class="btn btn-primary" @click="store.start(item)">Start quiz</button>
      </li>
    </ul>
  </section>
</template>
