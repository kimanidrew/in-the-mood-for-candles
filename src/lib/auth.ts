import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE = "imc_session";

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function getSessionUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return prisma.user.findUnique({ where: { id: token }, select: { id:true,name:true,email:true,role:true } });
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
  return user;
}

export { COOKIE };
