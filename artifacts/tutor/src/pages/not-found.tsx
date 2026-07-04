export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="font-serif text-2xl text-foreground leading-tight">A Guide to Homecare</div>
        <div className="text-xs text-muted-foreground mb-10">Caregiver preparedness &middot; guided by Dorothy Mooka</div>

        <div className="font-serif text-6xl text-primary mb-3">404</div>
        <h1 className="font-serif text-2xl text-foreground mb-2">We couldn't find that page</h1>
        <p className="text-muted-foreground mb-7 leading-relaxed">
          The page you're looking for doesn't exist, or it may have moved. Let's get you back to the course.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to A Guide to Homecare
        </a>
      </div>
    </div>
  );
}
