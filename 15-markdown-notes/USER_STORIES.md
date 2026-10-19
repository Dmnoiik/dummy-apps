# Inkwell Notes: user stories

Inkwell Notes is a Markdown notebook. Every story starts from the demo data: click "Reset demo data" in the header (the notes reload). The left sidebar has "New note", the "Notes" and "Trash" switch, a "Search notes" field, a "Sort by" menu, a "Tags" list, a "Pinned" section and the "Notes" list. Opening a note shows its title, a "Modified" line with a word count, the "Note content" editor and a live "Preview". Changes are saved automatically a moment after typing stops. Dates read DD.MM.YYYY HH:mm.

The demo data holds these notes, all last modified on 12.10.2026 at 10:00:
- "Welcome to Inkwell" (pinned), tag #welcome
- "C++ build notes", tag #dev
- "Łódź trip", tags #podróże and #łódź
- "zebra crossing ideas", no tags
- "Groceries", tag #zakupy
- "Meeting notes", tag #work
- In the trash: "Old draft 1", "Old draft 2", "Old draft 3" and "Old draft 4"

With "Last modified" selected, the "Notes" list reads: "C++ build notes", "Łódź trip", "zebra crossing ideas", "Groceries", "Meeting notes".

## US-01: Write a note with some formatting

As a reader of many books, I want to keep a short reading list with formatting so that it is easy to scan later.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "New note".
2. Replace the title with "Reading list" and press Tab.
3. In "Note content", type the following lines (a blank line between each block):
   `# Reading list`
   `**Dune** and *Solaris*`
   `- Dune`
   `- Solaris`
4. Read the "Preview".
5. Wait one second.

**Expected result:**
- The preview shows "Reading list" as a large heading.
- "Dune" is bold and "Solaris" is italic in the sentence below it.
- Two bullet points, "Dune" and "Solaris", are listed.
- "Reading list" appears first in the "Notes" list, with today's date in its "Modified" line.

## US-02: Write a note about an HTML element

As a front-end developer, I want to write down a layout tip so that I can find it again next week.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "New note".
2. Replace the title with "HTML layout tips" and press Tab.
3. In "Note content", type: `Use the <div> element for layout and the <span> element for inline text.`
4. Read the "Preview".
5. Click "Groceries", then click "HTML layout tips" in the "Notes" list.

**Expected result:**
- The preview shows the whole sentence exactly as typed, including `<div>` and `<span>`.
- After step 5 the editor and the preview show the same sentence again.
- "HTML layout tips" is listed in "Notes".

## US-03: Browse my notes by hashtag

As a traveller who also shops weekly, I want to filter notes by hashtag so that I only see related notes.

**Preconditions:** Demo data reset.

**Steps:**
1. Read the "Tags" list.
2. Click "#zakupy".
3. Click "#zakupy" again.
4. Click "#łódź".
5. Click "#łódź" again.

**Expected result:**
- The "Tags" list shows "#dev", "#podróże", "#welcome", "#work", "#zakupy" and "#łódź".
- After step 2 the lists show only "Groceries".
- After step 3 all notes are listed again.
- After step 4 the lists show only "Łódź trip".
- After step 5 all notes are listed again.

## US-04: Find my build notes by searching

As a developer, I want to search my notes so that I can jump to the one about building C++ projects.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Search notes" and type `C++`.
2. Read the "Notes" list.
3. Clear the field and type `meeting`.
4. Read the "Notes" list.
5. Clear the field.

**Expected result:**
- After step 2 the list shows "C++ build notes".
- After step 4 the list shows "Meeting notes".
- After step 5 all notes are listed again.

## US-05: Sort the list alphabetically

As a person with a mix of English and Polish notes, I want to sort my notes by title so that I can scan them in order.

**Preconditions:** Demo data reset.

**Steps:**
1. In "Sort by", choose "Title A–Z".
2. Read the "Notes" list and the "Pinned" section.
3. In "Sort by", choose "Last modified".

**Expected result:**
- After step 1 the "Notes" list reads: "C++ build notes", "Groceries", "Łódź trip", "Meeting notes", "zebra crossing ideas".
- "Welcome to Inkwell" stays in "Pinned".
- After step 3 the "Notes" list reads again: "C++ build notes", "Łódź trip", "zebra crossing ideas", "Groceries", "Meeting notes".

## US-06: Tidy up after checking a couple of notes

As someone clearing out my notebook, I want to look at a few notes and bin the one I no longer need.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Groceries" in the "Notes" list and read it.
2. Click "Meeting notes" in the "Notes" list and read it.
3. Click "Move to trash".
4. Read the "Notes" list.
5. Click "Trash" in the sidebar.

