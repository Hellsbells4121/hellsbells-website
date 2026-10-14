// Order form on the shop page. Netlify receives the form and emails it to Helen
// (set up under Netlify > Forms > Form notifications). Does not depend on the customer's email app.
(function () {
  var form = document.querySelector('form.order-form');
  if (!form) return;
  var EMAIL = 'hpcreates4121@gmail.com';
  var result = document.getElementById('order-result');
  var btn = form.querySelector('button[type="submit"]');

  // Offer the items that are for sale as suggestions.
  fetch('content/crochet.json').then(function (r) { return r.json(); }).then(function (data) {
    var list = document.getElementById('of-items');
    (data.items || []).forEach(function (it) {
      var st = String(it.status || '').toLowerCase();
      if (st !== 'available' && st !== 'made to order') return;
      var o = document.createElement('option');
      o.value = it.name || '';
      list.appendChild(o);
    });
  }).catch(function () { /* the field still works as free text */ });

  function show(cls, text) {
    result.className = 'order-msg ' + cls;
    result.textContent = text;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    btn.disabled = true;
    show('', 'Sending…');
    var body = new URLSearchParams(new FormData(form)).toString();
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        form.reset();
        show('ok', 'Thank you! Your order has been sent. I will email you soon to confirm.');
      })
      .catch(function () {
        show('err', 'Sorry, that did not send. Please email ' + EMAIL + ' instead.');
      })
      .then(function () { btn.disabled = false; });
  });
})();
