"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.getSharedCategories = getSharedCategories;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.toggleCategoryDisabled = toggleCategoryDisabled;
exports.seedDefaultCategories = seedDefaultCategories;
const db_1 = require("../../db");
async function listCategories({ isShared, isDisabled, ownerId, } = {}) {
    const where = {};
    if (typeof isShared === 'boolean')
        where.isShared = isShared;
    if (typeof isDisabled === 'boolean')
        where.isDisabled = isDisabled;
    if (ownerId)
        where.ownerId = ownerId;
    return db_1.prisma.propertyCategory.findMany({
        where,
        include: { owner: { select: { id: true, email: true, full_name: true } } },
        orderBy: { name: 'asc' },
    });
}
async function getSharedCategories() {
    return db_1.prisma.propertyCategory.findMany({
        where: { isShared: true, isDisabled: false },
        orderBy: { name: 'asc' },
    });
}
async function getCategoryById(id) {
    return db_1.prisma.propertyCategory.findUnique({
        where: { id },
        include: {
            owner: { select: { id: true, email: true, full_name: true } },
            properties: { select: { id: true, title: true, address: true } },
        },
    });
}
async function createCategory(input, userId) {
    const { name, description, isShared = true, ownerId } = input;
    if (!name || typeof name !== 'string') {
        throw new Error('Category name is required');
    }
    return db_1.prisma.propertyCategory.create({
        data: {
            name,
            description,
            isShared,
            ownerId: ownerId || userId,
        },
    });
}
async function updateCategory(id, input) {
    if (!id)
        throw new Error('Category ID is required');
    const category = await db_1.prisma.propertyCategory.findUnique({ where: { id } });
    if (!category)
        throw new Error('Category not found');
    return db_1.prisma.propertyCategory.update({
        where: { id },
        data: input,
    });
}
async function deleteCategory(id) {
    if (!id)
        throw new Error('Category ID is required');
    const category = await db_1.prisma.propertyCategory.findUnique({ where: { id } });
    if (!category)
        throw new Error('Category not found');
    // Prevent deletion if properties are still assigned
    const propCount = await db_1.prisma.property.count({ where: { categoryId: id } });
    if (propCount > 0) {
        throw new Error(`Cannot delete: ${propCount} propert${propCount === 1 ? 'y' : 'ies'} still assigned`);
    }
    return db_1.prisma.propertyCategory.delete({ where: { id } });
}
async function toggleCategoryDisabled(id) {
    const category = await db_1.prisma.propertyCategory.findUnique({ where: { id } });
    if (!category)
        throw new Error('Category not found');
    return db_1.prisma.propertyCategory.update({
        where: { id },
        data: { isDisabled: !category.isDisabled },
    });
}
async function seedDefaultCategories(userId) {
    const defaults = [
        { name: 'Apartment', description: 'Standard apartment unit', isShared: true },
        { name: 'Condo', description: 'Condominium property', isShared: true },
        { name: 'House', description: 'Single-family house', isShared: true },
        { name: 'Townhouse', description: 'Townhouse or row house', isShared: true },
        { name: 'Villa', description: 'Luxury villa or estate', isShared: true },
        { name: 'Studio', description: 'Studio apartment', isShared: true },
        { name: 'Penthouse', description: 'Penthouse unit', isShared: true },
    ];
    const created = [];
    for (const cat of defaults) {
        const existing = await db_1.prisma.propertyCategory.findUnique({
            where: { name: cat.name },
        });
        if (!existing) {
            const c = await db_1.prisma.propertyCategory.create({
                data: { ...cat, ownerId: userId },
            });
            created.push(c);
        }
    }
    return created;
}
