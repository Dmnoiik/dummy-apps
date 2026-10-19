const LETTERS = ['A', 'B', 'C', 'D']

function choice(text, options, answer) {
  return {
    type: Array.isArray(answer) ? 'multiple' : 'single',
    text,
    options: options.map((label, i) => ({ id: LETTERS[i], text: label })),
    answer,
  }
}

function trueFalse(text, answer) {
  return {
    type: 'boolean',
    text,
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    answer: answer ? 'true' : 'false',
  }
}

function numeric(text, answer) {
  return { type: 'numeric', text, options: [], answer }
}

function quiz(id, title, category, icon, description, questions) {
  return {
    id,
    title,
    category,
    icon,
    description,
    passMark: 70,
    questions: questions.map((q, i) => ({ ...q, id: `${id}-${i + 1}` })),
  }
}

export const QUIZZES = [
  quiz('js-basics', 'JavaScript Basics', 'Coding', '🧩', 'Types, arrays and the quirks every beginner trips over.', [
    choice('What does typeof null return?', ['"null"', '"object"', '"undefined"', '"number"'], 'B'),
    choice('Which array method adds an element to the end of an array?', ['push', 'pop', 'shift', 'concat'], 'A'),
    choice('Which of these values are falsy in JavaScript?', ['0', '"0"', 'NaN', '"false"'], ['A', 'C']),
    choice('Which keyword declares a block-scoped variable that cannot be reassigned?', ['var', 'let', 'const', 'static'], 'C'),
    choice('What does Array.prototype.map return?', ['The original array', 'A new array', 'A single value', 'undefined'], 'B'),
    choice('What is the result of "5" + 3?', ['8', '"53"', 'NaN', '"8"'], 'B'),
    numeric('What does 7 / 2 evaluate to?', 3.5),
    choice('Which function turns a JSON string into an object?', ['JSON.stringify', 'JSON.parse', 'JSON.decode', 'Object.from'], 'B'),
    trueFalse('NaN === NaN evaluates to true.', false),
    choice('What happens to Promise.all when one of the promises rejects?', ['It waits for the rest', 'It resolves with undefined', 'It rejects right away', 'It retries the promise'], 'C'),
  ]),
  quiz('space-explorers', 'Space Explorers', 'Science', '🚀', 'Planets, stars and the people who went looking for them.', [
    choice('Which planet is known as the Red Planet?', ['Venus', 'Mars', 'Mercury', 'Neptune'], 'B'),
    choice('Which is the largest planet in our solar system?', ['Saturn', 'Earth', 'Jupiter', 'Uranus'], 'C'),
    choice('Which of these planets are gas giants?', ['Mars', 'Jupiter', 'Venus', 'Saturn'], ['B', 'D']),
    choice('What kind of object is the Sun?', ['A planet', 'A comet', 'A star', 'A moon'], 'C'),
    choice('Which galaxy contains our solar system?', ['Andromeda', 'Triangulum', 'Whirlpool', 'Milky Way'], 'D'),
    trueFalse('Sound travels through the vacuum of space just as it does through air.', false),
    numeric('How many planets orbit the Sun?', 8),
    choice('Who was the first person to walk on the Moon?', ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'John Glenn'], 'C'),
    choice('Which star is closest to the Sun?', ['Sirius', 'Proxima Centauri', 'Betelgeuse', 'Vega'], 'B'),
    choice('A light year is a unit of what?', ['Time', 'Speed', 'Brightness', 'Distance'], 'D'),
  ]),
  quiz('world-capitals', 'World Capitals', 'Geography', '🌍', 'Pick the right capital before the timer runs out.', [
    choice('What is the capital of Australia?', ['Sydney', 'Canberra', 'Melbourne', 'Perth'], 'B'),
    choice('What is the capital of Canada?', ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], 'C'),
    choice('Which of these cities are capitals of South American countries?', ['Lima', 'Madrid', 'Bogota', 'Lisbon'], ['A', 'C']),
    choice('What is the capital of Poland?', ['Warsaw', 'Krakow', 'Gdansk', 'Poznan'], 'A'),
    choice('What is the capital of Japan?', ['Osaka', 'Kyoto', 'Nagoya', 'Tokyo'], 'D'),
    trueFalse('Istanbul is the capital of Turkey.', false),
    numeric('How many countries share a land border with Poland?', 7),
    choice('What is the capital of Egypt?', ['Cairo', 'Alexandria', 'Luxor', 'Giza'], 'A'),
    choice('What is the capital of Brazil?', ['Rio de Janeiro', 'Sao Paulo', 'Brasilia', 'Salvador'], 'C'),
    choice('What is the capital of Norway?', ['Bergen', 'Oslo', 'Stavanger', 'Tromso'], 'B'),
  ]),
]
