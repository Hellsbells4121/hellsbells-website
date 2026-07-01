// Renders book cards from content/books.json
(function () {
  var mount = document.getElementById('books-gallery');
  if (!mount) return;

  fetch('content/books.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var books = data.books || [];
      if (!books.length) return;
      mount.innerHTML = books.map(function (b, i) {
        var img = b.cover
          ? '<div class="thumb"><img src="' + b.cover + '" alt="' + escapeHtml(b.title) + ' cover" loading="lazy"></div>'
          : '';
        var links = '';
        if (b.amazon_url) links += '<a href="' + b.amazon_url + '" target="_blank" rel="noopener" style="margin-right:14px;">Amazon →</a>';
        if (b.ingramspark_url) links += '<a href="' + b.ingramspark_url + '" target="_blank" rel="noopener">IngramSpark →</a>';
        var byline = b.author ? '<p class="dim" style="font-size:0.85rem; margin:-4px 0 8px;">by ' + escapeHtml(b.author) + '</p>' : '';
        return (
          '<div class="card">' +
            img +
            '<div class="tag' + (i % 2 ? ' teal' : '') + '">Book</div>' +
            '<h3>' + escapeHtml(b.title) + '</h3>' +
            byline +
            '<p class="dim">' + escapeHtml(b.description || '') + '</p>' +
            (links ? '<p style="margin-top:10px;">' + links + '</p>' : '') +
          '</div>'
        );
      }).join('');
    })
    .catch(function (err) { console.error('Could not load books content:', err); });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
