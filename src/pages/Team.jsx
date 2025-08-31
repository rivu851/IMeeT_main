import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Teams = () => {
  const [teamsData, setTeamsData] = useState({});
  const [selectedTeam, setSelectedTeam] = useState("");
  const [expandedCard, setExpandedCard] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      let data;
      try {
        const response = await axios.get("http://localhost:3412/team-details");
        data = response.data.data;
      } catch (error) {
        console.error("Error fetching team data:", error);
        return; 
      }
  
      // Grouping together the roles
      const groupedData = data.reduce((acc, member) => {
        const group = member.role.toUpperCase() || "OTHERS";
        if (!acc[group]) acc[group] = [];
        acc[group].push({
          name: member.name,
          role: member.role,
          insta: member.insta,
          linkedin: member.linkedin,
          github: member.github,
          img_url: member.img_url,
          priority: member.priority,
        });
        return acc;
      }, {});
  
      // priority listing 
      Object.values(groupedData).forEach(group =>
        group.sort((a, b) => a.priority - b.priority)
      );
  
      // Tech team shobar age
      const priorityOrder = ["TECH TEAM", "GRAPHICS TEAM"];
      const sortedGroupedData = {};
      priorityOrder.forEach(role => {
        if (groupedData[role]) {
          sortedGroupedData[role] = groupedData[role];
          delete groupedData[role]; // remove from original
        }
      });
  
      Object.keys(groupedData)
        .sort()
        .forEach(role => {
          sortedGroupedData[role] = groupedData[role];
        });
  
      setTeamsData(sortedGroupedData);
      setSelectedTeam(Object.keys(sortedGroupedData)[0]);
    };
  
    fetchTeamData();
  }, []);
  

  const handleCardClick = (index) => {
    if (expandedCard === index) {
      setExpandedCard(null);
    } else {
      setExpandedCard(index);
    }
  };

  // Random rotation for postcard effect
  const getRandomRotation = (index) => {
    const rotations = [-2, -1, 0, 1, 2];
    return rotations[index % rotations.length];
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    }),
    expanded: {
      zIndex: 40,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-[#0a0a18] bg-noise text-white pt-24 pb-16 px-4 overflow-hidden" ref={containerRef}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-white">
          Meet Our Amazing Team
        </h2>
        
        {/* Improved Team Filter */}
        <div className="sticky top-4 z-30 mb-12 flex justify-center">
          <div className="bg-black/40 backdrop-blur-lg p-1.5 rounded-xl shadow-xl border border-purple-500/30 flex flex-wrap justify-center gap-1">
            {Object.keys(teamsData).map((team) => (
              <motion.button
                key={team}
                onClick={() => {
                  setSelectedTeam(team);
                  setExpandedCard(null);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                  selectedTeam === team
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedTeam === team && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg"
                    layoutId="activeTeamTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{team}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.h3 
          className="text-center text-xl mb-10 text-purple-300 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={selectedTeam}
          transition={{ duration: 0.5 }}
        >
          {selectedTeam}
        </motion.h3>

        {/* Member Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4"
          layout
        >
          <AnimatePresence mode="wait">
            {teamsData[selectedTeam]?.map((member, i) => (
              <motion.div
                key={`${selectedTeam}-${i}`}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={expandedCard === i ? ["visible", "expanded"] : "visible"}
                exit="exit"
                layoutId={`card-${selectedTeam}-${i}`}
                style={{ 
                  rotate: expandedCard === i ? 0 : getRandomRotation(i),
                  zIndex: expandedCard === i ? 20 : 10 
                }}
                className={`${
                  expandedCard === i 
                    ? "fixed inset-0 m-auto w-4/5 h-4/5 max-w-2xl max-h-[80vh] pt-16" 
                    : "relative w-full h-full "
                }`}
                onClick={() => handleCardClick(i)}
              >
                <div className="w-full h-full perspective-1000 cursor-pointer">
                  <div className="relative w-full h-full">
                    {/* Member Card */}
                    <div 
                      className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden"
                      style={{ aspectRatio: "4/3" }}
                    >
                      {/* Member Image */}
                      <div className="relative w-full h-full">
                        <img
                          src={member.img_url || "/api/placeholder/400/320"}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Card Border and Elements */}
                        <div className="absolute inset-0 border-8 border-white pointer-events-none">
                          {/*<div className="absolute top-3 right-3 bg-purple-600 px-3 py-1 text-white text-sm font-bold rounded-sm rotate-3 shadow-md">
                            {member.role}
                          </div>
                          
                          {/* Team Badge 
                          <div className="absolute top-3 left-3 w-12 h-16 bg-gradient-to-br from-indigo-400 to-purple-600 border-2 border-white rounded-sm overflow-hidden flex items-center justify-center shadow-md">
                            <div className="text-white text-xs font-bold rotate-90">ImeeT Team</div>
                            <div className="absolute top-0 right-0 left-0" style={{height: '25%'}}>
                              <div className="w-full h-full bg-white/20 border-b border-white/50"></div>
                            </div>
                          </div>*/}
                          
                          {/* Badge/Stamp */}
                          <div className="absolute top-6 left-20 w-16 h-16 rounded-full border border-gray-400 border-dashed opacity-30 flex items-center justify-center">
                            <div className="rotate-12 text-gray-400 text-xs font-mono">{selectedTeam}</div>
                          </div>
                          
                          {/* Member Name */}
                          <div className="absolute left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm p-4 text-white">
                            <h3 className="font-bold text-lg">{member.name}</h3>
                            
                            {expandedCard === i && (
                              <motion.div 
                                className="flex mt-3 gap-4 justify-center "
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <a href={member.insta} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 text-xl" onClick={e => e.stopPropagation()}>
                                  <FaInstagram />
                                </a>
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xl" onClick={e => e.stopPropagation()}>
                                  <FaLinkedin />
                                </a>
                                <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white text-xl" onClick={e => e.stopPropagation()}>
                                  <FaGithub />
                                </a>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {expandedCard === i && (
                  <motion.button
                    className="fixed top-24 right-4 z-50 bg-white/80 hover:bg-white text-red-600 rounded-full p-3 shadow-lg backdrop-blur-sm "
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
          
          {expandedCard !== null && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-10 "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedCard(null)}
            />
          )}
        </motion.div>
      </div>
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-indigo-600 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
};

export default Teams;