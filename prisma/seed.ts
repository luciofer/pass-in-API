import { prisma } from "../src/lib/prisma"

async function seed() {
    await prisma.event.create({
        data: {
            id: "7e62275f-e8e6-4528-9861-b99d4abac115",
            title: "Unite Summit",
            slug: "unite-summit",
            details: "The event of the year",
            maximumAttendees: 120
        }
    })
}

seed().then(() => {
    console.log("Database seeded!")
    prisma.$disconnect()
})