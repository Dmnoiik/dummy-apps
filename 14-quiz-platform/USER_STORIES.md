# Quizzle: user stories

Quizzle is a quiz platform. The catalog offers three quizzes (JavaScript Basics, Space Explorers, World Capitals), each with 10 questions, a 5 minute time limit and a pass mark of 70%. Every story starts from the demo data: click "Reset demo data" (the page reloads). Unless a story says otherwise, "Shuffle questions" is off and "Number of questions" is 10, so questions appear in the order below.

JavaScript Basics, in order (correct answers in brackets):
1. What does typeof null return? (B, "object")
2. Which array method adds an element to the end of an array? (A, push)
3. Which of these values are falsy in JavaScript? (multiple choice, A and C)
4. Which keyword declares a block-scoped variable that cannot be reassigned? (C, const)
5. What does Array.prototype.map return? (B, A new array)
6. What is the result of "5" + 3? (B, "53")
7. What does 7 / 2 evaluate to? (numeric, 3.5)
8. Which function turns a JSON string into an object? (B, JSON.parse)
9. NaN === NaN evaluates to true. (True or false, False)
10. What happens to Promise.all when one of the promises rejects? (C, It rejects right away)

The demo history holds four earlier attempts: Space Explorers 9% (28 Sep 2026), World Capitals 20% (2 Oct 2026), JavaScript Basics 100% (7 Oct 2026) and Space Explorers 85% (12 Oct 2026).

## US-01: Pick a quiz and start it

As a learner, I want to browse the quizzes and start one so that I can test my knowledge.

**Preconditions:** Demo data reset.

**Steps:**
1. Read the quiz cards under "Pick a quiz".
2. On the "JavaScript Basics" card, click "Start quiz".
3. Read the header and the question.

**Expected result:**
- The catalog lists "JavaScript Basics", "Space Explorers" and "World Capitals", each with a category, a short description and a "Start quiz" button.
- The quiz opens on "Question 1 of 10" with the text "What does typeof null return?" and options A to D.
- The header shows the quiz title, "Answered 0/10" and a timer reading 05:00.
- "Previous" is disabled.
- The "Questions" panel shows buttons "Question 1" to "Question 10", with question 1 marked as the current one.

## US-02: Answer a few questions and follow my progress

As a learner, I want to see how far I have got so that I know how many questions are left.

**Preconditions:** Demo data reset. "JavaScript Basics" started.

**Steps:**
1. On question 1, select option B.
2. Click "Next".
3. On question 2, select option A.
4. Click "Next".
5. On question 3, tick options A and C.
6. Read the header and the "Questions" panel.

**Expected result:**
- The header shows "Answered 3/10".
- In the "Questions" panel the buttons "Question 1", "Question 2" and "Question 3" look different from "Question 4" to "Question 10", which are unanswered.
- "Question 3" is also marked as the current question.
- The timer keeps counting down.

## US-03: Answer a multiple choice question I am unsure about

As a learner, I want to give my best answer to a "select all that apply" question so that I get credit only for what I know.

**Preconditions:** Demo data reset. "JavaScript Basics" started.

**Steps:**
1. Click "Question 3" in the "Questions" panel.
2. Tick options A, B, C and D, because you are not sure which values are falsy.
3. Click "Submit quiz".
4. In the dialog, click "Submit anyway".
5. In "Review your answers", read the entry for question 3.

**Expected result:**
- Question 3 is shown with the hint "Select all that apply" and four checkboxes.
- The result screen shows 0% and "Not passed".
- The entry for question 3 reads "Your answer: A. 0, B. "0", C. NaN, D. "false"" and is marked "Incorrect", because only A and C are right.
- The entry also shows the right answer: "A. 0, C. NaN".

## US-04: Answer a numeric question

As a learner, I want to type a number for a calculation question so that my answer is checked.

**Preconditions:** Demo data reset. "JavaScript Basics" started.

**Steps:**
1. Click "Question 7" in the "Questions" panel.
2. Type "3.50" in "Your answer".
3. Click "Next" and then "Previous" to return to question 7.
4. Click "Submit quiz", then "Submit anyway".
5. In "Review your answers", read the entry for question 7.

**Expected result:**
- The typed value is still in "Your answer" after returning to question 7.
- Question 7 is counted as answered.
- The entry for question 7 reads "Your answer: 3.50" and is marked "Correct", since 3.50 is the same number as 3.5.
- The score is 10%.

## US-05: Flag questions and look at them again

As a learner, I want to mark questions I am unsure about so that I can come back to them before I submit.

**Preconditions:** Demo data reset. "JavaScript Basics" started.

**Steps:**
1. Click "Question 2" in the "Questions" panel, then click "Flag for review".
2. Click "Question 5", then click "Flag for review".
3. Tick "Show flagged only".
4. Click the "Question 5" button.
5. Untick "Show flagged only".

**Expected result:**
- After steps 1 and 2 the buttons for questions 2 and 5 show a flag marker.
- With "Show flagged only" ticked, the "Questions" panel lists only "Question 2" and "Question 5".
- Clicking "Question 5" opens question 5 ("What does Array.prototype.map return?").
- With the box unticked, all ten question buttons are listed again, the two flagged ones still marked.

## US-06: Take a quiz and see whether I passed

As a learner, I want to finish a quiz and see my result so that I know how I did.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Start quiz" on "JavaScript Basics".
2. Answer questions 1 to 7 and leave 8 to 10 empty: question 1 B, question 2 A, question 3 A and C, question 4 C, question 5 B, question 6 B, question 7 "3.5".
3. Click "Submit quiz".
4. In the dialog, click "Submit anyway".
5. Read the result screen.

