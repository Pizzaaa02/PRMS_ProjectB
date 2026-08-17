"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFavorite = exports.removeFavorite = exports.addFavorite = exports.getMyFavorites = void 0;
const db_1 = require("../../db");
const getMyFavorites = async (userId) => {
    return db_1.prisma.favorite.findMany({
        where: { userId },
        include: { property: true },
    });
};
exports.getMyFavorites = getMyFavorites;
const addFavorite = async (userId, propertyId) => {
    return db_1.prisma.favorite.upsert({
        where: { userId_propertyId: { userId, propertyId } },
        update: {},
        create: { userId, propertyId },
    });
};
exports.addFavorite = addFavorite;
const removeFavorite = async (userId, propertyId) => {
    return db_1.prisma.favorite.deleteMany({
        where: { userId, propertyId },
    });
};
exports.removeFavorite = removeFavorite;
const checkFavorite = async (userId, propertyId) => {
    const fav = await db_1.prisma.favorite.findUnique({
        where: { userId_propertyId: { userId, propertyId } },
    });
    return { favorited: !!fav };
};
exports.checkFavorite = checkFavorite;
