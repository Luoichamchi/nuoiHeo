const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const adminPinHash = await bcrypt.hash("123456", 10);
  const memberPinHash = await bcrypt.hash("000000", 10);

  const admin = await prisma.user.upsert({
    where: { id: "admin-seed" },
    update: {
      fullName: "Admin",
      pinHash: adminPinHash,
      role: "ADMIN",
      isActive: true
    },
    create: {
      id: "admin-seed",
      fullName: "Admin",
      pinHash: adminPinHash,
      role: "ADMIN"
    }
  });

  const names = ["Nguyen Van A", "Tran Thi B", "Le Van C", "Pham Thi D", "Hoang Van E"];

  for (let i = 0; i < names.length; i += 1) {
    await prisma.user.upsert({
      where: { id: `member-seed-${i}` },
      update: {
        fullName: names[i],
        pinHash: memberPinHash,
        role: "MEMBER",
        isActive: true
      },
      create: {
        id: `member-seed-${i}`,
        fullName: names[i],
        pinHash: memberPinHash,
        role: "MEMBER"
      }
    });
  }

  const now = new Date();
  const startAt = new Date(now.getTime() + 60 * 60 * 1000);
  const lockAt = new Date(now.getTime() + 30 * 60 * 1000);

  const existingMatch = await prisma.match.findFirst({ where: { title: "Team A vs Team B" } });
  if (!existingMatch) {
    await prisma.match.create({
      data: {
        title: "Team A vs Team B",
        optionALabel: "Team A",
        optionBLabel: "Team B",
        penaltyAmount: 50000,
        startAt,
        lockAt,
        createdById: admin.id
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
