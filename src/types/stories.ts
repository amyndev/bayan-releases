export interface Story {
  id: string
  title: string
  content: string | null
  summary: string | null
  tags: string[]
  sources: string[]
  image: string | null
  created_at: string
  updated_at: string
}

export interface StoryInsert {
  id?: string
  title: string
  content?: string | null
  summary?: string | null
  tags?: string[]
  sources?: string[]
  image?: string | null
  created_at?: string
  updated_at?: string
}

export type StoryUpdate = Partial<StoryInsert>

export interface StoriesTable {
  Row: Story
  Insert: StoryInsert
  Update: StoryUpdate
  Relationships: []
}
