export function isAnswered(answer) {
  if (Array.isArray(answer)) return answer.length > 0
  if (typeof answer === 'string') return answer.trim() !== ''
  return answer != null
}

export function isCorrect(question, answer) {
  if (!isAnswered(answer)) return false
  if (question.type === 'multiple') {
    const selected = [].concat(answer)
    return selected.some((id) => question.answer.includes(id))
  }
  if (question.type === 'numeric') {
    return String(answer).trim() === String(question.answer)
  }
  return answer === question.answer
}

export function scorePercent(results) {
  if (results.length === 0) return 0
  const correct = results.filter(Boolean).length
  return Math.round((correct / results.length) * 100)
}

export function isPassed(percent, passMark = 70) {
  return percent > passMark
}
