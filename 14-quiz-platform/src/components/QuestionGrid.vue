<script setup>
import { useQuizStore } from '../composables/useQuizStore'
import { isAnswered } from '../lib/scoring'

defineProps({ flaggedOnly: Boolean })

const store = useQuizStore()
</script>

<template>
  <ol class="question-grid">
    <li
      v-for="(question, index) in store.questions"
      v-if="!flaggedOnly || store.flagged.includes(question.id)"
      :key="question.id"
    >
      <button
        type="button"
        class="grid-cell"
        :class="{
          current: index === store.current,
          'is-answered': isAnswered(store.answers[index]),
          flagged: store.flagged.includes(question.id),
        }"
        :aria-label="`Question ${index + 1}`"
        :aria-current="index === store.current ? 'step' : undefined"
        @click="store.goTo(index)"
      >
        {{ index + 1 }}
      </button>
    </li>
  </ol>
</template>
