export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gold"></div>
        <p className="mt-4 text-lg text-stone font-medium">Loading articles...</p>
      </div>
    </div>
  );
}
