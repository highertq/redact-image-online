import Link from "next/link";

import { Kicker, Prose } from "@/components/Typography";
import { SITE_NAME } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Kicker>404</Kicker>
      <h1 className="text-h1 font-semibold text-ink md:text-display">
        This page does not exist
      </h1>
      <Prose>
        <p>
          The link may be outdated, or the address may have a typo. The
          redaction tool itself is still where you left it.
        </p>
      </Prose>
      <p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-body-sm font-semibold text-paper transition-hover hover:bg-redact"
        >
          Go to {SITE_NAME}
        </Link>
      </p>
    </div>
  );
}
