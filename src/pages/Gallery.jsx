import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const years = ["2022", "2024"];

export default function AGallery() {
  const [year, setYear] = useState("2024");
  const [expandedCard, setExpandedCard] = useState(null);
  const [isFlipped, setIsFlipped] = useState({});
  const [images, setImages] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get(`https://imeetserver2k25.onrender.com/gallery/${year}`);
        setImages(res.data.images || []);
      } catch (err) {
        console.error("Failed to fetch images:", err);
        setImages([]);
      }
    };
    fetchImages();
  }, [year]);

  const handleCardClick = (index) => {
    setExpandedCard(index === expandedCard ? null : index);
  };

  const flipCard = (index, e) => {
    e.stopPropagation();
    setIsFlipped((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getRandomRotation = (index) => {
    const rotations = [-2, -1, 0, 1, 2];
    return rotations[index % rotations.length];
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
    expanded: {
      zIndex: 40,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div
      className="min-h-screen bg-[#0a0a18] bg-noise text-white pt-16 pb-16 px-4 overflow-x-hidden relative"
      ref={containerRef}
    >
      {/* Glowing Animated Blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(270deg,#1a0029,#250041,#0d0014)] bg-[length:400%_400%] animate-movingGradient"></div>

      {/* Floating Glowing Blobs */}
      <div className="fixed top-10 left-[-15rem] w-[28rem] h-[28rem] bg-fuchsia-600/40 rounded-full blur-3xl animate-leftBlob pointer-events-none"></div>

      <div className="fixed top-1/3 right-[-10rem] w-[34rem] h-[34rem] bg-amber-400/30 rounded-full blur-3xl animate-rightBlob pointer-events-none"></div>

      <div className="fixed bottom-10 left-[-18rem] w-[28rem] h-[28rem] bg-pink-400/35 rounded-full blur-3xl animate-bottomBlob pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Year Filter */}
        <div className="sticky top-4 z-30 mb-8 flex justify-center">
          <div className="bg-black/30 backdrop-blur-md p-2 rounded-full shadow-xl border border-purple-500/20">
            {years.map((y) => (
              <motion.button
                key={y}
                onClick={() => {
                  setYear(y);
                  setExpandedCard(null);
                  setIsFlipped({});
                }}
                className={`px-6 py-3 rounded-full font-bold text-lg transition-all mx-1 relative overflow-hidden ${
                  year === y
                    ? "bg-gradient-to-r from-purple-700 to-indigo-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {year === y && (
                  <motion.div
                    className="absolute inset-0 bg-purple-500/20"
                    layoutId="activeYear"
                    transition={{ type: "spring", bounce: 0.2 }}
                  />
                )}
                <span className="relative z-10">{y}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12 text-transparent bg-clip-text bg-white">
          Remnants of the Past
        </h2>
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12 text-transparent bg-clip-text bg-white">
          ImeeT Memories: {year} Edition
        </h2>

        {/* Postcard Grid */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4" layout>
          <AnimatePresence mode="wait">
            {images.map((imgUrl, i) => (
              <motion.div
                key={`${year}-${i}`}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={expandedCard === i ? ["visible", "expanded"] : "visible"}
                exit="exit"
                layoutId={`card-${year}-${i}`}
                style={{
                  rotate: expandedCard === i ? 0 : getRandomRotation(i),
                  zIndex: expandedCard === i ? 20 : 10,
                }}
                className={`${
                  expandedCard === i
                    ? "fixed inset-0 m-auto w-4/5 h-4/5 max-w-2xl max-h-[80vh] pt-14"
                    : "relative w-full h-full"
                }`}
                onClick={() => handleCardClick(i)}
              >
                <div className="w-full h-full perspective-1000 cursor-pointer">
                  <div
                    className={`flip-card-inner relative w-full h-full transition-transform duration-700 transform-style-3d ${
                      isFlipped[i] ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front */}
                    <div
                      className="flip-card-front w-full h-full bg-white rounded-lg shadow-xl overflow-hidden transform-style-3d backface-hidden"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <div className="relative w-full h-full">
                        <img
                          src={imgUrl}
                          alt={`Gallery ${year} ${i}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 border-8 border-white pointer-events-none">
                          <div className="absolute top-6 left-20 w-16 h-16 rounded-full border border-gray-400 border-dashed opacity-30 flex items-center justify-center">
                            <div className="rotate-12 text-gray-400 text-[8px] font-mono">{year}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back */}
                    <div
                      className="flip-card-back absolute w-full h-full bg-cream bg-[url('/vintage-paper.jpg')] bg-cover text-gray-800 rounded-lg shadow-xl p-6 transform rotate-y-180 backface-hidden flex flex-col"
                      style={{ aspectRatio: "4/3" }}
                    ></div>
                  </div>
                </div>

                {/* Flip button */}
                {expandedCard === i && (
                  <motion.button
                    className="absolute bottom-4 right-4 z-50 bg-white/80 hover:bg-white text-purple-800 rounded-full p-3 shadow-lg backdrop-blur-sm"
                    onClick={(e) => flipCard(i, e)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.button>
                )}

                {/* Close button */}
                {expandedCard === i && (
                  <motion.button
                    className="fixed top-24 right-4 z-50 bg-white/80 hover:bg-white text-red-600 rounded-full p-3 shadow-lg backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCard(null);
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Overlay when card is expanded */}
          {expandedCard !== null && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedCard(null)}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
