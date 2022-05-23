import type { LoaderFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react"
import { Header } from "~/components"
// @ts-ignore
import customStyles from "~/customStyles.css"
// @ts-ignore
import styles from "~/tailwind.css"

import connectDb from "./db/connectDb.server"
import type { Student } from "./routes/students"
import { requireUserSession } from "./server/session"

// import { createContext, useContext } from "react"

export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
  {
    rel: "stylesheet",
    href: customStyles,
  },
]

export function meta() {
  return {
    charset: "utf-8",
    title: "Remix + MongoDB",
    viewport: "width=device-width,initial-scale=1",
  }
}

// export const loader: LoaderFunction = async ({ request }) => {
//   const db = await connectDb()
//   const session = await requireUserSession(request)
//   console.log("session: ", session)
//   const authUid = session.get("auth")
//   console.log("authUid: ", authUid)
//   const students = await db.models.Users.findOne({ _id: authUid })
//   console.log("students: ", students)
//   return students
// }

export const loader: LoaderFunction = async ({ request }) => {
  const db = await connectDb()
  const session = await requireUserSession(request)
  const students = await db.models.Users.find({}, { password: 0 })

  const authUid = session.get("auth")
  const user = students.find((student) => student._id.toString() === authUid)
  students.filter((student) => student._id.toString() !== authUid)

  return { students, user }
}

export default function App() {
  const { user } = useLoaderData<{
    students: Student[]
    user: Student
  }>()

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-screen">
        <Header currentUser={user} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
