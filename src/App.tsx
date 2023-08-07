import React from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

class App extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = {
      location: "Nigeria",
      isLoading: false,
      displayLocation: "",
      weather: {},
    };
    this.fetchWeather = this.fetchWeather.bind(this);
  }

  async fetchWeather() {
    try {
      this.setState({ isLoading: true });
      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();
      console.log(geoData);

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);
      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.err(err);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  render(): React.ReactNode {
    return (
      <main className="bg-primary h-screen flex justify-center items-center">
        <div className=" border-double outline-2 outline outline-offset-8 border-black border-2 text-xl font-primary min-w-[75%] py-24 px-8 text-center flex flex-col gap-12">
          <h1 className="text-6xl">Classy Weather</h1>
          <div>
            <input
              onChange={(e) => this.setState({ location: e.target.value })}
              value={this.state.location}
              className="bg-primary__light px-8 py-4"
              type="text"
              placeholder="Search from location..."
            />
          </div>
          <button
            className="bg-primary__light inline-block w-fit mx-auto px-5 py-1 text-sm"
            onClick={this.fetchWeather}
          >
            Get Weather
          </button>
          {this.state.isLoading && "Loading"}
          {this.state.weather.weathercode && (
            <Weather
              weather={this.state.weather}
              location={this.state.displayLocation}
            />
          )}
        </div>
      </main>
    );
  }
}

export default App;

class Weather extends React.Component {
  render(): React.ReactNode {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = this.props.weather;
    return (
      <div>
        <h2 className="font-bold text-2xl mb-4">
          Weather for {this.props.location}
        </h2>
        <ul className="flex justify-center items-center gap-4">
          {dates.map((el: string, i: number) => (
            <Day
              key={el}
              max={max[i]}
              min={min[i]}
              date={el}
              code={codes[i]}
              isToday={i === 0}
            />
          ))}
        </ul>
      </div>
    );
  }
}

class Day extends React.Component {
  render(): React.ReactNode {
    const { max, min, date, code, isToday } = this.props;
    return (
      <li className="text-sm bg-primary__light px-5 py-8">
        <span className="text-3xl font-bold">{getWeatherIcon(code)}</span>
        <p>{isToday ? "Today" : formatDay(date)}</p>
        <p>
          {Math.floor(min)}&deg; &mdash; {Math.ceil(max)}&deg;
        </p>
      </li>
    );
  }
}

// echo "# classy-weather" >> README.md
// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/mister-abdurahman/classy-weather.git
// git push -u origin main
