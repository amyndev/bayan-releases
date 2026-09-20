export interface Place {
  id: string
  name: string
  tags: string[]
  region: string | null
  description: string | null
  image: string | null
  created_at: string
  updated_at: string
}

export interface PlaceInsert {
  id?: string
  name: string
  tags?: string[]
  region?: string | null
  description?: string | null
  image?: string | null
  created_at?: string
  updated_at?: string
}

export type PlaceUpdate = Partial<PlaceInsert>

export interface PlacesTable {
  Row: Place
  Insert: PlaceInsert
  Update: PlaceUpdate
  Relationships: []
}