**Expected result:**
- After step 3 the editor closes and "Select a note or start a new one." is shown.
- The "Notes" list reads: "C++ build notes", "Łódź trip", "zebra crossing ideas", "Groceries". "Welcome to Inkwell" is still in "Pinned".
- The trash lists "Old draft 1", "Old draft 2", "Old draft 3", "Old draft 4" and "Meeting notes".

## US-07: Add an item to my shopping list and move on

As a busy shopper, I want to jot down one more item and move on to my meeting notes without waiting.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Groceries" in the "Notes" list.
2. Click at the end of the text in "Note content", press Enter and type `- Honey`.
3. Click "Meeting notes" in the "Notes" list to check the agenda.
4. Click "Groceries" to look over the list once more, then click "Meeting notes" again.

**Expected result:**
- After step 3 the editor shows "Meeting notes" with its attendees and the three agenda bullets.
- After step 4 "Meeting notes" still reads "Attendees: Ola, Piotr, Kasia" followed by the bullets "Review the roadmap", "Assign owners" and "Book the next sync".
- "Groceries" shows "Oat milk", "Rye bread", "Tomatoes" and "Honey" as bullets.

## US-08: Empty the trash

As someone finished with old drafts, I want to clear the trash for good so that it does not pile up.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Trash" in the sidebar.
2. Read the list.
3. Click "Empty trash".
4. Click "Notes" in the sidebar.

**Expected result:**
- Step 2 lists "Old draft 1", "Old draft 2", "Old draft 3" and "Old draft 4".
- After step 3 the text "The trash is empty." is shown and "Empty trash" is disabled.
- After step 4 the "Notes" list and the "Pinned" section still hold the six notes from the demo data.

## US-09: Keep an eye on the word count

As a writer with a daily word target, I want the word count to follow what I type.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "New note" and read the word count next to "Modified".
2. In "Note content", type `Dune  and   Solaris` (two spaces after "Dune", three after "and").
3. Add a new line and type `Hyperion`.

**Expected result:**
- After step 1 the count reads "0 words".
- After step 2 it reads "3 words".
- After step 3 it reads "4 words".

## US-10: Check when a note was last changed

As a person revisiting my shopping list, I want to see when I last edited it.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Groceries" and read the "Modified" line.
2. In "Note content", add a new line at the end and type `- Honey`.
3. Wait two seconds.
4. Read the "Modified" line and the date under "Groceries" in the "Notes" list.

**Expected result:**
- After step 1 the line reads "Modified 12.10.2026 10:00".
- After step 4 both places show today's date and the current time (hours and minutes) in the format DD.MM.YYYY HH:mm.

## US-11: Pin an important note to the top

As a shopper, I want to pin my shopping list so that it stays at the top of the sidebar.

**Preconditions:** Demo data reset.

**Steps:**
1. In the "Groceries" row of the "Notes" list, click "Pin".
2. Read the "Pinned" section and the "Notes" list.

**Expected result:**
- "Groceries" is listed in "Pinned" together with "Welcome to Inkwell".
- Its button now reads "Unpin".
- The "Notes" list reads: "C++ build notes", "Łódź trip", "zebra crossing ideas", "Meeting notes".

## US-12: Unpin the welcome note

As a returning user, I want to unpin the welcome note so that it no longer sits above my own notes.

**Preconditions:** Demo data reset.

**Steps:**
1. In the "Welcome to Inkwell" row of the "Pinned" section, click "Unpin".
2. Read the sidebar.

**Expected result:**
- The "Pinned" section disappears.
- "Welcome to Inkwell" is listed in "Notes" and its button reads "Pin".

## US-13: Bring a draft back from the trash

As a writer who changed their mind, I want to restore an old draft so that I can keep working on it.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Trash" in the sidebar.
2. In the "Old draft 1" row, click "Restore".
3. Click "Notes" in the sidebar.
4. Click "Old draft 1".

**Expected result:**
- After step 2 "Old draft 1" is gone from the trash, which still lists the other three drafts.
- After step 3 "Old draft 1" is listed in "Notes".
- After step 4 the editor shows "First attempt at the newsletter intro."

## US-14: Export a note as a Markdown file

As a person who keeps backups, I want to download a note as a `.md` file.

**Preconditions:** Demo data reset.

**Steps:**
1. Click "Groceries".
2. Click "Export .md".
3. Open the downloaded file.

**Expected result:**
- A file named `groceries.md` is downloaded.
- Its content is the text shown in "Note content": the heading "# Groceries", the three bullets "Oat milk", "Rye bread" and "Tomatoes", and the line "#zakupy".
