// Renders album cards from content/music.json
(function () {
  var mount = document.getElementById('music-gallery');
  if (!mount) return;

  fetch('content/music.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var albums = data.albums || [];
      if (!albums.length) return;
      mount.innerHTML = albums.map(function (a, i) {
        var img = a.cover
          ? '<div class="thumb"><img src="' + a.cover + '" alt="' + escapeHtml(a.title) + ' album cover" loading="lazy"></div>'
          : '';
        var links = '';
        if (a.spotify_url) links += '<a href="' + a.spotify_url + '" target="_blank" rel="noopener" style="margin-right:14px;">Spotify →</a>';
        if (a.apple_music_url) links += '<a href="' + a.apple_music_url + '" target="_blank" rel="noopener" style="margin-right:14px;">Apple Music →</a>';
        if (a.youtube_url) links += '<a href="' + a.youtube_url + '" target="_blank" rel="noopener">YouTube →</a>';

        var embed = '';
        var embedUrl = spotifyEmbedUrl(a.spotify_url);
        if (embedUrl) {
          embed = '<iframe style="border-radius:10px; margin-top:14px;" src="' + embedUrl + '" width="100%" height="152" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
        }

        var trackList = '';
        if (a.tracks && a.tracks.length) {
          trackList = '<ul style="list-style:none; padding:0; margin:14px 0 0; border-top:1px solid var(--line);">' +
            a.tracks.map(function (t) {
              var trackLink = t.youtube_url
                ? '<a href="' + t.youtube_url + '" target="_blank" rel="noopener" style="font-size:0.85rem;">YouTube →</a>'
                : '';
              return '<li style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--line); font-size:0.92rem;"><span>' + escapeHtml(t.name) + '</span>' + trackLink + '</li>';
            }).join('') +
          '</ul>';
        }

        return (
          '<div class="card">' +
            img +
            '<div class="tag' + (i % 2 ? ' teal' : '') + '">Album</div>' +
            '<h3>' + escapeHtml(a.title) + '</h3>' +
            '<p class="dim">' + escapeHtml(a.description || '') + '</p>' +
            (links ? '<p style="margin-top:10px;">' + links + '</p>' : '') +
            embed +
            trackList +
          '</div>'
        );
      }).join('');
    })
    .catch(function (err) { console.error('Could not load music content:', err); });

  // Converts a normal open.spotify.com link into its embeddable player form
  function spotifyEmbedUrl(url) {
    if (!url) return null;
    var match = url.match(/open\.spotify\.com\/(album|track|artist|playlist)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    return 'https://open.spotify.com/embed/' + match[1] + '/' + match[2] + '?utm_source=generator&theme=0';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
