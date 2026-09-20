export type Place = {
  id: string
  name: string
  tags: string[]
  region: string | null
  description: string | null
  image: string | null
  created_at: string
  updated_at: string
}

export type PlaceInsert = {
  id?: string
  name: string
  tags?: string[]
  region?: string | null
  description?: string | null
  image?: string | null
  created_at?: string
  updated_at?: string
}

export type PlaceUpdate = {
  id?: string
  name?: string
  tags?: string[]
  region?: string | null
  description?: string | null
  image?: string | null
  created_at?: string
  updated_at?: string
}

export type PlacesTable = {
  Row: Place
  Insert: PlaceInsert
  Update: PlaceUpdate
  Relationships: []
}
