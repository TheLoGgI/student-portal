const Avatar = ({
  src,
  name,
  size = 50,
  color = "purple-300",
}: {
  src?: string
  name?: string
  size?: number
  color?: string
}) => (
  <div
    className={`rounded-full flex justify-center items-center`}
    style={{ backgroundColor: color }}
  >
    <img
      src={src ?? "assets/images/default-avatar.png"}
      width={size}
      height={size}
      alt={`Avatar ${name}`}
    />
  </div>
)

export default Avatar
