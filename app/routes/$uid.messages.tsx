import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import Avatar from "~/components/Avatar"
import UserListItem from "~/components/UserListItem"
import connectDb from "~/db/connectDb.server"
import { getSession } from "~/server/session"

import type { Student } from "./students"

export const action: ActionFunction = async ({ request, params }) => {
  const db = await connectDb()
  const cookie = request.headers.get("Cookie")
  const session = await getSession(cookie)
  const authUid = session.get("auth")
  const conversationPartner = params.uid

  // Find a conversation between the two users
  // Add (push) the message to the conversation
  // If no conversation already exits, create a new one
  // Add (push) the message to the conversation
  try {
    const conversation = await db.models.Messaging.findOne({
      $and: [
        {
          speakerOne: { $or: [{ _id: authUid }, { _id: conversationPartner }] },
        },
        {
          speakerTwo: { $or: [{ _id: authUid }, { _id: conversationPartner }] },
        },
      ],
    })
    console.log("conversation: ", conversation)

    // const user = await db.models.Users.findById(authUid)
  } catch (err) {
    console.log("err: ", err)
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

  const user = await db.models.Users.findOne(
    { _id: authUid },
    {
      password: 0,
    }
  )
  const studentMessges = await db.models.Users.find(
    {
      _id: { $in: user.connections },
    },
    {
      password: 0,
    }
  )

  return {
    connections: studentMessges,
    user,
  }
}

type MessageCardProps = {
  message: {
    sender: Student
    message: string
    timeSent: string
  }
  user: Student
}

function MessageCard({ message, user }: MessageCardProps) {
  return (
    <div
      className={
        "bg-white shadow-solid w-1/2 p-4 mt-4 right-0" +
        (message.sender._id === user._id ? "ml-96" : "ml-4")
      }
    >
      <div className="flex justify-between">
        <div className="w-16 h-16">
          <Avatar
            name={message.sender.fullname}
            src={message.sender.avatar.image}
            color={message.sender.avatar.color}
            size={200}
          />
        </div>
        <p className="text-gray-600">Time sent: {message.timeSent}</p>
      </div>
      <div className="card-text whitespace-pre-line mt-2 max-h-min">
        <p>{message.message}</p>
      </div>
    </div>
  )
}

type MessageLoaderProps = {
  connections: Student[]
  user: Student
}

function Messages() {
  const { connections, user } = useLoaderData<MessageLoaderProps>()
  console.log("connections: ", connections)

  const message = {
    sender: {
      fullname: "John Doe",
      avatar: {
        image: connections[0].avatar.image,
        color: connections[0].avatar.color,
      },
    },
    timeSent: "12:00",
  }

  return (
    <main className="max-w-screen-xl mx-auto my-4 max-h-screen relative">
      <div className="grid grid-cols-6 gap-3">
        <div
          className="col-start-1 col-end-3 max-h-fit overflow-y-auto"
          style={{
            height: "80vh",
          }}
        >
          {connections.map((connection) => (
            <div className="mt-4" key={connection._id}>
              <UserListItem student={connection} hasButton={false} />
            </div>
          ))}
        </div>
        <div
          className="col-span-4 col-end-7 bg-stone-100 grid col-1 row-auto overflow-y-scroll"
          style={{
            height: "80vh",
          }}
        >
          {/* <MessageCard message={message} user={user} /> */}
        </div>
      </div>
      <Form method="post" className="flex gap-2 absolute -bottom-12 right-0">
        <input
          type="text"
          name="message"
          id="message"
          className="p-1 mt-1 rounded-sm border-2 border-gray-300 w-screen max-w-screen-sm "
        />
        <input
          type="submit"
          value="Message"
          className="bg-green-300 px-6 py-2 rounded-sm"
        />
      </Form>
    </main>
  )
}

export default Messages
