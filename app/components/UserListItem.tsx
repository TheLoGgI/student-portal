import { NavLink } from "@remix-run/react"
import type { Student } from "~/routes/students"
import { getFormatedDate } from "~/utils"

import Avatar from "./Avatar"

type UserlistItemProps = {
  student: Student
  urlPath?: string
  onClick?: (student: Student) => void
  isSelected?: boolean
}

const UserListItem = ({
  student,
  onClick,
  urlPath,
  isSelected = false,
}: UserlistItemProps) => {
  const createdAt = getFormatedDate(student.createdAt)

  const handleClick = () => {
    onClick?.(student)
  }

  const selectedStyles = isSelected ? " bg-pink-400" : ""

  return (
    <NavLink
      to={`/${student._id}/${urlPath ?? "profil"}`}
      className={({ isActive }) =>
        "bg-white border-2 block border-gray-200 shadow-solid p-2 hover:bg-pink-200 cursor-pointer" +
        selectedStyles +
        (isActive ? " border-pink-400 border-4 shadow-none" : "")
      }
      onClick={handleClick}
    >
      <div className={"flex gap-2"}>
        <div className="w-16">
          <Avatar
            name={student.fullname}
            src={student.avatar.image}
            color={student.avatar.color}
          />
        </div>
        <div className="flex flex-col">
          <p className="font-medium">{student.fullname}</p>
          <p>{createdAt}</p>
        </div>
      </div>
    </NavLink>
  )
}

export default UserListItem
