import { db } from './index';
import { usersTable } from './schema';
import { eq } from 'drizzle-orm';

// User queries for server components and server actions
export async function getAllUsers() {
  return await db.select().from(usersTable);
}

export async function getUserByEmail(email: string) {
  const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
  return users[0] || null;
}

export async function createUser(data: typeof usersTable.$inferInsert) {
  const newUser = await db.insert(usersTable).values(data).returning();
  return newUser[0];
}

export async function updateUserByEmail(email: string, data: Partial<typeof usersTable.$inferInsert>) {
  await db.update(usersTable).set(data).where(eq(usersTable.email, email));
}

export async function deleteUserByEmail(email: string) {
  await db.delete(usersTable).where(eq(usersTable.email, email));
}