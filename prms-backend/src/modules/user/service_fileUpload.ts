import { prisma } from '../../db';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

interface FileUploadData {
  originalName: string;
  storageName: string;
  mimeType: string;
  fileSize: number;
  category: string;
  url: string;
  description?: string;
}

export async function uploadFile(userId: string, data: FileUploadData) {
  return prisma.userProfileFile.create({
    data: {
      userId,
      originalName: data.originalName,
      storageName: data.storageName,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      category: data.category,
      url: data.url,
      description: data.description || null,
    },
  });
}

export async function getUserFiles(userId: string, page = 1, limit = 10, category?: string) {
  const where: any = { userId };
  if (category) {
    where.category = category;
  }

  const [files, total] = await Promise.all([
    prisma.userProfileFile.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.userProfileFile.count({ where }),
  ]);
  return { files, total };
}

export async function getFileById(fileId: string) {
  return prisma.userProfileFile.findUnique({
    where: { id: fileId },
  });
}

export async function deleteFile(fileId: string) {
  const file = await prisma.userProfileFile.findUnique({
    where: { id: fileId },
  });

  if (!file) throw new Error('File not found');

  // Delete the physical file from disk
  const filePath = path.join(__dirname, '..', '..', 'public', file.url.replace(/^\/files\//, ''));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return prisma.userProfileFile.delete({
    where: { id: fileId },
  });
}
