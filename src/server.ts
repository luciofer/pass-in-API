import fastify from "fastify"
import { string, z } from 'zod'
import { PrismaClient } from "@prisma/client"
import { error } from "console"
const app = fastify()

app.get("/", () => {
    return "Pass.in APP "
})

const prisma = new PrismaClient({
    log: ['query']
})


app.post("/events", async (request, response) => {
    const createEventSchema = z.object({
        title: z.string().min(4),
        details: z.string().nullable(),
        maximumAttendees: z.number().int().positive().nullable()
    })

    try{
        const data = createEventSchema.parse(request.body)

        const event = await prisma.event.create({
            data:{
                title: data.title,
                details: data.details,
                maximumAttendees: data.maximumAttendees,
                slug: new Date().toISOString()
            }
        })
        return response.status(201).send({eventId: event.id})
    } catch (error: any) {
        console.log(error.message)
        return response.status(500).send(error.message)
    }
   
})

app.listen({ port: 3333 }).then(() => {
    console.log("HTTP server running")
})
