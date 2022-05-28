import type { ActionFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react"
import handleErrorCodes from "~/components/HandleErrorCodes"
import connectDb from "~/db/connectDb.server"
import {
  destroySession,
  getSession,
  requireUserSession,
} from "~/server/session"
import bcrypt from "bcryptjs"

import { RFC5322EmailValidation } from "../createAccount"
import type { Student } from "../students"

const LinkStyles =
  "text-purple-800 hover:underline hover:underline-offset-2 hover:text-purple-600 place-self-end self-start"

export const action: ActionFunction = async ({ request, params }) => {
  const db = await connectDb()
  const form = await request.formData()

  const session = await requireUserSession(request)
  const authUid = session.get("auth")

  try {
    switch (form.get("type")) {
      case "_delete": {
        const confirmMessage = form.get("confirm") as string

        const doc = await db.models.Users.findOneAndDelete({
          _id: authUid,
          fullname: confirmMessage,
        })

        await db.models.Users.updateMany(
          // {
          //   $or: [
          //     { recruters: { $in: [authUid] } },
          //     { network: { $in: [authUid] } },
          //   ],
          // },
          {
            network: { $in: [authUid] },
          },
          {
            $pull: { network: authUid },
          }
          // {
          //   $pull: { $and: [{ network: authUid }, { recruters: authUid }] },
          // }
        )

        if (!doc) throw new Error("networkError")
        return redirect(`/`, {
          headers: {
            "Set-Cookie": await destroySession(session),
          },
        })
      }
      case "_password": {
        const password = form.get("password") as string
        const repassword = form.get("repassword") as string
        if (!password || !repassword) throw new Error("emptyFields")
        if (password.trim() !== repassword.trim())
          throw new Error("passwordMatch")
        if (password.trim().length < 8) throw new Error("passwordLength")

        const hashedPassword = await bcrypt.hash(password, 10)
        const doc = await db.models.Users.findByIdAndUpdate(
          { _id: authUid },
          {
            password: hashedPassword,
          }
        )
        if (!doc) throw new Error("networkError")

        return redirect(`settings/${params.uid}/general`)
      }
      case "_email": {
        const email = form.get("email") as string
        if (!email) throw new Error("emptyFields")
        if (!RFC5322EmailValidation.test(email)) throw new Error("invalidemail")
        const doc = await db.models.Users.findByIdAndUpdate(
          { _id: authUid },
          {
            email,
          }
        )
        if (!doc) throw new Error("networkError")

        return redirect(`settings/${params.uid}/general`)
      }
      case "_name": {
        const name = form.get("name") as string
        if (!name) throw new Error("emptyFields")
        const doc = await db.models.Users.findByIdAndUpdate(
          { _id: authUid },
          {
            fullname: name,
          }
        )
        if (!doc) throw new Error("networkError")

        return redirect(`settings/${params.uid}/general`)
      }
    }
  } catch (error) {
    console.log("error: ", error)
    return handleErrorCodes(error)
  }
}

export async function loader({ request }: { request: Request }) {
  const cookie = request.headers.get("Cookie")
  const session = await getSession(cookie)
  if (!session.has("auth")) {
    throw redirect("/login")
  }
  return request.url
}

type ModalProps = {
  isActive: boolean
  name: string
}

const Modal = ({ isActive, name }: ModalProps) => {
  if (!isActive) return null

  return (
    <div className="bg-gray-100 max-w-lg p-4 absolute z-20 shadow-solid">
      <p className="text-xl mb-4">
        <strong> You are about to delete your account</strong>
      </p>
      <p>
        After deleting your account, you will no longer be able to access your
        account. All data connected to this account will be is deleted and
        requiters and
      </p>

      <p className="mt-4">Are you sure you want to delete your account?</p>
      <p className="mb-4">
        <em className="font-medium">Confirm by writing yor account name.</em>
        <span className="ml-2 text-gray-700">{name}</span>
      </p>

      <Form method="post">
        <label htmlFor="confirm">Confirm account name</label>
        <input
          type="text"
          className="p-1 mt-1 rounded-sm ml-2"
          name="confirm"
          placeholder="Account name..."
          id="confirm"
        />

        <div className="flex justify-between align-center mt-4">
          <button
            className="bg-red-400 rounded-sm p-4"
            type="submit"
            name="type"
            value="_delete"
          >
            Delete Account
          </button>
          <Link
            to="./"
            className="p-4 px-10 border-2 font-medium border-blue-400 text-blue-700"
          >
            No
          </Link>
        </div>
      </Form>
    </div>
  )
}

const formGroup = "flex flex-col gap-2 mt-4"

export default function AccountSettings() {
  const user = useOutletContext<Student>()
  const url = useLoaderData()
  const fetcher = useFetcher()
  const update = new URL(url).searchParams.get("update")

  return (
    <>
      {update === "delete" && (
        <div className="backdrop-blur-md absolute w-screen h-screen"></div>
      )}
      <main className="w-full h-full max-w-screen-lg mx-auto mt-8 p-4">
        <Modal isActive={update === "delete"} name={user.fullname} />
        <h1 className="text-2xl">General settings</h1>
        <div className="grid grid-cols-table gap-6 mt-8">
          <p>Name</p>
          {update === "name" ? (
            <Form method="post">
              <div className={formGroup}>
                <label htmlFor="email">Change name to</label>
                <input
                  type="text"
                  name="name"
                  className="p-1 bg-gray-100 rounded-sm"
                  id="name"
                />
              </div>
              <button
                type="submit"
                name="type"
                value="_name"
                className="bg-fuchsia-400 w-full px-6 py-2 rounded-sm mt-4"
              >
                Change name
              </button>
            </Form>
          ) : (
            <p>{user.fullname}</p>
          )}

          <Link to="?update=name" className={LinkStyles}>
            Change name
          </Link>
        </div>
        <div className="grid grid-cols-table gap-6 mt-8">
          <p>Email</p>
          {update === "email" ? (
            <fetcher.Form method="post">
              <div className={formGroup}>
                <label htmlFor="email">New email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className={
                    "p-1 bg-gray-100 rounded-sm" +
                    (fetcher.data?.type === "invalidemail" ||
                    fetcher.data?.type === "emailExists"
                      ? " border-2 border-red-400"
                      : "")
                  }
                  id="email"
                  onChange={() => fetcher.submit(null)}
                />
                {(fetcher.data?.type === "invalidemail" ||
                  fetcher.data?.type === "emailExists") && (
                  <small id="passwordHelp" className="text-red-600">
                    {fetcher.data?.msg}
                  </small>
                )}
              </div>
              <button
                type="submit"
                name="type"
                value="_email"
                className="bg-fuchsia-400 w-full px-6 py-2 rounded-sm mt-4"
              >
                Change email
              </button>
            </fetcher.Form>
          ) : (
            <p>{user.email}</p>
          )}

          <Link to="?update=email" className={LinkStyles}>
            Change email
          </Link>
        </div>

        <div className="grid grid-cols-table gap-6 mt-8">
          <p>Password</p>

          {update === "password" ? (
            <fetcher.Form method="post">
              <div className={formGroup}>
                <label htmlFor="password">New password</label>
                <input
                  type="password"
                  name="password"
                  required
                  className={
                    "p-1 bg-gray-100 rounded-sm" +
                    (fetcher.data?.type === "passwordMatch" ||
                    fetcher.data?.type === "passwordLength"
                      ? " border-2 border-red-400"
                      : "")
                  }
                  id="password"
                  onChange={() => fetcher.submit(null)}
                  placeholder="New password"
                />
                {(fetcher.data?.type === "passwordMatch" ||
                  fetcher.data?.type === "passwordLength") && (
                  <small id="passwordHelp" className="text-red-600">
                    {fetcher.data?.msg}
                  </small>
                )}
              </div>
              <div className={formGroup}>
                <label htmlFor="password">Repaet new password</label>
                <input
                  type="password"
                  name="repassword"
                  required
                  className="p-1 bg-gray-100 rounded-sm "
                  id="repassword"
                  onChange={() => fetcher.submit(null)}
                />
              </div>
              <button
                type="submit"
                name="type"
                value="_password"
                className="bg-fuchsia-400 w-full px-6 py-2 rounded-sm mt-4"
              >
                Change password
              </button>
            </fetcher.Form>
          ) : (
            <p>***********</p>
          )}

          <Link to="?update=password" className={LinkStyles}>
            change password
          </Link>
        </div>
        <footer className="mt-20 flex justify-end">
          <Link className="bg-red-400 rounded-sm p-4" to="?update=delete">
            Delete account
          </Link>
        </footer>
      </main>
    </>
  )
}
