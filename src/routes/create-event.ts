import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { generateSlug } from "../utils/generate-slugs"
import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify"
import { BadRequest } from "./_errors/bad-requests"

export async function createEvent(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/events",
        {
            schema: {
                summary: "Create an event.",
                tags: ["events"],
                body: z.object({
                    title: z.string().min(4),
                    details: z.string().nullable().optional(),
                    maximumAttendees: z
                        .number()
                        .int()
                        .positive()
                        .nullable()
                        .optional()
                }),
                response: {
                    201: z.object({
                        eventId: z.string().uuid()
                    })
                }
            }
        },
        async (request, response) => {
            const { title, details, maximumAttendees } = request.body

            const slug = generateSlug(title)

            const eventWithSameSlug = await prisma.event.findUnique({
                where: {
                    slug
                }
            })

            if (eventWithSameSlug !== null) {
                throw new BadRequest(
                    "Another event with the same title already exists."
                )
            }

            const event = await prisma.event.create({
                data: {
                    title,
                    details,
                    maximumAttendees,
                    slug: slug
                }
            })
            return response.status(201).send({ eventId: event.id })
        }
    )
}
