import type { StoriesTable } from "./stories"
import type { CharactersTable, CharacterGender } from "./characters"
import type { PlacesTable } from "./places"
import type { StoryCharactersTable, StoryPlacesTable } from "./relations"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      stories: StoriesTable
      characters: CharactersTable
      places: PlacesTable
      story_characters: StoryCharactersTable
      story_places: StoryPlacesTable
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      character_gender: CharacterGender
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
