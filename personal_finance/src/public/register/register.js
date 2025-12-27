document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const message = document.getElementById('message');

  function show(msg, isError = true) {
    message.textContent = msg;
    message.style.color = isError ? 'red' : 'var(--success)';
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    message.textContent = '';

    const username = form.username.value.trim();
    const lastname = form.lastname.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const password2 = form.password2.value;

    if (!username || !lastname) return show('İsim ve soyisim gereklidir');
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRe.test(email)) return show('Geçerli bir e-posta girin');
    if (!password || password.length < 6) return show('Parola en az 6 karakter olmalı');
    if (password !== password2) return show('Parolalar eşleşmiyor');

    // Try to call a hypothetical backend register endpoint; if not available, simulate success.
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, lastname, email, password })
      });

      if (res.ok) {
        show('Kayıt başarılı. Giriş sayfasına yönlendiriliyorsunuz...', false);
        setTimeout(() => window.location.href = '/login/login.html', 900);
        return;
      }

      // if endpoint missing or returns error, try to read message
      let data = {};
      try { data = await res.json(); } catch (e) {}
      show(data.message || 'Kayıt başarısız');
    } catch (err) {
      console.warn('Register request failed', err);
      show('Sunucuya ulaşılamıyor. Lütfen daha sonra tekrar deneyin');
    }
  });
});
