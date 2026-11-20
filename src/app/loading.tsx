import { CardSkeleton } from "@/components/article-card";
export default function Loading() {
  return (
    <div className="mt-4">
      <div className="skeleton h-28 rounded-3xl" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
    </div>
  );
}
