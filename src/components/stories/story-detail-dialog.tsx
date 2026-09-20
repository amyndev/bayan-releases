import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Quote, Tag } from "lucide-react"
import type { Story } from "@/types"

interface StoryDetailDialogProps {
  story: Story | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StoryDetailDialog({
  story,
  open,
  onOpenChange,
}: StoryDetailDialogProps) {
  if (!story) return null

  const formattedDate = new Date(story.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle dir="auto" className="text-xl font-bold tracking-tight leading-snug">
            {story.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Created on {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Cover image if available */}
          {story.image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              <img
                src={story.image}
                alt={story.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = "none"
                }}
              />
            </div>
          )}

          {/* Summary */}
          {story.summary && (
            <div
              dir="auto"
              className="rounded-lg border bg-muted/30 p-3.5 text-sm italic text-muted-foreground leading-relaxed font-sans"
            >
              {story.summary}
            </div>
          )}

          {/* Full Content */}
          {story.content ? (
            <div
              dir="auto"
              className="whitespace-pre-wrap text-base leading-loose text-foreground font-sans"
            >
              {story.content}
            </div>
          ) : (
            <div className="text-sm italic text-muted-foreground">
              No detailed content provided yet.
            </div>
          )}

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {story.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" dir="auto">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {story.sources && story.sources.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Quote className="h-3.5 w-3.5" />
                Sources & References
              </div>
              <div className="flex flex-wrap gap-1.5">
                {story.sources.map((source) => (
                  <Badge key={source} variant="outline" dir="auto" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
