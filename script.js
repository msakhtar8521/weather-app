async function getWeather() {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value.trim();

  if (!city) {
    document.getElementById("weatherResult").innerHTML =
      `<p style="color:#ffeb3b;">Please enter a city.</p>`;
    document.getElementById("forecastChart").style.display = "none";
    return;
  }

  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`; // free API, no key

  try {
    const response = await fetch(url);
    const data = await response.json();

    const weather = data.current_condition?.[0];
    if (!weather) throw new Error("No weather data found.");

    const description = (weather.weatherDesc?.[0]?.value || "").toLowerCase();

    // Pick an icon & background
    let icon = "🌍";
    let bgColor = "linear-gradient(to right, #6dd5fa, #2980b9)";
    if (description.includes("sunny") || description.includes("clear")) {
      icon = "☀️"; bgColor = "linear-gradient(to right, #f9d423, #ff4e50)";
    } else if (description.includes("cloud")) {
      icon = "☁️"; bgColor = "linear-gradient(to right, #757f9a, #d7dde8)";
    } else if (description.includes("rain")) {
      icon = "🌧️"; bgColor = "linear-gradient(to right, #00c6ff, #0072ff)";
    } else if (description.includes("snow")) {
      icon = "❄️"; bgColor = "linear-gradient(to right, #83a4d4, #b6fbff)";
    } else if (description.includes("thunder")) {
      icon = "⛈️"; bgColor = "linear-gradient(to right, #141e30, #243b55)";
    }
    document.body.style.background = bgColor;

    // Current weather block
    let output = `
      <h2>${icon} ${city}</h2>
      <p>🌡 Temperature: ${weather.temp_C}°C</p>
      <p>☁ Weather: ${weather.weatherDesc[0].value}</p>
      <p>💨 Wind Speed: ${weather.windspeedKmph} km/h</p>
      <h3 style="margin-top:20px;">📅 3-Day Forecast</h3>
      <div class="forecast">
    `;

    // Forecast arrays for chart
    const labels = [];
    const temps = [];

    // Forecast data (3 days)
    (data.weather || []).slice(0, 3).forEach((day, index) => {
      const avgTemp = Number(day.avgtempC);
      const desc = day.hourly?.[4]?.weatherDesc?.[0]?.value || "N/A";

      let dayIcon = "🌍";
      const d = desc.toLowerCase();
      if (d.includes("sunny") || d.includes("clear")) dayIcon = "☀️";
      else if (d.includes("cloud")) dayIcon = "☁️";
      else if (d.includes("rain")) dayIcon = "🌧️";
      else if (d.includes("snow")) dayIcon = "❄️";
      else if (d.includes("thunder")) dayIcon = "⛈️";

      labels.push(`Day ${index + 1}`);
      temps.push(avgTemp);

      output += `
        <div class="day-card">
          <h4>Day ${index + 1}</h4>
          <p>${dayIcon} ${desc}</p>
          <p>🌡 Avg Temp: ${avgTemp}°C</p>
        </div>
      `;
    });

    output += `</div>`;
    document.getElementById("weatherResult").innerHTML = output;

    // Draw Chart.js line chart
    const chartEl = document.getElementById("forecastChart");
    const ctx = chartEl.getContext("2d");
    chartEl.style.display = "block"; // show when data is ready

    if (window.myChart) window.myChart.destroy(); // remove previous chart

    window.myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Avg Temperature (°C)",
          data: temps,
          borderColor: "white",
          backgroundColor: "rgba(255,255,255,0.3)",
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "white" } } },
        scales: {
          x: { ticks: { color: "white" } },
          y: { ticks: { color: "white" } }
        }
      }
    });

  } catch (error) {
    document.getElementById("weatherResult").innerHTML =
      `<p style="color:red;">${error.message || "Something went wrong."}</p>`;
    document.getElementById("forecastChart").style.display = "none";
  }
}
