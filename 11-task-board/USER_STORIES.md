# Taskline: user stories

Taskline is a single-board Kanban app with the columns Backlog, To Do, In Progress, Review and Done. Every story starts from the demo data: click "Reset demo data" and reload the page.

## US-01: Get an overview of the board

As a team member, I want to see all columns and their cards at a glance so that I know where the work stands.

**Preconditions:** Demo data reset.

**Steps:**
1. Open the app and look at the five columns from left to right.
2. Read the counter in each column header.
3. Look at the cards in the "To Do" column.

**Expected result:**
- The columns are Backlog, To Do, In Progress, Review and Done, in that order.
- The counters show 3, 4, 2/3, 2/4 and 2.
- "To Do" lists "Set up CI pipeline", "Login page", "Write onboarding copy" and "Fix navbar overlap" in that order.

## US-02: Create a card

As a product owner, I want to add a new card so that a new piece of work is captured on the board.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Add card".
2. Enter "Release notes" in "Title".
3. Select "Kasia" in "Assignee" and "High" in "Priority".
4. Click "Save".

**Expected result:**
- The dialog closes and a "Saved" message appears.
- "Release notes" appears at the bottom of the "Backlog" column with the High priority tag and Kasia's avatar.
- The "Backlog" counter shows 4.

## US-03: Edit a card and save with the keyboard

As a developer, I want to change a card's details and save with Ctrl+S so that I do not have to reach for the mouse.

**Preconditions:** Demo data reset.

**Steps:**
1. Click the title "Fix navbar overlap".
2. In the dialog, select "High" in "Priority".
3. Select "Ania" in "Assignee".
4. Press Ctrl+S.

**Expected result:**
- A single "Saved" message appears and the dialog closes.
- "Fix navbar overlap" shows the High priority tag and Ania's avatar.

## US-04: Move a card to another column and keep it after refresh

As a team member, I want to drag a card to a different column so that the board reflects its progress.

**Preconditions:** Demo data reset.

**Steps:**
1. Drag "Fix navbar overlap" from "To Do" onto the "Review" column.
2. Reload the page.

**Expected result:**
- After the drag, "Fix navbar overlap" is in "Review" and "To Do" has three cards.
- After the reload, the card is still in "Review".

## US-05: Put a card further down the list

As a team lead, I want to reorder cards inside a column so that the most urgent work is in the order I choose.

**Preconditions:** Demo data reset.

**Steps:**
1. In "To Do", drag "Set up CI pipeline" and drop it on "Write onboarding copy".
2. Read the order of the cards in "To Do".
3. Drag "Fix navbar overlap" and drop it on "Login page".
4. Read the order of the cards in "To Do" again.

**Expected result:**
- After step 1 the dragged card takes the position that "Write onboarding copy" had: "Login page", "Write onboarding copy", "Set up CI pipeline", "Fix navbar overlap".
- After step 3 "Fix navbar overlap" takes the position that "Login page" had: "Fix navbar overlap", "Login page", "Write onboarding copy", "Set up CI pipeline".

## US-06: Respect the work-in-progress limit

As a team lead, I want a column to refuse cards beyond its limit so that the team does not take on too much work at once.

**Preconditions:** Demo data reset. "In Progress" shows 2/3.

**Steps:**
1. Drag "Set up CI pipeline" onto the "In Progress" column.
2. Drag "Login page" onto the "In Progress" column.
3. Read the "In Progress" counter and its cards.

**Expected result:**
- After step 1 "In Progress" shows 3/3.
- After step 2 a "WIP limit reached" message appears, "Login page" stays in "To Do" and "In Progress" still has exactly 3 cards.

## US-07: Delete a card and change your mind

As a developer, I want to undo a deletion so that an accidental click does not lose work.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Delete" on "Login page". A "Card deleted" message with an "Undo" button appears.
2. Drag "Write onboarding copy" onto the "Review" column.
3. Within 5 seconds of step 1, click "Undo".
4. Read the cards in "To Do" and in "Review".

