import type { ActionFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Link, useActionData } from "@remix-run/react"
import { Shapes } from "~/components"
import Wrapper from "~/components/GridWrapper"
import handleErrorCodes from "~/components/HandleErrorCodes"
import connectDb from "~/db/connectDb.server"
import bcrypt from "bcryptjs"
import { useState } from "react"

const emptyUser = {
  fullname: "",
  isCorporation: false,
  description: "",
  tags: [],
  password: "",
  email: "",
  socials: {
    linkedin: "",
    github: "",
    website: "",
  },
  recruters: [],
  network: [],
  isProfileComplete: false,
}

// Source: https://security.stackexchange.com/questions/116116/safe-email-validation
export const RFC5322EmailValidation = new RegExp(
  // eslint-disable-next-line no-control-regex
  "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])"
)

export const action: ActionFunction = async ({ request }) => {
  const db = await connectDb()
  const form = await request.formData()

  const fullname = form.get("fullname") as string
  const email = form.get("email") as string
  const password = form.get("password") as string
  const repassword = form.get("repassword") as string

  try {
    if (!email || !password || !repassword) throw new Error("emptyFields")
    if (!RFC5322EmailValidation.test(email)) throw new Error("invalidemail")
    if (password.trim() !== repassword.trim()) throw new Error("passwordMatch")
    if (password.trim().length < 8) throw new Error("passwordLength")

    const hashedPassword = await bcrypt.hash(password, 10)
    const doc = await db.models.Users.create({
      ...emptyUser,
      fullname,
      email,
      password: hashedPassword,
    })
    if (!doc) throw new Error("networkError")

    return redirect("/login")
  } catch (error) {
    return handleErrorCodes(error)
  }
}

const formGroup = "flex flex-col mb-4"

export default function CreateAccount() {
  const actionData = useActionData()
  const [error, setError] = useState(actionData)

  const emptyFields = error?.type === "emptyFields"
  const passwordsConflict = error?.type === "passwordMatch"
  const passwordLength = error?.type === "passwordLength"
  const invalidemail = error?.type === "invalidemail"
  const emailExists = error?.type === "emailExists"

  const handleResetErrorState = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error === null || error === undefined) return
    if (
      e.currentTarget.type === "password" &&
      (error.type === "passwordMatch" || error.type === "passwordLength")
    )
      setError(null)
    if (e.currentTarget.type === "email" && error.type === "invalidemail")
      setError(null)
  }

  return (
    <div className="grid grid-cols-[minmax(400px,_0.25fr),_1fr] h-full">
      <div className="bg-gray-100 p-4 h-full shadow-solid flex justify-center">
        <Wrapper>
          <h1 className="font-bold text-3xl self-center">Create account</h1>
          <form method="post">
            {(emptyFields || emailExists) && (
              <small id="passwordHelp" className="text-red-600">
                {error?.msg}
              </small>
            )}
            <div className={formGroup}>
              <label htmlFor="fullname">Full name</label>
              <input
                type="text"
                name="fullname"
                required
                className="p-1 mt-1 rounded-sm"
                id="fullname"
              />
            </div>
            <div className={formGroup}>
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                className={
                  "p-1 mt-1 rounded-sm" +
                  (invalidemail ? " border-2 border-red-400" : "")
                }
                id="email"
                name="email"
                required
                onChange={handleResetErrorState}
                aria-describedby="emailHelp rounded-sm"
              />
              {invalidemail ? (
                <small id="passwordHelp" className="text-red-600">
                  {error?.msg}
                </small>
              ) : (
                <small id="emailHelp">
                  We'll never share your email with anyone else.
                </small>
              )}
            </div>
            <div className={formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                onChange={handleResetErrorState}
                className={
                  "p-1 mt-1 rounded-sm" +
                  (passwordsConflict || passwordLength
                    ? " border-2 border-red-400"
                    : "")
                }
                name="password"
                required
                id="password"
              />
              {(passwordsConflict || passwordLength) && (
                <small id="passwordHelp" className="text-red-600">
                  {error?.msg}
                </small>
              )}
            </div>
            <div className={formGroup}>
              <label htmlFor="repassword">Repeat password</label>
              <input
                type="password"
                name="repassword"
                onChange={handleResetErrorState}
                required
                className="p-1 mt-1 rounded-sm"
                id="repassword"
              />
            </div>

            <button
              type="submit"
              className="bg-fuchsia-400 w-full px-6 py-2 rounded-sm"
            >
              Create account
            </button>
            <Link
              to="/login"
              className="block text-center border-4 rounded-sm border-fuchsia-400 text-fuchsia-700 w-full px-6 py-2 mt-4"
            >
              Login
            </Link>
          </form>
        </Wrapper>
      </div>
      <Shapes />
    </div>
  )
}
