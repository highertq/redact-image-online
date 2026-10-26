/**
 * The site's core promise. It lives in one place because it is rendered in the
 * drop zone and in the editor, and the two must never drift apart.
 */
export const PRIVACY_NOTE =
  "Your image never leaves this browser tab. Nothing is uploaded, and the exported PNG is re-encoded from a canvas, which drops metadata such as EXIF.";

/** The short form used by the drop zone, matching the site's core promise. */
export const PRIVACY_SHORT =
  "Your image never leaves this browser tab. Nothing is uploaded.";
