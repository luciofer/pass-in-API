import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { generateSlug } from "../utils/generate-slugs"
import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify"

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
            try {
                const { title, details, maximumAttendees } = request.body

                const slug = generateSlug(title)

                const eventWithSameSlug = await prisma.event.findUnique({
                    where: {
                        slug
                    }
                })

                if (eventWithSameSlug !== null) {
                    throw new Error(
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
            } catch (error: any) {
                console.log(error.message)
                return response.status(500).send(error.message)
            }
        }
    )
}
