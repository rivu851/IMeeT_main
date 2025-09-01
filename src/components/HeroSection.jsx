import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import hero from "../assets/RegBg-img.png";
import { TypeAnimation } from "react-type-animation";
import ArrowLeft from "/arrow-left.svg";
import ArrowRight from "/arrow-right.svg";
import ImeeTLogo from "/ImeeT 2025.svg";

const HeroSection = () => {
  // Initial countdown → 10d 20h 20m 2s in seconds
  const initialTime =
    10 * 24 * 60 * 60 + 20 * 60 * 60 + 20 * 60 + 2;

  // Get or set the fixed end timestamp
  const getEndTime = () => {
    const savedEndTime = localStorage.getItem("eventEndTime");
    if (savedEndTime) {
      return parseInt(savedEndTime, 10);
    }
    const newEndTime = Date.now() + initialTime * 1000;
    localStorage.setItem("eventEndTime", newEndTime);
    return newEndTime;
  };

  const endTime = getEndTime();

  function calculateTimeLeft(totalSeconds) {
    return {
      days: Math.floor(totalSeconds / (60 * 60 * 24)),
      hours: Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60)),
      minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
      seconds: totalSeconds % 60,
    };
  }

  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(Math.floor((endTime - Date.now()) / 1000), 0)
  );
  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft(remainingSeconds)
  );
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      setHasEnded(true);
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setHasEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(remainingSeconds));
  }, [remainingSeconds]);

  // Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const fadeUp = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 80 } },
  };

  // Updated arrow motions
  const arrowVariantsLeft = {
    animate: {
      x: [0, 10, 0], // nudge right (towards logo)
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const arrowVariantsRight = {
    animate: {
      x: [0, -10, 0], // nudge left (towards logo)
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const floatVariants = {
    animate: {
      y: [0, -15, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const timerUnitVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.08, 1],
      transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.5 },
    },
    hover: {
      scale: 1.1,
      boxShadow: "0 0 15px rgba(168, 85, 247, 0.5)",
      transition: { duration: 0.3 },
    },
  };

  // Header text always fixed
  const getHeaderText = () => "LEARN, LEAD, LAUNCH";

  const timerUnits = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECONDS", value: timeLeft.seconds },
  ];

  return (
    <section className="relative h-screen flex flex-col justify-center items-center text-white text-center overflow-hidden ">
      {/* Moving background - moderate noticeable */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        animate={{
          scale: [1, 1.06, 1],       // smaller zoom
          x: [0, -10, 0, 10, 0],     // less horizontal shift
          y: [0, -5, 0, 5, 0],       // less vertical shift
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Floating Logo Left */}
      <motion.img
        src="/imeet_nobg.png"
        alt="Floating ImeeT Logo"
        className="
          w-36 h-36 md:w-60 md:h-60
          rounded-full
          absolute top-14 md:top-48 md:left-16 md:-translate-y-1/2 md:translate-x-0
          mx-auto
          overflow-hidden
        "
        variants={floatVariants}
        animate="animate"
      />

      <motion.div
        className="relative z-10 flex flex-col items-center px-6 max-w-6xl mx-auto mt-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo & Arrows */}
        <motion.div
          className="flex items-center justify-center w-full gap-8 md:gap-16 mb-10 pt-14 mt-5"
          variants={fadeUp}
        >
          <motion.img
            src={ArrowLeft}
            alt="left arrows"
            className="w-12 md:w-20"
            variants={arrowVariantsLeft}
            animate="animate"
          />
          <motion.img
            src={ImeeTLogo}
            alt="ImeeT 2025 Logo"
            className="w-[250px] md:w-[420px]"
            variants={logoVariants}
          />
          <motion.img
            src={ArrowRight}
            alt="right arrows"
            className="w-12 md:w-20"
            variants={arrowVariantsRight}
            animate="animate"
          />
        </motion.div>

        {/* Subtext */}
        <motion.div className="text-lg md:text-2xl font-bebas font-extrabold text-white/90 mb-6" variants={fadeUp}>
          THE IT DEPARTMENT ANNUAL FEST
        </motion.div>

        {/* Hashtag + Timer */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start w-full px-6 max-w-4xl mx-auto mt-2 gap-6">
          {/* Hashtag */}
          <motion.div className="text-center md:text-left font-bebas" variants={fadeUp}>
            <TypeAnimation
              sequence={["#jab_IT_met", 1000, "#stay_tuned", 1000]}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
              className="text-xl sm:text-2xl font-bold text-white/90"
            />
          </motion.div>

          {/* Timer */}
          <motion.div className="flex justify-center md:justify-end gap-4 w-full md:w-3/5 font-bebas" variants={fadeUp}>
            {timerUnits.map((unit, index) => (
              <motion.div
                key={unit.label}
                className="flex flex-col items-center"
                whileHover="hover"
                animate={unit.label === "SECONDS" && !hasEnded ? "pulse" : "initial"}
                variants={timerUnitVariants}
                transition={{ delay: index * 0.1 }}
              >
                <motion.span className="text-3xl md:text-4xl font-bold text-white/90">
                  {unit.value < 10 ? `0${unit.value}` : unit.value}
                </motion.span>
                <span className="text-xs uppercase tracking-wider text-purple-200 mt-1">{unit.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Header Text */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={getHeaderText()}
            className="text-6xl md:text-8xl font-extrabold tracking-tight mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {getHeaderText()}
          </motion.h1>
        </AnimatePresence>
      </motion.div>

      {/* Floating Logo Right */}
      <motion.img
        src="/iei_logo_main.png"
        alt="Floating ImeeT Logo"
        className="
        w-20 h-20 md:w-60 md:h-60
        rounded-full
        absolute bottom-0 md:top-48 md:right-16 md:-translate-y-1/2
        mx-auto
        overflow-hidden
        "
        variants={floatVariants}
        animate="animate"
      />
    </section>
  );
};

export default HeroSection;
