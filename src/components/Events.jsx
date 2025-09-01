import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { fadeIn } from "../Varients.jsx";
import axios from "axios";
import playClickSound from "../utils/ClickSound.js";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Events = () => {
  const [events, setEvents] = useState({ technical: [], non_Technical: [] });

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const response = await axios.get("https://imeetserver2k25.onrender.com/allEvents");
        if (response.data.data && Array.isArray(response.data.data)) {
          const categorizedEvents = {
            technical: response.data.data.filter(
              (event) => event.catagory === "technical"
            ),
            non_Technical: response.data.data.filter(
              (event) => event.catagory === "non_technical"
            ),
          };
          setEvents(categorizedEvents);
        }
      } catch (error) {
        console.error("Error invoking function for all events", error);
      }
    };

    fetchAllEvents();
  }, []);

  const EventCarousel = ({ title, events }) => {
    const settings = {
      dots: true,
      infinite: true,
      speed: 600,
      centerMode: true,
      centerPadding: "50px",
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3500,
      responsive: [
        { breakpoint: 1280, settings: { slidesToShow: 3, centerPadding: "30px" } },
        { breakpoint: 1024, settings: { slidesToShow: 2, centerPadding: "20px" } },
        { breakpoint: 640, settings: { slidesToShow: 1, centerPadding: "10px" } },
      ],
    };

    return (
      <div className="mb-20 z-50">
        <h2 className="text-4xl font-extrabold text-center bg-white bg-clip-text text-transparent mb-12 animate-gradient drop-shadow-xl tracking-wide">
          {title}
        </h2>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
          <Slider {...settings}>
            {events.map((event) => (
              <div key={event.event_id} className="p-4">
                <Link to={`/events/${event.event_id}`}>
                  <Motion.div
                    variants={fadeIn("up", 0.2)}
                    initial="hidden"
                    whileInView="show"
                    whileHover={{ scale: 1.07, rotate: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    viewport={{ once: false, amount: 0.6 }}
                    className="relative group rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md bg-white/5 border border-white/20 hover:border-fuchsia-400/70 transition-all duration-500 aspect-[4/5] flex flex-col"
                  >
                    {/* Event Image */}
                    <img
                      src={event.event_img_url}
                      alt={event.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onClick={playClickSound}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                    {/* Title */}
                    <div className="absolute bottom-0 w-full p-5">
                      <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg group-hover:text-fuchsia-300 transition-all duration-300 tracking-wide">
                        {event.name}
                      </h3>
                    </div>

                    {/* Neon Border */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 rounded-3xl border-2 border-fuchsia-400/60 animate-pulse shadow-[0_0_25px_6px_rgba(236,72,153,0.5)]"></div>
                    </div>
                  </Motion.div>
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen pt-20 relative text-white py-12 px-4 sm:px-8 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-[linear-gradient(270deg,#1a0029,#250041,#0d0014)] bg-[length:400%_400%] animate-movingGradient"></div>

      {/* Floating Glowing Blobs */}
      <div className="absolute top-10 left-[-15rem] w-[28rem] h-[28rem] bg-fuchsia-600/40 rounded-full blur-3xl animate-leftBlob"></div>

      <div className="absolute top-1/3 right-[-10rem] w-[34rem] h-[34rem] bg-amber-400/30 rounded-full blur-3xl animate-rightBlob"></div>

      <div className="absolute bottom-10 left-[-18rem] w-[28rem] h-[28rem] bg-pink-400/35 rounded-full blur-3xl animate-bottomBlob"></div>

      {/* Foreground content */}
      <div className="relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl sm:text-5xl font-extrabold bg-white bg-clip-text text-transparent animate-gradient font-bebas drop-shadow-2xl tracking-wide">
            Our Events
          </h1>
          <p className="bg-white bg-clip-text text-transparent mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            These events are designed to challenge participants, boost
            problem-solving skills, and give hands-on exposure to real-world
            tech innovations.
          </p>
        </div>

        <EventCarousel title="⚡ Technical Events" events={events.technical} />
        <EventCarousel title="🎭 Non-Technical Events" events={events.non_Technical} />
      </div>
    </div>
  );
};

export default Events;
