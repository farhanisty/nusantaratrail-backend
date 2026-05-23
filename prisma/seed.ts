import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed superadmin
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@nusantaratrail.id' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@nusantaratrail.id',
      password: hashedPassword,
      role: Role.superadmin,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nusantaratrail.id' },
    update: {},
    create: {
      name: 'Admin Dinas',
      email: 'admin@nusantaratrail.id',
      password: hashedPassword,
      role: Role.admin,
    },
  });

  // Seed lokasi wisata
  await prisma.location.upsert({
    where: { slug: 'candi-prambanan' },
    update: {},
    create: {
      name: 'Candi Prambanan',
      slug: 'candi-prambanan',
      description: 'Candi Hindu terbesar di Indonesia yang dibangun pada abad ke-9.',
      address: 'Jl. Raya Solo - Yogyakarta No.16, Kranggan, Bokoharjo, Prambanan, Sleman',
      latitude: -7.75208,
      longitude: 110.49149,
      category: 'candi',
      createdBy: admin.id,
    },
  });

  await prisma.location.upsert({
    where: { slug: 'keraton-yogyakarta' },
    update: {},
    create: {
      name: 'Keraton Yogyakarta',
      slug: 'keraton-yogyakarta',
      description: 'Istana resmi Kesultanan Ngayogyakarta Hadiningrat yang dibangun sejak 1755.',
      address: 'Jl. Rotowijayan Blok No. 1, Panembahan, Kecamatan Kraton, Yogyakarta',
      latitude: -7.80541,
      longitude: 110.36427,
      category: 'keraton',
      createdBy: admin.id,
    },
  });

  console.log('✅ Seeding selesai!');
  console.log('👤 Superadmin:', superadmin.email);
  console.log('👤 Admin:', admin.email);
  console.log('🔑 Password semua akun: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
