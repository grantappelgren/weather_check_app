export const setPlaceholderText = () => {
  const input = document.getElementById("searchBar__text");
  input.placeholder = "City, Ctry (e.g., CN) / City, Zip";
};

export const addSpinner = (element) => {
  animateButton(element);
  setTimeout(animateButton, 1000, element);
};

const animateButton = (element) => {
  element.classList.toggle("none");
  element.nextElementSibling.classList.toggle("block");
  element.nextElementSibling.classList.toggle("none");
};

export const displayError = (headerMsg, srMsg) => {
  updateWeatherLocationHeader(headerMsg);
  updateScreenReaderConfirmation(srMsg);
};

export const displayApiError = (statusCode) => {
  const properMsg = toProperCase(statusCode.message);
  updateWeatherLocationHeader(properMsg);
  updateScreenReaderConfirmation(`${properMsg}. Please try again.`);
};

const toProperCase = (text) => {
  const words = text.split(" ");
  const properWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  return properWords.join(" ");
};

const updateWeatherLocationHeader = (message) => {
  const h1 = document.getElementById("currentForecast__location");
  if (message.indexOf("Lat:") !== -1 && message.indexOf("Long:") !== -1) {
    const msgArray = message.split(" ");
    const mapArray = msgArray.map((msg) => {
      return msg.replace(":", ": ");
    });
    const lat =
      mapArray[0].indexOf("-") === -1
        ? mapArray[0].slice(0, 10)
        : mapArray[0].slice(0, 11);
    const lon =
      mapArray[1].indexOf("-") === -1
        ? mapArray[1].slice(0, 11)
        : mapArray[1].slice(0, 12);
    h1.textContent = `${lat} • ${lon} `;
  } else {
    h1.textContent = message;
  }
};

export const updateScreenReaderConfirmation = (message) => {
  document.getElementById("confirmation").textContent = message;
};

export const updateDisplay = (weatherJson, locationObj) => {
  fadeDisplay();
  clearDisplay();
  const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
  setBGImage(weatherClass);
  const screenReaderWeather = buildScreenReaderWeather(
    weatherJson,
    locationObj
  );
  updateScreenReaderConfirmation(screenReaderWeather);
  updateWeatherLocationHeader(locationObj.getName());
  // current conditions
  const ccArray = createCurrentConditionsDivs(
    weatherJson,
    locationObj.getUnit()
  );
  displayCurrentConditions(ccArray);
  displaySixDayForecast(weatherJson);
  setFocusOnSearch();
  fadeDisplay();
};

const fadeDisplay = () => {
  const cc = document.getElementById("currentForecast");
  cc.classList.toggle("zero-vis");
  cc.classList.toggle("fade-in");
  const sixDay = document.getElementById("dailyForecast");
  sixDay.classList.toggle("zero-vis");
  sixDay.classList.toggle("fade-in");
};

const clearDisplay = () => {
  const currentConditions = document.getElementById(
    "currentForecast__conditions"
  );
  deleteContents(currentConditions);
  const sixDayForecast = document.getElementById("dailyForecast__contents");
  deleteContents(sixDayForecast);
};

const deleteContents = (parentElement) => {
  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
};

const getWeatherClass = (icon) => {
  const firstThreeChars = icon.slice(0, 3);
  const weatherLookup = {
    "01d": "clearSkyDay",
    "01n": "clearSkyNight",
    "02d": "fewCloudsDay",
    "02n": "fewCloudsNight",
    "03d": "cloudsDay",
    "03n": "cloudsNight",
    "04d": "cloudsDay",
    "04n": "cloudsNight",
    "09d": "showerRainDay",
    "09n": "showerRainNight",
    "10d": "rainDay",
    "10n": "rainNight",
    "11d": "thunderstormDay",
    "11n": "thunderstormNight",
    "13d": "snowDay",
    "13n": "snowNight",
    "50d": "fogDay",
    "50n": "fogNight",
  };
  let weatherClass;
  weatherClass = weatherLookup[firstThreeChars];
  return weatherClass;
};

const setBGImage = (weatherClass) => {
  document.documentElement.classList.add(weatherClass);
  document.documentElement.classList.forEach((img) => {
    if (img !== weatherClass) document.documentElement.classList.remove(img);
  });
};

const buildScreenReaderWeather = (weatherJson, locationObj) => {
  const location = locationObj.getName();
  const unit = locationObj.getUnit();
  const tempUnit = unit === "imperial" ? "F" : "C";
  return `${weatherJson.current.weather[0].description} and ${Math.round(
    Number(weatherJson.current.temp)
  )}°${tempUnit} in ${location}`;
};

const setFocusOnSearch = () => {
  document.getElementById("searchBar__text").focus();
};

const createCurrentConditionsDivs = (weatherObj, unit) => {
  const windUnit = unit === "imperial" ? "mph" : "m/s";
  const icon = createMainImgDiv(
    weatherObj.current.weather[0].icon,
    weatherObj.current.weather[0].description
  );
  const properDesc = toProperCase(weatherObj.current.weather[0].description);
  const desc = createElem("div", "desc", properDesc);
  const temp = createElem(
    "div",
    "temp",
    `${Math.round(Number(weatherObj.current.temp))}°`
  );
  const maxTemp = createElem(
    "div",
    "maxTemp",
    `H: ${Math.round(Number(weatherObj.daily[0].temp.max))}°`
  );
  const minTemp = createElem(
    "div",
    "minTemp",
    `L: ${Math.round(Number(weatherObj.daily[0].temp.min))}°`
  );
  const feels = createElem(
    "div",
    "feels",
    `Feels Like: ${Math.round(Number(weatherObj.current.feels_like))}°`
  );
  const wind = createElem(
    "div",
    "wind",
    `Wind: ${Math.round(Number(weatherObj.current.wind_speed))}${windUnit}`
  );
  const humidity = createElem(
    "div",
    "humidity",
    `Humidity: ${weatherObj.current.humidity}%`
  );
  return [icon, desc, temp, maxTemp, minTemp, feels, wind, humidity];
};

