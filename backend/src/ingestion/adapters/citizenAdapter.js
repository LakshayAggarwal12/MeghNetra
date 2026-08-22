// Converts a citizen HTTP submission into the canonical raw-report shape.
function citizenAdapter(body) {
  const { text, locationHint, mediaRefs } = body;

  if (!text || typeof text !== "string" || text.trim().length < 5) {
    const err = new Error("Report text is required and must be at least 5 characters");
    err.status = 400;
    throw err;
  }

  return {
    sourceType: "citizen",
    rawText: text.trim(),
    locationHint: locationHint ? String(locationHint).trim() : null,
    submittedAt: new Date().toISOString(),
    mediaRefs: Array.isArray(mediaRefs) ? mediaRefs : [],
  };
}

module.exports = { citizenAdapter };