**Expected result:**
- The confirmation dialog says you have answered 7 of 10 questions.
- The result screen shows 70% and the label "Passed", with the note that the pass mark is 70%.
- "Review your answers" lists all 10 questions: questions 1 to 7 are marked "Correct" and questions 8 to 10 are marked "Incorrect" with "Your answer: No answer".
- "Retake" and "Back to catalog" buttons are available.

## US-07: Review my answers after a shuffled quiz

As a learner, I want the questions in a random order so that I don't just memorise the sequence, and then go through the review to learn from my mistakes.

**Preconditions:** Demo data reset.

**Steps:**
1. Tick "Shuffle questions" in "Settings".
2. Click "Start quiz" on "JavaScript Basics".
3. Answer each question as it appears, using this table (the order differs from run to run), clicking "Next" between questions:
   - "What does typeof null return?": B
   - "Which array method adds an element to the end of an array?": A
   - "Which of these values are falsy in JavaScript?": A and C
   - "Which keyword declares a block-scoped variable that cannot be reassigned?": C
   - "What does Array.prototype.map return?": B
   - "What is the result of "5" + 3?": B
   - "What does 7 / 2 evaluate to?": 3.5
   - "Which function turns a JSON string into an object?": B
   - "NaN === NaN evaluates to true.": False
   - "What happens to Promise.all when one of the promises rejects?": C
4. Click "Submit quiz".
5. Read the score and scroll through "Review your answers".

**Expected result:**
- The questions are not in the order of the table above.
- The header shows "Answered 10/10" once all ten are answered and no confirmation dialog appears on submit.
- The score is 100% and the label is "Passed".
- Every question in the review is marked "Correct", and each "Your answer" line shows the answer you gave to that question.

## US-08: Retake a quiz

As a learner, I want to try the same quiz again so that I can improve my score.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Start quiz" on "JavaScript Basics".
2. Click "Submit quiz", then "Submit anyway".
3. Click "Retake".
4. Note the timer, wait about 10 seconds, and read the timer again.

**Expected result:**
- After "Retake" the quiz opens on question 1 with all answers cleared, the header shows "Answered 0/10" and the timer reads 05:00.
- About 10 seconds later the timer reads about 04:50, counting down one second per second.
- Submitting the retake adds a new entry to the history.

## US-09: Remember my settings

As a learner, I want my quiz settings to be remembered so that I do not have to set them every time.

**Preconditions:** Demo data reset. Catalog open.

**Steps:**
1. In "Settings", tick "Shuffle questions".
2. Select 5 in "Number of questions".
3. Reload the page.
4. Read "Settings".
5. Click "Start quiz" on "JavaScript Basics".

**Expected result:**
- After the reload "Shuffle questions" is ticked and "Number of questions" shows 5.
- The quiz opens on "Question 1 of 5" and the header shows "Answered 0/5".
- The "Questions" panel lists "Question 1" to "Question 5".

## US-10: Check my history and best scores

As a learner, I want to see my earlier attempts and best scores so that I can track my progress.

**Preconditions:** Demo data reset. Catalog open.

**Steps:**
1. Find "History" below "Settings".
2. Read "Top scores".
3. Read "Recent attempts".

**Expected result:**
- "Top scores" lists the scores from best to worst: 100%, 85%, 20%, 9%.
- "Recent attempts" lists the newest first: Space Explorers 85% (12 Oct 2026), JavaScript Basics 100% (7 Oct 2026), World Capitals 20% (2 Oct 2026), Space Explorers 9% (28 Sep 2026).
- Scores of 70% and above are shown in green, lower ones in red.

## US-11: Run out of time

As a learner, I want the quiz to end when time is up so that every attempt has the same limit.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Start quiz" on "Space Explorers".
2. Select option B on question 1 ("Which planet is known as the Red Planet?").
3. Leave the page open without further input and watch the timer until it reaches 00:00 (5 minutes).

**Expected result:**
- The timer counts down from 05:00 once per second.
- When it reaches 00:00 the result screen opens by itself with the note "Time is up. Your answers were submitted automatically."
- The score is 10% with the label "Not passed", and the review shows question 1 as "Correct" and the others as "Incorrect".

## US-12: Submit before answering everything

As a learner, I want a warning before I hand in an unfinished quiz so that I do not submit by accident.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Start quiz" on "World Capitals".
2. Select option B on question 1 and click "Next".
3. Select option C on question 2.
4. Click "Submit quiz".
5. Click "Keep working".
6. Click "Submit quiz" again and then "Submit anyway".

**Expected result:**
- At step 4 a dialog titled "Submit with unanswered questions?" appears and says you have answered 2 of 10 questions.
- "Keep working" closes the dialog and returns to question 2 with the answers intact.
- "Submit anyway" opens the result screen with 20% and the label "Not passed".
- The new attempt appears under "Recent attempts" after you click "Back to catalog".

## US-13: Move between questions

As a learner, I want to move back and forth through the quiz so that I can answer in my own order.

**Preconditions:** Demo data reset. "Space Explorers" started.

**Steps:**
1. Click "Next" twice.
2. Click "Previous" once.
3. Click "Question 10" in the "Questions" panel.
4. Read the buttons at the bottom of the question.
5. Click "Question 1".

**Expected result:**
- After step 1 the eyebrow reads "Question 3 of 10", after step 2 "Question 2 of 10".
- Step 3 opens question 10 ("A light year is a unit of what?") and "Next" is disabled.
- Step 5 opens question 1 and "Previous" is disabled.
- The current question is always the one outlined in the "Questions" panel.
