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

export const loader: LoaderFunction = async ({ request }) => {
  const db = await connectDb()
  const session = await requireUserSession(request)
  console.log("session: ", session)

  if (!session.has("auth")) return { user: undefined }

  const authUid = session.get("auth")
  const user = await db.models.Users.findOne({ _id: authUid }, { password: 0 })

  return { user: user ?? undefined }
}

export default function App() {
  const { user } = useLoaderData<{
    user: Student
  }>()

  return (
    <Layout>
      <Header currentUser={user} />
      {/* <div className="bg-orange-300 h-screen w-screen"> */}
      <Outlet />
      {/* </div> */}
    </Layout>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary(error: Error) {
  // console.log("error: ", error)
  return (
    <Layout>
      <div className="bg-orange-300 h-screen w-screen">
        {/* <Header currentUser={user} /> */}

        <Outlet />
      </div>
    </Layout>
  )
}
