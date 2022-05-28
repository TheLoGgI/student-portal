import type { ActionFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Link, useActionData } from "@remix-run/react"
import Wrapper from "~/components/GridWrapper"
import Shapes from "~/components/Shapes"
import connectDb from "~/db/connectDb.server"
import { commitSession, getSession } from "~/server/session"
import bcrypt from "bcryptjs"
import { useState } from "react"

export const action: ActionFunction = async ({ request }) => {
  const db = await connectDb()
  const form = await request.formData()
  const session = await getSession(request.headers.get("Cookie"))

  const email = form.get("email") as string
  const password = form.get("password") as string

  try {
    const user = await db.models.Users.findOne({
      email,
    })

    if (!user) throw new Error("invalidUser")
    const isCorrectPassword = await bcrypt.compare(
      password.trim(),
      user.password
    )
    if (!isCorrectPassword) throw new Error("invalidPassword")

    session.set("auth", user._id)
    return redirect("/students", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    })
  } catch (error) {
    return json({
      msg: "Email or password is incorrect",
      status: 400,
      type: "incorrectFields",
    })
  }
}

// TODO: keep state after submit, if fields not valied.
const formGroup = "flex flex-col mb-4"

export default function Login() {
  const actionData = useActionData()
  const [error, setError] = useState(actionData)

  const hasInputMistake = error !== undefined && error !== null

  return (
    <div className="grid grid-cols-[minmax(400px,_0.25fr),_1fr] h-full">
      <div className="bg-gray-100 p-4 h-full shadow-solid flex justify-center">
        <Wrapper>
          <h1 className="font-bold text-3xl self-center">Login</h1>
          <form method="post">
            {hasInputMistake && (
              <small id="passwordHelp" className="text-red-600">
                Email or password is incorrect
              </small>
            )}
            <div className={formGroup}>
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                name="email"
                className="p-1 mt-1"
                id="email"
                onChange={() => setError(null)}
                aria-describedby="emailHelp rounded-sm"
                placeholder="Enter email"
              />
            </div>
            <div className={formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                className="p-1 mt-1 rounded-sm"
                id="password"
                onChange={() => setError(null)}
                placeholder="Password"
              />
            </div>
            <button
              type="submit"
              className="bg-fuchsia-400 w-full px-6 py-2 rounded-sm"
            >
              Login
            </button>
            <Link
              to="/createAccount"
              className="block text-center border-4 rounded-sm border-fuchsia-400 text-fuchsia-700 w-full px-6 py-2 mt-4"
            >
              Create account
            </Link>
          </form>
        </Wrapper>
      </div>
      <Shapes />
    </div>
  )
}
