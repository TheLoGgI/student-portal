import type { ActionFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react"
import Avatar from "~/components/Avatar"
import AvatarPicker from "~/components/AvatarPicker"
import handleErrorCodes from "~/components/HandleErrorCodes"
import Tag from "~/components/Tag"
import connectDb from "~/db/connectDb.server"
import { getSession, requireUserSession } from "~/server/session"
import type { ProfilLoaderData } from "~/types/loaders"
import { generateAvatars, randomColor } from "~/utils"

import type { Student } from "../students"

const LinkStyles =
  "text-purple-800 hover:underline hover:underline-offset-2 hover:text-purple-600 place-self-end self-start"

export const action: ActionFunction = async ({ request, params }) => {
  const db = await connectDb()
  const form = await request.formData()

  const session = await requireUserSession(request)
  const authUid = session.get("auth")
  const user = await db.models.Users.findById(authUid)

  try {
    switch (form.get("type")) {
      case "_reset":
        user.tags = []
        user.socials = {
          linkedin: "",
          github: "",
          website: "",
        }
        user.description = ""
        user.isProfileComplete = false
        break
      case "_avatar":
        const image = form.get("image")
        const color = form.get("color")

        user.avatar = {
          image,
          color,
        }
        break
      case "_tags":
        const interest = form.get("interest")
        const personality = form.get("personality")
        const skill = form.get("skill")

        user.tags = [skill, personality, interest]
        break
      case "_socials":
        const linkedin = form.get("linkedin") as string
        const github = form.get("github") as string
        const website = form.get("website") as string

        const linkedinMatch = linkedin.match(
          /^https:\/\/www.linkedin.com\/in\//
        )
        const githubMatch = github.match(/^https:\/\/github.com\//)

        if (linkedin !== "" && linkedinMatch === null)
          throw new Error("linkedinInvalid")
        if (github !== "" && githubMatch === null) throw new Error("unverified")

        user.socials = {
          linkedin,
          github,
          website,
        }
        break
      case "_description":
        const description = (form as any)._fields.description.toString().trim()

        user.description = description
        break
    }

    if (user.tags.length > 0 && user.description !== "") {
      user.isProfileComplete = true
    }

    await user.save()

    return redirect(`settings/${params.uid}/profil`)
  } catch (error) {
    return handleErrorCodes(error)
  }
}

export async function loader({
  request,
}: {
  request: Request
}): Promise<ProfilLoaderData> {
  const cookie = request.headers.get("Cookie")
  const session = await getSession(cookie)

  // Generate avatars
  const avatars = generateAvatars(15)
  const avatarsWithColors = avatars.map((avatar) => ({
    image: avatar,
    color: randomColor(),
  }))

  if (!session.has("auth")) {
    throw redirect("/login")
  }
  return { avatars: avatarsWithColors, url: request.url }
}

const formGroup = "flex flex-col gap-2 mt-4"

const Modal = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null

  return (
    <div className="bg-gray-100 max-w-lg p-4 absolute z-20 shadow-solid">
      <p className="text-xl mb-4">
        <strong> You are about to reset your profil</strong>
      </p>
      <p>
        All you profil details will be removed, and your account will be
        anonymous. You will keep your recruiters and network, but you will not
        show up in the results.
      </p>

      <p className="mt-4">
        Are you sure you want to remove your profil details?
      </p>

      <Form method="post">
        <div className="flex justify-between align-center mt-4">
          <button
            className="bg-red-400 rounded-sm p-4"
            type="submit"
            name="type"
            value="_reset"
          >
            Remove profil details
          </button>
          <Link
            to="./"
            className="p-4 px-10 border-2 font-medium border-blue-400 text-blue-700"
          >
            No, keep the profil details
          </Link>
        </div>
      </Form>
    </div>
  )
}

export default function ProfilSettings() {
  const user = useOutletContext<Student>()
  const { url, avatars } = useLoaderData<ProfilLoaderData>()
  const fetcher = useFetcher()
  const update = new URL(url).searchParams.get("update")

  return (
    <>
      {update === "reset" && (
        <div className="backdrop-blur-md absolute w-screen h-screen"></div>
      )}
      <div className="w-full h-full max-w-screen-lg mx-auto mt-8 p-4">
        <Modal isActive={update === "reset"} />
        <h1 className="text-2xl">General settings</h1>
        {!user.isProfileComplete && (
          <div className="bg-blue-200 w-full p-4 my-4">
            <p>
              Your profile is anonymous and not complete. It will not show up in
              searches
            </p>
          </div>
        )}

        <div className="grid grid-cols-table gap-6 mt-8">
          <h3>Avatar</h3>
          {update === "avatar" ? (
            <AvatarPicker user={user} avatars={avatars} />
          ) : (
            <div className="w-32">
              <Avatar
                src={user.avatar.image}
                color={user.avatar.color}
                name={user.fullname}
                size={150}
              />
            </div>
          )}

          <Link to="?update=avatar" className={LinkStyles}>
            Change avatar
          </Link>
        </div>
        <div className="grid grid-cols-table gap-6 mt-8">
          <h3>Tags</h3>
          {update === "tags" ? (
            <fetcher.Form method="post">
              <div className={formGroup}>
                <label htmlFor="skill">Skills</label>
                <select
                  className="p-1 bg-gray-100 rounded-sm"
                  name="skill"
                  id="skill"
                  defaultValue={user.tags[0]}
                >
                  <option value="problem-solving">Problem solving</option>
                  <option value="creative">Creative</option>
                  <option value="communication">Communication</option>
                  <option value="management">Management</option>
                  <option value="leadership">Leadership</option>
                  <option value="social">Social</option>
                </select>
              </div>
              <div className={formGroup}>
                <label htmlFor="personality">Personality</label>
                <select
                  className="p-1 bg-gray-100 rounded-sm"
                  name="personality"
                  id="personality"
                  defaultValue={user.tags[1]}
                >
                  <option value="adventurous">Adventurous</option>
                  <option value="balanced">Balanced</option>
                  <option value="courageous">Courageous</option>
                  <option value="curious">Curious</option>
                  <option value="driven">Driven</option>
                  <option value="energetic">Energetic</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="methodical">Methodical</option>
                  <option value="observant">Observant</option>
                  <option value="orderly">Orderly</option>
                  <option value="organized">Organized</option>
                  <option value="perceptive">Perceptive</option>
                  <option value="positive">Positive</option>
                  <option value="risktaker">Risk taker</option>
                  <option value="selfaware">Self aware</option>
                </select>
              </div>
              <div className={formGroup}>
                <label htmlFor="interest">Interest</label>
                <select
                  className="p-1 bg-gray-100 rounded-sm"
                  name="interest"
                  id="interest"
                  defaultValue={user.tags[2]}
                >
                  <option value="sports">Sports</option>
                  <option value="games">Games</option>
                  <option value="music">Music</option>
                  <option value="cooking">Cooking</option>
                  <option value="dancing">Dancing</option>
                  <option value="languages">Languages</option>
                  <option value="exercise">Exercise</option>
                  <option value="tecnology">Tecnology</option>
                  <option value="travel">Travel</option>
                  <option value="movies">Movies</option>
                  <option value="politics">Politics</option>
                </select>
              </div>
              <button
                type="submit"
                name="type"
                value="_tags"
                className="bg-fuchsia-400 w-full px-6 py-2 rounded-sm mt-4"
              >
                Update tags
              </button>
            </fetcher.Form>
          ) : (
            <div className="flex gap-2 ">
              {user.tags.length > 0 ? (
                user.tags.map((tag) => <Tag tag={tag} key={tag} />)
              ) : (
                <p>No tags</p>
              )}
            </div>
          )}

          <Link to="?update=tags" className={LinkStyles}>
            Update tags
          </Link>
        </div>

        <div className="grid grid-cols-table gap-6 mt-8">
          <h3>Social links</h3>

          {update === "social" ? (
            <fetcher.Form method="post">
              <div className={formGroup}>
                <label htmlFor="linkedin">Linkedin</label>
                <input
                  type="text"
                  name="linkedin"
                  defaultValue={user.socials.linkedin}
                  className={
                    "p-1 bg-gray-100 rounded-sm" +
                    (fetcher.data?.type === "linkedinInvalid"
                      ? " border-2 border-red-400"
                      : "")
                  }
                  id="linkedin"
                  placeholder="https://www.linkedin.com/..."
                />
              </div>
              <div className={formGroup}>
                <label htmlFor="linkedin">Github</label>
                <input
                  type="text"
                  name="github"
                  defaultValue={user.socials.github}
                  className={
                    "p-1 bg-gray-100 rounded-sm" +
                    (fetcher.data?.type === "githubInvalid"
                      ? " border-2 border-red-400"
                      : "")
                  }
                  id="github"
                  placeholder="https://www.github.com/..."
                />
                {(fetcher.data?.type === "invalidemail" ||
                  fetcher.data?.type === "emailExists") && (
                  <small id="passwordHelp" className="text-red-600">
                    {fetcher.data?.msg}
                  </small>
                )}
              </div>
              <div className={formGroup}>
                <label htmlFor="linkedin">Website</label>
                <input
                  type="text"
                  name="website"
                  defaultValue={user.socials.website}
                  className="p-1 bg-gray-100 rounded-sm"
                  id="website"
                />
              </div>
              <button
                type="submit"
                name="type"
                value="_socials"
                className="bg-fuchsia-400 w-full px-6 py-2 rounded-sm mt-4"
              >
                Change socials
              </button>
            </fetcher.Form>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="flex justify-between border-b-2">
                <span className="font-medium">LinkedIn:</span>
                <a className="text-right" href={user.socials.linkedin}>
                  {user.socials.linkedin}
                </a>
              </p>
              <p className="flex justify-between border-b-2">
                <span className="font-medium">Github:</span>
                <a className="text-right" href={user.socials.github}>
                  {user.socials.github}
                </a>
              </p>
              <p className="flex justify-between border-b-2">
                <span className="font-medium">Website:</span>
                <a className="text-right" href={user.socials.website}>
                  {user.socials.website}
                </a>
              </p>
            </div>
          )}

          <Link to="?update=social" className={LinkStyles}>
            Update socials
          </Link>
        </div>
        <div className="grid grid-cols-table gap-6 mt-8">
          <div className="div">
            <label htmlFor="description">Description</label>
            <p className="text-gray-500 mt-2">
              First 250 charectors is shown as a short description in the
              searches.
            </p>
          </div>
          {update === "description" ? (
            <Form method="post">
              <div className="mt-4">
                <textarea
                  className="p-1 bg-gray-100 rounded-sm w-full"
                  name="description"
                  id="description"
                  cols={30}
                  rows={10}
                >
                  {user.description}
                </textarea>
              </div>
              <button
                type="submit"
                name="type"
                value="_description"
                className="bg-fuchsia-400 w-full px-6 py-2 rounded-sm mt-4"
              >
                Change description
              </button>
            </Form>
          ) : (
            <div className="card-body overflow-hidden">
              <div className="card-text break-words sm:whitespace-pre-line">
                <p>
                  {user.description === ""
                    ? "No description"
                    : user.description}
                </p>
              </div>
            </div>
          )}

          <Link to="?update=description" className={LinkStyles}>
            Change description
          </Link>
        </div>
        <footer className="mt-20 flex justify-end">
          <Link className="bg-yellow-200 rounded-sm p-4" to="?update=reset">
            Reset profil
          </Link>
        </footer>
      </div>
    </>
  )
}
