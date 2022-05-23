import type { ActionFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { destroySession, getSession } from "~/server/session"

const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"))
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  })
}

const loader = () => {
  return redirect("/")
}

export { action, loader }
