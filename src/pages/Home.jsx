import React, { useEffect, useState } from 'react'
import About from "../components/About.jsx"
import Events from "../components/Events.jsx"
import HeroSection from '../components/HeroSection.jsx'
import Stripe from "../assets/Stripe-img.png"
import { motion } from "framer-motion"

const Home = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Smooth scrolling speed
  const duration = screenWidth < 640 ? 25 : screenWidth < 1024 ? 40 : 65;

  return (
    <div>
      <HeroSection />
      <About />

      {/* Stripe animation */}
      <div className="w-full h-[85px] overflow-hidden bg-transparent">
        <motion.div
          className="flex w-[200%] h-full"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: duration,
            ease: "linear"
          }}
        >
          {/* Each image is FULL width now */}
          <img src={Stripe} alt="stripe" className="w-full h-full object-cover" />
          <img src={Stripe} alt="stripe" className="w-full h-full object-cover" />
        </motion.div>
      </div>

      <Events />
    </div>
  )
}

export default Home
