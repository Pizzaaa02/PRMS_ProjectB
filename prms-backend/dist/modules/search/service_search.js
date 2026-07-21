"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProperties = searchProperties;
exports.toggleFavorite = toggleFavorite;
exports.getFavorites = getFavorites;
const db_1 = require("../../db");
async function searchProperties(query) {
    const where = {};
    if (query.location)
        where.OR = [{ city: { contains: query.location } }, { address: { contains: query.location } }, { state: { contains: query.location } }];
    if (query.property_type)
        where.property_type = query.property_type;
    if (query.min_price || query.max_price) {
        where.rent = {};
        if (query.min_price)
            where.rent.gte = parseFloat(query.min_price);
        if (query.max_price)
            where.rent.lte = parseFloat(query.max_price);
    }
    if (query.amenity)
        where.amenities = { some: { name: { contains: query.amenity } } };
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const [properties, total] = await Promise.all([
        db_1.prisma.property.findMany({ where, include: { owner: { select: { id: true, full_name: true, email: true } }, amenities: true, images: { take: 3 }, category: true }, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' } }),
        db_1.prisma.property.count({ where }),
    ]);
    return { properties, total, page, limit, totalPages: Math.ceil(total / limit) };
}
async function toggleFavorite(userId, propertyId) {
    const existing = await db_1.prisma.favorite.findUnique({
        where: { userId_propertyId: { userId, propertyId } },
    });
    if (existing) {
        await db_1.prisma.favorite.delete({ where: { userId_propertyId: { userId, propertyId } } });
        return false;
    }
    await db_1.prisma.favorite.create({ data: { userId, propertyId } });
    return true;
}
async function getFavorites(userId) {
    return db_1.prisma.favorite.findMany({
        where: { userId },
        include: { property: { include: { images: { take: 1 } } } },
    });
}
