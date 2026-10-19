/* Note model: CRUD, tags, search, sorting and trash. */
window.Inkwell = window.Inkwell || {};

Inkwell.util = (function () {
  'use strict';

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function formatDate(ts) {
    var d = new Date(ts);
    return pad(d.getDate()) + '.' + pad(d.getMonth()) + '.' + d.getFullYear() +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function wordCount(text) {
    return text.trim().split(' ').length;
  }

  return {
    formatDate: formatDate,
    wordCount: wordCount
  };
})();

Inkwell.notes = (function () {
  'use strict';

  var state = Inkwell.storage.load();

  function persist() {
    Inkwell.storage.save(state);
  }

  function active() {
    return state.notes.filter(function (n) {
      return !n.trashed;
    });
  }

  function trashed() {
    return state.notes.filter(function (n) {
      return n.trashed;
    });
  }

  function get(id) {
    for (var i = 0; i < state.notes.length; i++) {
      if (state.notes[i].id === id) {
        return state.notes[i];
      }
    }
    return null;
  }

  function create() {
    state.seq += 1;
    var note = {
      id: 'n' + state.seq,
      title: 'Untitled note',
      body: '',
      pinned: false,
      trashed: false,
      modified: Date.now()
    };
    state.notes.unshift(note);
    persist();
    return note;
  }

  function update(id, changes) {
    var note = get(id);
    if (!note) {
      return null;
    }
    for (var key in changes) {
      if (changes.hasOwnProperty(key)) {
        note[key] = changes[key];
      }
    }
    note.modified = Date.now();
    persist();
    return note;
  }

  function setPinned(id, pinned) {
    var note = get(id);
    if (note) {
      note.pinned = pinned;
      persist();
    }
  }

  function trash(id) {
    var note = get(id);
    if (note) {
      note.trashed = true;
      persist();
    }
  }

  function restore(id) {
    var note = get(id);
    if (note) {
      note.trashed = false;
      persist();
    }
  }

  function emptyTrash() {
    for (var i = 0; i < state.notes.length; i++) {
      if (state.notes[i].trashed) {
        state.notes.splice(i, 1);
      }
    }
    persist();
  }

  function extractTags(text) {
    var found = String(text || '').match(/#(\w+)/g) || [];
    var tags = [];
    for (var i = 0; i < found.length; i++) {
      var tag = found[i].slice(1).toLowerCase();
      if (tags.indexOf(tag) === -1) {
        tags.push(tag);
      }
    }
    return tags;
  }

  function allTags() {
    var tags = [];
    active().forEach(function (n) {
      extractTags(n.body).forEach(function (t) {
        if (tags.indexOf(t) === -1) {
          tags.push(t);
        }
      });
    });
    return tags.sort();
  }

  function search(query) {
    var list = active();
    if (!query) {
      return list;
    }
    var re = new RegExp(query, 'i');
    return list.filter(function (n) {
      return re.test(n.title) || re.test(n.body);
    });
  }

  function sort(mode, list) {
    var copy = (list || active()).slice();
    if (mode === 'title') {
      copy.sort(function (a, b) {
        return a.title > b.title ? 1 : -1;
      });
    } else {
      copy.sort(function (a, b) {
        return b.modified - a.modified;
      });
    }
    return copy;
  }

  function reset() {
    state = Inkwell.storage.reset();
  }

  return {
    active: active,
    trashed: trashed,
    get: get,
    create: create,
    update: update,
    setPinned: setPinned,
    trash: trash,
    restore: restore,
    emptyTrash: emptyTrash,
    extractTags: extractTags,
    allTags: allTags,
    search: search,
    sort: sort,
    reset: reset
  };
})();
