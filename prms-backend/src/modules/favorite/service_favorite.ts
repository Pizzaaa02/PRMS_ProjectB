import { prisma } from '../../db';

export const getMyFavorites = async (userId: string) => {
  return prisma.favorite.findMany({
    where: { userId },
    include: { property: true },
  });
};

export const addFavorite = async (userId: string, propertyId: string) => {
  return prisma.favorite.upsert({
    where: { userId_propertyId: { userId, propertyId } },
    update: {},
    create: { userId, propertyId },
  });
};

export const removeFavorite = async (userId: string, propertyId: string) => {
  return prisma.favorite.deleteMany({
    where: { userId, propertyId },
  });
};

export const checkFavorite = async (userId: string, propertyId: string) => {
  const fav = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });
  return { favorited: !!fav };
};