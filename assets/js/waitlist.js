/* Waitlist capture — posts to the mybuku waitlistApi Cloud Function. */
(function () {
  var ENDPOINT = 'https://us-central1-mybuku-d77f1.cloudfunctions.net/waitlistApi';

  function wire(form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var status = form.querySelector('.wl-status');
      var btn = form.querySelector('button[type=submit]');
      var email = form.querySelector('.wl-email').value.trim();
      var consent = form.querySelector('input[name=consent]').checked;
      status.textContent = '';
      if (!consent) {
        status.textContent = 'Please tick the consent box first.';
        return;
      }
      btn.disabled = true;
      var old = btn.textContent;
      btn.textContent = 'Joining\u2026';
      try {
        var res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            product: form.dataset.product || 'mybuku',
            consent: consent,
            website: form.querySelector('.wl-hp').value,
            source: 'buku.pro site'
          })
        });
        var data = await res.json();
        if (res.ok && data.ok) {
          status.textContent = data.alreadyExisted
            ? "You're already on the list \u2014 we'll be in touch."
            : "You're on the list. We'll be in touch.";
          form.reset();
        } else {
          status.textContent = (data && data.error) || 'Something went wrong. Try again.';
        }
      } catch (err) {
        status.textContent = 'Network error. Try again.';
      }
      btn.disabled = false;
      btn.textContent = old;
    });
  }

  document.querySelectorAll('.waitlist-form').forEach(wire);
})();
