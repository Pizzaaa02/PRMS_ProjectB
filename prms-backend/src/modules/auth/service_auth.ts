import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../db';
import { env } from '../../config';

export async function registerUser(email: string, password: string, full_name?: string, phone?: string, role?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const firebase_uid = "";

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firebase_uid,
      full_name,
      phone,
      UserRole: {
        create: {
          role: { connect: { name: role || 'Tenant' } }
        }
      }
    },
    include: { UserRole: { include: { role: true } } },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { UserRole: { include: { role: true } } },
  });

  if (!user) throw new Error('Invalid credentials');
  if (!user.passwordHash) throw new Error('Please use Firebase login for this account');
  if (!user.is_active) throw new Error('Account is suspended');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  return user;
}

export function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

export async function saveRefreshToken(userId: string, refreshToken: string) {
  const hash = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: hash } });
}

export async function verifyRefreshToken(userId: string, refreshToken: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.refreshToken) throw new Error('No refresh token found');
  const valid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!valid) throw new Error('Invalid refresh token');
  return user;
}

export async function getCurrentUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, full_name: true, phone: true,
      profile_img_url: true, firebase_uid: true, is_active: true, created_at: true,
      UserRole: { include: { role: true } },
    },
  });
}

export async function updateUserProfile(
  userId: string,
  data: { full_name?: string; phone?: string; profile_img_url?: string; role?: string }
) {
  // If role is provided, update the UserRole association
  if (data.role) {
    const role = await prisma.role.findUnique({ where: { name: data.role } });
    if (!role) throw new Error(`Role ${data.role} not found`);
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { userId, roleId: role.id },
    });
  }

  const { role, ...userFields } = data;
  return prisma.user.update({
    where: { id: userId },
    data: userFields,
    include: {
      UserRole: { include: { role: true } },
    },
  });
}

export async function logoutUser(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) throw new Error('Password-based account required');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error('Current password is incorrect');

  const newHash = await bcrypt.hash(newPassword, 10);
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
}
