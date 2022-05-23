export const generateAvatars = (
  amount: number,
  seed: string = ""
): string[] => {
  const avatars: string[] = []
  for (let i = 0; i < amount; i++) {
    const randomHexKey = Math.random().toString(16).slice(2)
    const avatarUrl = `https://avatars.dicebear.com/api/adventurer/${randomHexKey}${seed}.svg`
    avatars.push(avatarUrl)
  }
  return avatars
}

export const randomColor = (): string => {
  const colors = [
    "#7E96F6",
    "#D8B4FE",
    "#F3F089",
    "#F3C989",
    "#89DAF3",
    "#F389F3",
    "#F389B7",
    "#F3A689",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// export default { generateAvatars }
