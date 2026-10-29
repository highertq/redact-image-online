import type { Scenario } from "@/lib/content/types";

export const API_KEY: Scenario = {
  slug: "redact-api-key",
  published: "2026-10-27",
  updated: "2026-10-27",
  navLabel: "API keys and tokens",
  h1: "Redact an API Key Before You Share a Screenshot",
  title: "Redact an API Key",
  description:
    "Cover an API key or token in a screenshot before posting it. Detection finds common prefixed keys, and solid fill replaces the characters for good.",
  lede:
    "A leaked key is the rare screenshot that turns into an invoice. The characters are long and awkward, which is exactly why people crop one carelessly and publish a usable credential.",
  risk: {
    heading: "Why a key in an image is urgent in a way other fields are not",
    body: [
      "An API key is an authenticated capability. A name identifies a person; a key spends money, reads a database, or sends mail as you. Providers bill for the usage, and abuse often begins within minutes of a public post because automated scanners watch code hosts and social feeds for the prefixes.",
      "The shape makes cropping unreliable. A key like sk-proj-... runs 100 to 200 characters, and a screenshot usually shows it wrapped across two lines, partially scrolled, or truncated with an ellipsis by the interface. The part you can see is frequently the part that is still valid.",
      "There is a second leak nobody crops. Terminal screenshots show the export line or the config file path, and the value is reprinted inside a request header block lower in the log. Covering the first occurrence leaves the working credential on screen.",
    ],
  },
  fields: {
    heading: "What to cover on a page that shows a key",
    intro:
      "The key is the obvious target. The context around it tells an attacker which provider to try it against.",
    rows: [
      {
        label: "The full value, every line it wraps onto",
        detail:
          "A long key breaks across lines in a terminal or a settings panel. Cover the whole run, including the fragment after a visible line break.",
      },
      {
        label: "The prefix and the provider label",
        detail:
          "sk-live, AKIA, ghp_, AIza and a field caption such as 'OpenAI API key' all identify which service the value authenticates to.",
      },
      {
        label: "Account and project identifiers",
        detail:
          "Project IDs, account numbers, and key names are not secret on their own, but they narrow a probe from every account to one.",
      },
      {
        label: "Base URLs, hostnames, and endpoints",
        detail:
          "A private API host in the same panel tells an attacker where to send the credential and what version of the interface to target.",
      },
      {
        label: "Any second copy in the log",
        detail:
          "Request headers, retry output, and quoted history repeat the value. Scroll the full frame before exporting.",
      },
      {
        label: "Related secrets on the same screen",
        detail:
          "Webhook signing secrets, refresh tokens, and SMTP passwords usually sit within a few rows of an API key in a settings panel.",
      },
    ],
  },
  auto: {
    heading: "What the built-in detection will and will not find",
    intro:
      "Auto-detect reads the text in the image in your browser, then matches it against three well-known key shapes. It is a helper for the common cases, not an audit of your secrets.",
    detects: [
      "OpenAI-style keys: sk- followed by at least twenty letters or digits",
      "AWS access key IDs: AKIA followed by sixteen uppercase letters or digits",
      "Classic GitHub personal access tokens: ghp_ followed by thirty-six characters",
      "Each occurrence on the page, reported as a separate box",
    ],
    misses: [
      "Keys with prefixes the matcher does not know: gho_, ghs_, github_pat_, AIza, xoxb-, xoxp-, pq:, dnb:, and provider-specific formats added after this page was written.",
      "Generic bearer tokens, JWTs, session cookies, and high-entropy strings that carry no recognizable prefix.",
      "A value the recognition pass splits across a line break. The matcher needs the prefix and the body to read as one continuous string.",
      "Keys printed in a monospaced font at small size or low contrast, where an O reads as a 0 and the pattern no longer matches.",
      "Truncated display values such as sk-...9f3c, which are not the credential but still hint at the provider.",
    ],
  },
  steps: {
    heading: "Removing the key, step by step",
    intro:
      "Under a minute for one screenshot. If the key was already public, revoke it first — the screenshot is the smaller problem.",
    items: [
      {
        title: "Revoke before you publish, if it was already out",
        body: "Redaction cannot un-leak a key. Rotate the credential at the provider, then treat the screenshot as a document about a dead value rather than a live one.",
      },
      {
        title: "Load the screenshot",
        body: "Drop, paste with Ctrl/Cmd+V, or choose a file. It is decoded in the tab and never sent anywhere.",
      },
      {
        title: "Run auto-detect, then read its output sceptically",
        body: "A missing box means nothing at all — absence of a flag is not evidence of absence. Check every character run on the page yourself.",
      },
      {
        title: "Box the value with margin, on every line it occupies",
        body: "Drag past the first and last characters on all sides, and box each line of a wrapped key separately. Tight boxes leak the edge characters.",
      },
      {
        title: "Use solid black, never mosaic",
        body: "Pixelation averages pixels into blocks, and long character runs keep enough stroke information to be reconstructed at zoom. A fill replaces them.",
      },
      {
        title: "Export and inspect the PNG at 100 percent",
        body: "Open the downloaded file, not the editor. Check the edges of each box and the tail of the frame for a second occurrence.",
      },
    ],
  },
  detail: {
    heading: "Why a fill is the only defensible style here",
    body: [
      "A key is a high-entropy string with a known verifier. That combination is worse than an SSN: a degraded image that leaves a partial shape can be tested directly against the provider's API, so any candidate that resolves is confirmed rather than guessed. Anything that averages rather than overwrites leaves that door open.",
      "A solid fill replaces the pixels inside the box with a single color in the destination canvas. The characters are not encoded, compressed, or pushed into another channel — they are gone from the file, at every zoom level, permanently.",
      "The blur option on other tools is actively misleading for this field. A blur applied to a terminal font preserves the spacing rhythm and the stroke positions of every glyph, which is most of what distinguishes one character from another at that size.",
      "One practical note on the pixelate mode this tool offers: it paints an opaque base first and then a mosaic, so nothing shows through the fill. It still uses original pixels at reduced resolution, which is why the recommendation for a credential is the plain black fill.",
    ],
  },
  faq: [
    {
      question: "Is it safe to show only the first few characters?",
      answer:
        "For a support post it is common practice, and the prefix plus a tail is generally not enough to use a key. It still tells a scanner which provider to target, so cover the prefix too if the screenshot is going somewhere public.",
    },
    {
      question: "Auto-detect found nothing. Does that mean my key is covered?",
      answer:
        "No. Detection only knows three shapes. A missing box means the pattern did not match — check the image by hand and draw the boxes yourself.",
    },
    {
      question: "Should I still rotate a key I covered properly?",
      answer:
        "If the key was ever displayed on a screen that reached a third party, rotate it. Redaction protects the file you are publishing now; it does nothing about the copies that already exist.",
    },
    {
      question: "Does the tool upload or store the screenshot?",
      answer:
        "Neither. There is no upload path, no server processing, and no storage. Reloading the page discards the image, and there is no account to attach it to.",
    },
    {
      question: "Will the exported file keep the terminal's metadata?",
      answer:
        "The export is a new PNG encoded from a canvas. Container metadata from the source file does not survive the rebuild.",
    },
    {
      question: "Can I use this on a photo of a monitor?",
      answer:
        "Yes, though recognition drops sharply on a photograph because of moiré, angle, and contrast. Expect to place the boxes by hand and verify at full zoom.",
    },
  ],
  pillarLink: {
    before:
      "Settings panels and terminal captures rarely show one secret. You can",
    anchor: "redact image online",
    after:
      "with as many boxes as the frame needs, on a canvas that stays in the browser tab the whole time.",
  },
  related: [
    "redact-screenshot",
    "redact-ip-address",
    "redact-email-address",
  ],
};

