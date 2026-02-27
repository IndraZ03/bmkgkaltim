import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

console.log('DB URL:', process.env.DATABASE_URL)
const prisma = new PrismaClient()

async function main() {
  // ═══════════════════════════════════════════════════════════════
  // STATIONS
  // ═══════════════════════════════════════════════════════════════

  const stations = [
    {
      name: "Stasiun Meteorologi Kelas I Sultan Aji Muhammad Sulaiman Sepinggan - Balikpapan",
      code: "STAMET_BPN",
      hasAdmin: true, // SATU-SATUNYA YANG PUNYA ADMIN
    },
    {
      name: "Stasiun Geofisika Kelas III Balikpapan",
      code: "STAGEOF_BPN",
      hasAdmin: false,
    },
    {
      name: "Stasiun Meteorologi Kelas III APT Pranoto - Samarinda",
      code: "STAMET_SMD",
      hasAdmin: false,
    },
    {
      name: "Stasiun Meteorologi Kelas I Kalimarau - Berau",
      code: "STAMET_BRU",
      hasAdmin: false,
    },
  ]

  const createdStations: Record<string, any> = {}
  for (const station of stations) {
    const result = await prisma.station.upsert({
      where: { code: station.code },
      update: { name: station.name, hasAdmin: station.hasAdmin },
      create: station,
    })
    createdStations[station.code] = result
    console.log(`✅ Station: ${station.name} (${station.code}) | Admin: ${station.hasAdmin}`)
  }

  // ═══════════════════════════════════════════════════════════════
  // INTERNAL BACKOFFICE USERS
  // ═══════════════════════════════════════════════════════════════

  // 1. Administrator (ADMIN) - full access - Stamet Balikpapan
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bmkg.go.id' },
    update: {
      password: adminPassword,
      role: 'ADMIN' as any,
      isVerified: true,
      stationId: createdStations['STAMET_BPN'].id,
    },
    create: {
      email: 'admin@bmkg.go.id',
      name: 'Administrator',
      password: adminPassword,
      role: 'ADMIN' as any,
      isVerified: true,
      stationId: createdStations['STAMET_BPN'].id,
    },
  })
  console.log('✅ Admin:', admin.email, '| Password: admin123 | Stasiun: STAMET_BPN')

  // 2. Content Manager (CONTENT) - manages news, articles, videos
  const contentPassword = await hash('content123', 12)
  const contentManager = await prisma.user.upsert({
    where: { email: 'content@bmkg.go.id' },
    update: {
      password: contentPassword,
      role: 'CONTENT' as any,
      isVerified: true,
      stationId: createdStations['STAMET_BPN'].id,
    },
    create: {
      email: 'content@bmkg.go.id',
      name: 'Content Manager',
      password: contentPassword,
      role: 'CONTENT' as any,
      isVerified: true,
      stationId: createdStations['STAMET_BPN'].id,
    },
  })
  console.log('✅ Content Manager:', contentManager.email, '| Password: content123')

  // 3. Content Manager Admin (CONTENT_ADMIN) - approves content
  const contentAdminPassword = await hash('contentadmin123', 12)
  const contentManagerAdmin = await prisma.user.upsert({
    where: { email: 'contentadmin@bmkg.go.id' },
    update: {
      password: contentAdminPassword,
      role: 'CONTENT_ADMIN' as any,
      isVerified: true,
      stationId: createdStations['STAMET_BPN'].id,
    },
    create: {
      email: 'contentadmin@bmkg.go.id',
      name: 'Content Manager Admin',
      password: contentAdminPassword,
      role: 'CONTENT_ADMIN' as any,
      isVerified: true,
      stationId: createdStations['STAMET_BPN'].id,
    },
  })
  console.log('✅ Content Manager Admin:', contentManagerAdmin.email, '| Password: contentadmin123')

  // 4. Datin (DATIN) - data & informasi
  const datinPassword = await hash('datin123', 12)
  const datin = await prisma.user.upsert({
    where: { email: 'datin@bmkg.go.id' },
    update: {
      password: datinPassword,
      role: 'DATIN' as any,
      isVerified: true,
      stationId: createdStations['STAMET_BPN'].id,
    },
    create: {
      email: 'datin@bmkg.go.id',
      name: 'Datin Operator',
      password: datinPassword,
      role: 'DATIN' as any,
      isVerified: true,
      stationId: createdStations['STAMET_BPN'].id,
    },
  })
  console.log('✅ Datin:', datin.email, '| Password: datin123')

  // 5. DATIN users per station (functional role + station assignment)
  const datinStationPassword = await hash('datin123', 12)

  // DATIN Stasiun Geofisika Balikpapan
  const datinGeof = await prisma.user.upsert({
    where: { email: 'datin.stageof.bpn@bmkg.go.id' },
    update: {
      password: datinStationPassword,
      role: 'DATIN' as any,
      isVerified: true,
      stationId: createdStations['STAGEOF_BPN'].id,
    },
    create: {
      email: 'datin.stageof.bpn@bmkg.go.id',
      name: 'DATIN Stasiun Geofisika Balikpapan',
      password: datinStationPassword,
      role: 'DATIN' as any,
      isVerified: true,
      stationId: createdStations['STAGEOF_BPN'].id,
    },
  })
  console.log('✅ DATIN Geofisika BPN:', datinGeof.email, '| Password: datin123')

  // DATIN Stasiun Meteorologi Samarinda
  const datinSmd = await prisma.user.upsert({
    where: { email: 'datin.stamet.smd@bmkg.go.id' },
    update: {
      password: datinStationPassword,
      role: 'DATIN' as any,
      isVerified: true,
      stationId: createdStations['STAMET_SMD'].id,
    },
    create: {
      email: 'datin.stamet.smd@bmkg.go.id',
      name: 'DATIN Stasiun Meteorologi Samarinda',
      password: datinStationPassword,
      role: 'DATIN' as any,
      isVerified: true,
      stationId: createdStations['STAMET_SMD'].id,
    },
  })
  console.log('✅ DATIN Met Samarinda:', datinSmd.email, '| Password: datin123')

  // DATIN Stasiun Meteorologi Berau
  const datinBru = await prisma.user.upsert({
    where: { email: 'datin.stamet.bru@bmkg.go.id' },
    update: {
      password: datinStationPassword,
      role: 'DATIN' as any,
      isVerified: true,
      stationId: createdStations['STAMET_BRU'].id,
    },
    create: {
      email: 'datin.stamet.bru@bmkg.go.id',
      name: 'DATIN Stasiun Meteorologi Berau',
      password: datinStationPassword,
      role: 'DATIN' as any,
      isVerified: true,
      stationId: createdStations['STAMET_BRU'].id,
    },
  })
  console.log('✅ DATIN Met Berau:', datinBru.email, '| Password: datin123')

  // 6. Content Manager per station
  const contentStationPassword = await hash('content123', 12)

  // Content Stasiun Geofisika Balikpapan
  const contentGeof = await prisma.user.upsert({
    where: { email: 'content.stageof.bpn@bmkg.go.id' },
    update: {
      password: contentStationPassword,
      role: 'CONTENT' as any,
      isVerified: true,
      stationId: createdStations['STAGEOF_BPN'].id,
    },
    create: {
      email: 'content.stageof.bpn@bmkg.go.id',
      name: 'Content Stasiun Geofisika Balikpapan',
      password: contentStationPassword,
      role: 'CONTENT' as any,
      isVerified: true,
      stationId: createdStations['STAGEOF_BPN'].id,
    },
  })
  console.log('✅ Content Geofisika BPN:', contentGeof.email, '| Password: content123')

  // ═══════════════════════════════════════════════════════════════
  // PELAYANAN DATA USERS (PUBLIC)
  // ═══════════════════════════════════════════════════════════════

  // 6. Pelayanan Data User - verified
  const pelayananPassword = await hash('pelayanan123', 12)
  const pelayananUser = await prisma.user.upsert({
    where: { email: 'pelayanan@example.com' },
    update: {
      password: pelayananPassword,
      role: 'PELAYANAN' as any,
      isVerified: true,
      phone: '081234567890',
      institution: 'Universitas Mulawarman',
      address: 'Jl. M. Yamin No. 1, Samarinda, Kalimantan Timur',
    },
    create: {
      email: 'pelayanan@example.com',
      name: 'Budi Santoso',
      password: pelayananPassword,
      role: 'PELAYANAN' as any,
      isVerified: true,
      phone: '081234567890',
      institution: 'Universitas Mulawarman',
      address: 'Jl. M. Yamin No. 1, Samarinda, Kalimantan Timur',
    },
  })
  console.log('✅ Pelayanan User (verified):', pelayananUser.email, '| Password: pelayanan123')

  // 7. Pelayanan Data User 2 - unverified (for testing verification flow)
  const pelayanan2Password = await hash('pelayanan456', 12)
  const pelayananUser2 = await prisma.user.upsert({
    where: { email: 'pelayanan2@example.com' },
    update: {
      password: pelayanan2Password,
      role: 'PELAYANAN' as any,
      isVerified: false,
      phone: '089876543210',
      institution: 'Institut Teknologi Kalimantan',
      address: 'Jl. Soekarno Hatta KM 15, Karang Joang, Balikpapan',
    },
    create: {
      email: 'pelayanan2@example.com',
      name: 'Siti Aminah',
      password: pelayanan2Password,
      role: 'PELAYANAN' as any,
      isVerified: false,
      phone: '089876543210',
      institution: 'Institut Teknologi Kalimantan',
      address: 'Jl. Soekarno Hatta KM 15, Karang Joang, Balikpapan',
    },
  })
  console.log('✅ Pelayanan User (unverified):', pelayananUser2.email, '| Password: pelayanan456')

  // ═══════════════════════════════════════════════════════════════
  // IKM STATIONS
  // ═══════════════════════════════════════════════════════════════

  const ikmStations = [
    {
      stationName: "Stasiun Meteorologi Kelas I Sultan Aji Muhammad Sulaiman Sepinggan - Balikpapan",
      ikmValue: 89.76,
      rating: "Sangat Baik",
    },
    {
      stationName: "Stasiun Geofisika Kelas III Balikpapan",
      ikmValue: 87.32,
      rating: "Sangat Baik",
    },
    {
      stationName: "Stasiun Meteorologi Kelas III APT Pranoto - Samarinda",
      ikmValue: 88.15,
      rating: "Sangat Baik",
    },
    {
      stationName: "Stasiun Meteorologi Kelas I Kalimarau - Berau",
      ikmValue: 90.21,
      rating: "Sangat Baik",
    },
  ]

  for (const station of ikmStations) {
    const existing = await prisma.ikmStation.findFirst({
      where: { stationName: station.stationName },
    })
    if (!existing) {
      await prisma.ikmStation.create({ data: station })
      console.log('✅ Created IKM station:', station.stationName)
    } else {
      console.log('⏩ IKM station already exists:', station.stationName)
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SKM QUESTIONS (Survei Kepuasan Masyarakat)
  // Based on PermenPAN-RB No 14 Tahun 2017
  // ═══════════════════════════════════════════════════════════════

  const skmQuestions = [
    {
      code: "U1",
      question: "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?",
      category: "Persyaratan",
      orderIndex: 1,
    },
    {
      code: "U2",
      question: "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?",
      category: "Prosedur",
      orderIndex: 2,
    },
    {
      code: "U3",
      question: "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?",
      category: "Waktu Pelayanan",
      orderIndex: 3,
    },
    {
      code: "U4",
      question: "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?",
      category: "Biaya/Tarif",
      orderIndex: 4,
    },
    {
      code: "U5",
      question: "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?",
      category: "Produk Layanan",
      orderIndex: 5,
    },
    {
      code: "U6",
      question: "Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?",
      category: "Kompetensi Petugas",
      orderIndex: 6,
    },
    {
      code: "U7",
      question: "Bagaimana pendapat Saudara perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?",
      category: "Perilaku Petugas",
      orderIndex: 7,
    },
    {
      code: "U8",
      question: "Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?",
      category: "Penanganan Pengaduan",
      orderIndex: 8,
    },
    {
      code: "U9",
      question: "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?",
      category: "Sarana Prasarana",
      orderIndex: 9,
    },
  ]

  for (const q of skmQuestions) {
    const existing = await prisma.skmQuestion.findFirst({
      where: { code: q.code },
    })
    if (!existing) {
      await prisma.skmQuestion.create({ data: q })
      console.log('✅ Created SKM question:', q.code, '-', q.category)
    } else {
      console.log('⏩ SKM question already exists:', q.code)
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ACTIVITY LOG
  // ═══════════════════════════════════════════════════════════════

  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "SYSTEM",
      target: "Database",
      details: "Database seed: initial data populated with all user roles and stations",
    },
  })
  console.log('✅ Activity log created')

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════')
  console.log('  SEED COMPLETE - Akun Login')
  console.log('═══════════════════════════════════════════════')
  console.log('')
  console.log('  INTERNAL BACKOFFICE (/login)')
  console.log('  ┌──────────────────────────────────────────────────────┐')
  console.log('  │ Admin          : admin@bmkg.go.id                    │')
  console.log('  │                  Password: admin123                  │')
  console.log('  │ Content Manager: content@bmkg.go.id                  │')
  console.log('  │                  Password: content123                │')
  console.log('  │ Content Admin  : contentadmin@bmkg.go.id             │')
  console.log('  │                  Password: contentadmin123           │')
  console.log('  │ Datin (STAMET) : datin@bmkg.go.id                    │')
  console.log('  │                  Password: datin123                  │')
  console.log('  └──────────────────────────────────────────────────────┘')
  console.log('')
  console.log('  DATIN PER STASIUN (Role: DATIN + Stasiun)')
  console.log('  ┌──────────────────────────────────────────────────────┐')
  console.log('  │ DATIN Geof BPN : datin.stageof.bpn@bmkg.go.id       │')
  console.log('  │ DATIN Met SMD  : datin.stamet.smd@bmkg.go.id        │')
  console.log('  │ DATIN Met BRU  : datin.stamet.bru@bmkg.go.id        │')
  console.log('  │   All Password : datin123                           │')
  console.log('  └──────────────────────────────────────────────────────┘')
  console.log('')
  console.log('  CONTENT PER STASIUN (Role: CONTENT + Stasiun)')
  console.log('  ┌──────────────────────────────────────────────────────┐')
  console.log('  │ Content Geof   : content.stageof.bpn@bmkg.go.id     │')
  console.log('  │                  Password: content123                │')
  console.log('  └──────────────────────────────────────────────────────┘')
  console.log('')
  console.log('  PELAYANAN DATA (/pelayanan-data)')
  console.log('  ┌──────────────────────────────────────────────────────┐')
  console.log('  │ Budi Santoso   : pelayanan@example.com               │')
  console.log('  │   (verified)     Password: pelayanan123             │')
  console.log('  │ Siti Aminah    : pelayanan2@example.com              │')
  console.log('  │   (unverified)   Password: pelayanan456             │')
  console.log('  └──────────────────────────────────────────────────────┘')
  console.log('')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
