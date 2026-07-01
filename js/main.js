// Lantern glow follows the cursor (desktop only, disabled if reduced motion preferred)
(function () {
  var glow = document.getElementById('lantern-glow');
  if (!glow) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  window.addEventListener('mousemove', function (e) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.classList.add('active');
  });
  window.addEventListener('mouseleave', function () {
    glow.classList.remove('active');
  });
})();

// Scatter a handful of firefly particles across the page
(function () {
  var field = document.querySelector('.fireflies');
  if (!field) return;
  var count = window.innerWidth < 640 ? 8 : 16;
  for (var i = 0; i < count; i++) {
    var f = document.createElement('span');
    f.className = 'firefly';
    f.style.left = Math.random() * 100 + 'vw';
    f.style.top = Math.random() * 100 + 'vh';
    f.style.animationDelay = (Math.random() * 14) + 's';
    f.style.animationDuration = (10 + Math.random() * 8) + 's';
    field.appendChild(f);
  }
})();
