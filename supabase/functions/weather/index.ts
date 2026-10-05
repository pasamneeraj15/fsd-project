const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const location = url.searchParams.get("location");

    const apiKey = Deno.env.get("OPENWEATHER_API_KEY");

    if (!apiKey) {
      // Return demo data when no API key is configured
      const demoData = {
        current: {
          temp: 28,
          condition: "Partly Cloudy",
          humidity: 65,
          wind_speed: 12,
          rain_chance: 20,
          uv_index: 6,
          location: location || "Demo Location",
          is_demo: true,
        },
        forecast: [
          { day: "Mon", temp_max: 30, temp_min: 22, condition: "Sunny", icon: "sun" },
          { day: "Tue", temp_max: 31, temp_min: 23, condition: "Partly Cloudy", icon: "cloud-sun" },
          { day: "Wed", temp_max: 29, temp_min: 21, condition: "Light Rain", icon: "cloud-rain" },
          { day: "Thu", temp_max: 28, temp_min: 20, condition: "Rain", icon: "cloud-rain" },
          { day: "Fri", temp_max: 30, temp_min: 22, condition: "Sunny", icon: "sun" },
        ],
        advisory: "Moderate temperatures expected. Light rain mid-week — consider adjusting irrigation schedules accordingly.",
        is_demo: true,
      };
      return new Response(JSON.stringify(demoData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let latVal = lat;
    let lonVal = lon;

    // If no coordinates but location text provided, geocode first
    if (!latVal || !lonVal) {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location || "")}&limit=1&appid=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        latVal = String(geoData[0].lat);
        lonVal = String(geoData[0].lon);
      } else {
        return new Response(JSON.stringify({ error: "Location not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latVal}&lon=${lonVal}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latVal}&lon=${lonVal}&units=metric&appid=${apiKey}`;

    const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    if (currentData.cod !== 200) {
      return new Response(JSON.stringify({ error: currentData.message || "Weather data unavailable" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process 5-day forecast (take one reading per day at noon)
    const dailyMap = new Map();
    for (const item of forecastData.list || []) {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
          temp_max: Math.round(item.main.temp_max),
          temp_min: Math.round(item.main.temp_min),
          condition: item.weather[0].main,
          icon: item.weather[0].main.toLowerCase(),
        });
      } else {
        const existing = dailyMap.get(date);
        existing.temp_max = Math.max(existing.temp_max, Math.round(item.main.temp_max));
        existing.temp_min = Math.min(existing.temp_min, Math.round(item.main.temp_min));
      }
    }
    const forecast = Array.from(dailyMap.values()).slice(0, 5);

    const current = {
      temp: Math.round(currentData.main.temp),
      condition: currentData.weather[0].main,
      humidity: currentData.main.humidity,
      wind_speed: Math.round(currentData.wind.speed * 3.6),
      rain_chance: currentData.rain ? Math.round(currentData.rain["1h"] * 100) : 10,
      uv_index: 6,
      location: currentData.name,
      is_demo: false,
    };

    const advisory = `Current conditions in ${currentData.name}: ${currentData.weather[0].main} at ${current.temp}°C. ${
      current.humidity > 70
        ? "High humidity — watch for fungal diseases."
        : current.humidity < 40
        ? "Low humidity — increase irrigation frequency."
        : "Humidity levels are normal for most crops."
    } Wind speed: ${current.wind_speed} km/h.`;

    return new Response(JSON.stringify({ current, forecast, advisory, is_demo: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
