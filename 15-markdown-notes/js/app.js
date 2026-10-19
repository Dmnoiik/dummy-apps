/* UI wiring for Inkwell Notes. */
(function ($) {
  'use strict';

  var notes = Inkwell.notes;
  var util = Inkwell.util;

  var currentNoteId = null;
  var activeTag = null;
  var saveTimer = null;

  var $search = $('#search');
  var $sort = $('#sort');
  var $tagList = $('#tag-list');
  var $pinnedList = $('#pinned-list');
  var $noteList = $('#note-list');
  var $trashList = $('#trash-list');
  var $title = $('#note-title');
  var $body = $('#note-body');
  var $preview = $('#preview');

  function slug(text) {
    var s = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return s || 'note';
  }

  function buildItem(note) {
    var $li = $('<li class="note-item"></li>').data('id', note.id);
    if (note.id === currentNoteId) {
      $li.addClass('is-current');
    }
    var $open = $('<button type="button" class="note-open"></button>');
    $open.append($('<span class="note-title"></span>').text(note.title));
    $open.append($('<span class="note-date"></span>').text(util.formatDate(note.modified)));
    var $pin = $('<button type="button" class="pin-btn"></button>')
      .attr('data-pinned', note.pinned ? 'true' : 'false')
      .text(note.pinned ? 'Unpin' : 'Pin');
    return $li.append($open, $pin);
  }

  function renderTags() {
    $tagList.empty();
    var tags = notes.allTags();
    if (activeTag && tags.indexOf(activeTag) === -1) {
      activeTag = null;
    }
    tags.forEach(function (tag) {
      var $btn = $('<button type="button" class="tag"></button>').text('#' + tag).attr('data-tag', tag);
      if (tag === activeTag) {
        $btn.addClass('is-active');
      }
      $tagList.append($('<li></li>').append($btn));
    });
  }

  function renderList() {
    $pinnedList.empty();
    $noteList.empty();

    var found = notes.search($search.val());
    if (activeTag) {
      found = found.filter(function (n) {
        return notes.extractTags(n.body).indexOf(activeTag) !== -1;
      });
    }
    var sorted = notes.sort($sort.val(), found);
    var pinnedCount = 0;

    sorted.forEach(function (note) {
      if (note.pinned) {
        pinnedCount++;
        $pinnedList.append(buildItem(note));
      } else {
        $noteList.append(buildItem(note));
      }
    });

    $('#pinned-section').prop('hidden', pinnedCount === 0);
    $('#list-empty').prop('hidden', sorted.length > 0);
  }

  function renderTrash() {
    $trashList.empty();
    var items = notes.trashed();
    items.forEach(function (note) {
      var $li = $('<li class="trash-item"></li>').data('id', note.id);
      $li.append($('<span class="note-title"></span>').text(note.title));
      $li.append($('<button type="button" class="restore-btn">Restore</button>'));
      $trashList.append($li);
    });
    $('#trash-empty').prop('hidden', items.length > 0);
    $('#btn-empty-trash').prop('disabled', items.length === 0);
  }

  function renderAll() {
    renderTags();
    renderList();
    renderTrash();
  }

  function renderEditorMeta(note) {
    $('#note-meta').text('Modified ' + util.formatDate(note.modified));
  }

  function updateCounts() {
    var count = util.wordCount($body.val());
    $('#word-count').text(count + (count === 1 ? ' word' : ' words'));
  }

  function updatePreview() {
    $preview.html(Inkwell.markdown.render($body.val()));
  }

  function showEditor(show) {
    $('#editor').prop('hidden', !show);
    $('#placeholder').prop('hidden', show);
  }

  function closeEditor() {
    currentNoteId = null;
    clearTimeout(saveTimer);
    showEditor(false);
  }

  function openNote(id) {
    var note = notes.get(id);
    if (!note) {
      return;
    }
    currentNoteId = id;
    $title.val(note.title);
    $body.val(note.body);
    renderEditorMeta(note);
    updateCounts();
    updatePreview();
    showEditor(true);
    renderList();

    $(document).on('click', '#btn-trash', function () {
      notes.trash(id);
      if (currentNoteId === id) {
        closeEditor();
      }
      renderAll();
    });
  }

  function scheduleSave() {
    var text = $body.val();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      var note = notes.update(currentNoteId, { body: text });
      if (note) {
        renderEditorMeta(note);
        renderAll();
      }
    }, 800);
  }

  function setView(view) {
    var showTrash = view === 'trash';
    $('#view-notes').toggleClass('is-active', !showTrash);
    $('#view-trash').toggleClass('is-active', showTrash);
    $('#notes-panel').prop('hidden', showTrash);
    $('#trash-panel').prop('hidden', !showTrash);
    if (showTrash) {
      closeEditor();
      renderTrash();
    }
  }

  $('#btn-new').on('click', function () {
    setView('notes');
    var note = notes.create();
    renderAll();
    openNote(note.id);
    $title.trigger('focus');
  });

  $('#view-notes').on('click', function () {
    setView('notes');
  });

  $('#view-trash').on('click', function () {
    setView('trash');
  });

  $search.on('input', renderList);
  $sort.on('change', renderList);

  $tagList.on('click', '.tag', function () {
    var tag = $(this).attr('data-tag');
    activeTag = activeTag === tag ? null : tag;
    renderTags();
    renderList();
  });

  $('.sidebar').on('click', '.note-open', function () {
    openNote($(this).closest('.note-item').data('id'));
  });

  $('.sidebar').on('click', '.pin-btn', function () {
    var $btn = $(this);
    var id = $btn.closest('.note-item').data('id');
    var pinned = $btn.attr('data-pinned');
    notes.setPinned(id, !pinned);
    renderList();
  });

  $trashList.on('click', '.restore-btn', function () {
    notes.restore($(this).closest('.trash-item').data('id'));
    renderAll();
  });

  $('#btn-empty-trash').on('click', function () {
    notes.emptyTrash();
    renderAll();
  });

  $body.on('input', function () {
    updateCounts();
    updatePreview();
    scheduleSave();
  });

  $title.on('change', function () {
    var note = notes.update(currentNoteId, { title: $title.val() || 'Untitled note' });
    if (note) {
      renderEditorMeta(note);
      renderAll();
    }
  });

  $('#btn-export').on('click', function () {
    var note = notes.get(currentNoteId);
    if (!note) {
      return;
    }
    var blob = new Blob([$body.val()], { type: 'text/markdown' });
    var url = URL.createObjectURL(blob);
    var $link = $('<a></a>').attr({ href: url, download: slug(note.title) + '.md' }).appendTo(document.body);
    $link[0].click();
    $link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);
  });

  $('#btn-reset').on('click', function () {
    notes.reset();
    activeTag = null;
    $search.val('');
    closeEditor();
    setView('notes');
    renderAll();
  });

  renderAll();
})(jQuery);
