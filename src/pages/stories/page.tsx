import * as React from "react"
import { supabase } from "@/lib/supabase"
import type { Story, StoryInsert, StoryUpdate } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  Eye,
  LayoutGrid,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Table as TableIcon,
  Trash2,
  X,
} from "lucide-react"
import { StoryCard } from "@/components/stories/story-card"
import { StoryFormDialog } from "@/components/stories/story-form-dialog"
import { StoryDetailDialog } from "@/components/stories/story-detail-dialog"

export default function StoriesPage() {
  const [stories, setStories] = React.useState<Story[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshTrigger, setRefreshTrigger] = React.useState(0)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")

  // Dialog States
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [storyToEdit, setStoryToEdit] = React.useState<Story | null>(null)
  const [storyToView, setStoryToView] = React.useState<Story | null>(null)
  const [storyToDelete, setStoryToDelete] = React.useState<Story | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Status notification
  const [notification, setNotification] = React.useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const showNotification = React.useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }, [])

  const refetchStories = React.useCallback(() => {
    setLoading(true)
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  // Fetch stories from Supabase
  React.useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const { data, error } = await supabase
          .from("stories")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error

        if (!ignore) {
          setStories(data || [])
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Error fetching stories:", err)
          showNotification(
            "error",
            err instanceof Error ? err.message : "Failed to load stories from Supabase."
          )
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [refreshTrigger, showNotification])

  // Create or Update
  const handleSaveStory = async (data: StoryInsert | StoryUpdate): Promise<boolean> => {
    try {
      const title = "title" in data && data.title ? data.title : "Story"

      if (storyToEdit) {
        // UPDATE
        const { error } = await supabase
          .from("stories")
          .update(data as StoryUpdate)
          .eq("id", storyToEdit.id)

        if (error) throw error

        showNotification("success", `Story "${title}" updated successfully!`)
      } else {
        // INSERT
        const { error } = await supabase
          .from("stories")
          .insert(data as StoryInsert)

        if (error) throw error

        showNotification("success", `Story "${title}" created successfully!`)
      }

      refetchStories()
      return true
    } catch (err: unknown) {
      console.error("Error saving story:", err)
      const message = err instanceof Error ? err.message : "Failed to save story."
      showNotification("error", message)
      throw new Error(message, { cause: err })
    }
  }

  // Delete
  const handleConfirmDelete = async () => {
    if (!storyToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyToDelete.id)

      if (error) throw error

      showNotification("success", `Story "${storyToDelete.title}" deleted.`)
      setStoryToDelete(null)
      refetchStories()
    } catch (err: unknown) {
      console.error("Error deleting story:", err)
      showNotification(
        "error",
        err instanceof Error ? err.message : "Failed to delete story."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  // Filtered stories based on search
  const filteredStories = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return stories

    return stories.filter((story) => {
      const matchTitle = story.title.toLowerCase().includes(q)
      const matchSummary = story.summary?.toLowerCase().includes(q) || false
      const matchTags = story.tags?.some((t) => t.toLowerCase().includes(q)) || false
      const matchSources = story.sources?.some((s) => s.toLowerCase().includes(q)) || false
      return matchTitle || matchSummary || matchTags || matchSources
    })
  }, [stories, searchQuery])

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stories</h1>
          <p className="text-sm text-muted-foreground">
            Manage narratives, historical events, and Quranic stories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetchStories}
            disabled={loading}
            title="Refresh stories"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setStoryToEdit(null)
              setIsFormOpen(true)
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Story
          </Button>
        </div>
      </div>

      {/* Notification Toast/Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between rounded-lg border p-3.5 text-sm transition-all ${
            notification.type === "success"
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Controls Bar: Search & View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stories, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-muted-foreground">
            {filteredStories.length} {filteredStories.length === 1 ? "story" : "stories"}
          </span>

          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="mr-1 h-3.5 w-3.5" />
              Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="mr-1 h-3.5 w-3.5" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        // Loading Skeletons
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-3 rounded-xl border p-4">
                <Skeleton className="h-36 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        )
      ) : filteredStories.length === 0 ? (
        // Empty State
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            {searchQuery ? "No matching stories found" : "No stories yet"}
          </h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            {searchQuery
              ? `No stories matched your search "${searchQuery}". Try a different keyword.`
              : "Start documenting stories by creating your first story record."}
          </p>
          {!searchQuery && (
            <Button
              size="sm"
              className="mt-5"
              onClick={() => {
                setStoryToEdit(null)
                setIsFormOpen(true)
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create First Story
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onView={(s) => setStoryToView(s)}
              onEdit={(s) => {
                setStoryToEdit(s)
                setIsFormOpen(true)
              }}
              onDelete={(s) => setStoryToDelete(s)}
            />
          ))}
        </div>
      ) : (
        // Table View
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Sources</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStories.map((story) => (
                <TableRow key={story.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <button
                      onClick={() => setStoryToView(story)}
                      className="text-left hover:underline"
                    >
                      {story.title}
                    </button>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                    {story.summary || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {story.tags && story.tags.length > 0
                        ? story.tags.slice(0, 2).map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">
                              {t}
                            </Badge>
                          ))
                        : "—"}
                      {story.tags && story.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{story.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {story.sources?.length ? `${story.sources.length} ref(s)` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setStoryToView(story)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setStoryToEdit(story)
                            setIsFormOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setStoryToDelete(story)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Dialog (Create / Edit) */}
      <StoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        storyToEdit={storyToEdit}
        onSubmit={handleSaveStory}
      />

      {/* Detail Dialog */}
      <StoryDetailDialog
        story={storyToView}
        open={Boolean(storyToView)}
        onOpenChange={(open) => !open && setStoryToView(null)}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(storyToDelete)}
        onOpenChange={(open) => !open && setStoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the story{" "}
              <strong className="text-foreground">
                "{storyToDelete?.title}"
              </strong>{" "}
              from Supabase. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Story
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
