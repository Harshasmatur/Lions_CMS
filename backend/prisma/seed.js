"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const email = process.env.SEED_ADMIN_EMAIL || "admin@lionscollege.com";
    const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
    const name = process.env.SEED_ADMIN_NAME || "Admin";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`Seed skipped — admin user already exists (${email}).`);
        return;
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    const admin = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: client_1.Role.ADMIN,
            isActive: true,
        },
    });
    console.log("Created admin user:");
    console.log(`  email:    ${admin.email}`);
    console.log(`  password: ${password}`);
    console.log("IMPORTANT: change this password after first login.");
}
main()
    .catch((err) => {
    console.error(err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map