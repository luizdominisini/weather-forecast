import { Divider, Flex, Image, Spinner, Text } from "@chakra-ui/react";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";
import { PiCircleLight, PiDropSimpleLight, PiWindLight } from "react-icons/pi";
import { RiSearch2Line } from "react-icons/ri";
import { BoxItem } from "../components/BoxItem";
import { Input } from "../components/Input";
import {
  ConsultarDadosResponse,
  useMutationWeather,
} from "../hooks/useMutationWeather";
import { useCoordsStore } from "../stores/coords";
import { mascaraTemperatura } from "../utils/conversao";

export const HomePage = () => {
  const { mutateAsync, isLoading } = useMutationWeather();
  const inputRef = useRef<HTMLInputElement>(null);
  const [weatherData, setWeatherData] = useState({} as ConsultarDadosResponse);

  const [latitude, longitude] = useCoordsStore((s) => [
    s.states.latitude,
    s.states.longitude,
  ]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchLocation();
    }
  };

  useEffect(() => {
    (async () => {
      await mutateAsync(
        { coordenada: `${latitude},${longitude}` },
        {
          onSuccess: (data) => {
            setWeatherData(data);
          },
        }
      );
    })();
  }, [latitude, longitude, mutateAsync]);

  const localDate = DateTime.fromMillis(weatherData?.current?.dt * 1000, {
    zone: "utc",
  }).setZone(weatherData?.timezone);

  const isNightTime = localDate.get("hour") >= 18 || localDate.get("hour") < 6;

  const searchLocation = async () => {
    await mutateAsync(
      { cidade: inputRef.current?.value || "" },
      {
        onSuccess: (data) => {
          setWeatherData(data);
        },
      }
    );
  };

  return (
    <Flex
      height="100vh"
      justify="center"
      align="center"
      bgColor="weather.white"
      color="weather.white"
    >
      <Flex
        borderRadius="25"
        boxShadow="base"
        flexDir="column"
        p={6}
        gap={10}
        bg={
          isNightTime
            ? "linear-gradient(180deg, rgba(0,44,200,1) 0%, rgba(44,46,50,1) 100%)"
            : "linear-gradient(175deg, rgba(202,77,38,1) 0%, rgba(128,31,0,1) 100%)"
        }
      >
        <Flex alignItems="center" justifyContent="center" gap={2}>
          <Input
            maxW="300px"
            ref={inputRef}
            onKeyDown={handleKeyPress}
            placeholder="city..."
            color="weather.black"
          />
          {isLoading ? (
            <Spinner />
          ) : (
            <RiSearch2Line
              onClick={searchLocation}
              cursor="pointer"
              size="25px"
            />
          )}
        </Flex>

        {weatherData.current && (
          <>
            <Flex
              flexDir="column"
              gap={5}
              alignItems="center"
              fontSize="1.2rem"
            >
              <Text fontSize="0.9rem" fontWeight="300">
                {localDate.toFormat("cccc, dd LLL yyyy | 'Local Time:' HH:mm")}
              </Text>

              <Flex alignItems="center" gap={3}>
                <Text textTransform="capitalize">{`${weatherData.cityName}`}</Text>
                <Image
                  src={`https://flagsapi.com/${weatherData.countryAcronym}/flat/32.png`}
                />
              </Flex>

              <Text fontSize="4rem" textShadow="#0000003d 0px 4px 4px">
                {weatherData?.hourly &&
                  mascaraTemperatura(Math.floor(weatherData?.hourly[0].temp))}
              </Text>

              <Flex alignItems="center">
                <Text fontWeight="300" textTransform="capitalize">
                  {weatherData?.current?.weather &&
                    weatherData?.current?.weather[0]?.description}
                </Text>
                {weatherData?.current?.weather && (
                  <Image
                    src={`http://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}.png`}
                  />
                )}
              </Flex>

              <Divider />

              <Flex gap={3}>
                <BoxItem
                  icon={<PiWindLight size="25px" />}
                  label={"Wind"}
                  value={`${weatherData?.current?.wind_speed} km/h`}
                />
                <BoxItem
                  icon={<PiDropSimpleLight size="25px" />}
                  label={"Humidity"}
                  value={`${weatherData?.current?.humidity}%`}
                />
                <BoxItem
                  icon={<PiCircleLight size="25px" />}
                  label={"UV Index"}
                  value={`${weatherData?.current?.uvi}`}
                />
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
};
