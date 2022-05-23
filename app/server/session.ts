import { createCookieSessionStorage, redirect } from "@remix-run/node"

import { sessionCookie } from "./cookies"

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({ cookie: sessionCookie })

async function requireUserSession(request: Request) {
  const cookie = request.headers.get("Cookie")
  const session = await getSession(cookie)

  return session
}

export { getSession, commitSession, destroySession, requireUserSession }
