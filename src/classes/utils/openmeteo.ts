import { fetchWeatherApi } from 'openmeteo';
import dotenv from "dotenv";
dotenv.config();

interface SunHoursResult {
  sunrise: Date[];
  sunset: Date[];
  welcomeType: number;
}

export class openmeteo{
    private latitude: number;
    private longitude: number;

    constructor(latitude: number, longitude: number){
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public async getSunHours(): Promise<SunHoursResult>{
        const today = new Date().toLocaleDateString("en-CA", { timeZone: process.env.TIMEZONE });
        const formatter = new Intl.DateTimeFormat("en-CA", {timeZone: process.env.TIMEZONE, dateStyle: "short", timeStyle: "medium", hour12: false}).format(new Date());
        const now = new Date(formatter);

        const params = {
            "latitude": this.latitude,
            "longitude": this.longitude,
            "daily": ["daylight_duration", "sunrise", "sunset"],
            "hourly": "temperature_2m",
            "timezone": "auto",
            "start_date": today,
            "end_date": today,
        };
        const url = `${process.env.URLOPENMETEO}`;
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];
    
        const utcOffsetSeconds = response.utcOffsetSeconds();
    
        const daily = response.daily()!;
    
        const sunrise = daily.variables(1)!;
        const sunset = daily.variables(2)!;
        
        const weatherData = {
            daily: {
            sunrise: [...Array(sunrise.valuesInt64Length())].map(
                (_, i) => new Date((Number(sunrise.valuesInt64(i)) + utcOffsetSeconds) * 1000)
            ),
            sunset: [...Array(sunset.valuesInt64Length())].map(
                (_, i) => new Date((Number(sunset.valuesInt64(i)) + utcOffsetSeconds) * 1000)
            ),
            },
        };

        const tNow = now.getTime();
        const tSunrise = weatherData.daily.sunrise[0].getTime();
        const tSunset = weatherData.daily.sunset[0].getTime();

        const noon = new Date(now);
        noon.setHours(12, 0, 0, 0);
        const tNoon = noon.getTime();

        const welcomeType: 1 | 2 | 3 =
        tNow >= tSunrise && tNow < tNoon
        ? 1
        : tNow >= tNoon && tNow < tSunset
        ? 2
        : 3;

        const result = {
        ...weatherData.daily,
        welcomeType,
        };
    
        return result;
    }
}