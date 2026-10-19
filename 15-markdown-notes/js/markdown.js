/* Tiny Markdown renderer: headings, emphasis, lists, links and code. */
window.Inkwell = window.Inkwell || {};

Inkwell.markdown = (function () {
  'use strict';

  function inline(text) {
    return text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  function render(src) {
    var lines = String(src || '').split('\n');
    var out = [];
    var inList = false;
    var inFence = false;
    var para = [];

    function flushPara() {
      if (para.length) {
        out.push('<p>' + inline(para.join(' ')) + '</p>');
        para = [];
      }
    }

    function closeList() {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var m;

      if (/^```/.test(line)) {
        flushPara();
        closeList();
        out.push(inFence ? '</code></pre>' : '<pre><code>');
        inFence = !inFence;
        continue;
      }
      if (inFence) {
        out.push(line + '\n');
        continue;
      }

      if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
        flushPara();
        closeList();
        out.push('<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>');
      } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
        flushPara();
        if (!inList) {
          out.push('<ul>');
          inList = true;
        }
        out.push('<li>' + inline(m[1]) + '</li>');
      } else if (/^\s*$/.test(line)) {
        flushPara();
        closeList();
      } else {
        closeList();
        para.push(line);
      }
    }

    flushPara();
    closeList();
    if (inFence) {
      out.push('</code></pre>');
    }
    return out.join('\n');
  }

  return {
    render: render
  };
})();
