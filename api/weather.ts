export const maxDuration = 10

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'OPENWEATHER_API_KEY is not configured.' }, { status: 503 })
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=28.6139&lon=77.2090&units=metric&appid=${apiKey}`
    )
    if (!response.ok) return Response.json({ error: 'Weather data is unavailable.' }, { status: response.status })
    return Response.json(await response.json(), { headers: { 'Cache-Control': 's-maxage=300' } })
  } catch (error) {
    console.error('Weather request failed:', error)
    return Response.json({ error: 'Weather data is unavailable.' }, { status: 502 })
  }
}
