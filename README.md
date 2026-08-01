# 🏥 Mini Clinic Information System

Mini Clinic Information System adalah aplikasi berbasis web yang digunakan untuk membantu proses administrasi dan pelayanan pasien di klinik secara terintegrasi.

Aplikasi ini dikembangkan sebagai **Technical Assignment Programmer** menggunakan teknologi berikut:

- Frontend : React.js
- Backend : Node.js (Express.js)
- Database : PostgreSQL
- ORM : Prisma ORM
- Authentication : JSON Web Token (JWT)

---

# ✨ Fitur

## Authentication
- Login
- Logout
- Authorization berdasarkan Role
  - Administrator
  - Doctor
  - Registration Officer

## Dashboard
- Total Pasien
- Total Pasien Hari Ini
- Total Antrean Hari Ini
- Total Pasien Menunggu
- Total Pasien Selesai Dilayani

## Master Data Pasien
- Tambah Data Pasien
- Ubah Data Pasien
- Hapus Data Pasien
- Detail Data Pasien
- Pencarian
- Pagination
- Nomor Rekam Medis Otomatis

## Pendaftaran Pasien
- Registrasi Pasien
- Pilih Dokter
- Pilih Poliklinik
- Jenis Pembayaran
- Keluhan Awal

## Manajemen Antrean
- Generate Nomor Antrean Otomatis
- Daftar Antrean
- Panggil Antrean Berikutnya
- Update Status Antrean

## Pemeriksaan Dokter
- SOAP (Subjective, Objective, Assessment, Plan)
- Input Diagnosa
- Input Tindakan Medis
- Input Resep Obat
- Riwayat Pemeriksaan Pasien

---

# 📌 Catatan

Aplikasi ini menggunakan **Prisma Migration** dan **Prisma Seeder**.

Setelah proses migrasi database selesai, **wajib menjalankan Prisma Seeder** untuk mengisi data awal seperti:

- Role
- User Login
- Dokter
- Poliklinik
- Data Master lainnya

Tanpa menjalankan proses seeding, aplikasi tidak memiliki akun login maupun data master sehingga beberapa fitur tidak dapat digunakan.

---

# 🛠️ Teknologi

## Frontend

- React.js
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React

## Backend

- Node.js
- Express.js
- Prisma ORM
- JSON Web Token (JWT)
- bcrypt

## Database

- PostgreSQL

---

# 📂 Struktur Project

```
mini-clinic/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── routes/
│   │   └── App.jsx
│   │
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

# 🚀 Cara Instalasi

## 1. Clone Repository

```bash
git clone https://github.com/BimoSurya2003/test-magang.git
```

Masuk ke folder project

```bash
cd mini-clinic
```

---

## 2. Install Backend

```bash
cd backend

npm install
```

---

## 3. Install Frontend

```bash
cd ../frontend

npm install
```

---

# ⚙️ Konfigurasi Environment

## Backend

Salin file `.env.example`

```bash
cp .env.example .env
```

Isi file `.env`

```env
PORT=3000

DATABASE_URL="postgresql://username:password@localhost:5432/mini_clinic"

JWT_SECRET=your_jwt_secret

JWT_EXPIRES_IN=1d
```

---

## Frontend

Salin file `.env.example`

```bash
cp .env.example .env
```

Isi file `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

---

# 🗄️ Cara Migrasi Database

Generate Prisma Client

```bash
npx prisma generate
```

Jalankan Migration

```bash
npx prisma migrate dev
```

Setelah migration selesai, jalankan Seeder

```bash
npm run seed
```

Seeder akan membuat data awal seperti:

- Role
- User Login
- Dokter
- Poliklinik
- Data Master lainnya

> **Penting:** Jalankan `npm run seed` setelah migration selesai. Tanpa proses seeding, akun login dan data master awal tidak akan tersedia.

Apabila hanya ingin menyinkronkan schema database

```bash
npx prisma db push
```

Kemudian tetap jalankan

```bash
npm run seed
```

---

# ▶️ Cara Menjalankan Aplikasi

## Backend

```bash
cd backend

npm install

cp .env.example .env

npx prisma generate

npx prisma migrate dev

npm run seed

npm run dev
```

Backend berjalan di

```
http://localhost:3000
```

---

## Frontend

```bash
cd frontend

npm install

cp .env.example .env

npm run dev
```

Frontend berjalan di

```
http://localhost:5173
```

---

# 👤 Akun Login

## Administrator

```
Username : admin
Password : admin123
```

## Registration Officer

```
Username : petugas
Password : petugas123
```

## Doctor

```
Username : dokter
Password : dokter123
```

> **Catatan:** Username dan password di atas mengikuti data yang dibuat pada file Seeder. Sesuaikan apabila terdapat perubahan.

---

# 🌐 REST API

## Authentication

```
POST /api/login
POST /api/logout
```

## Patient

```
GET    /api/patients
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id
```

## Registration

```
GET  /api/registrations
POST /api/registrations
PUT  /api/registrations/:id
```

## Queue

```
GET /api/queues
POST /api/queues
PUT /api/queues/:id/call
PUT /api/queues/:id/status
```

## Medical Record

```
POST /api/medical-records
GET  /api/medical-records/:patientId
```

## Prescription

```
POST /api/prescriptions
GET  /api/prescriptions/:id
```

---

# 🔒 Keamanan

Repository ini **tidak menyimpan** informasi sensitif.

Konfigurasi berikut disimpan pada file `.env` dan **tidak di-hardcode** ke dalam source code maupun repository:

- Database URL
- JWT Secret
- Port
- API URL
- Konfigurasi sensitif lainnya

Repository hanya menyertakan file:

```
.env.example
```

sebagai contoh konfigurasi.

---

# 👨‍💻 Author

**Bimo Surya Prima**

Technical Assignment Programmer – Mini Clinic Information System
