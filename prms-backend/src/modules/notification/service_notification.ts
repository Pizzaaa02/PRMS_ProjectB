import { prisma } from '../../db';

// Real bug found live while fixing the IDOR issue below: this whole file
// referenced is_read/archived, neither of which exist on the real
// Notification model (schema.prisma has isRead only, no archived field
// at all) - confirmed by an actual runtime Prisma call, which throws
// "Unknown argument `is_read`. Did you mean `isRead`?" TypeScript never
// caught this (the where object here is explicitly typed `any`, and the
// generated Prisma input types apparently don't excess-property-check
// through this call shape either). markRead/markAllRead/createNotification
// were unconditionally broken at runtime; getNotifications only broke
// when a caller actually passed isRead/archived filters. Fixed the
// isRead field name; the `archived` filter is dropped here since no such
// field exists - NOT fixed: the frontend's "Archived" tab (NotificationCenter.jsx)
// depends on this field and is currently non-functional - that's a real,
// separate gap (add the field via migration, or the tab is stale/
// intended-to-be-removed - genuinely unclear which, needs a call, not a
// guess) flagged back to Boss rather than decided here.
export async function getNotifications(userId: string | undefined, isRead?: boolean) {
  const where: any = { userId };
  if (isRead !== undefined) where.isRead = isRead;
  return prisma.notification.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });
}

// Real IDOR vulnerability found live (compared against a teammate's
// separate repo, which had already fixed it - confirmed the bug was
// real by reading this file directly): markRead/deleteNotification took
// only the notification id, no ownership check at all - any logged-in
// user could mark-read or delete ANY other user's notification just by
// guessing/enumerating ids. The controller already had the real userId
// on hand (req.user.id) but never passed it through. Fixed by scoping
// both operations to {id, userId} via updateMany/deleteMany (a plain
// update/delete by id alone can't add an extra WHERE condition) and
// treating a 0-row match as "not found" - same response whether the id
// doesn't exist or just isn't this user's, so a caller can't use the
// error to enumerate other people's notification ids.
export async function markRead(id: string, userId: string) {
  const result = await prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  if (result.count === 0) throw new Error('Notification not found');
  return prisma.notification.findUnique({ where: { id } });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

export async function deleteNotification(id: string, userId: string) {
  const result = await prisma.notification.deleteMany({ where: { id, userId } });
  if (result.count === 0) throw new Error('Notification not found');
}

export async function createNotification(userId: string, data: { title: string; message: string; type: string; }) {
  return prisma.notification.create({
    data: {
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: false,
    },
  });
}