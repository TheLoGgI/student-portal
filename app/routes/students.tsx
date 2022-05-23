import type { LoaderFunction } from "@remix-run/node"
import { Form, useCatch, useLoaderData, useSubmit } from "@remix-run/react"
import Exams from "~/components/Exams"
import StudentsCard from "~/components/StudentCard"
import connectDb from "~/db/connectDb.server"
import { FormEvent } from "react"

export type Student = {
  _id: string
  fullname: string
  isCorporation: false
  description: string
  tags: [string, string, string]
  avatar: {
    image: string
    color: string
  }
  password: string
  email: string
  socials: {
    linkedin: string
    github: string
    website: string
  }
  recruters: string[]
  network: string[]
  createdAt: string
  updatedAt: string
  isProfileComplete: boolean
}

export const loader: LoaderFunction = async () => {
  const db = await connectDb()
  const students = await db.models.Users.find({ isProfileComplete: true })

  if (!students || students.length === 0)
    throw new Response("Not Found", {
      status: 404,
    })

  return students
}

export default function Students() {
  const students = useLoaderData<Student[]>() || []
  const submit = useSubmit()

  function handleChange(event: FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, { replace: true })
  }

  return (
    <main className="mx-auto p-4 max-w-screen-xl">
      <div className="flex justify-between items-center mb-4">
        <Form method="get" onChange={handleChange} className="flex my-2">
          <input
            className="p-2 bg-gray-100 rounded-sm"
            type="search"
            name="title"
            placeholder="Search snippets..."
          />
          <button
            type="submit"
            className="inline-block bg-fuchsia-400 px-6 py-2 rounded-sm"
          >
            Search
          </button>

          <select name="sort" className="p-2 bg-gray-100 rounded-sm">
            <option value="updatedAt">Last updated</option>
            <option value="title">Title</option>
            <option value="favorite">Favorites</option>
            <option value="createdAt">Date added</option>
          </select>
          <button
            className="inline-block bg-fuchsia-400 px-6 py-2 rounded-sm"
            type="submit"
          >
            Sort
          </button>
        </Form>
      </div>
      <div className="grid grid-cols-auto gap-y-8 gap-x-12 justify-items-center">
        {students.map((student) => (
          <StudentsCard key={student._id} student={student} />
        ))}
      </div>
    </main>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  console.log("caught: ", caught)
  return (
    <main className="mx-auto max-w-screen-xl flex justify-center items-center h-screen">
      <div className="w-1/2 mx-auto">
        <h1 className="text-3xl text-center mb-20">
          Sorry, no profiles fits this filtation
        </h1>
        <div>
          <Exams />
        </div>
      </div>
    </main>
  )
}

// export function ErrorBoundary({ error }) {}
