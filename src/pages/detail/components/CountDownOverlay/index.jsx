import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ClockCircleOutlined, LockFilled } from "@ant-design/icons";

const CountdownTab = ({ groupInfo }) => {
  const { open_time } = groupInfo;

  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    console.log("CountDownOverlay: ", open_time);
    
    if (!open_time) return;

    const updateTimer = () => {
      const now = dayjs();
      const end = dayjs(Number(open_time));
      const diff = end.diff(now);

      if (diff <= 0) {
        setIsAvailable(true);
        return;
      }

      const duration = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };

      setTimeLeft({
        days: String(duration.days).padStart(2, "0"),
        hours: String(duration.hours).padStart(2, "0"),
        minutes: String(duration.minutes).padStart(2, "0"),
        seconds: String(duration.seconds).padStart(2, "0"),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [groupInfo?.open_time]);

  // if (isAvailable) return null;

  return (
    <div className="absolute inset-0 z-50 bottom-0 pt-[100px] flex flex-col items-center justify-center backdrop-blur-md bg-white/50">
      <div className="flex flex-col items-center gap-4 w-full animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full text-white flex items-center justify-center text-3xl">
            <ClockCircleOutlined style={{ fontSize: 60, color: "#4E47FF" }} />
          </div>
          <div className="mt-3 text-xl font-semibold text-primary">
            Time capsule is unavailable
          </div>

          <div className="mt-4 mb-10 flex gap-4 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gray-800 font-mono transition-all duration-500 ease-in-out">
                {timeLeft.days} :
              </div>
              <div className="text-sm text-gray-500">Days</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gray-800 font-mono transition-all duration-500 ease-in-out">
                {timeLeft.hours} :
              </div>
              <div className="text-sm text-gray-500">Hours</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gray-800 font-mono transition-all duration-500 ease-in-out">
                {timeLeft.minutes} :
              </div>
              <div className="text-sm text-gray-500">Minutes</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gray-800 font-mono transition-all duration-500 ease-in-out">
                {timeLeft.seconds}
              </div>
              <div className="text-sm text-gray-500">Seconds</div>
            </div>
          </div>
          <div className="text-gray-500 text-base">
            Available at {dayjs(Number(open_time)).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTab;
