document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('loginForm');
	const email = document.getElementById('email');
	const password = document.getElementById('password');
	const message = document.getElementById('message');
	const toggle = document.getElementById('togglePassword');

	function showMessage(text, isError = true) {
		message.textContent = text;
		message.style.color = isError ? '' : 'green';
	}

	toggle.addEventListener('click', () => {
		const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
		password.setAttribute('type', type);
		toggle.textContent = type === 'password' ? 'Göster' : 'Gizle';
		toggle.setAttribute('aria-label', type === 'password' ? 'Parolayı göster' : 'Parolayı gizle');
	});

	form.addEventListener('submit', async (ev) => {
		ev.preventDefault();
		message.textContent = '';

		const emailVal = email.value.trim();
		const passVal = password.value;

		if (!emailVal) return showMessage('E-posta girilmelidir');
		// basit e-posta doğrulama
		const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
		if (!emailRe.test(emailVal)) return showMessage('Geçerli bir e-posta girin');

		if (!passVal || passVal.length < 6) return showMessage('Parola en az 6 karakter olmalıdır');

		// Gönderim: API yoksa kullanıcıya bilgi ver ve simulate et
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: emailVal, password: passVal })
			});

					if (res.ok) {
							const data = await res.json();
							// server sets httpOnly cookie with token; do not store anything in localStorage
							showMessage('Giriş başarılı, yönlendiriliyorsunuz...', false);
							setTimeout(() => { window.location.href = '/'; }, 700);
						return;
					}

			// backend varsa hata mesajı göster
			if (res.status >= 400 && res.status < 600) {
				let json = {};
				try { json = await res.json(); } catch (e) {}
				return showMessage(json.message || 'Giriş başarısız');
			}

			// other statuses
			showMessage('Giriş sırasında beklenmeyen bir sonuç alındı');
			} catch (err) {
				// genelde backend yok / CORS vs
				console.warn('Login request failed', err);
				showMessage('Sunucuya ulaşılamıyor. Lütfen daha sonra tekrar deneyin');
			}
	});
});
