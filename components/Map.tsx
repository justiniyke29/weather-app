"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { Icon } from "leaflet";
import axios from "axios";

delete (Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

type weatherDataProps = {
  base: string;
  clouds: {
    all: number;
  };
  coord: {
    lon: number;
    lat: number;
  };
  main: {
    feels_like: number;
    humidity: number;
    pressure: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  name: string;
  sys: {
    country: string;
    id: number;
    sunrise: number;
    sunset: number;
    type: number;
  };
  timezone: number;
  visibility: number;
  weather: {
    description: string;
    icon: string;
    main: string;
    id: string;
  }[];
  wind: {
    deg: number;
    speed: number;
  };
};
type clickedLocationProps = {
  lat: number;
  lng: number;
};
const Map = () => {
  const [weatherData, setWeatherData] = useState<weatherDataProps | null>(null);
  const [favourites, setFavourites] = useState<weatherDataProps[]>([]);
  const [clickedLocation, setClickedLocation] =
    useState<clickedLocationProps | null>(null);
  const key = process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY;
  const defaultLocation = [9.0765, 7.3986];
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${clickedLocation?.lat}&lon=${clickedLocation?.lng}&appid=${key}&units=metric`
        );
        setWeatherData(response.data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    if (clickedLocation) {
      fetchData();
    }
  }, [clickedLocation, key, setWeatherData]);
  useEffect(() => {
    const fav = localStorage.getItem("favorite-data");
    const favArray = fav && JSON.parse(fav);
    if (Array.isArray(favArray)) {
      setFavourites(favArray);
    }
  }, []);
  function LocationMarker() {
    const [position, setPosition] = useState(null);
    const map = useMapEvents({
      click(e: any) {
        setPosition(e.latlng);
        setClickedLocation(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      },
    });
    return position === null ? null : (
      <Marker position={position}>
        <Popup>You are here</Popup>
      </Marker>
    );
  }
  const handleSaveFavourites = () => {
    if (weatherData) {
      favourites.push(weatherData);
      localStorage.setItem("favorite-data", JSON.stringify(favourites));
    }
  };
  const clearFavourites = () => {
    localStorage.removeItem("favorite-data");
  };
  return (
    <div>
      <div className="mt-10">
        <button
          className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-3xl"
          onClick={clearFavourites}
        >
          Remove from favourites
        </button>
      </div>
      <MapContainer
        // @ts-ignore
        center={defaultLocation}
        zoom={8}
        className=" my-10 h-[250px] w-[380px] content-center items-center rounded-2xl md:h-[500px] lg:h-[750px] md:w-[730px] lg:w-[1000px] xl:w-[1300px]"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {clickedLocation && (
          <Marker position={clickedLocation}>
            <Popup>
              {weatherData && (
                <div>
                  <h3>Weather Information for {weatherData?.name}</h3>
                  <p>Temperature: {weatherData?.main?.temp}°C</p>
                  <p>Description: {weatherData?.weather?.[0]?.description}</p>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleSaveFavourites}
                  >
                    Save as favourites
                  </button>
                </div>
              )}
            </Popup>
          </Marker>
        )}
        {favourites.map((res) => (
          <Marker key={res.coord.lon} position={res.coord}>
            <Popup>
              <div>
                <h3>Weather Information for {res?.name}</h3>
                <p>Temperature: {res?.main?.temp}°C</p>
                <p>Description: {res?.weather?.[0]?.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default Map;
