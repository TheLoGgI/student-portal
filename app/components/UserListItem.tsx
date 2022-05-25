import { NavLink } from "@remix-run/react"
import type { Student } from "~/routes/students"
import { getFormatedDate } from "~/utils"

import Avatar from "./Avatar"

type UserlistItemProps = {
  student: Student
  onClick?: (student: Student) => void
  hasButton?: boolean
  isSelected?: boolean
}

const UserListItem = ({
  student,
  onClick,
  hasButton = true,
  isSelected = false,
}: UserlistItemProps) => {
  const createdAt = getFormatedDate(student.createdAt)

  const handleClick = () => {
    onClick?.(student)
  }

  const selectedStyles = isSelected ? " bg-pink-400" : ""

  return (
    <NavLink
      to={`/${student._id}/messages`}
      className={({ isActive }) =>
        "border-2 block border-gray-200 shadow-solid p-2 hover:bg-pink-200 cursor-pointer" +
        selectedStyles +
        (isActive ? " border-pink-400 border-4 shadow-none" : "")
      }
      onClick={handleClick}
    >
      <div className={hasButton ? "flex gap-2 justify-between" : "flex gap-2"}>
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
        {hasButton && (
          <button
            type="button"
            className="bg-green-400 rounded-sm p-1 ml-4 place-self-center py-2 px-4"
          >
            Contact
          </button>
        )}
      </div>
    </NavLink>
  )
}

export default UserListItem
