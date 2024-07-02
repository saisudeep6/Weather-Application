import React, { useState, useEffect,useRef } from "react";
import "../assets/styles/landing.css";
import axios from "axios";
import song from '../assets/songs/Blank Space.mp3'
import Clock from '../components/Clock/Clock'; 
import WeatherMap from '../components/Weather/WeatherMap';

const navigation = [
  { name: "Product", href: "#" },
  { name: "Features", href: "#" },
  { name: "Marketplace", href: "#" },
  { name: "Company", href: "#" },
];

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fileName, setFileName] = useState('');
  const audioPlayer = useRef(null);
  const songName = song.split('/').pop(); 
  const songName1 = songName.split('/').pop(); 
  useEffect(() => {
    const audio = audioPlayer.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setFileName(audio.src.split('/').pop()); // Extract file name from the src
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioPlayer.current.pause();
    } else {
      audioPlayer.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTimeSeek = (e) => {
    const { duration } = audioPlayer.current;
    const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * duration;
    audioPlayer.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const images = [
    "https://gifdb.com/images/high/wind-blowing-anime-scenery-63neqilegctf3gjt.gif",
    "https://i.pinimg.com/originals/ef/d8/46/efd8467c907bb0b7d84e4cd27f4cddaa.gif",
    "https://i.pinimg.com/originals/41/5f/96/415f96ea6ff06777e47b13d044d9da06.gif",
    "https://gifdb.com/images/high/foggy-mountains-anime-scenery-k3395hj770emibhb.gif",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric"); 
  const [location, setLocation] = useState(null);

  const API_KEY = "5de63f8347f04fbc52201cf335859947";
  const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
  const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
  useEffect(() => {
    const fetchLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            if (!response.ok) {
              throw new Error('Failed to fetch location');
            }
            const data = await response.json();
            let locality = data.address?.county || data.address?.city || data.address?.state || data.address?.neighbourhood || 'Unknown';
            locality = locality.replace(/\bmandal\b/gi, '').trim();
            setLocation(locality);
            fetchData(locality)
            setCity(locality)
          } catch (error) {
            setError('Failed to fetch location');
          }
        },
        (error) => {
          setError(error.message);
        }
      );
    };

    fetchLocation();
  }, []);


  
  useEffect(() => {
    if (city.trim() === "") return;
  }, [city]);

  const fetchData = async (cityValue) => {
    setLoading(true);
    try {
      const currentWeatherResponse = await axios.get(BASE_URL, {
        params: {
          q: cityValue,
          appid: API_KEY,
          units: "metric", 
        },
      });
      setWeatherData(currentWeatherResponse.data);
  
      const forecastResponse = await axios.get(FORECAST_URL, {
        params: {
          q: cityValue,
          appid: API_KEY,
          units: "metric",
          cnt: 5, 
        },
      });
      setForecastData(parseForecastData(forecastResponse.data.list));
      setError("");
    } catch (error) {
      setError("Could not fetch weather data. Please try again.");
    }
    setLoading(false);
  };
  

  const parseForecastData = (forecastList) => {
    return forecastList.map((item) => ({
      time: item.dt_txt.split(" ")[1],
      main: item.weather[0].main,
      icon: item.weather[0].icon,
      temp: Math.round(item.main.temp),
    }));
  };

  const handleInputChange = (event) => {
    setCity(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (city.trim() === "") return;
    fetchData(city);
    setWeatherData(null); 
    setForecastData([]); 
  };

  

  return (
    <div className="bg-[#090d14] text-white h-[auto]">
               {error && 
      <div className="fixed top-0 end-0 z-[60] sm:max-w-xl w-full mx-auto p-6">
        <div className="p-4  bg-[#353a40] rounded-xl shadow-sm">
          <div className="grid sm:flex sm:items-center gap-y-3 sm:gap-y-0 sm:gap-x-5">
              <h2 className="text-gray-500">
                <span className="font-semibold text-white font-bold"><span className="text-[red] ">Error: </span>{error}</span>
              </h2>
          </div>
        </div>
      </div>
      }
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          className="flex justify-center p-6 pb-0 lg:px-8"
          aria-label="Global"
        >


          <form onSubmit={handleSubmit} className="">
            <div className="input-wrapper">
              <button
                className="icon Explore-Button relative z-[999]"
                type="submit"
                onClick={handleSubmit}
              >
                <span className="IconContainer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 156 78"
                    className="telescope"
                  >
                    <path
                      fill="url(#paint0_linear_131_19)"
                      d="M10.3968 78C10.6002 78 32 72.831 32 72.831C29.5031 68.7434 27.3945 63.5193 26.0258 57.947C24.6386 52.3381 24.0837 46.7841 24.3982 42L3.38683 47.0957C0.0205717 47.9206 -1.0152 55.4725 1.09333 63.9959C3.05409 72.0061 7.10469 78 10.3968 78Z"
                    ></path>
                    <path
                      fill="url(#paint1_linear_131_19)"
                      d="M63.0824 25L34.8099 32.0351C33.7675 32.2957 32.8714 33.0215 32.1582 34.1382C31.6096 34.9943 31.1524 36.0738 30.8049 37.3393C30.5489 38.2513 30.366 39.2563 30.238 40.3544C29.6894 44.7839 30.0734 50.5348 31.5547 56.6207C33.0177 62.7067 35.2854 67.9925 37.7725 71.6587C38.3942 72.5707 39.016 73.371 39.6561 74.0596C40.5339 75.0274 41.43 75.7718 42.3078 76.2743C43.1307 76.7396 43.9536 77 44.74 77C45.0326 77 45.3252 76.9628 45.5995 76.8883L72.5919 70.1698L74 69.8164C69.867 64.1027 66.6484 56.1184 64.7282 48.1527C62.7532 39.9451 62.1497 31.8306 63.0094 25.3166C63.0458 25.2233 63.0643 25.1117 63.0824 25Z"
                    ></path>
                    <path
                      fill="url(#paint2_linear_131_19)"
                      d="M155.865 50.9153L144.361 3.54791C143.844 1.43031 141.964 0 139.88 0C139.512 0 139.143 0.0371509 138.774 0.130028L75.0921 15.8448C74.3361 16.0306 73.654 16.4021 73.0271 16.9594C72.1239 17.7581 71.3493 18.9284 70.7411 20.3958C70.3537 21.3246 70.0403 22.3648 69.7823 23.4979C68.4731 29.2935 68.7683 37.7267 70.9621 46.7544C73.2115 55.9863 76.9358 63.7509 80.8447 68.2277C81.6375 69.1194 82.4303 69.8995 83.2229 70.5125C83.4259 70.6795 83.6654 70.8283 83.9051 70.9581C85.6752 71.9798 87.7955 72.2584 89.7865 71.7571L152.492 56.5065C154.962 55.912 156.474 53.4044 155.865 50.9153Z"
                    ></path>
                    <defs>
                      <linearGradient
                        gradientUnits="userSpaceOnUse"
                        y2="78"
                        x2="16"
                        y1="42"
                        x1="16"
                        id="paint0_linear_131_19"
                      >
                        <stop stopColor="#6A8EF6"></stop>
                        <stop stopColor="#BF8AEB" offset="1"></stop>
                      </linearGradient>
                      <linearGradient
                        gradientUnits="userSpaceOnUse"
                        y2="77"
                        x2="52"
                        y1="25"
                        x1="52"
                        id="paint1_linear_131_19"
                      >
                        <stop stopColor="#6A8EF6"></stop>
                        <stop stopColor="#BF8AEB" offset="1"></stop>
                      </linearGradient>
                      <linearGradient
                        gradientUnits="userSpaceOnUse"
                        y2="72"
                        x2="112.5"
                        y1="0"
                        x1="112.5"
                        id="paint2_linear_131_19"
                      >
                        <stop stopColor="#6A8EF6"></stop>
                        <stop stopColor="#BF8AEB" offset="1"></stop>
                      </linearGradient>
                    </defs>
                  </svg>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 104 69"
                    className="tripod"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="11"
                      stroke="url(#paint0_linear_124_14)"
                      d="M98.4336 63.3406L52 5.99991"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="11"
                      stroke="url(#paint1_linear_124_14)"
                      d="M52.4336 6L6.00004 63.3407"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeWidth="11"
                      stroke="url(#paint2_linear_124_14)"
                      d="M52 63L52 6"
                    ></path>
                    <defs>
                      <linearGradient
                        gradientUnits="userSpaceOnUse"
                        y2="40.5"
                        x2="68"
                        y1="32"
                        x1="77.5"
                        id="paint0_linear_124_14"
                      >
                        <stop stopColor="#8E8DF2"></stop>
                        <stop stopColor="#BC8BEC" offset="1"></stop>
                      </linearGradient>
                      <linearGradient
                        gradientUnits="userSpaceOnUse"
                        y2="40.5174"
                        x2="36.4196"
                        y1="32.9922"
                        x1="26.1302"
                        id="paint1_linear_124_14"
                      >
                        <stop stopColor="#8E8DF2"></stop>
                        <stop stopColor="#BC8BEC" offset="1"></stop>
                      </linearGradient>
                      <linearGradient
                        gradientUnits="userSpaceOnUse"
                        y2="34.8174"
                        x2="42.7435"
                        y1="34.0069"
                        x1="55.4548"
                        id="paint2_linear_124_14"
                      >
                        <stop stopColor="#8E8DF2"></stop>
                        <stop stopColor="#BC8BEC" offset="1"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </button>
              <input
                placeholder="Enter Location.."
                className="input"
                name="text"
                type="text"
                value={city}
                onChange={handleInputChange}
              />
            </div>
          </form>
        </nav>
        <marquee 
         style={{
          fontFamily: "cursive",
        }}
        >Automatic location fetching will occur once the user grants location access..</marquee>
        </header>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className=" max-w-full py-8 lg:max-w-full lg:px-1">
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 ">
            <div
              className="group relative  rounded-lg h-[85vh]"
              // style={{
              //   boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
              // }}
            >
              <div className="text-white rounded-lg">
                <div className="relative isolate">
                  <div className=" max-w-full  lg:max-w-full">
                    <div className="w-full h-64  bg-center bg-cover rounded-lg shadow-md mb-10">
                      <img 
                      style={{filter:'hue-rotate(45deg) drop-shadow(purple 2px 4px 6px)brightness(0.91)'}}
                      src='https://static.vecteezy.com/system/resources/previews/035/751/263/original/ai-generated-blue-soft-cloud-cute-png.png' 
                      className="MainLogo cursor-pointer transform transition-transform duration-1000 hover:scale-[1.021]"/>
                    </div>
                    <p className="text-sm mt-5 px-3 relative z-[99]">Overview</p>
                    <h1
                      className="text-[2.3em] px-3 mt-5 relative z-[99]"
                      style={{
                        fontFamily: "cursive",
                      }}
                    >
                      Weather App
                    </h1>
                    <p className="text-right text-xl font-semibold leading-7 tracking-tight pe-5">
                      {weatherData
                        ? weatherData.name + ", " + weatherData.sys.country
                        : " "}
                    </p>

                    <ul
                      role="list"
                      className="grid gap-x-8 gap-y-6 sm:grid-cols-2 sm:gap-y-6 xl:col-span-2 px-8 py-3 mt-4"
                      style={{
                        fontFamily: "unset",
                      }}
                    >
                      <li className="cursor-pointer transform transition-transform duration-300 hover:scale-[1.051]">
                        <div className="flex items-start justify-center gap-x-6 bg-[#1f2226a6] rounded-lg h-[19.15vh] custom-white-shadow transition-shadow duration-300">
                          <div>
                          <h3 className="mt-5 pt-5 text-[darkgrey] text-base text-[1em] font-semibold leading-7 tracking-tight text-center">
                              CLIMATE
                            </h3>
                            <p style={{fontFamily:'math', textAlign:'center', fontSize:'calc(0.7em + 1vw'}} className="text-[#2ecde5] mt-4 font-semibold leading-7 tracking-tight capitalize">
                              {weatherData
                                ? weatherData.weather[0].description
                                : " ----"}
                            </p>
                          </div>
                        </div>
                      </li>

                      <li className="cursor-pointer transform transition-transform duration-300 hover:scale-[1.051]">
                        <div className="flex items-start justify-center gap-x-6 bg-[#1f2226a6] rounded-lg h-[19.15vh] custom-white-shadow transition-shadow duration-300">
                          <div>
                          <h3 className="mt-5 pt-5 text-[darkgrey] text-base text-[1em] font-semibold leading-7 tracking-tight text-center">
                              HUMIDITY
                            </h3>
                            <p style={{fontFamily:'math', textAlign:'center', fontSize:'calc(0.7em + 1vw'}} className="text-[blueviolet] mt-4 font-semibold leading-7 tracking-tight">
                              {weatherData ? weatherData.main.humidity : "0"}%
                            </p>
                          </div>
                        </div>
                      </li>
                      <li className="cursor-pointer transform transition-transform duration-300 hover:scale-[1.051]">
                        <div className="flex items-start justify-center gap-x-6 bg-[#1f2226a6] rounded-lg h-[19.15vh] custom-white-shadow transition-shadow duration-300">
                          <div>
                          <h3 className="mt-5 pt-5 text-[darkgrey] text-base text-[1em] font-semibold leading-7 tracking-tight text-center">
                              WIND SPEED
                            </h3>
                            <p style={{fontFamily:'math', textAlign:'center', fontSize:'calc(0.7em + 1vw'}} className="text-[chartreuse] mt-4 font-semibold leading-7 tracking-tight">
                              {weatherData ? weatherData.wind.speed : "0"} m/s
                            </p>
                          </div>
                        </div>
                      </li>
                      <li className="cursor-pointer transform transition-transform duration-300 hover:scale-[1.051]">
                        <div className="flex items-start justify-center gap-x-6 bg-[#1f2226a6] rounded-lg h-[19.15vh] custom-white-shadow transition-shadow duration-300">
                          <div>
                          <h3 className="mt-5 pt-5 text-[darkgrey] text-base text-[1em] font-semibold leading-7 tracking-tight text-center">
                          VISIBILITY
                            </h3>
                            <p style={{fontFamily:'math', textAlign:'center', fontSize:'calc(0.7em + 1vw'}} className="text-[floralwhite] mt-4 font-semibold leading-7 tracking-tight">
                              {weatherData ? weatherData.visibility : "0"}{" "}
                              m
                            </p>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="group relative rounded-lg h-[85vh]"
              //  style={{
              //   boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px'
              //  }}
            >
              <div className="text-white rounded-lg bg-[#3027271f]  ">
                <div className="relative isolate">
                  <div className=" max-w-full  lg:max-w-full">
                    <ul
                      role="list"
                      className="grid gap-x-8 gap-y-12 sm:grid-cols-1 sm:gap-y-16 xl:col-span-1 cursor-pointer transform transition-transform duration-300 hover:scale-[1.051]"
                    >
                      <li className="bg-[#7829c5] text-black rounded-lg custom-white-shadow transition-shadow duration-300 p-2">
                        <h3 className="text-[1.5em] font-semibold leading-7 tracking-tight p-3 text-[floralwhite]">
                          Weather
                        </h3>
                        <div className="flex justify-start item-center gap-x-6 h-[8vh] my-3 px-5">
                          {weatherData ? (
                            <div
                              className="flex items-center"
                              style={{
                                fontFamily: "cursive",
                                justifyContent: "space-between",
                                width: "-webkit-fill-available"
                              }}
                            >
                              <img
                                className="w-[6em] h-[6em] mr-2"
                                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
                                alt={weatherData.weather[0].description}
                              />
                           <p style={{
                              fontSize: 'calc(1.5em + 1vw)',
                              color: 'powderblue'
                            }}>
                              {weatherData.main.temp}°C
                            </p>


                            </div>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="60"
                              height="60"
                              fill="currentColor"
                              className="bi bi-cloud-lightning-rain-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M2.658 11.026a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m-7.5 1.5a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316m-7.105-1.25A.5.5 0 0 1 7.5 11h1a.5.5 0 0 1 .474.658l-.28.842H9.5a.5.5 0 0 1 .39.812l-2 2.5a.5.5 0 0 1-.875-.433L7.36 14H6.5a.5.5 0 0 1-.447-.724zm6.352-7.249a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 10H13a3 3 0 0 0 .405-5.973" />
                            </svg>
                          )}
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-white rounded-lg bg-[#3027271f] mt-5">
                <div className="relative isolate h-[32vh]">
                  <div className="max-w-full lg:max-w-full">
                    <img
                      src={images[currentImageIndex]}
                      alt="Animated Background"
                      className="w-full h-[32vh] object-cover rounded-lg shadow-md"
                    />
                  </div>
                  <div className="flex justify-center w-full -mt-20 overflow-hidden bg-white rounded-lg shadow-lg ">
                    <h3 className="py-2 font-bold tracking-wide text-center text-gray-800 uppercase rounded-lg animated-gradient px-4">
                      Advertisement
                    </h3>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-full overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 mt-5">
                <div className="flex">
                  <div className="overflow-hidden">
                    <img
                      className="w-full bg-cover object-cover object-center h-[100%] transition-transform duration-1000 hover:scale-[1.051]"
                      src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/2382afd6-d76a-4993-8149-e1c13695b545/dfs8rkd-7d9b6479-dcc8-498a-834d-df892df48fd4.png/v1/fill/w_894,h_894,q_70,strp/lovely_anime_sunrise_scenery_by_ddyykk_dfs8rkd-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTAyNCIsInBhdGgiOiJcL2ZcLzIzODJhZmQ2LWQ3NmEtNDk5My04MTQ5LWUxYzEzNjk1YjU0NVwvZGZzOHJrZC03ZDliNjQ3OS1kY2M4LTQ5OGEtODM0ZC1kZjg5MmRmNDhmZDQucG5nIiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.gqaYEEBlguI5vpqTuRr9iDzzR-elO6iX5yTh-naXSbM"
                      alt="avatar"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <img
                      className="w-full bg-cover object-cover object-center h-[100%] transition-transform duration-1000 hover:scale-[1.051]"
                      src="https://pics.craiyon.com/2023-11-10/tBITRBI1SqOylA1WMYX9kQ.webp"
                      alt="avatar"
                    />
                  </div>
                </div>
                <div className="flex justify-around bg-gray-900">
                  <div className="text-center pb-4">
                    <div className="flex items-center px-6 py-3 bg-gray-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        fill="currentColor"
                        className="bi bi-sunrise"
                        viewBox="0 0 16 16"
                      >
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l1.5 1.5a.5.5 0 0 1-.708.708L8.5 2.707V4.5a.5.5 0 0 1-1 0V2.707l-.646.647a.5.5 0 1 1-.708-.708zM2.343 4.343a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707L2.343 5.05a.5.5 0 0 1 0-.707m11.314 0a.5.5 0 0 1 0 .707l-1.414 1.414a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0M8 7a3 3 0 0 1 2.599 4.5H5.4A3 3 0 0 1 8 7m3.71 4.5a4 4 0 1 0-7.418 0H.499a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1h-3.79zM0 10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 10m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                      </svg>
                      <h1 className="mx-3 text-lg font-semibold text-white">
                        Sunrise
                      </h1>
                    </div>
                    <h1 className="mx-3 text-lg font-semibold text-white">
                      {weatherData
                        ? new Date(
                            weatherData.sys.sunrise * 1000
                          ).toLocaleTimeString()
                        : "-:--:--"}
                    </h1>
                  </div>
                  <div className="text-center pb-4">
                    <div className="flex items-center px-6 py-3 bg-gray-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        fill="currentColor"
                        className="bi bi-sunset"
                        viewBox="0 0 16 16"
                      >
                        <path d="M7.646 4.854a.5.5 0 0 0 .708 0l1.5-1.5a.5.5 0 0 0-.708-.708l-.646.647V1.5a.5.5 0 0 0-1 0v1.793l-.646-.647a.5.5 0 1 0-.708.708zm-5.303-.51a.5.5 0 0 1 .707 0l1.414 1.413a.5.5 0 0 1-.707.707L2.343 5.05a.5.5 0 0 1 0-.707zm11.314 0a.5.5 0 0 1 0 .706l-1.414 1.414a.5.5 0 1 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zM8 7a3 3 0 0 1 2.599 4.5H5.4A3 3 0 0 1 8 7m3.71 4.5a4 4 0 1 0-7.418 0H.499a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1h-3.79zM0 10a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 10m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                      </svg>

                      <h1 className="mx-3 text-lg font-semibold text-white">
                        Sunset
                      </h1>
                    </div>
                    <h1 className="mx-3 text-lg font-semibold text-white">
                      {weatherData
                        ? new Date(
                            weatherData.sys.sunset * 1000
                          ).toLocaleTimeString()
                        : "-:--:--"}
                    </h1>
                  </div>
                </div>
              </div>

              {/* {error && <p className="text-red-500">{error}</p>}

            {weatherData && (
                <div className="p-4 bg-white text-black shadow-md rounded-md">
                    <h2 className="text-xl font-bold">{weatherData.name}, {weatherData.sys.country}</h2>
                    <div className="flex items-center">
                        <img
                            className="w-12 h-12 mr-2"
                            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
                            alt={weatherData.weather[0].description}/>
                        <p className="text-lg">{weatherData.main.temp}°C</p>
                    </div>
                    <p className="text-gray-600">{weatherData.weather[0].description}</p>
                    <p>Humidity: {weatherData.main.humidity}%</p>
                    <p>Wind Speed: {weatherData.wind.speed}
                        {unit === 'metric'
                            ? 'm/s'
                            : 'mph'}</p>
                    <p>Sunrise: {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>
                    <p>Sunset: {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>
                    <p>Feels Like: {weatherData.main.feels_like}°{unit === 'metric'
                            ? 'C'
                            : 'F'}</p>
                    <p>Visibility: {weatherData.visibility}
                        {unit === 'metric'
                            ? 'meters'
                            : 'miles'}</p>
                    <p>Pressure: {weatherData.main.pressure}
                        hPa</p>
                    <p>Cloudiness: {weatherData.clouds.all}%</p>
                </div>
            )} */}
            </div>
            <div className="group relative rounded-lg h-[85vh] w-full">
              <div className="flex justify-center w-full">
              <div className="w-full">
              <div className="mt-4">
              <Clock />
              </div>
                  <div className="player mt-5">
                    <p className="indicator text-center mt-5">
                      Enjoy the Weather's Tranquility
                    </p>
                    <div className="top">
                      <button className="small">
                        <div className="inner_button">
                          <img
                            style={{ height: "10px" }}
                            src="data:image/svg+xml;base64,
PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQ5MiA0OTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ5MiA0OTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiI+PGc+PGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDY0LjM0NCwyMDcuNDE4bDAuNzY4LDAuMTY4SDEzNS44ODhsMTAzLjQ5Ni0xMDMuNzI0YzUuMDY4LTUuMDY0LDcuODQ4LTExLjkyNCw3Ljg0OC0xOS4xMjQgICAgYzAtNy4yLTIuNzgtMTQuMDEyLTcuODQ4LTE5LjA4OEwyMjMuMjgsNDkuNTM4Yy01LjA2NC01LjA2NC0xMS44MTItNy44NjQtMTkuMDA4LTcuODY0Yy03LjIsMC0xMy45NTIsMi43OC0xOS4wMTYsNy44NDQgICAgTDcuODQ0LDIyNi45MTRDMi43NiwyMzEuOTk4LTAuMDIsMjM4Ljc3LDAsMjQ1Ljk3NGMtMC4wMiw3LjI0NCwyLjc2LDE0LjAyLDcuODQ0LDE5LjA5NmwxNzcuNDEyLDE3Ny40MTIgICAgYzUuMDY0LDUuMDYsMTEuODEyLDcuODQ0LDE5LjAxNiw3Ljg0NGM3LjE5NiwwLDEzLjk0NC0yLjc4OCwxOS4wMDgtNy44NDRsMTYuMTA0LTE2LjExMmM1LjA2OC01LjA1Niw3Ljg0OC0xMS44MDgsNy44NDgtMTkuMDA4ICAgIGMwLTcuMTk2LTIuNzgtMTMuNTkyLTcuODQ4LTE4LjY1MkwxMzQuNzIsMjg0LjQwNmgzMjkuOTkyYzE0LjgyOCwwLDI3LjI4OC0xMi43OCwyNy4yODgtMjcuNnYtMjIuNzg4ICAgIEM0OTIsMjE5LjE5OCw0NzkuMTcyLDIwNy40MTgsNDY0LjM0NCwyMDcuNDE4eiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBzdHlsZT0iZmlsbDojODQ4NzhBIiBkYXRhLW9sZF9jb2xvcj0iIzAwMDAwMCI+PC9wYXRoPgoJPC9nPgo8L2c+PC9nPiA8L3N2Zz4="
                          />
                        </div>
                      </button>
                      <button className="small">
                        <div className="inner_button">
                          <img
                            style={{ height: "10px" }}
                            src="data:image/svg+xml;base64,
PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJMYXllcl8xIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTIiPjxnPjxwYXRoIGQ9Im00NjQuODgzIDY0LjI2N2gtNDE3Ljc2NmMtMjUuOTggMC00Ny4xMTcgMjEuMTM2LTQ3LjExNyA0Ny4xNDkgMCAyNS45OCAyMS4xMzcgNDcuMTE3IDQ3LjExNyA0Ny4xMTdoNDE3Ljc2NmMyNS45OCAwIDQ3LjExNy0yMS4xMzcgNDcuMTE3LTQ3LjExNyAwLTI2LjAxMy0yMS4xMzctNDcuMTQ5LTQ3LjExNy00Ny4xNDl6IiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBjbGFzcz0iYWN0aXZlLXBhdGgiIHN0eWxlPSJmaWxsOiM4NDg3OEEiIGRhdGEtb2xkX2NvbG9yPSIjMDAwMDAwIj48L3BhdGg+PHBhdGggZD0ibTQ2NC44ODMgMjA4Ljg2N2gtNDE3Ljc2NmMtMjUuOTggMC00Ny4xMTcgMjEuMTM2LTQ3LjExNyA0Ny4xNDkgMCAyNS45OCAyMS4xMzcgNDcuMTE3IDQ3LjExNyA0Ny4xMTdoNDE3Ljc2NmMyNS45OCAwIDQ3LjExNy0yMS4xMzcgNDcuMTE3LTQ3LjExNyAwLTI2LjAxMy0yMS4xMzctNDcuMTQ5LTQ3LjExNy00Ny4xNDl6IiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBjbGFzcz0iYWN0aXZlLXBhdGgiIHN0eWxlPSJmaWxsOiM4NDg3OEEiIGRhdGEtb2xkX2NvbG9yPSIjMDAwMDAwIj48L3BhdGg+PHBhdGggZD0ibTQ2NC44ODMgMzUzLjQ2N2gtNDE3Ljc2NmMtMjUuOTggMC00Ny4xMTcgMjEuMTM3LTQ3LjExNyA0Ny4xNDkgMCAyNS45OCAyMS4xMzcgNDcuMTE3IDQ3LjExNyA0Ny4xMTdoNDE3Ljc2NmMyNS45OCAwIDQ3LjExNy0yMS4xMzcgNDcuMTE3LTQ3LjExNyAwLTI2LjAxMi0yMS4xMzctNDcuMTQ5LTQ3LjExNy00Ny4xNDl6IiBkYXRhLW9yaWdpbmFsPSIjMDAwMDAwIiBjbGFzcz0iYWN0aXZlLXBhdGgiIHN0eWxlPSJmaWxsOiM4NDg3OEEiIGRhdGEtb2xkX2NvbG9yPSIjMDAwMDAwIj48L3BhdGg+PC9nPiA8L3N2Zz4="
                          />
                        </div>
                      </button>
                    </div>

                    <div>
                    <div className="center">
                      <img
                        className={` ${isPlaying ? 'rotate' : 'album'}`}
                        src="https://upload.wikimedia.org/wikipedia/en/f/f3/EVOL_by_Future_cover.jpg"
                        alt="Album Cover"
                      />
                    </div>
                  </div>

                    <div className="song_details">
                      <div style={{ fontSize: "20px" }}>{songName1.split('.')[0]}</div>
                      {/* <div style={{ marginTop: "7px", fontSize: "10px" }}>
                        Future ft. The Weeknd
                      </div> */}
                    </div>
                    <audio ref={audioPlayer} src={song} />

                    <div className="slider">
                      <div className="time">
                        <h2>{formatTime(currentTime)}</h2>
                        <h2>{formatTime(duration)}</h2>
                      </div>
                      <div className="slider_bar">
                        <div onClick={handleTimeSeek} style={{ width: '100%', backgroundColor: '#000', cursor: 'pointer' }}>
          <div style={{ width: `${(currentTime / duration) * 100}%`, backgroundColor: '#333', height: '5px' }} className="inner_slider_bar" />
        </div>
                      </div>
                    </div>

                    <div className="controls">
                      <button className="big">
                        <div className="inner_button_big">
                          <img
                            style={{ height: "15px", transform: "scale(-1)" }}
                            src="data:image/svg+xml;base64,
PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDQ4IDQ0OCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDQ4IDQ0ODsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIj48Zz48cGF0aCBkPSJNNDM5Ljg0LDIxMC4wNDJsLTI1Ni0xNDRjLTQuOTI4LTIuNzUyLTExLjAwOC0yLjcyLTE1LjkwNCwwLjEyOFMxNjAsNzQuMjk4LDE2MCw3OS45OTR2NjIuNTkyTDIzLjg0LDY2LjA0MiAgYy00Ljk2LTIuNzg0LTExLjAwOC0yLjcyLTE1LjkzNiwwLjEyOEMzLjAwOCw2OS4wNSwwLDc0LjI5OCwwLDc5Ljk5NHYyODhjMCw1LjY5NiwzLjAwOCwxMC45NDQsNy45MDQsMTMuODI0ICBjMi40OTYsMS40NCw1LjMxMiwyLjE3Niw4LjA5NiwyLjE3NmMyLjY4OCwwLDUuNDA4LTAuNjcyLDcuODQtMi4wNDhMMTYwLDMwNS40MDJ2NjIuNTkyYzAsNS42OTYsMy4wNCwxMC45NDQsNy45MzYsMTMuODI0ICBzMTAuOTc2LDIuOTEyLDE1LjkwNCwwLjEyOGwyNTYtMTQ0YzUuMDI0LTIuODQ4LDguMTYtOC4xNiw4LjE2LTEzLjk1MlM0NDQuODY0LDIxMi44OSw0MzkuODQsMjEwLjA0MnoiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIGNsYXNzPSJhY3RpdmUtcGF0aCIgc3R5bGU9ImZpbGw6Izg0ODc4QSIgZGF0YS1vbGRfY29sb3I9IiMwMDAwMDAiPjwvcGF0aD48L2c+IDwvc3ZnPg=="
                          />
                        </div>
                      </button>
                      <button className="big_play_pause" onClick={togglePlay}>
                        <div className="playpause">
                        {!isPlaying ? 
                        <img
                        style={{ height: "15px" }}
                        src="data:image/svg+xml;base64,
PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMzIwLjAwMSAzMjAuMDAxIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAzMjAuMDAxIDMyMC4wMDE7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiI+PGc+PHBhdGggZD0iTTI5NS44NCwxNDYuMDQ5bC0yNTYtMTQ0Yy00Ljk2LTIuNzg0LTExLjAwOC0yLjcyLTE1LjkwNCwwLjEyOEMxOS4wMDgsNS4wNTcsMTYsMTAuMzA1LDE2LDE2LjAwMXYyODggIGMwLDUuNjk2LDMuMDA4LDEwLjk0NCw3LjkzNiwxMy44MjRjMi40OTYsMS40NCw1LjI4LDIuMTc2LDguMDY0LDIuMTc2YzIuNjg4LDAsNS40MDgtMC42NzIsNy44NC0yLjA0OGwyNTYtMTQ0ICBjNS4wMjQtMi44NDgsOC4xNi04LjE2LDguMTYtMTMuOTUyUzMwMC44NjQsMTQ4Ljg5NywyOTUuODQsMTQ2LjA0OXoiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIGNsYXNzPSJhY3RpdmUtcGF0aCIgc3R5bGU9ImZpbGw6I0ZGRkZGRiIgZGF0YS1vbGRfY29sb3I9IiMwMDAwMDAiPjwvcGF0aD48L2c+IDwvc3ZnPg=="
                      />
                       : 
                       <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-pause-fill" viewBox="0 0 16 16">
  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
</svg>
}
                          
                          
                        </div>
                      </button>
                      <button className="big">
                        <div className="inner_button_big">
                          <img
                            style={{ height: "15px" }}
                            src="data:image/svg+xml;base64,
PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDQ4IDQ0OCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDQ4IDQ0ODsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIj48Zz48cGF0aCBkPSJNNDM5Ljg0LDIxMC4wNDJsLTI1Ni0xNDRjLTQuOTI4LTIuNzUyLTExLjAwOC0yLjcyLTE1LjkwNCwwLjEyOFMxNjAsNzQuMjk4LDE2MCw3OS45OTR2NjIuNTkyTDIzLjg0LDY2LjA0MiAgYy00Ljk2LTIuNzg0LTExLjAwOC0yLjcyLTE1LjkzNiwwLjEyOEMzLjAwOCw2OS4wNSwwLDc0LjI5OCwwLDc5Ljk5NHYyODhjMCw1LjY5NiwzLjAwOCwxMC45NDQsNy45MDQsMTMuODI0ICBjMi40OTYsMS40NCw1LjMxMiwyLjE3Niw4LjA5NiwyLjE3NmMyLjY4OCwwLDUuNDA4LTAuNjcyLDcuODQtMi4wNDhMMTYwLDMwNS40MDJ2NjIuNTkyYzAsNS42OTYsMy4wNCwxMC45NDQsNy45MzYsMTMuODI0ICBzMTAuOTc2LDIuOTEyLDE1LjkwNCwwLjEyOGwyNTYtMTQ0YzUuMDI0LTIuODQ4LDguMTYtOC4xNiw4LjE2LTEzLjk1MlM0NDQuODY0LDIxMi44OSw0MzkuODQsMjEwLjA0MnoiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIGNsYXNzPSJhY3RpdmUtcGF0aCIgc3R5bGU9ImZpbGw6Izg0ODc4QSIgZGF0YS1vbGRfY29sb3I9IiMwMDAwMDAiPjwvcGF0aD48L2c+IDwvc3ZnPg=="
                          />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="group relative bg-[#3027271f] rounded-lg h-[85vh]">
            <div className="main">
                    <div className="up">
                      <button className="card1 text-[darkgray]">
                      Pressure    
   <p className="text-[1.5em] text-[floralwhite]">{ weatherData ? weatherData.main.pressure : 0 }hPa</p>
   </button>
                      <button className="card2 text-[darkgray]">
                      Sea Level Pressure    
    <p className="text-[1.5em] text-[floralwhite]">{ weatherData ? weatherData.main.sea_level : 0 }hPa</p>
    </button>
                    </div>
                    <div className="down">
                      <button className="card3 text-[darkgray]">
                      Gorund Level Pressure 
    <p className="text-[1.5em] text-[floralwhite]">{ weatherData ? weatherData.main.grnd_level : 0 }hPa</p>
    </button>
                      <button className="card4 overflow-hidden">
                  <img src="https://d33wubrfki0l68.cloudfront.net/b68b4d504a8d63f8f3dd398a26b09fc43f90e67a/2190a/uploads/dribbble-loader-green.gif"/> 
                     </button>
                    </div>
          </div>
        <div className="flex justify-between">
        <div className="max-w-full w-full">
<div className="mt-5">
<div className="grid grid-cols-1 gap-2 text-center">
  <div className="bg-[#171b2059] mt-3 py-8 rounded-lg flex justify-between px-5"
  style={{
    boxShadow: 'rgba(225, 225, 225, 0.2) 0px 1px 4px',
  }}>
            <span>Rain Volume (last 1h)</span>
            <span className="text-[1.1em] text-[floralwhite]">{ weatherData ? (weatherData.rain ? weatherData.rain['1h'] : '0') : 0 }mm</span>
  </div>
  <div className="bg-[#171b2059] mt-3 py-8 rounded-lg flex justify-between px-5"
  style={{
    boxShadow: 'rgba(225, 225, 225, 0.2) 0px 1px 4px',
  }}>
            <span>Cloudiness</span>
            <span className="text-[1.1em] text-[floralwhite]" >{ weatherData ? weatherData.clouds.all: 0 }%</span>
  </div>
</div>
</div>

<div className="mt-5">
{weatherData ?
(
  <div>
 <WeatherMap lat={weatherData.coord.lat} lon={weatherData.coord.lon}  />
 {/* Uncomment and try other styles as needed */}
 {/* <WeatherMap lat={weatherData.coord.lat} lon={weatherData.coord.lon} mapStyle="light_all" /> */}
 {/* <WeatherMap lat={weatherData.coord.lat} lon={weatherData.coord.lon} mapStyle="voyager" /> */}
</div>
) : (
<WeatherMap lat={17.3753} lon={78.4744} mapStyle="dark_all" />
)
}
</div>


      </div>
        </div>
      </div> 

          </div>
        </div>
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-45rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}



 {/* <img
          src='https://i.pinimg.com/originals/f3/21/97/f32197f072587bc2bb08a879839fabec.gif'
          alt="Animated Background"
          className="background-image"
        /> */}
                {/* <img
          src='https://hackernoon.com/images/0*zzg_YoHtb5wXe98Z.gif'
          alt="Animated Background"
          className="background-image"
        /> */}

{/* {error && <p className="text-red-500">{error}</p>}

{weatherData && (
<div className="p-4 bg-white text-black shadow-md rounded-md">
<h2 className="text-xl font-bold">{weatherData.name}, {weatherData.sys.country}</h2>
<div className="flex items-center">
  <img
      className="w-12 h-12 mr-2"
      src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
      alt={weatherData.weather[0].description}
  />
  <p className="text-lg">{weatherData.main.temp}°C</p>
</div>
<p className="text-gray-600">{weatherData.weather[0].description}</p>
<p>Coordinates: {weatherData.coord.lat}, {weatherData.coord.lon}</p>
<p>Humidity: {weatherData.main.humidity}%</p>
<p>Wind Speed: {weatherData.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
<p>Rain Volume (last 1h): {weatherData.rain ? weatherData.rain['1h'] : '0'} mm</p>
<p>Sunrise: {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>
<p>Sunset: {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>
<p>Feels Like: {weatherData.main.feels_like}°{unit === 'metric' ? 'C' : 'F'}</p>
<p>Visibility: {weatherData.visibility} {unit === 'metric' ? 'meters' : 'miles'}</p>
<p>Pressure: {weatherData.main.pressure} hPa</p>
<p>Sea Level Pressure: {weatherData.main.sea_level} hPa</p>
<p>Ground Level Pressure: {weatherData.main.grnd_level} hPa</p>
<p>Cloudiness: {weatherData.clouds.all}%</p>
<div>
  <h3>Additional Conditions:</h3>
  {weatherData.weather.slice(1).map((condition, index) => (
      <p key={index}>{condition.description}</p>
  ))}
</div>

</div>
)} */}