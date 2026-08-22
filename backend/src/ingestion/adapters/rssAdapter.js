// Converts an RSS/news item into the canonical raw-report shape.
// SHOULD-HAVE feature: used by rss.connector.js if enabled.
function rssAdapter({ title, contentSnippet, isoDate, link }) {
  const text = [title, contentSnippet].filter(Boolean).join(" — ");
  if (!text) {
    const err = new Error("RSS item has no usable text");
    err.status = 400;
    throw err;
  }

  return {
    sourceType: "rss",
    rawText: text,
    locationHint: null, // resolved later by the AI /location step from text alone
    submittedAt: isoDate ? new Date(isoDate).toISOString() : new Date().toISOString(),
    mediaRefs: link ? [link] : [],
  };
}

module.exports = { rssAdapter };
