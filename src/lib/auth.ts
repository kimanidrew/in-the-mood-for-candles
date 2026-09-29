import { createHmac, scryptSync } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE = "imc_session";
const secret = () => process.env.AUTH_SECRET || "development-only-change-me";

export function hashPassword(password: string, salt: string) {
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  return scryptSync(password, salt, 64).toString("hex") === expected;
}

export function createSessionValue(userId: string) {
  const signature = createHmac("sha256", secret()).update(userId).digest("hex");
  return userId + "." + signature;
}

function readSessionValue(value: string) {
  const [userId, signature] = value.split(".");
  if (!userId || !signature) return null;
  const expected = createHmac("sha256", secret()).update(userId).digest("hex");
  return signature === expected ? userId : null;
}

export async function getSessionUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  const userId = token ? readSessionValue(token) : null;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId }, select: { id:true,name:true,email:true,role:true } });
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
  return user;
}

export { COOKIE };
