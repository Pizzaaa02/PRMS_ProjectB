"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAgents = getAllAgents;
exports.getAgentById = getAgentById;
exports.createAgent = createAgent;
exports.updateAgent = updateAgent;
exports.deleteAgent = deleteAgent;
exports.assignProperty = assignProperty;
exports.getAssignedProperties = getAssignedProperties;
const db_1 = require("../../db");
async function getAllAgents(page = 1, limit = 10, search, propertyId) {
    const where = {};
    if (search) {
        where.user = {
            OR: [
                { email: { contains: search } },
                { full_name: { contains: search } }
            ]
        };
    }
    if (propertyId) {
        // Find agents who are assigned to this property
        const agentProperties = await db_1.prisma.agentProperty.findMany({
            where: { propertyId },
            select: { agentId: true }
        });
        const agentIds = agentProperties.map(ap => ap.agentId);
        where.id = { in: agentIds };
    }
    const [agents, total] = await Promise.all([
        db_1.prisma.agent.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { id: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        full_name: true,
                        phone: true,
                        profile_img_url: true
                    }
                },
                agentProperties: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                title: true,
                                address: true
                            }
                        }
                    }
                }
            }
        }),
        db_1.prisma.agent.count({ where }),
    ]);
    return { agents, total };
}
async function getAgentById(id) {
    return db_1.prisma.agent.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    full_name: true,
                    phone: true,
                    profile_img_url: true
                }
            },
            agentProperties: {
                include: {
                    property: {
                        select: {
                            id: true,
                            title: true,
                            address: true
                        }
                    }
                }
            }
        },
    });
}
async function createAgent(userId) {
    // First check if user exists
    const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new Error('User not found');
    // Check if agent already exists
    const existingAgent = await db_1.prisma.agent.findUnique({ where: { userId } });
    if (existingAgent)
        throw new Error('Agent already exists for this user');
    // Create agent and link it to user
    return db_1.prisma.agent.create({
        data: {
            userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    full_name: true,
                    phone: true,
                    profile_img_url: true
                }
            },
            agentProperties: {
                include: {
                    property: {
                        select: {
                            id: true,
                            title: true,
                            address: true
                        }
                    }
                }
            }
        }
    });
}
async function updateAgent(id, data) {
    return db_1.prisma.agent.update({
        where: { id },
        data,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    full_name: true,
                    phone: true,
                    profile_img_url: true
                }
            }
        }
    });
}
async function deleteAgent(id) {
    return db_1.prisma.agent.delete({ where: { id } });
}
async function assignProperty(agentId, propertyId) {
    // Check if agent exists
    const agent = await db_1.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent)
        throw new Error('Agent not found');
    // Check if property exists
    const property = await db_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new Error('Property not found');
    // Check if assignment already exists
    const existingAssignment = await db_1.prisma.agentProperty.findUnique({
        where: { agentId_propertyId: { agentId, propertyId } }
    });
    if (existingAssignment) {
        throw new Error('Agent already assigned to this property');
    }
    // Create the assignment
    return db_1.prisma.agentProperty.create({
        data: {
            agentId,
            propertyId
        }
    });
}
async function getAssignedProperties(agentId, page = 1, limit = 10) {
    const where = { agentId };
    const [properties, total] = await Promise.all([
        db_1.prisma.agentProperty.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        address: true,
                        rent: true,
                        status: true,
                        images: { select: { url: true }, take: 1 }
                    }
                }
            }
        }),
        db_1.prisma.agentProperty.count({ where }),
    ]);
    return {
        agents: properties.map(p => ({
            ...p.property,
            agent_property_id: p.propertyId
        })),
        total
    };
}
