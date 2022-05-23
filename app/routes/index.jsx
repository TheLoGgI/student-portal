import { Link } from "@remix-run/react"

export default function Index() {
  return (
    <main className="max-w-screen-xl mx-auto">
      <div className="grid grid-cols-6">
        <div className="col-start-1 col-end-4 row-start-1 gap-4 relative z-10">
          <h1 className="text-6xl font-bold mt-10 text-blue-600">
            Find the best students and internes for your company
          </h1>
          <p className="text-lg mt-4 max-w-sm mb-20">
            Search for students with a specialty or filter them by experience
            level
          </p>
          <Link to="/login" className="bg-blue-400 px-6 py-4 rounded-sm">
            Login to find your students
          </Link>
        </div>
        <div className="col-span-4 col-end-7 row-start-1 gap-4">
          <img
            className="transform -scale-x-100"
            src="/assets/images/mimi-thian.jpg"
            alt="Students"
          />
        </div>
      </div>
    </main>
  )
}
