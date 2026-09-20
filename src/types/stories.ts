export type Story = {
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

export type StoryInsert = {
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

export type StoryUpdate = {
  id?: string
  title?: string
  content?: string | null
  summary?: string | null
  tags?: string[]
  sources?: string[]
  image?: string | null
  created_at?: string
  updated_at?: string
}

export type StoriesTable = {
  Row: Story
  Insert: StoryInsert
  Update: StoryUpdate
  Relationships: []
}
