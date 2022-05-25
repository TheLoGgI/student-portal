import type { Student } from "~/routes/students"

export type AvatarIconType = {
  image: string
  color: string
}

export type ProfilLoaderData = {
  avatars: AvatarIconType[]
  url: string
}

export type UserProfilLoaderData = {
  profilUser: Student
  isInterested: boolean
  url: string
  connections: {
    network: Student[]
    recruiters: Student[]
  }
}

export type DrawerProps = {
  isActive: boolean
  students: {
    network: Student[]
    recruiters: Student[]
  }
  connectionsType: string | null
}
