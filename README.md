# NusantaraTrail Backend 🗺️

API backend untuk aplikasi Peta Wisata Budaya Interaktif.

**Stack:** Node.js + Express + TypeScript + Prisma (MySQL) + Mongoose (MongoDB)

---

## Prasyarat

Pastikan sudah terinstall:
- Node.js >= 18
- XAMPP Linux (MySQL aktif di port 3306)
- MongoDB di Docker
- npm

---

## Langkah 1 — Clone & Install

```bash
# Masuk ke folder project
cd nusantaratrail-backend

# Install semua dependencies
npm install
```

---

## Langkah 2 — Jalankan MySQL (XAMPP)

```bash
# Start XAMPP
sudo /opt/lampp/lampp start

# Verifikasi MySQL jalan
sudo /opt/lampp/lampp status
```

Buka **phpMyAdmin** di `http://localhost/phpmyadmin` lalu buat database baru:
```sql
CREATE DATABASE nusantaratrail;
```

---

## Langkah 3 — Jalankan MongoDB (Docker)

```bash
# Jika container belum ada, buat dulu
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  mongo:latest

# Jika container sudah ada tapi mati
docker start mongodb

# Verifikasi
docker ps | grep mongodb
```

---

## Langkah 4 — Setup Environment

File `.env` sudah tersedia dengan konfigurasi default lokal.
Sesuaikan jika password MySQL kamu berbeda:

```bash
# Buka .env dan sesuaikan jika perlu
nano .env
```

Default konfigurasi:
```
DATABASE_URL="mysql://root:@localhost:3306/nusantaratrail"
MONGO_URI=mongodb://localhost:27017/nusantaratrail
```

> Jika MySQL XAMPP kamu pakai password, ubah `root:` menjadi `root:passwordmu`

---

## Langkah 5 — Generate Prisma Client & Migrate Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Jalankan migrasi (buat semua tabel di MySQL)
npm run prisma:migrate
```

Saat ditanya nama migrasi, ketik: `init`

---

## Langkah 6 — Seed Database (Opsional)

Isi data awal (superadmin, admin, dan 2 lokasi wisata):

```bash
npm run prisma:seed
```

Akun yang dibuat:
| Email | Password | Role |
|-------|----------|------|
| superadmin@nusantaratrail.id | password123 | superadmin |
| admin@nusantaratrail.id | password123 | admin |

---

## Langkah 7 — Generate Swagger Docs

```bash
npm run swagger
```

---

## Langkah 8 — Jalankan Server

```bash
npm run dev
```

Server berjalan di:
- 🚀 API Base URL : `http://localhost:3000/api`
- 📄 Swagger Docs : `http://localhost:3000/api-docs`
- ❤️  Health Check : `http://localhost:3000/health`

---

## Struktur Endpoint

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | /api/auth/register | ❌ | Register turis |
| POST | /api/auth/login | ❌ | Login semua role |
| POST | /api/auth/logout | ✅ | Logout |
| POST | /api/auth/refresh | ❌ | Refresh token |
| GET | /api/locations | ❌ | List lokasi wisata |
| GET | /api/locations/:id | ❌ | Detail lokasi |
| POST | /api/locations | Admin | Tambah lokasi |
| PUT | /api/locations/:id | Admin | Update lokasi |
| DELETE | /api/locations/:id | Admin | Hapus lokasi |
| POST | /api/qrcodes/generate/:locationId | Admin | Generate QR |
| GET | /api/qrcodes/scan/:code | ❌ | Scan QR |
| DELETE | /api/qrcodes/:id | Admin | Hapus QR |
| GET | /api/audio/:locationId | ❌ | Get audio guide |
| POST | /api/audio | Admin | Upload audio |
| PUT | /api/audio/:id | Admin | Update audio |
| DELETE | /api/audio/:id | Admin | Hapus audio |
| GET | /api/content/:locationId | ❌ | Get konten sejarah |
| POST | /api/content | Admin | Tambah konten |
| PUT | /api/content/:id | Admin | Update konten |
| DELETE | /api/content/:id | Admin | Hapus konten |
| GET | /api/reviews/:locationId | ❌ | Get review |
| POST | /api/reviews | ✅ | Buat review |
| PUT | /api/reviews/:id | ✅ | Update review |
| DELETE | /api/reviews/:id | ✅ | Hapus review |
| POST | /api/visits/log | ❌ | Catat kunjungan |
| GET | /api/visits/stats | Admin | Statistik total |
| GET | /api/visits/stats/:locationId | Admin | Statistik per lokasi |
| GET | /api/users | Superadmin | List semua user |
| PATCH | /api/users/:id/role | Superadmin | Update role |
| PATCH | /api/users/:id/active | Superadmin | Toggle aktif |

---

## Testing

```bash
# Semua test
npm test

# Unit test saja
npm run test:unit

# Integration test saja
npm run test:integration

# Dengan coverage
npm run test:coverage
```

---

## Prisma Studio (GUI Database)

```bash
npm run prisma:studio
```

Buka di `http://localhost:5555` — GUI untuk melihat & edit data MySQL.

---

## Tips Troubleshooting

**MySQL tidak bisa connect:**
```bash
# Pastikan XAMPP jalan
sudo /opt/lampp/lampp start
# Cek port
netstat -tlnp | grep 3306
```

**MongoDB tidak bisa connect:**
```bash
# Cek container jalan
docker ps
# Start jika mati
docker start mongodb
```

**Error `Cannot find module swagger-output.json`:**
```bash
npm run swagger
```

**Error Prisma client not generated:**
```bash
npm run prisma:generate
```
