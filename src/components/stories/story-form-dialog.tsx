import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X } from "lucide-react"
import type { Story, StoryInsert, StoryUpdate } from "@/types"

interface StoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storyToEdit?: Story | null
  onSubmit: (data: StoryInsert | StoryUpdate) => Promise<boolean>
}

interface StoryFormInnerProps {
  storyToEdit?: Story | null
  onSubmit: (data: StoryInsert | StoryUpdate) => Promise<boolean>
  onCancel: () => void
}

function StoryFormInner({ storyToEdit, onSubmit, onCancel }: StoryFormInnerProps) {
  const isEditing = Boolean(storyToEdit)

  const [title, setTitle] = React.useState(() => storyToEdit?.title || "")
  const [summary, setSummary] = React.useState(() => storyToEdit?.summary || "")
  const [content, setContent] = React.useState(() => storyToEdit?.content || "")
  const [imageUrl, setImageUrl] = React.useState(() => storyToEdit?.image || "")
  const [tags, setTags] = React.useState<string[]>(() => storyToEdit?.tags || [])
  const [tagInput, setTagInput] = React.useState("")
  const [sources, setSources] = React.useState<string[]>(() => storyToEdit?.sources || [])
  const [sourceInput, setSourceInput] = React.useState("")

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleAddSource = () => {
    const trimmed = sourceInput.trim()
    if (trimmed && !sources.includes(trimmed)) {
      setSources([...sources, trimmed])
      setSourceInput("")
    }
  }

  const handleRemoveSource = (sourceToRemove: string) => {
    setSources(sources.filter((s) => s !== sourceToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Please enter a story title.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const payload: StoryInsert = {
        title: title.trim(),
        summary: summary.trim() || null,
        content: content.trim() || null,
        image: imageUrl.trim() || null,
        tags,
        sources,
      }

      const success = await onSubmit(payload)
      if (success) {
        onCancel()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save story.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="story-title">Title *</Label>
        <Input
          id="story-title"
          placeholder="e.g. The Companions of the Cave (Ashab al-Kahf)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Summary */}
      <div className="space-y-1.5">
        <Label htmlFor="story-summary">Summary</Label>
        <Textarea
          id="story-summary"
          rows={2}
          placeholder="A brief overview or abstract of the story..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label htmlFor="story-content">Content</Label>
        <Textarea
          id="story-content"
          rows={5}
          placeholder="Full narrative, context, or story text..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Image URL */}
      <div className="space-y-1.5">
        <Label htmlFor="story-image">Image URL</Label>
        <Input
          id="story-image"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        {imageUrl.trim() && (
          <div className="mt-2 overflow-hidden rounded-md border bg-muted/40">
            <img
              src={imageUrl}
              alt="Story preview"
              className="h-32 w-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = "none"
              }}
            />
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label htmlFor="story-tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="story-tags"
            placeholder="Add a tag (e.g. quran, lesson)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTag()
              }
            }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 py-0.5">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Sources */}
      <div className="space-y-1.5">
        <Label htmlFor="story-sources">Sources & References</Label>
        <div className="flex gap-2">
          <Input
            id="story-sources"
            placeholder="e.g. Surah Al-Kahf 18:9-26"
            value={sourceInput}
            onChange={(e) => setSourceInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddSource()
              }
            }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={handleAddSource}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        {sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {sources.map((src) => (
              <Badge key={src} variant="outline" className="gap-1 py-0.5 text-xs">
                {src}
                <button
                  type="button"
                  onClick={() => handleRemoveSource(src)}
                  className="ml-0.5 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <DialogFooter className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Story"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function StoryFormDialog({
  open,
  onOpenChange,
  storyToEdit,
  onSubmit,
}: StoryFormDialogProps) {
  const isEditing = Boolean(storyToEdit)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Story" : "Create New Story"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this story."
              : "Fill in the details to add a new story to the collection."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <StoryFormInner
            key={storyToEdit?.id ?? "new"}
            storyToEdit={storyToEdit}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
