import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import Avatar from "~/components/Avatar"
import Exit from "~/components/Exit"
import CatchBoundary from "~/components/NotFoundCatchBoundary"
import Tag from "~/components/Tag"
import UserListItem from "~/components/UserListItem"
import connectDb from "~/db/connectDb.server"
import { getSession } from "~/server/session"
import type { DrawerProps, UserProfilLoaderData } from "~/types/loaders"
import { getFormatedDate } from "~/utils"

import type { Student } from "./students"

export const action: ActionFunction = async ({ request, params }) => {
  const db = await connectDb()
  const cookie = request.headers.get("Cookie")
  const session = await getSession(cookie)
  const authUid = session.get("auth")
  const profilUid = params.uid

  try {
    const user = await db.models.Users.findById(authUid)
    const profilUser = await db.models.Users.findById(profilUid)

    const isInterested = profilUser.network.includes(user._id)

    if (isInterested) {
      profilUser.network.splice(profilUser.network.indexOf(user._id), 1)

      user.connections.splice(
        user.connections.indexOf(profilUser._id.toString()),
        1
      )

      await profilUser.save()
      await user.save()
      return null
    }
    profilUser.network.push(user._id)
    user.connections.push(profilUser._id)

    await profilUser.save()
    await user.save()
  } catch (error) {
    console.log("error: ", error)
    return null
  }

  return null
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const db = await connectDb()
  const cookie = request.headers.get("Cookie")
  const session = await getSession(cookie)
  const authUid = session.get("auth")

  if (!session.has("auth")) {
    throw redirect("/login")
  }

  const profilUid = params.uid
  const user = await db.models.Users.findById(authUid)
  const profilUser = await db.models.Users.findById(profilUid)
  const networkConnections = await db.models.Users.find(
    {
      _id: { $in: profilUser.network },
    },
    {
      password: 0,
    }
  )
  // const requtiersConnections = await db.models.Users.find(
  //   {
  //     _id: { $in: profilUser.requiters },
  //   },
  //   {
  //     password: 0,
  //   }
  // )

  if (profilUser === null)
    throw new Response("Sorry, no user found with that id", {
      status: 404,
      statusText: "Sorry, no user found with that id",
    })

  // const interestsName = user.isCorporation ? "recruters" : "network"
  // const isInterested = profilUser[interestsName].includes(user._id)
  const isInterested = profilUser.network.includes(user._id)

  const profilData = await db.models.Users.findOne(
    { _id: profilUid },
    { password: 0 }
  )

  return {
    profilUser: profilData,
    isInterested,
    url: request.url,
    connections: {
      recruiters: networkConnections.filter((x) => x.isCorporation),
      network: networkConnections.filter((x) => x.isCorporation === false),
    },
  }
}

function Drawer({ isActive, students, connectionsType }: DrawerProps) {
  if (!isActive || connectionsType === null) return null
  const connection: Array<Student> = (students as any)[connectionsType]

  return (
    <aside className="w-96 absolute top-0 right-0 h-screen p-4 bg-gray-100 z-50 border-2 border-gray-300 overflow-y-scroll">
      <div className="flex justify-between">
        <h2 className="text-xl mb-4 capitalize">{connectionsType}</h2>
        <div>
          <Link to="./">
            <Exit />
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {connection.length !== 0 ? (
          connection.map((student) => (
            <UserListItem key={student._id} student={student} />
          ))
        ) : (
          <p>No connections in your {connectionsType}</p>
        )}
      </div>
    </aside>
  )
}

export default function UserProfil() {
  const { profilUser, isInterested, connections, url } =
    useLoaderData<UserProfilLoaderData>()
  const createdAt = getFormatedDate(profilUser.createdAt)

  const drawer = new URL(url).searchParams.get("drawer")

  return (
    <>
      <Drawer
        isActive={drawer === "network" || drawer === "recruiters"}
        students={connections}
        connectionsType={drawer}
      />

      <main className="w-full">
        <div className="container max-w-screen-xl mx-auto p-8 bg-gray-100 ">
          <div className="flex text-xl gap-5 justify-around flex-wrap items-center">
            <div className="w-24 h-24">
              <Avatar
                src={profilUser.avatar.image}
                name={profilUser.fullname}
                size={100}
                color={profilUser.avatar.color}
              />
            </div>
            <div className="flex flex-col ">
              <div className="flex flex-row gap-4 ">
                <h3 className="capitalize text-3xl mb-4">
                  {profilUser.fullname}
                </h3>
                <p>{profilUser?.isCorporation ? "Corporation" : "Student"}</p>
              </div>

              <div className="flex flex-row gap-4">
                <p className="text-base text-gray-600">
                  Signed up: {createdAt}
                </p>
                <div className="flex gap-2 text-base">
                  {profilUser.tags.map((tag: string) => (
                    <Tag tag={tag} key={tag} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                <Link
                  to="?drawer=recruiters"
                  className="text-base font-medium hover:underline hover:underline-offset-2 hover:text-purple-600"
                >
                  Recruiters
                </Link>
                <p>{connections.recruiters.length}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to="?drawer=network"
                  className="text-base font-medium hover:underline hover:underline-offset-2 hover:text-purple-600"
                >
                  Network
                </Link>
                <p>{connections.network.length}</p>
              </div>
            </div>

            <Form method="post">
              <button
                type="submit"
                name="instrested"
                className="bg-fuchsia-400 w-full px-6 py-2 rounded-sm"
              >
                {isInterested ? "Uninterested" : "Interested"}
              </button>
            </Form>
          </div>
        </div>
        <div className="mx-auto p-8 mt-4">
          <div className="flex gap-5 justify-around flex-wrap items-center w-full">
            <div className="max-w-lg">
              <p className="font-bold">Biography</p>
              <p className="">{profilUser.description}</p>
            </div>
            <div className="flex flex-col gap-2">
              {profilUser.socials && profilUser.socials.linkedin && (
                <p className="flex flex-col border-b-2">
                  <span className="font-medium">LinkedIn:</span>
                  <a className="text-right" href={profilUser.socials.linkedin}>
                    {profilUser.socials.linkedin}
                  </a>
                </p>
              )}

              {profilUser.socials && profilUser.socials.github && (
                <p className="flex flex-col border-b-2">
                  <span className="font-medium">Github:</span>
                  <a className="text-right" href={profilUser.socials.github}>
                    {profilUser.socials.github}
                  </a>
                </p>
              )}

              {profilUser.socials && profilUser.socials.website && (
                <p className="flex flex-col border-b-2">
                  <span className="font-medium">Website:</span>
                  <a className="text-right" href={profilUser.socials.website}>
                    {profilUser.socials.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export { CatchBoundary }
