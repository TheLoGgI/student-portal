import { createCookie } from "@remix-run/node"

export const sessionCookie = createCookie("auth", {
  maxAge: 60 * 60 * 24 * 7,
  httpOnly: true,
  secrets: [process.env.COOKIE_SECRET as string],
})
