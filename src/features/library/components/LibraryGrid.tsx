import { LibraryCard } from "@/features/library/components/LibraryCard"
import type { LibraryCardModel } from "@/features/library/view-models"

type LibraryGridProps = {
  items: LibraryCardModel[]
}

export function LibraryGrid({ items }: LibraryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <LibraryCard key={item.id} item={item} />
      ))}
    </div>
  )
}
