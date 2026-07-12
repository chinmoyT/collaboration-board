// One-time bootstrap for the single Admin account. There's no signup and
// Admins can't create other Admins, so this is the only way one gets made.
//
// Usage: node scripts/create-admin.js <email> <password> <name>
const bcrypt = require("bcryptjs");
const prisma = require("../src/prismaClient");

async function main() {
  const [email, password, name] = process.argv.slice(2);
  if (!email || !password || !name) {
    console.error("Usage: node scripts/create-admin.js <email> <password> <name>");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.error(`A user with email ${email} already exists (role: ${existing.role}).`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: passwordHash,
      name,
      role: "ADMIN",
    },
  });

  console.log(`Admin created: ${admin.email} (${admin.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
