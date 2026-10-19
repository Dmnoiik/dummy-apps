<script setup>
import { ref, watch } from 'vue'
import { useQuizStore } from './composables/useQuizStore'
import QuizCatalog from './components/QuizCatalog.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import QuizHeader from './components/QuizHeader.vue'
import QuestionView from './components/QuestionView.vue'
import QuestionGrid from './components/QuestionGrid.vue'
import ResultsView from './components/ResultsView.vue'

const store = useQuizStore()
const flaggedOnly = ref(false)

watch(
  () => store.phase,
  () => {
    flaggedOnly.value = false
  },
)
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <a class="brand" href="#" @click.prevent="store.backToCatalog()">
        <span class="brand-mark">Q</span>
        <span class="brand-name">Quizzle</span>
      </a>
      <p class="tagline">Bite-sized quizzes, big bragging rights.</p>
      <button type="button" class="btn btn-ghost" @click="store.resetDemoData()">Reset demo data</button>
    </header>

    <main>
      <div v-if="store.phase === 'catalog'" class="catalog-layout">
        <QuizCatalog />
        <aside class="side-stack">
          <SettingsPanel />
          <HistoryPanel />
        </aside>
      </div>

      <template v-else-if="store.phase === 'running'">
        <QuizHeader />
        <div class="play-layout">
          <QuestionView />
          <aside class="card navigator">
            <h2>Questions</h2>
            <label class="check">
              <input v-model="flaggedOnly" type="checkbox" />
              <span>Show flagged only</span>
            </label>
            <QuestionGrid :flagged-only="flaggedOnly" />
            <ul class="legend">
              <li><span class="swatch swatch-answered"></span>Answered</li>
              <li><span class="swatch swatch-flagged"></span>Flagged</li>
              <li><span class="swatch swatch-current"></span>Current</li>
            </ul>
          </aside>
        </div>
      </template>

      <ResultsView v-else />
    </main>

    <footer class="footer">Quizzle demo &middot; your data stays in this browser</footer>
  </div>
</template>