**Expected result:**
- "Login page" is back in "To Do", between "Set up CI pipeline" and "Fix navbar overlap".
- "Write onboarding copy" stays in "Review", because it was moved after the deletion; "To Do" has three cards.

## US-08: Tidy up the list while reading a checklist

As a developer, I want to keep a checklist open while I remove an unrelated card so that I can continue reading it.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Show checklist" on "Write onboarding copy". The two checklist items appear.
2. Click "Delete" on "Login page".
3. Look at the checklist panels of the cards in "To Do".

**Expected result:**
- The checklist remains open on "Write onboarding copy" and still shows "Draft welcome message" and "Review tone with the team".
- "Fix navbar overlap" keeps its checklist closed, and its button still reads "Show checklist".

## US-09: Review due-date badges

As a project manager, I want each card to show how close its deadline is so that I can spot what needs attention today.

**Preconditions:** Demo data reset.

**Steps:**
1. Find "Login page" in "To Do" and read its due badge.
2. Find "Set up CI pipeline" in "To Do" and read its due badge.
3. Find "Audit accessibility" in "Review" and read its due badge.

**Expected result:**
- "Login page" shows "Due today".
- "Set up CI pipeline" shows "Due in 5 days".
- "Audit accessibility" shows "Overdue".

## US-10: Filter by person and label

As a developer, I want to narrow the board to my own frontend work so that I see only what I need.

**Preconditions:** Demo data reset.

**Steps:**
1. Select "Bartek" in the "Assignee" filter.
2. Note the visible cards.
3. Additionally select "frontend" in the "Label" filter.
4. Note the visible cards.

**Expected result:**
- After step 1 only "Set up CI pipeline" and "Fix navbar overlap" are visible.
- After step 3 only "Fix navbar overlap" is visible, as it is the only card assigned to Bartek and labelled frontend.

## US-11: Find a card by searching

As a team member, I want to search cards by title so that I can jump to the one I remember.

**Preconditions:** Demo data reset.

**Steps:**
1. Type "login" in "Search cards".
2. Note the visible cards.
3. Clear the search and type "onboarding".
4. Note the visible cards.

**Expected result:**
- After step 1 "Login page" is the only visible card.
- After step 3 "Write onboarding copy" is the only visible card.

## US-12: Paste a link as a card title

As a developer, I want to create a card titled with a long URL so that the reference is right on the board.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Add card".
2. Enter `https://example.com/very/long/path/without/any/spaces/at/all/1234567890` in "Title".
3. Click "Save".
4. Look at the new card in "Backlog" and at the columns next to it.

**Expected result:**
- The card stays inside the "Backlog" column, with the URL wrapped over several lines if needed.
- The neighbouring "To Do" column keeps its place and nothing overlaps.

## US-13: Edit several cards one after another

As a developer, I want to update a few cards in a row with Ctrl+S so that I can tidy the board quickly.

**Preconditions:** Demo data reset.

**Steps:**
1. Click the title "Set up CI pipeline", select "Low" in "Priority" and press Ctrl+S.
2. Click the title "Login page", select "Medium" in "Priority" and press Ctrl+S.
3. Click the title "Write onboarding copy", select "Ania" in "Assignee" and press Ctrl+S.
4. Click the title "Fix navbar overlap", select "High" in "Priority" and press Ctrl+S.

**Expected result:**
- Each Ctrl+S shows exactly one "Saved" message and closes the dialog.
- At the end "Set up CI pipeline" is Low, "Login page" is Medium, "Write onboarding copy" is assigned to Ania and "Fix navbar overlap" is High.

## US-14: Reuse a card as a template

As a developer, I want to duplicate a card and adjust its checklist so that I can reuse a similar set of steps.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Duplicate" on "Set up CI pipeline". A card "Set up CI pipeline (copy)" appears below it.
2. Click "Show checklist" on "Set up CI pipeline (copy)".
3. Tick "Add workflow file".
4. Click "Show checklist" on the original "Set up CI pipeline".

**Expected result:**
- The copy shows "Add workflow file" ticked and its progress is 1/3.
- The original keeps all three items unticked and its progress is 0/3.
