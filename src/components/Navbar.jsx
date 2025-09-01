import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import playClickSound, { playDropdownSound, playDropdownCloseSound } from "../utils/ClickSound.js";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const { isAuthenticated, login, logout, user, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.email || !user?.token) return;

    let retryCount = 0;
    const maxRetries = 15;
    const retryDelay = 3000;

    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:3412/participant-details", {
          params: { email: user.email },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        setUserData(response.data.data);
      } catch (error) {
        if (error.response?.status === 404 && retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchUserData, retryDelay);
        } else {
          console.error("Error fetching user data:", error.response?.data || error.message);
        }
      }
    };

    const initialTimeout = setTimeout(fetchUserData, retryDelay);
    return () => clearTimeout(initialTimeout);
  }, [isAuthenticated, user]);

  const profileData = { ...user, ...userData };

  const toggleMenu = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    willOpen ? playDropdownSound() : playDropdownCloseSound();
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/events", label: "Events" },
    { path: "/team", label: "Team" },
    { path: "/gallery", label: "Gallery" },
  ];

  const handleAuth = () => {
    isAuthenticated ? logout() : login();
  };

  return (
    <div className="fixed w-full z-50">
      {/* Glassy background */}
      <div
        className={`mx-3 px-5 py-3 rounded-2xl flex items-center justify-between transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-black/20 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            : "bg-transparent"
        }`}
      >
        {/* LEFT: Logo */}
         <div className="flex items-center pl-1 lg:pl-3">
  <img
    src="/imeet_nobg.png"
    alt="IMeeT Logo"
    className="hidden lg:block w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
  />
  <span className="ml-1 lg:ml-2 text-xl lg:text-2xl font-bold tracking-wide">
    <span className="bg-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]">I</span>
    <span className="bg-white bg-clip-text text-transparent">mee</span>
    <span className="bg-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]">T 2025</span>
  </span>
</div>

        {/* NAV */}
        <nav className="fixed top-4 right-4 z-50 transition-all duration-500 rounded-full bg-gradient-to-r from-purple-900/70 to-indigo-900/70 border border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-end">
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-2 px-6 py-3">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-3 py-2 group"
                  onClick={playClickSound}
                >
                  <span
                    className={`relative z-10 text-sm font-medium transition-all duration-300 ${
                      isActive(item.path)
                        ? "text-white"
                        : "text-purple-200 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`absolute inset-0 rounded-full transition-all duration-300 ${
                      isActive(item.path)
                        ? "bg-purple-600/40 backdrop-blur-md border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                        : "bg-transparent group-hover:bg-yellow-400/50 group-hover:shadow-[0_0_15px_rgba(255,255,0,0.8)]"
                    }`}
                  ></span>
                </Link>
              ))}

              {/* Auth Button */}
              <button
                onClick={() => {
                  playClickSound();
                  handleAuth();
                }}
                className="ml-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.5)] hover:bg-yellow-400 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,0,0.8)]"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : isAuthenticated ? (
                  "Log out"
                ) : (
                  "Log in"
                )}
              </button>

              {/* Profile Avatar */}
              {isAuthenticated && (
                <Link to="/profile" onClick={playClickSound}>
                  <div className="ml-2 w-9 h-9 rounded-full overflow-hidden border-2 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                    <img
                      src={profileData?.image_url || user?.picture}
                      alt={profileData?.name || user?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              )}
            </div>

            {/* Hamburger (Mobile) */}
            <div className="md:hidden p-3">
              <button onClick={toggleMenu} className="p-2 rounded-full focus:outline-none" aria-label="Toggle menu">
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
                  <span className={`block w-6 h-0.5 bg-white mb-1.5 transition-all ${isOpen ? "translate-y-2 rotate-45" : ""}`}></span>
                  <span className={`block w-6 h-0.5 bg-white mb-1.5 transition-all ${isOpen ? "opacity-0" : ""}`}></span>
                  <span className={`block w-6 h-0.5 bg-white transition-all ${isOpen ? "-translate-y-2 -rotate-45" : ""}`}></span>
                </motion.div>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden absolute top-16 right-0 w-56 bg-gradient-to-b from-purple-900/95 to-indigo-900/95 backdrop-blur-lg border border-purple-700/30 shadow-[0_0_15px_rgba(168,85,247,0.4)] rounded-3xl overflow-hidden"
              >
                <div className="flex flex-col px-4 py-4 space-y-2">
                  {navLinks.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        isActive(item.path)
                          ? "text-white bg-purple-600/40 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                          : "text-purple-200 hover:text-white hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(255,255,0,0.8)]"
                      }`}
                      onClick={() => {
                        playClickSound();
                        setIsOpen(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {/* Profile in Mobile */}
                  {isAuthenticated && (
                    <Link
                      to="/profile"
                      onClick={() => {
                        playClickSound();
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center p-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-400 mr-2 shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                          <img
                            src={profileData.image_url || user?.picture}
                            alt={profileData?.name || user?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-white truncate">{profileData?.name || user?.name || "User"}</span>
                      </div>
                    </Link>
                  )}

                  {/* Auth Button Mobile */}
                  <button
                    onClick={() => {
                      playClickSound();
                      handleAuth();
                    }}
                    className="mt-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.6)] hover:bg-yellow-400 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,0,0.8)]"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : isAuthenticated ? (
                      "Log out"
                    ) : (
                      "Log in"
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
