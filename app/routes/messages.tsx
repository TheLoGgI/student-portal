import type { LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import CatchBoundary from "~/components/NotFoundCatchBoundary"
import connectDb from "~/db/connectDb.server"
import { getSession } from "~/server/session"

export const loader: LoaderFunction = async ({ request }) => {
  const db = await connectDb()
  const cookie = request.headers.get("Cookie")
  const session = await getSession(cookie)
  const authUid = session.get("auth")

  if (!session.has("auth")) {
    throw redirect("/login")
  }

  const user = await db.models.Users.findOne(
    { _id: authUid },
    {
      password: 0,
    }
  )

  // Find all conversations that are possible for the user, e.g connections
  const studentMessges = await db.models.Users.find(
    {
      _id: { $in: user.connections },
    },
    {
      password: 0,
    }
  )

  if (studentMessges.length === 0)
    throw new Response(
      "Sorry, you don't have any to chat with. Find people you want to connect with and tell them you are inderstested",
      {
        status: 400,
        statusText:
          "Sorry, you don't have any to chat with. Find people you want to connect with and tell them you are inderstested",
      }
    )

  return redirect(`/${studentMessges[0]._id}/messages`)
}

export { CatchBoundary }