export const IP_ADDRESS: Scenario = {
  slug: "redact-ip-address",
  published: "2026-10-27",
  updated: "2026-10-27",
  navLabel: "IP addresses",
  h1: "Remove an IP Address From a Screenshot",
  title: "Remove an IP Address",
  description:
    "Hide an IP address in a screenshot, log, or terminal capture. Detection matches dotted-quad IPv4, and solid fill replaces the digits in the export.",
  lede:
    "People hide the password line and leave the address that places them. An IP in a public post is a rough location, a network operator, and a target for scanning, all in four numbers.",
  risk: {
    heading: "What an address discloses that a username does not",
    body: [
      "A public IP resolves to an Internet service provider and a city, frequently to a neighborhood. Home connections sit in carrier-nat ranges where the address is tied to one subscriber with modest effort, which is why publishing it in a public thread is a different risk from publishing it in a private ticket.",
      "The address is also a scanning target. An exposed host with a management interface, an open file share, or a rate-limited API gets probed by automated systems within hours of appearing somewhere indexable.",
      "In the screenshots where this actually appears — a speed test, a server log, a router admin panel, a support forum reply — the IP usually shares the frame with a hostname, an account ID, or a session token. Each of those narrows the population from 'an address' to 'your address'.",
    ],
  },
  fields: {
    heading: "What to cover on a page that shows an address",
    intro:
      "Addresses come in more shapes than people expect, and the versions in headers and logs are the easy ones to miss.",
    rows: [
      {
        label: "The dotted-quad address itself",
        detail:
          "Both the public/WAN line and the local/LAN line (192.168.x.x, 10.x.x.x, 172.16–31.x.x). A private address alone is low risk, but it reveals network layout.",
      },
      {
        label: "IPv6 values",
        detail:
          "Long colon-separated addresses, often abbreviated with a double colon. They carry the same location exposure and are frequently left in the frame when only the IPv4 line is boxed.",
      },
      {
        label: "CIDR notation and subnets",
        detail:
          "A /24 or /64 suffix describes an entire range, not one host. Cover the prefix and the length.",
      },
      {
        label: "Log lines with an embedded client address",
        detail:
          "Server, proxy, and firewall logs repeat the source address per line. A single box over the first line leaves the rest readable.",
      },
      {
        label: "Hostnames and reverse DNS",
        detail:
          "A resolved name such as an ISP dynamic-pool hostname is as identifying as the number, and often sits directly beside it.",
      },
      {
        label: "Timestamps and geolocation panels",
        detail:
          "Speed-test and diagnostic tools print the city, coordinates, or a map next to the address. Covering only the number leaves the location visible.",
      },
    ],
  },
  auto: {
    heading: "What the built-in detection will and will not find",
    intro:
      "Auto-detect reads the text in the image in your browser and matches the dotted-quad shape, with a range check on each group of digits. It does not know IPv6 at all.",
    detects: [
      "Standard IPv4 quads such as 203.0.113.42 or 192.168.1.254, including ones inside a sentence",
      "Values followed by a port, such as 10.0.0.5:8080 — the address itself is flagged, so box the port too",
      "Several different addresses on one page, each as its own box",
      "Quads embedded in a log line where the digits sit at a comfortable size",
    ],
    misses: [
      "Every IPv6 address. The matcher looks only at dot-separated groups, so a colon-separated value is never reported.",
      "A version number that happens to have four parts, such as 1.2.3.4. The matcher cannot tell a release string from an address, so both get flagged — read each box rather than trusting the count.",
      "Addresses written with spaces, dashes, or a broken line instead of dots.",
      "Hostname-only disclosures, proxy-obfuscated values such as 'for 127.0.0.1 via', and MAC addresses.",
      "Small, low-contrast digits in a dense log where the recognition pass misreads a 1 as an l or drops a row entirely.",
    ],
  },
  steps: {
    heading: "Removing the address, step by step",
    intro:
      "Under a minute for one screenshot, with nothing stored between visits.",
    items: [
      {
        title: "Load the screenshot",
        body: "Drop it on the page, paste with Ctrl/Cmd+V, or choose a file. The image is decoded in the tab and never leaves it.",
      },
      {
        title: "Run auto-detect as a first pass",
        body: "It will usually catch the dotted-quad lines. It will catch none of the IPv6 values, so treat the reported count as a floor, not a total.",
      },
      {
        title: "Box the whole value plus any suffix",
        body: "Cover the digits, the trailing :port, and a /24 if present. A box that stops at the last octet leaves a subnet mask that identifies the range.",
      },
      {
        title: "Cover the location panel too",
        body: "Speed-test and diagnostic tools print a city, an ISP name, or coordinates beside the address. Cover those in the same pass or the number was not the point.",
      },
      {
        title: "Keep the fill on solid black",
        body: "Digits in a monospaced log font are exactly the small high-contrast shapes that survive a blur or a coarse mosaic. Use the fill.",
      },
      {
        title: "Export and re-check at 100 percent",
        body: "Open the downloaded PNG and read the frame top to bottom. Dense logs are where a second occurrence waits.",
      },
    ],
  },
  detail: {
    heading: "How much does hiding the number actually buy you",
    body: [
      "Honestly: it is containment, not immunity. A public address sits in server logs and CDN records across a normal session, so removing it from your screenshot does not make you unresolvable. What it removes is the public, indexed, easy-to-read disclosure — the version that a curious reader or a scanning script picks up from a forum post.",
      "The value of redaction is highest when the address is tied to something else in the same frame. A hostname plus a city plus an address in one image is a subscriber record; each of the three alone is a puzzle with many solutions. Covering the identifying fields together is the operation worth doing properly.",
      "For IPv6 in particular, note that a /64 embeds the interface identifier on many configurations, which means the address can encode a hardware MAC and stay stable across networks. If the frame contains one, cover it — and do not rely on detection to find it.",
      "A final practical note: if the address belongs to a service you administer and the screenshot is going to a public forum, consider whether a test range such as 203.0.113.0/24 documents the point better than a redaction of the real one.",
    ],
  },
  faq: [
    {
      question: "Is a 192.168.x.x address worth hiding?",
      answer:
        "It is not routable from the internet, so the direct risk is low. It does describe your internal layout, and it is worth covering when a hostname, a device name, or a network diagram shares the frame.",
    },
    {
      question: "Why did detection flag my software version 1.2.3.4?",
      answer:
        "The dotted-quad shape is identical. The matcher cannot distinguish the two from pixels alone, so it reports both and you decide. Delete the box that is not an address.",
    },
    {
      question: "Does it detect IPv6?",
      answer:
        "No. Only dot-separated IPv4 shapes are matched. Always box colon-separated addresses yourself.",
    },
    {
      question: "Does the export keep any metadata?",
      answer:
        "The file is a new PNG encoded from a canvas, so the source container's metadata does not survive the rebuild.",
    },
    {
      question: "Can I undo a box placed in the wrong spot?",
      answer:
        "Yes, with the undo button or Ctrl/Cmd+Z, and redo on Ctrl/Cmd+Shift+Z. Clear all removes every box at once. Nothing is written to disk until you download.",
    },
    {
      question: "Does this work on a phone?",
      answer:
        "Yes. Draw with a finger, and use the Draw/Scroll switch on touch screens so a tall log stays scrollable while you box individual lines.",
    },
  ],
  pillarLink: {
    before:
      "Logs and admin panels leak more than one identifier per screen, and every field on the frame is editable until you export. It is straightforward to",
    anchor: "redact image online",
    after:
      "with the address, the hostname, and the location panel covered in one pass.",
  },
  related: [
    "redact-api-key",
    "redact-screenshot",
    "redact-email-address",
  ],
};
