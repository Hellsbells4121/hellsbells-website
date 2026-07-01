// Renders crochet gallery items from content/crochet.json
(function () {
  var mount = document.getElementById('crochet-gallery');
  if (!mount) return;

  fetch('content/crochet.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var items = data.items || [];
      if (!items.length) return;
      mount.innerHTML = items.map(function (item) {
        var img = item.image
          ? '<div class="thumb"><img src="' + item.image + '" alt="' + escapeHtml(item.name) + '" loading="lazy"></div>'
          : '<div class="thumb" style="display:flex;align-items:center;justify-content:center;"><span class="dim" style="font-size:0.8rem;">Photo coming soon</span></div>';
        var statusTag = item.status
          ? '<div class="tag' + (item.status.toLowerCase() === 'sold' ? '' : ' teal') + '">' + escapeHtml(item.status) + '</div>'
          : '';
        var price = item.price ? '<p style="color:var(--copper-bright); font-weight:700; margin:4px 0 6px;">' + escapeHtml(item.price) + '</p>' : '';
        return (
          '<div class="card" style="padding:10px;">' +
            img +
            '<div style="padding:12px 4px 0;">' +
              statusTag +
              '<h3>' + escapeHtml(item.name) + '</h3>' +
              price +
              '<p class="dim">' + escapeHtml(item.description || '') + '</p>' +
            '</div>' +
          '</div>'
        );
      }).join('');
    })
    .catch(function (err) { console.error('Could not load crochet content:', err); });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
