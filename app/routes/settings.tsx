import type { LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { NavLink, Outlet, useLoaderData } from "@remix-run/react"
import connectDb from "~/db/connectDb.server"
import { requireUserSession } from "~/server/session"

const navLinkStyels = "w-full bg-green-100 hover:bg-green-200 "
const navLinkActive = "w-full bg-green-400 "

function Sidebar({ uid }: { uid: string }) {
  return (
    <aside className="py-4 shadow-solid flex flex-col gap-4">
      <NavLink
        to={`/settings/${uid}/general`}
        className={({ isActive }) => (isActive ? navLinkActive : navLinkStyels)}
      >
        <div className="border-l-8 border-green-400 py-4">
          <p className="ml-5">Account Settings</p>
        </div>
      </NavLink>
      <NavLink
        to={`/settings/${uid}/profil`}
        className={({ isActive }) => (isActive ? navLinkActive : navLinkStyels)}
      >
        <div className="border-l-8 border-green-400 py-4">
          <div className="ml-5">Profil Settings</div>
        </div>
      </NavLink>
    </aside>
  )
}

export const loader: LoaderFunction = async ({ request }) => {
  const db = await connectDb()
  const session = await requireUserSession(request.clone())

  const authUid = session.get("auth")
  if (!authUid) return redirect("/login")
  const user = await db.models.Users.findOne({ _id: authUid }, { password: 0 })
  return { user }
}

export default function Account() {
  const { user } = useLoaderData()

  return (
    <main className="grid grid-cols-[minmax(200px,_0.25fr),_1fr] h-full gap-2">
      <Sidebar uid={user._id} />
      <Outlet context={user} />
      {/* <AccountSettings user={user} /> */}
    </main>
  )
}
