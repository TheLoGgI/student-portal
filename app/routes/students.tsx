import type { LoaderFunction } from "@remix-run/node"
import type { SubmitFunction } from "@remix-run/react"
import { Form, useCatch, useLoaderData, useSubmit } from "@remix-run/react"
import Exams from "~/components/Exams"
import StudentsCard from "~/components/StudentCard"
import connectDb from "~/db/connectDb.server"
import type { FormEvent } from "react"

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
  connections: string[]
  createdAt: string
  updatedAt: string
  isProfileComplete: boolean
}

export const loader: LoaderFunction = async ({ request }) => {
  const db = await connectDb()

  const url = new URL(request.url)
  const search = url.searchParams.get("search") || ""
  const sort = url.searchParams.get("sort") || ""
  console.log("sort: ", sort)
  const tag = url.searchParams.get("tag") || ""

  const students = await db.models.Users.find({
    isProfileComplete: true,
    ...(tag !== "" && tag !== undefined
      ? { tags: { $in: [tag] } }
      : { fullname: { $regex: search, $options: "i" } }),
  }).sort(sort ? { [sort]: 1 } : null)

  if (!students || students.length === 0)
    throw new Response(`${search}|${sort}`, {
      status: 404,
      statusText: "Not Found",
    })

  return students
}

type StudentFilterProps = {
  submit: SubmitFunction
  initial?: { search: string; sort: string }
}

function StudentsFilter({ submit, initial }: StudentFilterProps) {
  function handleChange(event: FormEvent<HTMLFormElement>) {
    submit(event.currentTarget, { replace: true })
  }
  return (
    <header className="flex justify-between items-center mb-4 ">
      <Form method="get" onChange={handleChange} className="flex my-2 gap-4">
        <div className="flex flex-col">
          <label className="mr-2">Search</label>
          <input
            className="p-2 bg-gray-100 rounded-sm"
            type="search"
            name="search"
            defaultValue={initial?.search}
            placeholder="Search names & tags..."
          />
        </div>

        <div className="flex flex-col">
          <label className="mr-2">Sort</label>
          <select
            name="sort"
            className="p-2 bg-gray-100 rounded-sm"
            defaultValue={initial?.sort}
          >
            <option value="fullname">name</option>
            <option value="updatedAt">Last updated</option>
            <option value="createdAt">Date added</option>
          </select>
        </div>
        <button
          type="submit"
          className="self-end bg-fuchsia-400 px-6 py-2 rounded-sm"
        >
          Search
        </button>
      </Form>
      <Form method="get" onChange={handleChange} className="flex my-2 gap-4">
        <div className="flex flex-col">
          <label htmlFor="tags">Tags</label>
          <select name="tags" id="tags" className="p-2 bg-gray-100 rounded-sm">
            <option selected value="">
              No tag
            </option>
            <optgroup label="Skills">
              <option value="problem-solving">Problem solving</option>
              <option value="creative">Creative</option>
              <option value="communication">Communication</option>
              <option value="management">Management</option>
              <option value="leadership">Leadership</option>
              <option value="social">Social</option>
            </optgroup>
            <optgroup label="Personality">
              <option value="adventurous">Adventurous</option>
              <option value="balanced">Balanced</option>
              <option value="courageous">Courageous</option>
              <option value="curious">Curious</option>
              <option value="driven">Driven</option>
              <option value="energetic">Energetic</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="methodical">Methodical</option>
              <option value="observant">Observant</option>
              <option value="orderly">Orderly</option>
              <option value="organized">Organized</option>
              <option value="perceptive">Perceptive</option>
              <option value="positive">Positive</option>
              <option value="risktaker">Risk taker</option>
              <option value="selfaware">Self aware</option>
            </optgroup>
            <optgroup label="Interest">
              <option value="sports">Sports</option>
              <option value="games">Games</option>
              <option value="music">Music</option>
              <option value="cooking">Cooking</option>
              <option value="dancing">Dancing</option>
              <option value="languages">Languages</option>
              <option value="exercise">Exercise</option>
              <option value="tecnology">Tecnology</option>
              <option value="travel">Travel</option>
              <option value="movies">Movies</option>
              <option value="politics">Politics</option>
            </optgroup>
          </select>
        </div>
        <button
          type="submit"
          className="self-end bg-fuchsia-400 px-6 py-2 rounded-sm"
        >
          Filter tag
        </button>
      </Form>
    </header>
  )
}

export default function Students() {
  const students = useLoaderData<Student[]>() || []
  const submit = useSubmit()

  return (
    <main className="mx-auto p-4 max-w-screen-xl">
      <StudentsFilter submit={submit} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4 justify-items-center">
        {students.map((student) => (
          <StudentsCard key={student._id} student={student} />
        ))}
      </div>
    </main>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  const submit = useSubmit()
  const [search, sort] = caught.data.split("|")

  return (
    <main className="mx-auto max-w-screen-xl p-4">
      <StudentsFilter submit={submit} initial={{ search, sort }} />
      <div className="flex justify-center items-center h-screen">
        <div className="w-1/2 mx-auto ">
          <h1 className="text-3xl text-center mb-20">
            Sorry, no profiles fits this filtation
          </h1>
          <div>
            <Exams />
          </div>
        </div>
      </div>
    </main>
  )
}

// export function ErrorBoundary({ error }) {}
