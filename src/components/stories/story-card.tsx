import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, MoreVertical, Pencil, Quote, Trash2 } from "lucide-react"
import type { Story } from "@/types"

interface StoryCardProps {
  story: Story
  onView: (story: Story) => void
  onEdit: (story: Story) => void
  onDelete: (story: Story) => void
}

export function StoryCard({
  story,
  onView,
  onEdit,
  onDelete,
}: StoryCardProps) {
  const formattedDate = new Date(story.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Optional Card Image Banner */}
      {story.image && (
        <div className="relative h-44 w-full overflow-hidden bg-muted">
          <img
            src={story.image}
            alt={story.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = "none"
            }}
          />
        </div>
      )}

      <div>
        <CardHeader className="space-y-1.5 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle
              onClick={() => onView(story)}
              dir="auto"
              className="line-clamp-1 cursor-pointer text-lg font-semibold tracking-tight transition-colors hover:text-primary leading-snug"
            >
              {story.title}
            </CardTitle>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(story)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(story)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(story)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardDescription className="text-xs">
            Added on {formattedDate}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          {story.summary ? (
            <p dir="auto" className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
              {story.summary}
            </p>
          ) : (
            <p className="text-xs italic text-muted-foreground/60">
              No summary provided
            </p>
          )}

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {story.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" dir="auto" className="text-[11px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
              {story.tags.length > 3 && (
                <Badge variant="outline" dir="auto" className="text-[11px] px-1.5 py-0">
                  +{story.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {story.sources && story.sources.length > 0 ? (
            <>
              <Quote className="h-3 w-3" />
              <span>{story.sources.length} source{story.sources.length > 1 ? "s" : ""}</span>
            </>
          ) : (
            <span>No sources</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => onView(story)}
        >
          Read story &rarr;
        </Button>
      </CardFooter>
    </Card>
  )
}
