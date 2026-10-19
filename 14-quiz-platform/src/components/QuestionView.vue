<script setup>
import { computed, ref } from 'vue'
import { useQuizStore } from '../composables/useQuizStore'

const store = useQuizStore()
const confirming = ref(false)

const question = computed(() => store.questions[store.current])
const answer = computed(() => store.answers[store.current])
const isFlagged = computed(() => store.flagged.includes(question.value.id))
const unanswered = computed(() => store.total - store.answeredCount)

const hint = computed(() => {
  switch (question.value.type) {
    case 'multiple':
      return 'Select all that apply'
    case 'boolean':
      return 'True or false'
    case 'numeric':
      return 'Type a number'
    default:
      return 'Choose one answer'
  }
})

function toggleOption(id, checked) {
  const selected = Array.isArray(answer.value) ? [...answer.value] : []
  const next = checked ? [...selected, id] : selected.filter((o) => o !== id)
  store.setAnswer(store.current, next)
}

function requestSubmit() {
  if (unanswered.value > 0) confirming.value = true
  else store.submit()
}

function confirmSubmit() {
  confirming.value = false
  store.submit()
}
</script>

<template>
  <section class="card question" aria-labelledby="question-title">
    <p class="eyebrow">Question {{ store.current + 1 }} of {{ store.total }} &middot; {{ hint }}</p>
    <h2 id="question-title">{{ question.text }}</h2>

    <div v-if="question.type === 'numeric'" class="field">
      <label for="numeric-answer">Your answer</label>
      <input
        id="numeric-answer"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        :value="answer ?? ''"
        @input="store.setAnswer(store.current, $event.target.value)"
      />
    </div>

    <ul v-else class="options">
      <li v-for="option in question.options" :key="option.id">
        <label class="option" :class="{ selected: question.type === 'multiple' ? answer?.includes(option.id) : answer === option.id }">
          <input
            v-if="question.type === 'multiple'"
            type="checkbox"
            :checked="answer?.includes(option.id)"
            @change="toggleOption(option.id, $event.target.checked)"
          />
          <input
            v-else
            type="radio"
            :name="`answer-${question.id}`"
            :checked="answer === option.id"
            @change="store.setAnswer(store.current, option.id)"
          />
          <span v-if="question.type !== 'boolean'" class="option-key">{{ option.id }}</span>
          <span>{{ option.text }}</span>
        </label>
      </li>
    </ul>

    <div class="actions">
      <button type="button" class="btn" :disabled="store.current === 0" @click="store.prev()">Previous</button>
      <button type="button" class="btn" :disabled="store.current === store.total - 1" @click="store.next()">Next</button>
      <button type="button" class="btn btn-flag" :aria-pressed="isFlagged" @click="store.toggleFlag(question.id)">
        Flag for review
      </button>
      <button type="button" class="btn btn-primary push" @click="requestSubmit">Submit quiz</button>
    </div>

    <div v-if="confirming" class="overlay">
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">Submit with unanswered questions?</h2>
        <p>
          You have answered {{ store.answeredCount }} of {{ store.total }} questions. Unanswered questions count as
          incorrect.
        </p>
        <div class="actions">
          <button type="button" class="btn" @click="confirming = false">Keep working</button>
          <button type="button" class="btn btn-primary" @click="confirmSubmit">Submit anyway</button>
        </div>
      </div>
    </div>
  </section>
</template>
