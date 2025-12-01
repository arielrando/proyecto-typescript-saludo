import { fetchWeatherApi } from 'openmeteo';
import dotenv from "dotenv";
import { Response } from "express";
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

    private saveTime(Time:Number,flag:Number,res: Response):Boolean{
        const body = `{"nextSunTime":${Time},"welcomeType":${flag}}`;
        res.cookie("nextSunTime", body, {
            maxAge: 1000 * 60 * 60 * 24, // 1 día
            httpOnly: true, // no accesible por JS del cliente
        });
        return true;
    }

    public async getSunHours(res: Response): Promise<SunHoursResult>{
        const today = new Date().toLocaleDateString("en-CA", { timeZone: process.env.TIMEZONE });
        const formatter = new Intl.DateTimeFormat("en-CA", {timeZone: process.env.TIMEZONE, dateStyle: "short", timeStyle: "medium", hour12: false}).format(new Date());
        const now = new Date(formatter);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toLocaleDateString("en-CA", { timeZone: process.env.TIMEZONE });

        const params = {
            "latitude": this.latitude,
            "longitude": this.longitude,
            "daily": ["daylight_duration", "sunrise", "sunset"],
            "hourly": "temperature_2m",
            "timezone": "auto",
            "start_date": today,
            "end_date": tomorrowStr,
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
        const tSunriseTomorrow = weatherData.daily.sunrise[1].getTime();

        const noon = new Date(now);
        noon.setHours(12, 0, 0, 0);
        const tNoon = noon.getTime();

        const welcomeType: 1 | 2 | 3 =
        tNow >= tSunrise && tNow < tNoon
        ? 1
        : tNow >= tNoon && tNow < tSunset
        ? 2
        : 3;

        switch (welcomeType) {
            case 1:
                this.saveTime(tNoon,1,res);
                break;
            case 2:
                this.saveTime(tSunset,2,res);
                break;
            case 3:
                if(tNow<tSunrise){
                    this.saveTime(tSunrise, 3, res);
                }else{
                    this.saveTime(tSunriseTomorrow, 3, res);
                }
                break;
        }

        const result = {
        ...weatherData.daily,
        welcomeType,
        };
    
        return result;
    }
}