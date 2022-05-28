import { Link, useCatch } from "@remix-run/react"

import NotFound from "./NotFound"

export default function NotFoundCatchBoundary() {
  const caught = useCatch()
  return (
    <main className="mx-auto max-w-screen-xl flex justify-center items-center h-screen">
      <div className="mx-auto">
        <h1 className="text-3xl text-center mb-20">{caught.statusText}</h1>
        <div>
          <NotFound />
        </div>
        <Link to="/students">Go find students to message</Link>
      </div>
    </main>
  )
}
