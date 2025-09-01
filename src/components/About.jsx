import { useRef } from "react";
import { useInView, motion as Motion } from "framer-motion";
import { fadeIn } from "../Varients";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link } from "react-router-dom";
import about from "../assets/About-img.png";
import playClickSound from "../utils/ClickSound.js";

const About = () => {
  const imgRef = useRef(null);
  const isInView = useInView(imgRef, { once: false, amount: 0.5 }); 
  // 👆 triggers when 50% visible

  return (
    <section className="min-h-screen pt-24 pb-16 px-6 md:px-12 bg-[#0a0a0f] text-white flex items-center justify-center relative overflow-hidden">
      
      {/* === Background Moving 3D Squares === */}
      <Motion.div
        initial={{ rotate: 0, x: 0, y: 0, opacity: 0.2 }}
        animate={{
          rotate: [0, 180, 360],
          x: [0, 300, 0],
          y: [0, 100, 0],
          opacity: [0.2, 0.35, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-fuchsia-500 to-purple-700 blur-md"
        style={{ transformStyle: "preserve-3d" }}
      />

      <Motion.div
        initial={{ rotate: 0, x: 0, y: 0, opacity: 0.3 }}
        animate={{
          rotate: [0, -180, -360],
          x: [0, 100, 0],
          y: [0, -50, 0],
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-20 w-52 h-52 bg-gradient-to-tr from-pink-400 via-pink-500 to-indigo-500 blur-2xl shadow-[0_0_80px_40px_rgba(236,72,153,0.5)]"
        style={{ transformStyle: "preserve-3d" }}
      />

      <Motion.div
        initial={{ rotate: 0, x: -50, y: 150, opacity: 0.3 }}
        animate={{
          rotate: [0, 360, 720],
          x: [-50, 150, -50],
          y: [150, 50, 150],
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.35, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-64 h-64 bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-400 opacity-90 blur-2xl shadow-[0_0_60px_30px_rgba(139,92,246,0.6)]"
        style={{ transformStyle: "preserve-3d" }}
      />

      {/* === Foreground Content === */}
      <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-16 relative z-10">
        
        {/* LEFT: Text Section */}
        <div className="lg:w-1/2 mb-20 flex flex-col items-center lg:items-start">
          {/* Heading */}
          <Motion.h1
            variants={fadeIn("up", 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight text-center lg:text-left relative"
          >
            About{" "}
            <span className="text-transparent bg-clip-text bg-amber-500">I</span>
            <span className="bg-white bg-clip-text text-transparent">mee</span>
            <span className="text-transparent bg-clip-text bg-amber-500">T</span>
            <span className="block mt-2 w-24 h-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-400 mx-auto lg:mx-0"></span>
          </Motion.h1>

          {/* Paragraphs */}
          <Motion.p
            variants={fadeIn("up", 0.2)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.5 }}
            className="text-lg md:text-xl leading-relaxed mt-14 text-gray-300 text-center lg:text-left max-w-xl"
          >
            ImeeT is the annual flagship festival of the IT department at RCCIIT,
            celebrating <span className="text-white font-semibold">innovation, creativity</span>, 
            and the power of technology. It’s a platform where students 
            showcase their talents and push boundaries through events like{" "}
            <span className="text-fuchsia-400 font-semibold">Nerd Nirvana</span>, 
            <span className="text-fuchsia-400 font-semibold"> Code Conquest</span>, 
            and <span className="text-fuchsia-400 font-semibold"> Pixel Perfect</span>.
          </Motion.p>

          <Motion.p
            variants={fadeIn("up", 0.3)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.5 }}
            className="text-lg md:text-xl leading-relaxed mb-10 text-gray-300 text-center lg:text-left max-w-xl mt-8"
          >
            Join us at <span className="text-fuchsia-400 font-semibold">ImeeT</span>, 
            where technology meets creativity to create an unforgettable festival experience.
          </Motion.p>

          {/* Button */}
          <Motion.div
            variants={fadeIn("up", 0.4)}
            initial="hidden"
            whileInView="show"
            className="flex justify-center lg:justify-start"
          >
            <Link to="/gallery" onClick={playClickSound}>
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative text-lg md:text-xl font-semibold py-3 px-8 rounded-full overflow-hidden
                  bg-black border border-gray-300 text-white
                  shadow-[0_0_20px_rgba(192,192,192,0.7)] transition-all mt-8 duration-300
                  group"
              >
                <span className="relative z-10 flex items-center transition-all duration-300 group-hover:tracking-wider">
                  Explore <FaArrowRightLong className="ml-3" size={20} />
                </span>
                <span className="absolute inset-0 rounded-full border-2 border-transparent
                  bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200
                  opacity-40 group-hover:animate-[spin_6s_linear_infinite]"></span>
              </Motion.button>
            </Link>
          </Motion.div>
        </div>

        {/* RIGHT: Image Section */}
        <Motion.div
          variants={fadeIn("left", 0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.4 }}
          className="lg:w-1/2 flex justify-center"
        >
          <Motion.div
            ref={imgRef}
            initial={{ scale: 0.85 }}
            animate={{ scale: isInView ? 1.1 : 0.85 }} // 👈 controlled by hook
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="relative rounded-3xl overflow-hidden md:mt-8 shadow-2xl bg-gradient-to-br from-purple-900/40 to-black/30 p-4"
          >
            <img
              src={about}
              alt="ImeeT2K24"
              className="rounded-2xl w-full max-w-lg h-auto object-contain"
            />
          </Motion.div>
        </Motion.div>
      </div>
    </section>
  );
};

export default About;
