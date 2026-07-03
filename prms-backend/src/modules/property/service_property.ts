import { prisma } from '../../db';

export async function getAllProperties(page = 1, limit = 10) {
  const [properties, total] = await Promise.all([
    prisma.property.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { owner: { select: { id: true, full_name: true, email: true } }, amenities: true, images: true, category: true } }),
    prisma.property.count(),
  ]);
  return { properties, total };
}

export async function getPropertyById(id: string) {
  return prisma.property.findUnique({
    where: { id },
    include: { owner: true, amenities: true, images: true, category: true },
  });
}

export async function createProperty(data: any, ownerId: string) {
  const amenitiesList = data.amenities;
  delete data.amenities;
  const imagesList = data.images;
  delete data.images;

  const property = await prisma.property.create({
    data: { ...data, owner: { connect: { id: ownerId } } },
  });

  if (amenitiesList && amenitiesList.length > 0) {
    await prisma.amenity.createMany({ data: amenitiesList.map((a: any) => ({ ...a, propertyId: property.id })) });
  }
  if (imagesList && imagesList.length > 0) {
    await prisma.propertyImage.createMany({ data: imagesList.map((img: any) => ({ ...img, propertyId: property.id })) });
  }

  return prisma.property.findUnique({ where: { id: property.id }, include: { amenities: true, images: true, owner: true, category: true } });
}

export async function updateProperty(id: string, data: any) {
  return prisma.property.update({
    where: { id }, data,
    include: { amenities: true, images: true, owner: true, category: true },
  });
}

export async function deactivateProperty(id: string) {
  return prisma.property.update({ where: { id }, data: { status: 'INACTIVE' } });
}

export async function addImage(propertyId: string, url: string) {
  return prisma.propertyImage.create({ data: { propertyId, url } });
}

export async function deleteImage(imageId: string) {
  return prisma.propertyImage.delete({ where: { id: imageId } });
}

export async function getLandlordProperties(landlordId: string) {
  return prisma.property.findMany({
    where: { ownerId: landlordId },
    include: { amenities: true, images: true, category: true },
  });
}
