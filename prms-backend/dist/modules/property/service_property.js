"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProperties = getAllProperties;
exports.getPropertyById = getPropertyById;
exports.createProperty = createProperty;
exports.updateProperty = updateProperty;
exports.deactivateProperty = deactivateProperty;
exports.addImage = addImage;
exports.deleteImage = deleteImage;
exports.getLandlordProperties = getLandlordProperties;
const db_1 = require("../../db");
async function getAllProperties(page = 1, limit = 10) {
    const [properties, total] = await Promise.all([
        db_1.prisma.property.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' }, include: { owner: { select: { id: true, full_name: true, email: true } }, amenities: true, images: true, category: true } }),
        db_1.prisma.property.count(),
    ]);
    return { properties, total };
}
async function getPropertyById(id) {
    return db_1.prisma.property.findUnique({
        where: { id },
        include: { owner: true, amenities: true, images: true, category: true },
    });
}
async function createProperty(data, ownerId) {
    const amenitiesList = data.amenities;
    delete data.amenities;
    const imagesList = data.images;
    delete data.images;
    const property = await db_1.prisma.property.create({
        data: { ...data, owner: { connect: { id: ownerId } } },
    });
    if (amenitiesList && amenitiesList.length > 0) {
        await db_1.prisma.amenity.createMany({ data: amenitiesList.map((a) => ({ ...a, propertyId: property.id })) });
    }
    if (imagesList && imagesList.length > 0) {
        await db_1.prisma.propertyImage.createMany({ data: imagesList.map((img) => ({ ...img, propertyId: property.id })) });
    }
    return db_1.prisma.property.findUnique({ where: { id: property.id }, include: { amenities: true, images: true, owner: true, category: true } });
}
async function updateProperty(id, data) {
    return db_1.prisma.property.update({
        where: { id }, data,
        include: { amenities: true, images: true, owner: true, category: true },
    });
}
async function deactivateProperty(id) {
    return db_1.prisma.property.update({ where: { id }, data: { status: 'INACTIVE' } });
}
async function addImage(propertyId, url) {
    return db_1.prisma.propertyImage.create({ data: { propertyId, url } });
}
async function deleteImage(imageId) {
    return db_1.prisma.propertyImage.delete({ where: { id: imageId } });
}
async function getLandlordProperties(landlordId) {
    return db_1.prisma.property.findMany({
        where: { ownerId: landlordId },
        include: { amenities: true, images: true, category: true },
    });
}
