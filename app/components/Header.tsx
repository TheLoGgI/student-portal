import { Form, Link } from "@remix-run/react"
import type { Student } from "~/routes/students"

import Avatar from "./Avatar"

const NavLink = ({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) => (
  <Link
    to={to}
    className="text-gray-600 hover:underline hover:underline-offset-2 hover:text-purple-600"
  >
    {children}
  </Link>
)

export default function Header({ currentUser }: { currentUser: Student }) {
  return (
    <header className="w-full shadow-md h-20 flex justify-between relative z-20 bg-white">
      <Link to="/">
        <img
          src="/assets/images/awpstudents-logo.svg"
          alt="awp students logotype"
          width={100}
          height={100}
          className="p-4 inline-block"
        />
      </Link>
      <nav className="flex justify-end items-center gap-4 bg-white">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/students">Students</NavLink>
        {/* <NavLink to="/recruiters">Recruiters</NavLink> */}
        {currentUser !== undefined ? (
          <div className="bg-purple-100 h-full p-4 flex items-center gap-4">
            <label htmlFor="dropdown" className="cursor-pointer">
              <Avatar
                src={currentUser.avatar.image}
                color={currentUser.avatar.color}
                name="John Doe"
              />
            </label>
            <input type="checkbox" id="dropdown" className="hidden" />
            <div className="controlled-dropdown">
              <div className="dropdown-content flex flex-col">
                <NavLink to={`/profil/${currentUser._id}`}>Profile</NavLink>
                <NavLink to={`/settings/${currentUser._id}/profil`}>
                  Edit profil
                </NavLink>
                <NavLink to={`/settings/${currentUser._id}/general`}>
                  Account settings
                </NavLink>
                <Form method="post" action="/logout">
                  <button
                    type="submit"
                    name="logout"
                    className="text-gray-600 hover:underline hover:underline-offset-2 hover:text-purple-600"
                  >
                    Logout
                  </button>
                </Form>
              </div>
            </div>
            <div className="flex flex-col capitalize">
              <Link
                to={`/${currentUser._id}/profil`}
                className="hover:underline hover:underline-offset-2 hover:text-purple-600"
              >
                {currentUser.fullname}
              </Link>

              <p className="text-sm">
                {currentUser?.isCorporation ? "Corporation" : "Student"}
              </p>
            </div>
          </div>
        ) : (
          <div className="pr-4">
            <NavLink to="/login">Login</NavLink>
          </div>
        )}
      </nav>
    </header>
  )
}
