import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (existing) {
    console.log("Admin user already exists:", adminUsername);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      username: adminUsername,
      password: hashedPassword,
      name: "Admin",
    },
  });

  console.log("Admin user created successfully!");
  console.log("Username:", adminUsername);
  console.log("Password:", adminPassword);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});
