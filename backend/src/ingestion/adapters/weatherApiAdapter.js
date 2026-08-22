// Converts a weather-API condition reading into the canonical raw-report shape.
// In this prototype the "weather API" is simulated (see weatherApi.connector.js)
// to keep the live demo reliable and free of external rate limits, but the
// adapter contract is identical to what a real OpenWeatherMap/IMD payload
// would go through.
function weatherApiAdapter({ city, description, windSpeedKmh, rainfallMm }) {
  if (!city || !description) {
    const err = new Error("Weather API payload missing city or description");
    err.status = 400;
    throw err;
  }

  return {
    sourceType: "weather_api",
    rawText: description,
    locationHint: city,
    submittedAt: new Date().toISOString(),
    mediaRefs: [],
    numericSignals: { windSpeedKmh: windSpeedKmh ?? null, rainfallMm: rainfallMm ?? null },
  };
}

module.exports = { weatherApiAdapter };