const createMainImgDiv = (icon, altText) => {
  const iconDiv = createElem("div", "icon");
  iconDiv.id = "icon";
  const myIcon = translateIconToMyIcon(icon);
  myIcon.ariaHidden = true;
  myIcon.title = altText;
  iconDiv.appendChild(myIcon);
  return iconDiv;
};

const createElem = (elemType, divClassName, divText, unit) => {
  const div = document.createElement(elemType);
  div.className = divClassName;
  if (divText) {
    div.textContent = divText;
  }
  if (divClassName === "temp") {
    const unitDiv = document.createElement("div");
    unitDiv.classList.add("unit");
    unitDiv.textContent = unit;
    div.appendChild(unitDiv);
  }
  return div;
};

const translateIconToMyIcon = (icon) => {
  const img = document.createElement("img");
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(2);
  switch (firstTwoChars) {
    case "01":
      if (lastChar === "d") {
        img.src = "img/clearskyday.png";
      } else {
        img.src = "img/clearskynight.png";
      }
      break;
    case "02":
      if (lastChar === "d") {
        img.src = "img/fewcloudsday.png";
      } else {
        img.src = "img/fewcloudsnight.png";
      }
      break;
    case "03":
      img.src = "img/clouds.png";
      break;
    case "04":
      img.src = "img/clouds.png";
      break;
    case "09":
      if (lastChar === "d") {
        img.src = "img/showerrainday.png";
      } else {
        img.src = "img/showerrainnight.png";
      }
      break;
    case "10":
      if (lastChar === "d") {
        img.src = "img/rainday.png";
      } else {
        img.src = "img/rainnight.png";
      }
      break;
    case "11":
      img.src = "img/thunderstorm.png";
    case "13":
      img.src = "img/snow.png";
      break;
    case "50":
      img.src = "img/fog.png";
      break;
  }
  return img;
};

const displayCurrentConditions = (currentConditionsArray) => {
  const ccContainer = document.getElementById("currentForecast__conditions");
  currentConditionsArray.forEach((cc) => {
    ccContainer.appendChild(cc);
  });
};

const displaySixDayForecast = (weatherJson) => {
  for (let i = 1; i <= 6; i++) {
    const dfArray = createDailyForecastDivs(weatherJson.daily[i]);
    displayDailyForecast(dfArray);
  }
};

const createDailyForecastDivs = (dayWeather) => {
  const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
  const dayAbbreviation = createElem(
    "p",
    "dayAbbreviation",
    dayAbbreviationText
  );
  const dayIcon = createDailyForecastIcon(
    dayWeather.weather[0].icon,
    dayWeather.weather[0].description
  );
  const dayHigh = createElem(
    "p",
    "dayHigh",
    `${Math.round(Number(dayWeather.temp.max))}°`
  );
  const dayLow = createElem(
    "p",
    "dayLow",
    `${Math.round(Number(dayWeather.temp.min))}°`
  );
  return [dayAbbreviation, dayIcon, dayHigh, dayLow];
};

const getDayAbbreviation = (data) => {
  const dateObj = new Date(data * 1000);
  const utcString = dateObj.toUTCString();
  return utcString.slice(0, 3).toUpperCase();
};

const createDailyForecastIcon = (icon, altText) => {
  const img = document.createElement("img");
  if (window.innerWidth < 768 || window.innerHeight < 1025) {
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    switch (firstTwoChars) {
      case "01":
        if (lastChar === "d") {
          img.src = "img/clearskyday.png";
        } else {
          img.src = "img/clearskynight.png";
        }
        break;
      case "02":
        if (lastChar === "d") {
          img.src = "img/fewcloudsday.png";
        } else {
          img.src = "img/fewcloudsnight.png";
        }
        break;
      case "03":
        img.src = "img/clouds.png";
        break;
      case "04":
        img.src = "img/clouds.png";
        break;
      case "09":
        if (lastChar === "d") {
          img.src = "img/showerrainday.png";
        } else {
          img.src = "img/showerrainnight.png";
        }
        break;
      case "10":
        if (lastChar === "d") {
          img.src = "img/rainday.png";
        } else {
          img.src = "img/rainnight.png";
        }
        break;
      case "11":
        img.src = "img/thunderstorm.png";
      case "13":
        img.src = "img/snow.png";
        break;
      case "50":
        img.src = "img/fog.png";
        break;
    }
    img.alt = altText;
    return img;
  }
};

const displayDailyForecast = (dfArray) => {
  const dayDiv = createElem("div", "forecastDay");
  dfArray.forEach((el) => {
    dayDiv.appendChild(el);
  });
  const dailyForecastContainer = document.getElementById(
    "dailyForecast__contents"
  );
  dailyForecastContainer.appendChild(dayDiv);
};
