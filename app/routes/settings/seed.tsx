import { faker } from "@faker-js/faker"
import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import connectDb from "~/db/connectDb.server"
import { generateAvatars, randomColor } from "~/utils"
import bcrypt from "bcryptjs"

type SeedLoaderType = Record<"seedCount" | "userCount", number>

async function createRandomUser() {
  const fullname = faker.name.findName()
  return {
    fullname: fullname,
    isCorporation: Math.random() > 0.5,
    description: faker.lorem.paragraphs(5),
    tags: ["creative", "curious", "movies"],
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
    email: faker.internet.email(fullname),
    createdAt: faker.date.between(
      "2018-01-01T00:00:00.000Z",
      "2022-01-01T00:00:00.000Z"
    ),
    isProfileComplete: true,
  }
}

export const action: ActionFunction = async () => {
  const db = await connectDb()
  const seedData = await db.models.Seed.find({})

  // const seedUsers = []
  // for (let i = 0; i < 50; i++) {
  //   seedUsers.push(await createRandomUser())
  // }
  // console.log("seedUsers: ", seedUsers)

  try {
    // await db.models.Seed.deleteMany()
    // await db.models.Seed.insertMany(seedUsers)
    await db.models.Users.deleteMany()
    await db.models.Users.insertMany(seedData)
  } catch (error) {
    return redirect("/?seed=false", {
      status: 302,
    })
  }
  return redirect("/?seed=true")
}

export const loader: LoaderFunction = async () => {
  const db = await connectDb()

  return {
    userCount: await db.models.Users.countDocuments(),
    seedCount: await db.models.Seed.countDocuments(),
  }
}

export default function Seed() {
  const { userCount, seedCount } = useLoaderData<SeedLoaderType & any>()

  return (
    <section className="flex justify-center items-center">
      <div className="bg-gray-100 p-4 shadow-solid text-2xl">
        <p>
          <b> You have {userCount} user(s) in the database</b>
        </p>
        <p>Do you want to seed the database with {seedCount} users</p>
        <div className="flex justify-between mt-4">
          <Form method="post">
            <button
              className="bg-fuchsia-400 w-full px-6 py-2 rounded-sm"
              type="submit"
            >
              Seed
            </button>
          </Form>
          <Link
            to="/"
            className="block text-center px-4 border-4 rounded-sm border-fuchsia-400 text-fuchsia-700"
          >
            No
          </Link>
        </div>
      </div>
    </section>
  )
}
