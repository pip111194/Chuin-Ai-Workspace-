import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const convCount = await prisma.conversation.count();
  const msgCount = await prisma.message.count();
  console.log("Database connected!");
  console.log("Users: " + userCount);
  console.log("Conversations: " + convCount);
  console.log("Messages: " + msgCount);
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
