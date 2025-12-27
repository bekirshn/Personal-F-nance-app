# Personal Finance Web App


Basit bir kişisel finans takip uygulaması (Node.js + Express + SQLite).

Bu depo eğitim / proje amaçlı hazırlanmıştır. Sunucu API'si ve statik frontend `src/public` içinde bulunur.

## Özet
- Backend: Node.js, Express (ES modules)
- Database: SQLite (`database.db`) - şema `database/schema.sql` içinde
- Auth: bcryptjs (parola hashing) + JWT (token), tarayıcıda httpOnly cookie ile saklanır
- Frontend: Statik HTML/CSS/vanilla JS (dizin: `src/public`)

## Özellikler
- Kayıt / Giriş (register / login)
- Kullanıcının giderler (expenses), gelirler (incomes) ve notlarını tutma
- Route bazlı yetkilendirme: yalnızca oturum açmış kullanıcı kendi verisini görebilir / değiştirebilir
- Legacy: Atomic `POST /api/` endpoint'i (kullanıcı + başlangıç finansal veriyi tek request ile oluşturur) korunmuştur

---

## Gereksinimler

VeriProje, kişisel finans verilerini (gider, gelir, not) takip etmek için örnek bir Node.js + Express + SQLite uygulamasıdır. Bu depo eğitim ve küçük projeler için uygundur; backend API ve basit bir statik frontend içerir.

Hızlı bakış
-----------
- Backend: Node.js (ES modules) + Express
- Veritabanı: SQLite (`database.db`) — şema `database/schema.sql` içinde
- Kimlik doğrulama: `bcryptjs` ile parola hash, `jsonwebtoken` (JWT) ile token; tarayıcıda httpOnly cookie olarak saklanır
- Frontend: statik HTML/CSS/vanilla JS (dizin: `src/public`)

Öne çıkan özellikler
-------------------
- Kullanıcı kaydı ve girişi (register/login)
- Giderler (expenses), gelirler (incomes) ve notlar (notes) CRUD
- Route bazlı yetkilendirme; yalnızca oturum açmış kullanıcı kendi verilerini görebilir ve değiştirebilir
- Mevcut (legacy) bir "atomic create" endpoint'i korunmuştur: `POST /api/` (kullanıcı + başlangıç finansal veriyi tek istekte oluşturur). Yeni önerilen akış: `POST /api/auth/register` + sonrasında resource endpoint'leri.

Hızlı başlatma (README için PR'ye koyulacak hâl)
---------------------------------------------
1. Depoyu klonlayın ve dizine girin

```fish
git clone <repo-url>
cd veriProje
```

2. Node.js ve bağımlılıkları yükleyin

```fish
# Proje kökünde
npm install
```

3. Ortam değişkenlerini ayarlayın

```bash
# .env (örnek)
PORT=3000
DB_PATH=database.db
JWT_SECRET=çok-gizli-bir-deger
NODE_ENV=development
```

4. Veritabanını başlatın (tercihen sqlite3 CLI ile)

```fish
sqlite3 database.db < database/schema.sql
```

5. Sunucuyu başlatın

```fish
npm start
# veya
node server.js
```

6. Tarayıcıda açın

http://localhost:3000/

Projedeki bağımlılıklar (kök package.json'dan)
------------------------------------------------
Bu repoda kullanılan üst-seviye npm paketleri:

- bcryptjs
- cookie-parser
- dotenv
- express
- jsonwebtoken
- sqlite
- sqlite3

Kurulumda doğrulama ve tek paket yükleme
---------------------------------------
Top-level paketleri doğrulamak için proje kökünde çalıştırın:

```fish
npm ls --depth=0
```

Eksik bir paket varsa tek tek kurmak için:

```fish
npm install <paket-adı>
# örn: npm install cookie-parser --save
```

Not: `sqlite3` native modül içerir; bazı sistemlerde derleme için build araçları (ör. make, python) gerekebilir.

Önemli endpointler
-------------------
- POST `/api/auth/register` — kullanıcı kaydı
- POST `/api/auth/login` — giriş (server httpOnly cookie ile token set eder)
- POST `/api/auth/logout` — çıkış (cookie temizlenir)
- GET `/api/me` — kimlik doğrulanmışsa mevcut kullanıcı bilgisi döner
- GET `/api/:id` — kullanıcının finans verileri (auth required; sadece kendi id'sini görebilir)
- POST `/api/expense`, `/api/income`, `/api/note` — yeni öğe oluşturma (auth required)
- PUT/DELETE `/api/expense/:id`, `/api/income/:id`, `/api/note/:id` — güncelle/sil (auth + ownership enforced)
- POST `/api/` — legacy atomic create (kullanıcı + başlangıç verisi). Yeni öneri: register + resource endpoint'leri.

Güvenlik notları
---------------
- Token, httpOnly cookie içinde saklanır (client-side JS ile okunamaz) — XSS riskini azaltır.
- Üretimde `JWT_SECRET` güçlü bir değer olmalı ve `NODE_ENV=production` ise `secure` cookie kullanın (HTTPS gerektirir).

Sorun giderme
-------------
- Giriş yaptığınız halde anasayfaya döndürüyorsanız:
	- Tarayıcıda DevTools → Network → POST `/api/auth/login` yanıtında `Set-Cookie` görünüyor mu kontrol edin.
	- `/api/me` isteğinde Request Headers içinde `Cookie` gönderiliyor mu kontrol edin.
	- Frontend fetch çağrılarında `credentials: 'same-origin'` kullanıldığından emin olun.

- `sqlite3` kurulırken derleme hataları alırsanız işletim sisteminize göre build araçlarını (build-essential, python, vs.) yükleyin.

Katkıda bulunma
---------------
- PR'ler ve issue'lar memnuniyetle kabul edilir. Küçük değişiklikler için feature branch → PR akışı önerilir.

Bu proje öğretici amaçlıdır. 

