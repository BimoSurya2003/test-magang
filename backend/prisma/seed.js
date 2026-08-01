import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Helper: cari data berdasarkan kondisi tertentu, kalau belum ada baru buat.
// Ini membuat seed aman dijalankan berkali-kali (idempotent) tanpa perlu
// tahu apakah field-nya di-set @unique di schema atau tidak.
async function findOrCreate(model, whereCondition, createData) {
  const existing = await model.findFirst({ where: whereCondition });
  if (existing) return existing;
  return model.create({ data: createData });
}

async function main() {

  // =====================
  // ROLE
  // =====================
  const adminRole = await findOrCreate(
    prisma.role,
    { name: "ADMIN" },
    { name: "ADMIN" }
  );

  const doctorRole = await findOrCreate(
    prisma.role,
    { name: "DOKTER" },
    { name: "DOKTER" }
  );

  const officerRole = await findOrCreate(
    prisma.role,
    { name: "PETUGAS" },
    { name: "PETUGAS" }
  );


  // =====================
  // USER / PETUGAS LOGIN
  // =====================

  await findOrCreate(
    prisma.user,
    { username: "admin" },
    {
      username: "admin",
      password: await bcrypt.hash("admin123", 10),
      roleId: adminRole.id,
    }
  );


  await findOrCreate(
    prisma.user,
    { username: "petugas" },
    {
      username: "petugas",
      password: await bcrypt.hash("petugas123", 10),
      roleId: officerRole.id,
    }
  );


  await findOrCreate(
    prisma.user,
    { username: "dokter" },
    {
      username: "dokter",
      password: await bcrypt.hash("dokter123", 10),
      roleId: doctorRole.id,
    }
  );


  // =====================
  // DOKTER
  // =====================

  const doctor1 = await findOrCreate(
    prisma.doctor,
    { name: "Dr. Budi Santoso" },
    { name: "Dr. Budi Santoso" }
  );


  const doctor2 = await findOrCreate(
    prisma.doctor,
    { name: "Dr. Andi Wijaya" },
    { name: "Dr. Andi Wijaya" }
  );


  // =====================
  // POLIKLINIK
  // =====================

  const umum = await findOrCreate(
    prisma.polyclinic,
    { name: "Poli Umum" },
    { name: "Poli Umum" }
  );


  const gigi = await findOrCreate(
    prisma.polyclinic,
    { name: "Poli Gigi" },
    { name: "Poli Gigi" }
  );


  // =====================
  // PASIEN 12 DATA
  // =====================

  const patientsData = [
    {
      medicalRecord:"RM001",
      nik:"320100000001",
      name:"Ahmad Fauzi",
      gender:"MALE",
      birthDate:new Date("1995-01-10"),
      phone:"081111111111",
      address:"Bandung"
    },
    {
      medicalRecord:"RM002",
      nik:"320100000002",
      name:"Siti Aminah",
      gender:"FEMALE",
      birthDate:new Date("1998-02-15"),
      phone:"082222222222",
      address:"Cimahi"
    },
    {
      medicalRecord:"RM003",
      nik:"320100000003",
      name:"Rizky Maulana",
      gender:"MALE",
      birthDate:new Date("1997-03-20"),
      phone:"083333333333",
      address:"Bandung"
    },
    {
      medicalRecord:"RM004",
      nik:"320100000004",
      name:"Dewi Lestari",
      gender:"FEMALE",
      birthDate:new Date("1999-04-12"),
      phone:"084444444444",
      address:"Garut"
    },
    {
      medicalRecord:"RM005",
      nik:"320100000005",
      name:"Fajar Ramadhan",
      gender:"MALE",
      birthDate:new Date("2000-05-01"),
      phone:"085555555555",
      address:"Bandung"
    },
    {
      medicalRecord:"RM006",
      nik:"320100000006",
      name:"Nabila Putri",
      gender:"FEMALE",
      birthDate:new Date("2001-06-11"),
      phone:"086666666666",
      address:"Bandung"
    },
    {
      medicalRecord:"RM007",
      nik:"320100000007",
      name:"Ilham Saputra",
      gender:"MALE",
      birthDate:new Date("1996-07-22"),
      phone:"087777777777",
      address:"Sumedang"
    },
    {
      medicalRecord:"RM008",
      nik:"320100000008",
      name:"Ayu Permata",
      gender:"FEMALE",
      birthDate:new Date("1994-08-30"),
      phone:"088888888888",
      address:"Bandung"
    },
    {
      medicalRecord:"RM009",
      nik:"320100000009",
      name:"Bagas Pratama",
      gender:"MALE",
      birthDate:new Date("1993-09-09"),
      phone:"089999999999",
      address:"Bandung"
    },
    {
      medicalRecord:"RM010",
      nik:"320100000010",
      name:"Rina Wulandari",
      gender:"FEMALE",
      birthDate:new Date("2002-10-10"),
      phone:"081234567890",
      address:"Cimahi"
    },
    {
      medicalRecord:"RM011",
      nik:"320100000011",
      name:"Dimas Setiawan",
      gender:"MALE",
      birthDate:new Date("1992-11-11"),
      phone:"081111222333",
      address:"Bandung"
    },
    {
      medicalRecord:"RM012",
      nik:"320100000012",
      name:"Putri Ananda",
      gender:"FEMALE",
      birthDate:new Date("2003-12-12"),
      phone:"082222333444",
      address:"Bandung"
    }
  ];

  // Cek satu per satu berdasarkan NIK, agar tidak duplikat saat seed dijalankan ulang.
  // Simpan hasilnya (termasuk id) agar bisa dipakai untuk membuat Registration di bawah.
  const createdPatients = [];
  for (const patient of patientsData) {
    const created = await findOrCreate(
      prisma.patient,
      { nik: patient.nik },
      patient
    );
    createdPatients.push(created);
  }


  // =====================
  // REGISTRASI PASIEN
  // =====================
  // Setiap pasien didaftarkan ke salah satu poliklinik & dokter, secara bergantian.
  // Status bervariasi supaya data di halaman Antrean & Pemeriksaan Dokter langsung
  // terisi dengan kondisi WAITING / CHECK_IN / EXAMINATION / FINISHED.

  const complaints = [
    "Demam dan batuk sejak 3 hari",
    "Sakit gigi berlubang",
    "Pusing dan mual",
    "Gusi bengkak",
    "Nyeri perut bagian bawah",
    "Sakit gigi geraham",
    "Flu dan pilek",
    "Nyeri saat mengunyah",
    "Sesak napas ringan",
    "Gigi sensitif",
    "Alergi kulit gatal-gatal",
    "Karang gigi menumpuk",
  ];

  const statusPlan = [
    "WAITING", "WAITING", "WAITING", "WAITING",
    "CHECK_IN", "CHECK_IN", "CHECK_IN", "CHECK_IN",
    "EXAMINATION", "EXAMINATION",
    "FINISHED", "FINISHED",
  ];

  const createdRegistrations = [];
  const queueCounters = { umum: 0, gigi: 0 };

  for (let i = 0; i < createdPatients.length; i++) {
    const patient = createdPatients[i];
    const isUmum = i % 2 === 0;
    const polyclinic = isUmum ? umum : gigi;
    const doctor = isUmum ? doctor1 : doctor2;
    const status = statusPlan[i];

    const registration = await findOrCreate(
      prisma.registration,
      { patientId: patient.id },
      {
        patientId: patient.id,
        doctorId: doctor.id,
        polyclinicId: polyclinic.id,
        visitDate: new Date(),
        paymentType: i % 2 === 0 ? "UMUM" : "BPJS",
        complaint: complaints[i],
        status,
      }
    );
    createdRegistrations.push({ registration, isUmum, status });

    // =====================
    // ANTREAN (QUEUE)
    // =====================
    // Nomor antrean berbeda prefix per poliklinik: U untuk Poli Umum, G untuk Poli Gigi.
    if (isUmum) {
      queueCounters.umum += 1;
    } else {
      queueCounters.gigi += 1;
    }
    const prefix = isUmum ? "U" : "G";
    const counter = isUmum ? queueCounters.umum : queueCounters.gigi;
    const queueNumber = `${prefix}${String(counter).padStart(3, "0")}`;

    await findOrCreate(
      prisma.queue,
      { registrationId: registration.id },
      {
        registrationId: registration.id,
        queueNumber,
        status,
      }
    );
  }


  // =====================
  // REKAM MEDIS (untuk pasien yang statusnya FINISHED)
  // =====================
  const finishedRegistrations = createdRegistrations.filter(
    (r) => r.status === "FINISHED"
  );

  const medicalRecordSamples = [
    {
      subjective: "Pasien mengeluh alergi kulit gatal-gatal sejak 2 hari, tidak ada demam.",
      bloodPressure: "120/80 mmHg",
      temperature: 36.6,
      weight: 58,
      height: 165,
      assessment: "Dermatitis alergika ringan",
      plan: "Hindari pemicu alergi, gunakan obat sesuai resep, kontrol jika belum membaik dalam 5 hari",
      actions: ["Pemeriksaan fisik kulit"],
      prescriptions: [
        { medicine: "Cetirizine", dosage: "10mg", instruction: "1x1 sehari setelah makan" },
        { medicine: "Salep Hidrokortison", dosage: "1%", instruction: "Oleskan 2x sehari pada area gatal" },
      ],
    },
    {
      subjective: "Pasien mengeluh karang gigi menumpuk dan bau mulut.",
      bloodPressure: "118/76 mmHg",
      temperature: 36.5,
      weight: 62,
      height: 158,
      assessment: "Kalkulus gigi (karang gigi)",
      plan: "Scaling gigi, edukasi kebersihan mulut, kontrol rutin 6 bulan sekali",
      actions: ["Scaling / pembersihan karang gigi"],
      prescriptions: [
        { medicine: "Obat kumur antiseptik", dosage: "150ml", instruction: "Kumur 2x sehari setelah sikat gigi" },
      ],
    },
  ];

  for (let i = 0; i < finishedRegistrations.length; i++) {
    const { registration } = finishedRegistrations[i];
    const sample = medicalRecordSamples[i % medicalRecordSamples.length];

    const medicalRecord = await findOrCreate(
      prisma.medicalRecord,
      { registrationId: registration.id },
      {
        registrationId: registration.id,
        patientId: registration.patientId,
        subjective: sample.subjective,
        bloodPressure: sample.bloodPressure,
        temperature: sample.temperature,
        weight: sample.weight,
        height: sample.height,
        assessment: sample.assessment,
        plan: sample.plan,
      }
    );

    for (const actionText of sample.actions) {
      await findOrCreate(
        prisma.medicalAction,
        { medicalRecordId: medicalRecord.id, action: actionText },
        { medicalRecordId: medicalRecord.id, action: actionText }
      );
    }

    for (const presc of sample.prescriptions) {
      await findOrCreate(
        prisma.prescription,
        { medicalRecordId: medicalRecord.id, medicine: presc.medicine },
        {
          medicalRecordId: medicalRecord.id,
          medicine: presc.medicine,
          dosage: presc.dosage,
          instruction: presc.instruction,
        }
      );
    }
  }


  console.log("Seeder berhasil");
}


main()
.catch(e=>{
 console.error(e);
 process.exit(1);
})
.finally(()=>{
 prisma.$disconnect();
});