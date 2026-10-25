import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        This page does not exist
      </h1>
      <p className="text-sm leading-relaxed text-neutral-600">
        The link may be outdated, or the address may have a typo. The redaction
        tool itself is still where you left it.
      </p>
      <p className="text-sm">
        <Link className="font-medium text-neutral-900 underline" href="/">
          Go to {SITE_NAME}
        </Link>
      </p>
    </div>
  );
}
