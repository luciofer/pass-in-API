import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma"

export async function getEventAttendees(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/events/:eventId/attendees",
        {
            schema: {
                summary: "Get event attendees",
                tags: ["attendees"],
                params: z.object({
                    eventId: z.string().uuid()
                }),
                querystring: z.object({
                    pageIndex: z
                        .string()
                        .nullish()
                        .default("0")
                        .transform(Number),
                    query: z.string().nullish()
                }),
                response: {
                    200: z.object({
                        attendees: z.array(
                            z.object({
                                id: z.number(),
                                name: z.string(),
                                email: z.string().email(),
                                createdAt: z.date(),
                                checkedInAt: z.date().nullable()
                            })
                        ),
                    total: z.number()
                    })
                }
            }
        },
        async (request, response) => {
            const { eventId } = request.params
            const { pageIndex, query } = request.query

            const [attendees, total] = await Promise.all([
                prisma.attendee.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                        checkIn: {
                            select: {
                                createdAt: true
                            }
                        }
                    },
                    where: query
                        ? {
                              eventId,
                              name: {
                                  contains: query
                              }
                          }
                        : {
                              eventId
                          },
                    take: 10,
                    skip: pageIndex * 10,
                    orderBy: {
                        createdAt: "desc"
                    }
                }),
                prisma.attendee.count({
                    where: query
                        ? {
                              eventId,
                              name: {
                                  contains: query
                              }
                          }
                        : {
                              eventId
                          }
                })
            ])

            return response.send({
                attendees: attendees.map((attendee) => {
                    return {
                        id: attendee.id,
                        name: attendee.name,
                        email: attendee.email,
                        createdAt: attendee.createdAt,
                        checkedInAt: attendee.checkIn?.createdAt ?? null
                    }
                }),
                total
            })
        }
    )
}
