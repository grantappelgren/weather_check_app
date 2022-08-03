const WEATHER_API_KEY = "66bdbe0cdc1f842d961849f652c4d3c0";

// coordsObj is received from geolocation of the browser
// locationObj is what we created with CurrentLocation class in CurrentLocation.js
export const setLocationObject = (locationObj, coordsObj) => {
  const { lat, lon, name, unit } = coordsObj;
  locationObj.setLat(lat);
  locationObj.setLon(lon);
  locationObj.setName(name);
  if (unit) {
    locationObj.setUnit(unit);
  }
};

export const getHomeLocation = () => {
  return localStorage.getItem("defaultWeatherLocation");
};

// Used to obtain weather data via API from coordinates
export const getWeatherFromCoords = async (locationObj) => {
  const lat = locationObj.getLat();
  const lon = locationObj.getLon();
  const units = locationObj.getUnit();
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;
  try {
    // No need to encode this url because there is no direct user input that might have included spaces
    const weatherStream = await fetch(url);
    const weatherJson = await weatherStream.json();
    return weatherJson;
  } catch (err) {
    console.log(err);
  }
};

// Used to obtain coordinates via API from text entries into search bar
export const getCoordsFromApi = async (entryText, units) => {
  const regex = /^\d+$/g; // Looks for entries that start and end with numbers
  const flag = regex.test(entryText) ? "zip" : "q"; // If entries start and end with number, flag is zip, otherwise, q for query
  const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${WEATHER_API_KEY}`;
  const encodedUrl = encodeURI(url); // changes spaces to special characters that work in a URL
  try {
    const dataStream = await fetch(encodedUrl);
    const jsonData = await dataStream.json();
    return jsonData;
  } catch (err) {
    console.error(err.stack);
  }
};

export const cleanText = (text) => {
  const regex = / {2,}/g;
  const entryText = text.replaceAll(regex, " ").trim();
  return entryText;
};
