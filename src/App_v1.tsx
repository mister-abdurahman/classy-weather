import React from "react";

function getWeatherIcon(wmoCode: number) {
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
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

class App_v1 extends React.Component {
  // illustration of a class field for our state
  state = {
    location: "",
    isLoading: false,
    displayLocation: "",
    weather: {},
  };

  // we're using arrow fn cos of their relationship with the this keyword.
  updateInput = (location: string) => {
    this.setState({ location });
  };

  // async fetchWeather() {
  fetchWeather = async () => {
    try {
      if (this.state.location.length < 2) return this.setState({ weather: {} }); //cos the api can only get result from 2 characters
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
  };

  // different but similar to useEffect on an empty [].
  componentDidMount(): void {
    // this.fetchWeather();
    this.setState({ location: localStorage.getItem("location") || "" });
    if (this.state.location.length > 2) this.fetchWeather();
  }
  // different but useEffect with dependencies
  componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>): void {
    if (this.state.location !== prevState.location) this.fetchWeather();

    localStorage.setItem("location", this.state.location);
  }
  render(): React.ReactNode {
    return (
      <main className="bg-primary h-screen flex justify-center items-center">
        <div className=" border-double outline-2 outline outline-offset-8 border-black border-2 text-xl font-primary md:max-w-[85%] max-w-[70%] md:py-24 py-12 md:px-8 px-2 text-center flex flex-col md:gap-12 gap-8">
          <h1 className="md:text-6xl text-2xl">Classy Weather</h1>
          <div>
            <Input location={this.state.location} onUpdate={this.updateInput} />
          </div>
          {/* <button
            className="bg-primary__light inline-block w-fit mx-auto px-5 py-1 text-sm"
            onClick={this.fetchWeather}
          >
            Get Weather
          </button> */}
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

export default App_v1;

class Input extends React.Component {
  render(): React.ReactNode {
    const { location, onUpdate } = this.props;
    return (
      <input
        onChange={(e) => onUpdate(e.target.value)}
        value={location}
        className="bg-primary__light md:px-8 px-4 md:py-4 py-2 w-full lg:w-auto md:text-base text-sm"
        type="text"
        placeholder="Search from location..."
      />
    );
  }
}

class Weather extends React.Component {
  componentWillUnmount(): void {
    console.log("runs when component is unmounted");
  }
  render(): React.ReactNode {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = this.props.weather;
    return (
      <div>
        <h2 className="font-bold md:text-2xl text-sm mb-4 md-2">
          Weather for {this.props.location}
        </h2>
        <ul className="md:flex md:flex-row grid grid-cols-2 justify-center items-center lg:gap-4 gap-2">
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
      <li className="md:text-sm text-xs bg-primary__light lg:px-5 md:px-3 px-1 lg:py-8 md:py-4 py-2">
        <span className="md:text-3xl text-xs font-bold">
          {getWeatherIcon(code)}
        </span>
        <p>{isToday ? "Today" : formatDay(date)}</p>
        <p>
          {Math.floor(min)}&deg; &mdash; {Math.ceil(max)}&deg;
        </p>
      </li>
    );
  }
}
