export type StoryCharacter = {
  story_id: string
  character_id: string
}

export type StoryPlace = {
  story_id: string
  place_id: string
}

export type StoryCharactersTable = {
  Row: StoryCharacter
  Insert: StoryCharacter
  Update: Partial<StoryCharacter>
  Relationships: [
    {
      foreignKeyName: "story_characters_character_id_fkey"
      columns: ["character_id"]
      isOneToOne: false
      referencedRelation: "characters"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "story_characters_story_id_fkey"
      columns: ["story_id"]
      isOneToOne: false
      referencedRelation: "stories"
      referencedColumns: ["id"]
    },
  ]
}

export type StoryPlacesTable = {
  Row: StoryPlace
  Insert: StoryPlace
  Update: Partial<StoryPlace>
  Relationships: [
    {
      foreignKeyName: "story_places_place_id_fkey"
      columns: ["place_id"]
      isOneToOne: false
      referencedRelation: "places"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "story_places_story_id_fkey"
      columns: ["story_id"]
      isOneToOne: false
      referencedRelation: "stories"
      referencedColumns: ["id"]
    },
  ]
}
