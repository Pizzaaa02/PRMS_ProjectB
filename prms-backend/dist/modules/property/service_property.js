"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDate = normalizeDate;
exports.getAllProperties = getAllProperties;
exports.getPropertyById = getPropertyById;
exports.createProperty = createProperty;
exports.updateProperty = updateProperty;
exports.deactivateProperty = deactivateProperty;
exports.addImage = addImage;
exports.getImageById = getImageById;
exports.deleteImage = deleteImage;
exports.addVideoToProperty = addVideoToProperty;
exports.removeVideoFromProperty = removeVideoFromProperty;
exports.addDocumentToProperty = addDocumentToProperty;
exports.removeDocumentFromProperty = removeDocumentFromProperty;
exports.getLandlordProperties = getLandlordProperties;
const db_1 = require("../../db");
/** Convert date-only strings (YYYY-MM-DD) to Date objects for Prisma DateTime fields */
function normalizeDate(val) {
    if (!val)
        return undefined;
    if (val instanceof Date)
        return val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
}
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
    // Normalize date-only strings to Date objects for Prisma DateTime fields
    if (data.availableFrom)
        data.availableFrom = normalizeDate(data.availableFrom);
    if (data.availableTo)
        data.availableTo = normalizeDate(data.availableTo);
    // Prisma 7: use relation syntax instead of scalar FK fields in create data
    let categoryConnect = data.categoryId
        ? { connect: { id: data.categoryId } }
        : undefined;
    if (data.categoryId)
        delete data.categoryId;
    const property = await db_1.prisma.property.create({
        data: { ...data, category: categoryConnect, owner: { connect: { id: ownerId } } },
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
    // Separate non-core fields (media + amenities) from the data object
    const imagesArr = data.images;
    const videosArr = data.videos;
    const amenitiesArr = data.amenities;
    delete data.images;
    delete data.videos;
    delete data.amenities;
    // Normalize date-only strings for Prisma DateTime fields
    if (data.availableFrom != null)
        data.availableFrom = normalizeDate(data.availableFrom);
    if (data.availableTo != null)
        data.availableTo = normalizeDate(data.availableTo);
    // Atomic core-field update
    const updated = await db_1.prisma.property.update({
        where: { id },
        data,
        include: { amenities: true, images: true, owner: true, category: true },
    });
    // Sync media (images + videos)
    if (Array.isArray(imagesArr)) {
        await syncImages(id, imagesArr);
    }
    if (Array.isArray(videosArr)) {
        await syncVideos(id, videosArr);
    }
    // Sync amenities
    if (Array.isArray(amenitiesArr)) {
        await syncAmenities(id, amenitiesArr);
    }
    return db_1.prisma.property.findUnique({
        where: { id },
        include: { amenities: true, images: true, owner: true, category: true },
    });
}
async function syncImages(propertyId, incomingImages) {
    const existing = await db_1.prisma.propertyImage.findMany({ where: { propertyId } });
    const existingMap = new Map(existing.map((img) => [img.id, img]));
    const idsToAdd = [];
    const idsToRemove = [];
    const incomingIds = new Set();
    for (const img of incomingImages) {
        incomingIds.add(img.id);
        if (!existingMap.has(img.id)) {
            idsToAdd.push(img.id);
        }
    }
    for (const img of existing) {
        if (!incomingIds.has(img.id)) {
            idsToRemove.push(img.id);
        }
    }
    if (idsToAdd.length > 0) {
        await db_1.prisma.propertyImage.createMany({
            data: incomingImages
                .filter((img) => idsToAdd.includes(img.id))
                .map((img) => ({ ...img, propertyId })),
        });
    }
    if (idsToRemove.length > 0) {
        await db_1.prisma.propertyImage.deleteMany({
            where: { id: { in: idsToRemove } },
        });
    }
}
async function syncVideos(propertyId, incomingVideos) {
    const existing = await db_1.prisma.propertyImage.findMany({
        where: { propertyId, type: 'video' },
    });
    const existingMap = new Map(existing.map((vid) => [vid.id, vid]));
    const incomingIds = new Set();
    const idsToAdd = [];
    const idsToRemove = [];
    for (const vid of incomingVideos) {
        incomingIds.add(vid.id);
        if (!existingMap.has(vid.id)) {
            idsToAdd.push(vid.id);
        }
    }
    for (const vid of existing) {
        if (!incomingIds.has(vid.id)) {
            idsToRemove.push(vid.id);
        }
    }
    if (idsToAdd.length > 0) {
        await db_1.prisma.propertyImage.createMany({
            data: incomingVideos
                .filter((v) => idsToAdd.includes(v.id))
                .map((v) => ({ ...v, propertyId, type: 'video' })),
        });
    }
    if (idsToRemove.length > 0) {
        await db_1.prisma.propertyImage.deleteMany({
            where: { id: { in: idsToRemove } },
        });
    }
}
async function syncAmenities(propertyId, incomingAmenities) {
    const existing = await db_1.prisma.amenity.findMany({
        where: { propertyId },
    });
    const existingMap = new Map(existing.map((a) => [a.id, a]));
    const incomingIds = new Set();
    const toCreate = [];
    const toUpdate = [];
    const toDelete = [];
    for (const a of incomingAmenities) {
        incomingIds.add(a.id);
        if (existingMap.has(a.id)) {
            toUpdate.push(a);
        }
        else {
            toCreate.push({ ...a, propertyId });
        }
    }
    for (const a of existing) {
        if (!incomingIds.has(a.id)) {
            toDelete.push(a.id);
        }
    }
    if (toUpdate.length > 0) {
        for (const a of toUpdate) {
            await db_1.prisma.amenity.update({
                where: { id: a.id },
                data: { name: a.name, description: a.description },
            });
        }
    }
    if (toCreate.length > 0) {
        await db_1.prisma.amenity.createMany({ data: toCreate });
    }
    if (toDelete.length > 0) {
        await db_1.prisma.amenity.deleteMany({ where: { id: { in: toDelete } } });
    }
}
async function deactivateProperty(id) {
    return db_1.prisma.property.update({ where: { id }, data: { status: 'INACTIVE' } });
}
async function addImage(propertyId, url, thumbnailUrl) {
    return db_1.prisma.propertyImage.create({
        data: { propertyId, url, thumbnailUrl: thumbnailUrl || undefined, type: 'image' },
    });
}
async function getImageById(imageId) {
    return db_1.prisma.propertyImage.findUnique({ where: { id: imageId } });
}
async function deleteImage(imageId) {
    return db_1.prisma.propertyImage.delete({ where: { id: imageId } });
}
async function addVideoToProperty(propertyId, url) {
    const prop = await db_1.prisma.property.findUnique({ where: { id: propertyId }, select: { videoUrls: true } });
    if (!prop)
        throw new Error('Property not found');
    const urls = prop.videoUrls || [];
    urls.push(url);
    return db_1.prisma.property.update({
        where: { id: propertyId },
        data: { videoUrls: urls },
    });
}
async function removeVideoFromProperty(propertyId, url) {
    const prop = await db_1.prisma.property.findUnique({ where: { id: propertyId }, select: { videoUrls: true } });
    if (!prop)
        throw new Error('Property not found');
    const urls = prop.videoUrls || [];
    if (!urls.includes(url))
        return null;
    return db_1.prisma.property.update({
        where: { id: propertyId },
        data: { videoUrls: urls.filter((u) => u !== url) },
    });
}
async function addDocumentToProperty(propertyId, url) {
    const prop = await db_1.prisma.property.findUnique({ where: { id: propertyId }, select: { documentUrls: true } });
    if (!prop)
        throw new Error('Property not found');
    const urls = prop.documentUrls || [];
    urls.push(url);
    return db_1.prisma.property.update({
        where: { id: propertyId },
        data: { documentUrls: urls },
    });
}
async function removeDocumentFromProperty(propertyId, url) {
    const prop = await db_1.prisma.property.findUnique({ where: { id: propertyId }, select: { documentUrls: true } });
    if (!prop)
        throw new Error('Property not found');
    const urls = prop.documentUrls || [];
    if (!urls.includes(url))
        return null;
    return db_1.prisma.property.update({
        where: { id: propertyId },
        data: { documentUrls: urls.filter((u) => u !== url) },
    });
}
async function getLandlordProperties(landlordId) {
    const properties = await db_1.prisma.property.findMany({
        where: { ownerId: landlordId },
        include: { amenities: true, images: true, category: true, agentProperties: { include: { agent: true } } },
    });
    return properties.map((p) => ({
        ...p,
        agentProperties: p.agentProperties.map((ap) => ap.agent),
    }));
}
