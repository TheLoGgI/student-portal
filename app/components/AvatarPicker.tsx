import { Form } from "@remix-run/react"
import type { Student } from "~/routes/students"
import type { AvatarIconType } from "~/types/loaders"

import Avatar from "./Avatar"

type AvatarPickerProps = {
  user: Student
  avatars: AvatarIconType[]
}

const AvatarPicker = ({ user, avatars }: AvatarPickerProps) => {
  return (
    <div>
      <div className="w-32">
        <Avatar
          size={200}
          src={user.avatar.image}
          color={user.avatar.color}
          name={user.fullname}
        />
      </div>
      <p className="text-xl my-4 mb-8 font-bold">Pick a new avatar:</p>

      <div className="grid grid-cols-3 justify-items-center gap-2">
        {avatars.map((avatar, i) => {
          return (
            <Form method="post" key={i} id="avatarform">
              <input
                type="hidden"
                id="avatarimage"
                name="image"
                value={avatar.image}
              />
              <input
                type="hidden"
                id="avatarcolor"
                name="color"
                value={avatar.color}
              />
              <button
                className="hover:bg-gray-500 cursor-pointer w-24"
                value="_avatar"
                type="submit"
                name="type"
              >
                <Avatar
                  size={100}
                  src={avatar.image}
                  color={avatar.color}
                  name="randomavatar"
                />
              </button>
            </Form>
          )
        })}
      </div>
    </div>
  )
}

export default AvatarPicker
