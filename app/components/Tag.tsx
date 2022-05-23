import { Link } from "@remix-run/react"

type TagProps = {
  tag: string
}

const Tag = ({ tag }: TagProps) => (
  <Link to={`.?tags=${tag}`} key={tag} className="capitalize underline">
    {tag}
  </Link>
)

export default Tag
