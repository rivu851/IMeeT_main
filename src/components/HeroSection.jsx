import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import hero from "../assets/RegBg-img.png";
import { TypeAnimation } from "react-type-animation";
import ArrowLeft from "/arrow-left.svg";
import ArrowRight from "/arrow-right.svg";
import ImeeTLogo from "/ImeeT 2025.svg";

const HeroSection = () => {
  // Fixed event date: 11 Sept 2025, 10:00 AM local time
  const eventDate = new Date("2025-09-11T10:00:00").getTime();

  function calculateTimeLeft() {
    const diff = eventDate - Date.now();
    return {
      total: diff,
      days: Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0),
      hours: Math.max(Math.floor((diff / (1000 * 60 * 60)) % 24), 0),
      minutes: Math.max(Math.floor((diff / 1000 / 60) % 60), 0),
      seconds: Math.max(Math.floor((diff / 1000) % 60), 0),
    };
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    if (timeLeft.total <= 0) {
      setHasEnded(true);
      return;
    }

    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.total <= 0) {
        clearInterval(timer);
        setHasEnded(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft.total]);

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

  const arrowVariantsLeft = {
    animate: {
      x: [0, 10, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const arrowVariantsRight = {
    animate: {
      x: [0, -10, 0],
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

  const getHeaderText = () => "INNOVATE • INSPIRE • IMPACT";

  const timerUnits = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECONDS", value: timeLeft.seconds },
  ];

  return (
    <section className="relative h-screen flex flex-col justify-center items-center text-white text-center overflow-hidden ">
      {/* Moving background */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        animate={{
          scale: [1, 1.06, 1],
          x: [0, -10, 0, 10, 0],
          y: [0, -5, 0, 5, 0],
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
    absolute top-12 md:top-44 md:left-16 md:-translate-y-1/2
    mx-auto
    overflow-hidden
  "
  initial={{ x: -200, opacity: 0 }}         // start from left & hidden
  animate={{ x: 0, opacity: 1 }}           // move into place
  transition={{ duration: 1, ease: "easeOut" }} // smooth effect
  variants={floatVariants}                 // keep the floating loop
  whileInView="animate"
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
    className="mt-8 text-4xl md:text-7xl font-extrabold tracking-tight leading-tight text-center"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -20, opacity: 0 }}
    transition={{ duration: 0.6 }}
  >
    {/* Mobile / Tablet view */}
    <span className="block md:hidden">
      <span className="block">INNOVATE</span>
      <span className="inline-flex items-center justify-center whitespace-nowrap gap-[0.5ch]
                      before:content-['•'] after:content-['•']">
        INSPIRE
      </span>
      <span className="block">IMPACT</span>
    </span>

    {/* Desktop view */}
    <span className="hidden md:inline-flex items-center gap-2">
      <span>INNOVATE</span>
      <span>•</span>
      <span>INSPIRE</span>
      <span>•</span>
      <span>IMPACT</span>
    </span>
  </motion.h1>
</AnimatePresence>

      </motion.div>

      {/* Floating Logo Right */}
      <motion.img
  src="/iei_logo_main.png"
  alt="Floating IEI Logo"
  className="
    w-20 h-20 md:w-56 md:h-56
    rounded-full
    absolute bottom-0 md:top-48 md:right-16 md:-translate-y-1/2
    mx-auto
    overflow-hidden
  "
  initial={{ x: 200, opacity: 0 }}          // start off-screen right
  animate={{ x: 0, opacity: 1 }}            // slide into place
  transition={{ duration: 1, ease: "easeOut" }} // smooth effect
  variants={floatVariants}                  // keep the floating loop
  whileInView="animate"
/>

    </section>
  );
};

export default HeroSection;
