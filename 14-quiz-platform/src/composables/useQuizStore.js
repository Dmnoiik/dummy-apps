import { computed, reactive, ref } from 'vue'
import { QUIZZES } from '../data/quizzes'
import { createHistorySeed } from '../data/history-seed'
import { isAnswered, isCorrect, isPassed, scorePercent } from '../lib/scoring'
import { clearState, readState, writeState } from '../lib/storage'
import { useSettings } from './useSettings'
import { useTimer } from './useTimer'

const { settings, resetSettings } = useSettings()
const timer = useTimer()

const phase = ref('catalog')
const quiz = ref(null)
const order = ref([])
const answers = ref([])
const flagged = ref([])
const current = ref(0)
const timedOut = ref(false)
const history = ref(readState().history ?? createHistorySeed())

const questions = computed(() => order.value.map((i) => quiz.value.questions[i]))
const total = computed(() => questions.value.length)
const answeredCount = computed(() => answers.value.filter(isAnswered).length)
const results = computed(() => questions.value.map((q, i) => isCorrect(q, answers.value[i])))
const percent = computed(() => scorePercent(results.value))
const passed = computed(() => isPassed(percent.value, quiz.value?.passMark))
const review = computed(() =>
  questions.value.map((question, i) => {
    const answer = answers.value[order.value[i]]
    return { number: i + 1, question, answer, correct: isCorrect(question, answer) }
  }),
)

function shuffled(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function start(target) {
  const indices = target.questions.map((_, i) => i)
  const ordered = settings.value.shuffle ? shuffled(indices) : indices
  quiz.value = target
  order.value = ordered.slice(0, settings.value.questionCount)
  answers.value = order.value.map(() => null)
  flagged.value = []
  current.value = 0
  timedOut.value = false
  phase.value = 'running'
  timer.start(expire)
}

function retake() {
  start(quiz.value)
}

function setAnswer(index, value) {
  answers.value[index] = value
}

function goTo(index) {
  if (index >= 0 && index < total.value) current.value = index
}

function next() {
  goTo(current.value + 1)
}

function prev() {
  goTo(current.value - 1)
}

function toggleFlag(questionId) {
  const at = flagged.value.indexOf(questionId)
  if (at === -1) flagged.value.push(questionId)
  else flagged.value.splice(at, 1)
}

function submit() {
  if (phase.value !== 'running') return
  phase.value = 'results'
  history.value = [
    {
      id: `attempt-${Date.now()}`,
      quizId: quiz.value.id,
      quizTitle: quiz.value.title,
      percent: percent.value,
      date: new Date().toISOString(),
    },
    ...history.value,
  ]
  writeState({ history: history.value })
}

function expire() {
  if (phase.value !== 'running') return
  timedOut.value = true
  submit()
}

function backToCatalog() {
  phase.value = 'catalog'
}

function resetDemoData() {
  clearState()
  resetSettings()
  history.value = createHistorySeed()
  phase.value = 'catalog'
}

export const store = reactive({
  quizzes: QUIZZES,
  phase,
  quiz,
  questions,
  answers,
  flagged,
  current,
  timedOut,
  history,
  total,
  answeredCount,
  percent,
  passed,
  review,
  start,
  retake,
  setAnswer,
  goTo,
  next,
  prev,
  toggleFlag,
  submit,
  backToCatalog,
  resetDemoData,
})

export function useQuizStore() {
  return store
}
