import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import connectDb from "~/db/connectDb.server"

type SeedLoaderType = Record<"seedCount" | "userCount", number>

export const action: ActionFunction = async () => {
  const db = await connectDb()
  const seedData = await db.models.Seed.find({})

  // const seedUsers = []
  // for (let i = 0; i < 50; i++) {
  //   seedUsers.push(await createRandomUser())
  // }

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
