import { Link, Outlet } from "@remix-run/react"
// import connectDb from "~/db/connectDb.server.js"

// export async function loader() {
//   const db = await connectDb()
//   const books = await db.models.Book.find()
//   return books
// }

export default function Index() {
  const books = []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Remix + Mongoose</h1>
      <h2 className="text-lg font-bold mb-3">
        Here are a few of my favorite books:
      </h2>
      <ul className="ml-5 list-disc">
        {books.map((book) => {
          return (
            <li key={book._id}>
              <Link
                to={`/books/${book._id}`}
                className="text-blue-600 hover:underline"
              >
                {book.title}
              </Link>
            </li>
          )
        })}
      </ul>
      <Outlet />
    </div>
  )
}
