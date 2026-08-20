import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@employr.com";
  const rawPassword = "admin123";

  // Hash password with scrypt format salt:hash (matching admin login route)
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(rawPassword, salt, 64).toString("hex");
  const hashedPassword = `${salt}:${hash}`;
  const now = new Date();

  // Upsert admin user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      name: "Super Admin",
      updated_at: now,
    },
    create: {
      email,
      name: "Super Admin",
      role: "ADMIN",
      updated_at: now,
    },
  });

  // Check existing credential account
  const existingAccount = await prisma.accounts.findFirst({
    where: {
      user_id: user.id,
      provider_id: "credential",
    },
  });

  if (existingAccount) {
    await prisma.accounts.update({
      where: { id: existingAccount.id },
      data: { password: hashedPassword, updated_at: now },
    });
  } else {
    await prisma.accounts.create({
      data: {
        id: crypto.randomUUID(),
        user_id: user.id,
        account_id: user.id,
        provider_id: "credential",
        password: hashedPassword,
        created_at: now,
        updated_at: now,
      },
    });
  }

  console.log("✅ Admin user created successfully!");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${rawPassword}`);
  console.log(`   Role:     ADMIN`);
  console.log(`   User ID:  ${user.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Error creating admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
