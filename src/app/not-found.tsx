import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
        404
      </p>
      <h1 className="mt-3 font-heading text-4xl">This page was never chopped.</h1>
      <p className="mt-3 text-muted-foreground">
        The desk is still open. Pick a slip and keep going.
      </p>
      <Link
        href="/desk"
        className="mt-6 rounded-full bg-foreground px-4 py-2 text-sm text-background"
      >
        Back to the desk
      </Link>
    </div>
  );
}
