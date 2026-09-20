export type CharacterGender = "male" | "female" | "group"

export interface Character {
  id: string
  name: string
  tags: string[]
  gender: CharacterGender
  bio: string | null
  image: string | null
  created_at: string
  updated_at: string
}

export interface CharacterInsert {
  id?: string
  name: string
  tags?: string[]
  gender?: CharacterGender
  bio?: string | null
  image?: string | null
  created_at?: string
  updated_at?: string
}

export type CharacterUpdate = Partial<CharacterInsert>

export interface CharactersTable {
  Row: Character
  Insert: CharacterInsert
  Update: CharacterUpdate
  Relationships: []
}
