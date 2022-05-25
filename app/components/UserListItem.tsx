import type { Student } from "~/routes/students"
import { getFormatedDate } from "~/utils"

import Avatar from "./Avatar"

type UserlistItemProps = {
  student: Student
  onClick?: (student: Student) => void
}

const UserListItem = ({ student, onClick }: UserlistItemProps) => {
  const createdAt = getFormatedDate(student.createdAt)
  return (
    <div className="border-2 border-gray-200 shadow-solid p-2">
      <div className="flex gap-2 justify-between">
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
        <button
          type="button"
          className="bg-green-400 rounded-sm p-1 ml-4 place-self-center py-2 px-4"
        >
          Contact
        </button>
      </div>
    </div>
  )
}

export default UserListItem
