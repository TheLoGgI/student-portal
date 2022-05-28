import type { ActionFunction, LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import Avatar from "~/components/Avatar"
import NotFound from "~/components/NotFound"
import CatchBoundary from "~/components/NotFoundCatchBoundary"
import UserListItem from "~/components/UserListItem"
import connectDb from "~/db/connectDb.server"
import { getSession } from "~/server/session"
import type { MessageLoaderProps } from "~/types/loaders"
import { padTo2Digits } from "~/utils"

import type { Student } from "./students"

export const action: ActionFunction = async ({ request, params }) => {
  const db = await connectDb()
  const form = await request.formData()
  const cookie = request.headers.get("Cookie")
  const session = await getSession(cookie)
  const authUid = session.get("auth")
  const conversationPartnerUid = params.uid

  const message = form.get("message") as string

  try {
    const conversation = await db.models.Messaging.findOne({
      $or: [
        {
          speakerOne: { _id: authUid },
          speakerTwo: { _id: conversationPartnerUid },
        },
        {
          speakerOne: { _id: conversationPartnerUid },
          speakerTwo: { _id: authUid },
        },
      ],
    })
    // { $or: [{ _id: authUid }, { _id: conversationPartnerUid }] }
    if (conversation === null) {
      const newConversation = await db.models.Messaging.create({
        speakerOne: { _id: authUid },
        speakerTwo: { _id: conversationPartnerUid },
        messages: [
          {
            from: authUid,
            message,
            date: new Date(),
          },
        ],
      })

      await newConversation.save()
      return null
    }

    conversation.messages.push({
      from: authUid,
      message,
      date: new Date(),
    })

    await conversation.save()
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
  const conversationPartnerUid = params.uid
  console.log("conversationPartnerUid: ", conversationPartnerUid)

  if (!session.has("auth")) {
    throw redirect("/login")
  }

  const user = await db.models.Users.findOne(
    { _id: authUid },
    {
      password: 0,
    }
  )

  // Find all conversations that are possible for the user, e.g connections
  const studentMessengers = await db.models.Users.find(
    {
      $or: [
        {
          _id: { $in: user.connections },
        },
        // Find _id where user is a connection
        { connections: { $in: user._id } },
      ],
    },
    {
      password: 0,
    }
  )

  if (studentMessengers.length === 0)
    throw new Response(
      "Sorry, you don't have any to chat with. Find people you want to connect with and tell them you are inderstested",
      {
        status: 400,
        statusText:
          "Sorry, you don't have any to chat with. Find people you want to connect with and tell them you are inderstested",
      }
    )

  const conversation = await db.models.Messaging.findOne({
    $or: [
      {
        speakerOne: { _id: authUid },
        speakerTwo: { _id: conversationPartnerUid },
      },
      {
        speakerOne: { _id: conversationPartnerUid },
        speakerTwo: { _id: authUid },
      },
    ],
  })
  console.log("conversation: ", conversation)

  // if (conversation === null)
  //   throw new Response("Sorry, you have no conversations with this person", {
  //     status: 400,
  //     statusText: "Sorry, no user found with that id",
  //   })
  const emptyConversation = {
    messages: [],
  }

  return {
    conversation: conversation === null ? emptyConversation : conversation,
    connections: studentMessengers,
    user,
  }
}

type MessageCardProps = {
  message: {
    from: Student
    message: string
    date: string
  }
  user: Student
}

function MessageCard({ message, user }: MessageCardProps) {
  const isCurrentUser = message.from._id === user._id
  const time = new Date(message.date)
  const timeSent = time.toLocaleDateString("da-DK", {
    month: "long",
    day: "numeric",
  })
  const hoursAndMinutes =
    padTo2Digits(time.getHours()) + ":" + padTo2Digits(time.getMinutes())

  return (
    <div
      className={
        "bg-white shadow-solid w-1/2 p-4 mt-4 right-0" +
        (isCurrentUser ? " ml-96" : " ml-4")
      }
    >
      <div
        className={
          "flex justify-between" + (isCurrentUser ? " flex-row-reverse" : "")
        }
      >
        <div className="w-16 h-16">
          <Avatar
            name={message.from.fullname}
            src={message.from.avatar.image}
            color={message.from.avatar.color}
            size={200}
          />
        </div>
        <p className="text-gray-600">
          {timeSent} {hoursAndMinutes}
        </p>
      </div>
      <div className="card-text whitespace-pre-line mt-2 max-h-min">
        <p>{message.message}</p>
      </div>
    </div>
  )
}

function Messages() {
  const { connections, user, conversation } =
    useLoaderData<MessageLoaderProps>()

  // const formRef = useRef()

  // useEffect(() => {
  //   console.log("formRef: ", formRef)
  //   // formRef.current.focus()
  // }, [formRef])

  // const message = {
  //   sender: {
  //     fullname: "John Doe",
  //     avatar: {
  //       image: connections[0].avatar.image,
  //       color: connections[0].avatar.color,
  //     },
  //   },
  //   timeSent: "12:00",
  // }

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
              <UserListItem student={connection} urlPath="messages" />
            </div>
          ))}
        </div>
        <div
          className="col-span-4 col-end-7 bg-stone-100 pb-10 overflow-y-scroll"
          style={{
            height: "80vh",
          }}
        >
          {conversation.messages.length > 0 &&
            conversation.messages.map((message) => {
              const from = connections.find(
                (person) => person._id === message.from
              )
              console.log("from: ", from)
              return (
                <MessageCard
                  key={message._id}
                  message={{ ...message, from: from ?? user }}
                  user={user}
                />
              )
            })}
        </div>
      </div>
      <Form
        method="post"
        className="flex gap-2 absolute -bottom-12 right-0"
        // ref={formRef}
      >
        <input
          type="text"
          required
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
export { CatchBoundary }

export function ErrorBoundary() {
  return (
    <div className="bg-orange-300 h-screen w-screen">
      <main className="mx-auto max-w-screen-xl flex justify-center items-center h-screen">
        <div className="mx-auto flex flex-col justify-center">
          <h1 className="text-3xl text-center mb-20">
            You have requested a conversation with an invalid user
          </h1>
          <div className="inline-block text-center">
            <Link to="/students" className="bg-teal-300 px-6 py-2 rounded-sm">
              Go find students to message
            </Link>
          </div>
          <div>
            <NotFound />
          </div>
        </div>
      </main>
    </div>
  )
}
