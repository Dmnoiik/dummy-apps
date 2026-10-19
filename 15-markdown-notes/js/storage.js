/* Persistence layer: keeps the notebook in localStorage. */
window.Inkwell = window.Inkwell || {};

Inkwell.storage = (function () {
  'use strict';

  var KEY = 'inkwell:v1';

  function seed() {
    var modified = new Date(2026, 9, 12, 10, 0).getTime();
    return {
      seq: 10,
      notes: [
        {
          id: 'n1',
          title: 'Welcome to Inkwell',
          body: '# Welcome to Inkwell\n\nInkwell is a quiet place for your notes. Write in **Markdown** on the left and read the *preview* on the right.\n\n- Pin a note to keep it on top\n- Tag notes with hashtags\n- Export any note as a `.md` file\n\n#welcome',
          pinned: true,
          trashed: false,
          modified: modified
        },
        {
          id: 'n2',
          title: 'C++ build notes',
          body: '# C++ build notes\n\nCompile with `g++ -std=c++17 main.cpp -o app`.\n\n- Turn on -Wall and -Wextra\n- Link pthread when using threads\n- Keep the C++ templates in headers\n\n#dev',
          pinned: false,
          trashed: false,
          modified: modified
        },
        {
          id: 'n3',
          title: 'Łódź trip',
          body: 'A weekend in Łódź: walk along Piotrkowska Street, see the Manufaktura complex and the Poznański Palace.\n\n#podróże #łódź',
          pinned: false,
          trashed: false,
          modified: modified
        },
        {
          id: 'n4',
          title: 'zebra crossing ideas',
          body: 'Ideas for the zebra crossing mural near the school:\n\n- Rainbow stripes\n- Reflective paint\n- Ask the neighbours to help',
          pinned: false,
          trashed: false,
          modified: modified
        },
        {
          id: 'n5',
          title: 'Groceries',
          body: '# Groceries\n\n- Oat milk\n- Rye bread\n- Tomatoes\n\n#zakupy',
          pinned: false,
          trashed: false,
          modified: modified
        },
        {
          id: 'n6',
          title: 'Meeting notes',
          body: '# Meeting notes\n\nAttendees: Ola, Piotr, Kasia\n\n- Review the roadmap\n- Assign owners\n- Book the next sync\n\n#work',
          pinned: false,
          trashed: false,
          modified: modified
        },
        {
          id: 'n7',
          title: 'Old draft 1',
          body: 'First attempt at the newsletter intro.',
          pinned: false,
          trashed: true,
          modified: modified
        },
        {
          id: 'n8',
          title: 'Old draft 2',
          body: 'Outline for the garden article.',
          pinned: false,
          trashed: true,
          modified: modified
        },
        {
          id: 'n9',
          title: 'Old draft 3',
          body: 'Quotes to use in the speech.',
          pinned: false,
          trashed: true,
          modified: modified
        },
        {
          id: 'n10',
          title: 'Old draft 4',
          body: 'Rough list of book titles.',
          pinned: false,
          trashed: true,
          modified: modified
        }
      ]
    };
  }

  function load() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(KEY);
    } catch (e) {
      raw = null;
    }
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // fall through to the starter notes
      }
    }
    return seed();
  }

  function save(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // storage unavailable; keep working in memory
    }
  }

  function reset() {
    try {
      window.localStorage.removeItem(KEY);
    } catch (e) {
      // nothing to clear
    }
    return seed();
  }

  return {
    load: load,
    save: save,
    reset: reset
  };
})();
