export type CharacterGender = "male" | "female" | "group"

export type Character = {
  id: string
  name: string
  tags: string[]
  gender: CharacterGender
  bio: string | null
  image: string | null
  created_at: string
  updated_at: string
}

export type CharacterInsert = {
  id?: string
  name: string
  tags?: string[]
  gender?: CharacterGender
  bio?: string | null
  image?: string | null
  created_at?: string
  updated_at?: string
}

export type CharacterUpdate = {
  id?: string
  name?: string
  tags?: string[]
  gender?: CharacterGender
  bio?: string | null
  image?: string | null
  created_at?: string
  updated_at?: string
}

export type CharactersTable = {
  Row: Character
  Insert: CharacterInsert
  Update: CharacterUpdate
  Relationships: []
}
