import { faker } from "@faker-js/faker"
import type { ActionFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import connectDb from "~/db/connectDb.server"
import { generateAvatars, randomColor } from "~/utils"
import bcrypt from "bcryptjs"

const skills = [
  "problem-solving",
  "creative",
  "communication",
  "management",
  "leadership",
  "social",
]

const personality = [
  "adventurous",
  "balanced",
  "courageous",
  "curious",
  "driven",
  "energetic",
  "enthusiastic",
  "methodical",
  "observant",
  "orderly",
  "organized",
  "perceptive",
  "positive",
  "risktaker",
  "selfaware",
]

const interest = [
  "sports",
  "music",
  "movies",
  "travel",
  "food",
  "games",
  "cooking",
  "dancing",
  "languages",
  "exercise",
  "tecnology",
  "travel",
  "movies",
  "politics",
]

function pickRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const randomSubset = (arr: string[]) => arr.filter(() => Math.random() > 0.5)

async function createRandomUser() {
  const fullname = faker.name.findName()
  return {
    fullname: fullname,
    isCorporation: Math.random() > 0.5,
    description: faker.lorem.paragraphs(5),
    tags: [pickRandom(skills), pickRandom(personality), pickRandom(interest)],
    avatar: {
      image: generateAvatars(1)[0],
      color: randomColor(),
    },
    requters: [],
    network: [],
    connections: [],
    socials: {
      github: `https://github.com/${fullname.replace(" ", "-")}`,
      linkedin: `https://www.linkedin.com/in/${fullname.replace(" ", "-")}/`,
      website: faker.internet.url(),
    },
    password: await bcrypt.hash("randomuser", 10),
    email: faker.internet.email(fullname, faker.name.lastName()),
    createdAt: faker.date.between(
      "2018-01-01T00:00:00.000Z",
      "2022-01-01T00:00:00.000Z"
    ),
    isProfileComplete: true,
  }
}
const DEFAULT_SEEDERS = 50

export const action: ActionFunction = async ({ request }) => {
  if (process.env.NODE_ENV === "production")
    return json({
      error:
        "Populating the database with fakerJS is disabled in production mode",
    })

  const db = await connectDb()
  const url = new URL(request.url)
  const seederCount = parseInt(
    (url.searchParams.get("count") as string) ?? DEFAULT_SEEDERS,
    10
  )

  const seedUsers = []
  for (let i = 0; i < seederCount; i++) {
    seedUsers.push(await createRandomUser())
  }

  try {
    await db.models.Seed.deleteMany()
    await db.models.Seed.insertMany(seedUsers)

    // Create connnections
    const seeders = await db.models.Seed.find({})
    const seedersIds = seeders.map((s) => s._id)

    for (let j = 0; j < seeders.length; j++) {
      const seeder = seeders[j]
      const subset = randomSubset(seedersIds)
      // Both user and seeder are connected, e.g intresseted in a working relationship and can message each other.
      seeder.network = subset
      seeder.connections = subset
      await db.models.Seed.updateOne({ _id: seeder._id }, seeder)
    }

    // const builkUpdate = seeders.map((s) => ({
    //   updateOne: { filter: { _id: s._id }, update: s },
    // }))
    // await db.models.Seed.bulkWrite(builkUpdate)
  } catch (error) {
    return json({
      error,
    })
  }
  return json({
    status: 200,
    statusText: `Seeded successfully, ${seederCount} users created`,
  })
}
