import { Link } from "@remix-run/react"
import type { Student } from "~/routes/students"

import Avatar from "./Avatar"
import Tag from "./Tag"

type StudetnCardProps = {
  student: Student
}

const StudentsCard = ({ student }: StudetnCardProps) => {
  const creadedAt = new Date(student.createdAt).toLocaleDateString("da-DK", {
    dateStyle: "long",
  })
  const shortDescription = student.description.slice(0, 250)

  return (
    <div className="bg-gray-200 p-4 shadow-solid sm:w-80 max-w-sm overflow-hidden">
      <div className="flex text-xl gap-5">
        <div className="w-24 h-24">
          <Avatar
            src={student.avatar.image}
            name={student.fullname}
            size={100}
            color={student.avatar.color}
          />
        </div>
        <div className="flex flex-col ">
          <Link
            to={`/${student._id}/profil`}
            className="hover:underline hover:text-blue-400"
          >
            <h3 className="capitalize">{student.fullname}</h3>
          </Link>
          <p className="text-base">{creadedAt}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            {student.tags.map((tag: string) => (
              <Tag tag={tag} key={tag} />
            ))}
          </div>
        </div>
      </div>
      <div className="card-body overflow-hidden mt-4">
        <div className="card-text whitespace-pre-line">
          <p>{shortDescription}...</p>
        </div>
      </div>
    </div>
  )
}

export default StudentsCard
