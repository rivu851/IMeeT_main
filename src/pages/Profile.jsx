import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import EditProfile from '../components/EditProfile';
import axios from 'axios';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { Menu, X } from "lucide-react";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import playClickSound from "../utils/ClickSound.js";

const FloatingBox = ({ delay, gradient, size, pos }) => {
  return (
    <motion.div
      initial={{ x: pos.x, y: pos.y, opacity: 0.15, scale: 1 }}
      animate={{
        x: [pos.x, pos.x + 60, pos.x],
        y: [pos.y, pos.y - 80, pos.y],
        rotate: [0, 180, 360],
        opacity: [0.2, 0.35, 0.2],
        scale: [1, 1.2, 1]
      }}
      transition={{ duration: 20, delay, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute ${size} ${gradient} opacity-70 blur-2xl rounded-3xl`}
      style={{ zIndex: 0 }}
    />
  );
};

const Profile = () => {
  const { isAuthenticated, user, isLoading, updateUser } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [eventsRegistered, setEventsRegistered] = useState([]);
  const [teamsData, setTeamsData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const infoRef = useRef(null);
  const eventsRef = useRef(null);
  const teamsRef = useRef(null);

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setSidebarOpen(false);
  };

  const eventSliderSettings = {
    dots: true,
    infinite: (eventsRegistered?.length || 0) > 1,
    speed: 500,
    slidesToShow: Math.min(eventsRegistered?.length || 0, 2),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };

  if (!isAuthenticated) return <Navigate to="/" />;

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    const userToken = user?.token;
    if (!userToken) return;

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3412/participant-details`, {
          params: { email: user.email },
          headers: { Authorization: `Bearer ${userToken}` }
        });
        setUserData(response.data.data);

        const eventRegistrations = await axios.get(
          'http://localhost:3412/get_user_event_names',
          {
            params: { user_uuid: response.data.data.user_id },
            headers: { Authorization: `Bearer ${userToken}` }
          }
        );
        setEventsRegistered(eventRegistrations.data.data || []);

        const fetchUserTeams = await axios.get(
          'http://localhost:3412/get_user_teams',
          {
            params: { user_uuid: response.data.data.user_id },
            headers: { Authorization: `Bearer ${userToken}` }
          }
        );
        const rawData = fetchUserTeams.data.data;
        const flatData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData || [];
        const grouped = flatData.reduce((acc, item) => {
          if (!acc[item.team_name]) {
            acc[item.team_name] = {
              eventName: item.name,
              members: []
            };
          }
          acc[item.team_name].members.push(item);
          return acc;
        }, {});
        setTeamsData(grouped);
      } catch (error) {
        console.error('Error fetching user data:', error.response?.data || error.message);
      }
    };
    fetchUserData();
  }, [isAuthenticated, user]);

  const profileData = { ...user, ...userData };

  const handleUpdateProfile = async (updatedData) => {
    const success = await updateUser(updatedData);
    if (success) setIsEditOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen  flex bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white overflow-hidden">
      
      {/* Background Floating Boxes */}
      <FloatingBox delay={0} gradient="bg-gradient-to-tr from-pink-500 to-indigo-600" size="w-64 h-64" pos={{x: 200, y: 200}} />
      <FloatingBox delay={8} gradient="bg-gradient-to-tr from-purple-500 to-blue-600" size="w-52 h-52" pos={{x: -150, y: 300}} />
      <FloatingBox delay={15} gradient="bg-gradient-to-tr from-indigo-500 to-purple-700" size="w-72 h-72" pos={{x: 100, y: -100}} />

      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 mt-12 bg-purple-700/40 rounded-lg border border-purple-500/50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white/5 backdrop-blur-md border-r border-purple-400/20 flex flex-col p-6 z-40 transform transition-transform duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        <div className="flex flex-col items-center mt-16 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg">
            <img
              src={profileData?.image_url || user?.picture || "/default-avatar.png"}
              alt={profileData?.name || 'User'}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mt-4 text-xl font-bold">{profileData?.name}</h2>
          <p className="text-purple-300 text-sm">{profileData?.email}</p>
        </div>

        <nav className="mt-8 flex flex-col gap-3">
          <button onClick={() => {scrollToRef(infoRef); playClickSound();}} className="px-4 py-2 rounded-lg bg-purple-700/30 hover:bg-purple-700/50 transition">
            Personal Info
          </button>
          <button onClick={() => {scrollToRef(eventsRef); playClickSound();}} className="px-4 py-2 rounded-lg bg-purple-700/30 hover:bg-purple-700/50 transition">
            Events
          </button>
          <button onClick={() => {scrollToRef(teamsRef); playClickSound();}} className="px-4 py-2 rounded-lg bg-purple-700/30 hover:bg-purple-700/50 transition">
            Teams
          </button>
          <button onClick={() => {setIsEditOpen(true); playClickSound();}} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition">
            Edit Profile
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10 space-y-10">
        
        {/* Personal Info */}
        <section ref={infoRef} className="backdrop-blur-md mt-12 bg-white/5 border border-purple-400/20 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div><p className="text-sm text-purple-200">Username</p><p>{profileData?.username || profileData?.name}</p></div>
            <div><p className="text-sm text-purple-200">Email</p><p>{profileData?.email}</p></div>
            <div><p className="text-sm text-purple-200">Department</p><p>{profileData?.dept || 'Not specified'}</p></div>
            <div><p className="text-sm text-purple-200">Class Roll</p><p>{profileData?.college_roll ? profileData.college_roll.toUpperCase() : 'Not specified'}</p></div>
            <div><p className="text-sm text-purple-200">Phone</p><p>{profileData?.contact_no || 'Not specified'}</p></div>
          </div>
        </section>

        {/* Registered Events */}
        <section ref={eventsRef} className="backdrop-blur-md bg-white/5 border border-purple-400/20 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold text-purple-300 mb-4">Registered Events</h2>
          {Array.isArray(eventsRegistered) && eventsRegistered.length > 1 ? (
            <Slider {...eventSliderSettings} className="event-slider">
              {eventsRegistered.map((event) => (
                <div key={event.event_id} className="px-2">
                  <Link to={`/events/${event.event_id}`}>
                    <div className="relative group overflow-hidden rounded-xl aspect-[4/5] max-w-sm cursor-pointer border border-purple-500/30">
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900 to-transparent opacity-70 z-10"></div>
                      <img
                        src={event.event_img_url || "/default-event.png"}
                        alt={event.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <h3 className="text-lg font-bold mb-1">{event.name}</h3>
                        <p className="text-purple-200 text-xs">
                          {event.date
                            ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'Date TBA'}
                        </p>
                        <p className="text-purple-300 text-xs">{event.start_time} - {event.end_time}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </Slider>
          ) : eventsRegistered.length === 1 ? (
            <div className="flex justify-center px-4">
              <div className="relative group overflow-hidden rounded-xl h-[400px] w-full max-w-xs cursor-pointer border border-purple-500/30">
                <Link to={`/events/${eventsRegistered[0].event_id}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900 to-transparent opacity-70 z-10" />
                  <img
                    src={eventsRegistered[0].event_img_url || "/default-event.png"}
                    alt={eventsRegistered[0].name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <h3 className="text-lg font-bold mb-1">{eventsRegistered[0].name}</h3>
                    <p className="text-purple-200 text-xs">
                      {eventsRegistered[0].date
                        ? new Date(eventsRegistered[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Date TBA'}
                    </p>
                    <p className="text-purple-300 text-xs">{eventsRegistered[0].start_time} - {eventsRegistered[0].end_time}</p>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-purple-200">No events registered yet.</p>
          )}
        </section>

        {/* Teams Section */}
        {teamsData && Object.keys(teamsData).length > 0 && (
          <section ref={teamsRef} className="backdrop-blur-md bg-white/5 border border-purple-400/20 p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Your Teams</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(teamsData).map(([teamName, teamInfo]) => (
                <div key={teamName} className="p-4 rounded-xl bg-gray-900/40 border border-purple-400/20 hover:bg-gray-900/60 transition">
                  <h3 className="text-lg font-bold text-purple-200 mb-2">{teamName}</h3>
                  <p className="text-sm text-purple-400 mb-3">{teamInfo.eventName}</p>
                  <ul className="space-y-1 pl-4 list-disc text-sm text-purple-100">
                    {teamInfo.members.map((member, idx) => (
                      <li key={idx}>
                        {member.member_name} ({member.college_roll}){' '}
                        {member.is_current_user && <span className="text-purple-400">(You)</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {isEditOpen && (
        <EditProfile
          user={profileData}
          onClose={() => setIsEditOpen(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
};

export default Profile;
