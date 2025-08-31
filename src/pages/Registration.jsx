import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import RegitrationBg from "../assets/RegBg-img.png";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import confetti from "canvas-confetti";//explotion
import * as Tone from "tone";//sound
import playClickSound from "../utils/ClickSound.js";

const Registration = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState(null);
  const { event_id } = useParams();

  const [isContactMissing,setIsContactMissing] = useState(false);
  const [isUserInfoMissing,setUserInfoMissing] = useState(false);

  const [isRegistered, setIsRegistered] = useState(false);
  const [checkedRegistration, setCheckedRegistration] = useState(false);

  const [contactError, setContactError] = useState("");
  const [teamEvent, setTeamEvent] = useState(false);
  const [teamSize, setTeamSize] = useState(1); 
  const [emailErrors, setEmailErrors] = useState(Array(teamSize - 1).fill(""));
  const [isLoading, setIsLoading] = useState(false);

  //Explotion Sound
  const playExplosionCelebration = async () => {
    await Tone.start();
    
    const reverb = new Tone.Reverb({
      decay: 4,
      preDelay: 0.02
    }).toDestination();

    await reverb.generate();

    // Base thump
    const boom = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.005,
        decay: 0.4,
        sustain: 0,
        release: 0.3
      }
    }).connect(reverb);

    // Sparkles
    const sparkleSynth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.1
      }
    }).connect(reverb);

    // Noise burst
    const noise = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0
      }
    }).connect(reverb);

    // Trigger firework layers
    boom.triggerAttackRelease("C2", "8n");
    noise.triggerAttackRelease("16n");

    // Melodic sparkle pops
    setTimeout(() => sparkleSynth.triggerAttackRelease("E6", "32n"), 100);
    setTimeout(() => sparkleSynth.triggerAttackRelease("G6", "32n"), 150);
    setTimeout(() => sparkleSynth.triggerAttackRelease("C7", "16n"), 250);
    {/*
    const now = Tone.now();

  for (let i = 0; i < 6; i++) {
    const time = now + Math.random() * 0.5; // Slight randomness
    const synth = new Tone.MembraneSynth().toDestination();

    synth.triggerAttackRelease("C2", "8n", time); // Deep thump

    // Optional: Add white noise burst for sparkle
    const noise = new Tone.Noise("white").start(time);
    const noiseEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.05,
    }).toDestination();
    noise.connect(noiseEnv);
    noiseEnv.triggerAttackRelease("8n", time);
  }*/}
  };
  //Explotion Effect
  const triggerConfetti = () => {
    const defaults = {
      origin: { y: 0.7 },
    };
  
    const fire = (particleRatio, opts) => {
      confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(200 * particleRatio),
      }));
    };
  
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
  
    fire(0.2, {
      spread: 60,
    });
  
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
  
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
  
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const [formData, setFormData] = useState({
    name: "",
    dept: "",
    college_roll: "",
    email: "",
    contact_no: "",
    team_name: "",
    team_member_email: [], // Array for team member email
  });

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      setTouched({
        name: true,
        dept: true,
        college_roll: true,
        contact_no: true,
        team_name: teamEvent,
      });
      return;
    }
    // click sound
    playClickSound();
    

  setIsLoading(true);
    await handleUpdatedInfo();
  
    if (!userData || !userData.user_id) {
      console.error("User ID is missing");
      return;
    }
  
    let requestData = {
      user_id: userData.user_id,
      event_id: event_id,
    };
    let teamCreated = false;
    let createdTeamName = "";
    try {
      // Only handle team creation if it's a team event
      if (teamEvent) {
        const teamResponse = await axios.post("http://localhost:3412/create-team", {
          event_id,
          team_name: formData.team_name,
        });
  
        if (teamResponse.data.success) {
          const team_id = teamResponse.data.team_id;
          teamCreated = true;
          createdTeamName = formData.team_name;
          requestData.team_id = team_id;
          requestData.team_name = formData.team_name;

          requestData.team_members = formData.team_member_email.map((email, index) => ({
            email,
          }));
        } else {
          console.error("Error creating team:", teamResponse.data.message);
          return;
        }
      }
  
      // Proceed with registration
      const response = await axios.post("http://localhost:3412/registrations", requestData);
  //POP UP
        if (response.data.success) {
          setShowPopup(true);
        
          setTimeout(() => {
            setShowPopup(false);
           
            triggerConfetti();
            playExplosionCelebration();
          }, 3000);
        
          setTimeout(() => {
            navigate(-1);
          }, 6000);
          setIsLoading(false);
      } else {
        console.log(response.data.message)
        console.error("Registration failed:", response.data.message);
        setIsLoading(false);
      }
    } catch (error) {
      if (teamCreated && createdTeamName) {
        try {
          await axios.post("http://localhost:3412/delete-team", { team_name: createdTeamName });
          console.log("Team deleted successfully due to registration failure.");
        } catch (deleteError) {
          console.error("Error deleting team:", deleteError);
        }
      }
      if (error.response && error.response.data && error.response.data.message) {
        console.error("Registration error:", error.response.data.message);
        alert(error.response.data.message); 
      } else {
        console.error("Unexpected error:", error);
        alert("Something went wrong. Please try again.");
      }
    }
  };
  // Fetch event details (team size & type)
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get("http://localhost:3412/eventDetails", {
          params: { event_id: event_id },
        });

        if (response.data.data.length > 0) {
          setTeamEvent(response.data.data[0].is_team);
          setTeamSize(response.data.data[0].team_size || 1);
        } else {
          console.error("No event found for this event_id");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };
    fetchEventDetails();
  }, [event_id]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await axios.get("http://localhost:3412/participant-details", {
            params: { email: user.email },
          });
          const res = response.data.data;
          setUserData(res);
          setIsContactMissing(!res?.contact_no);
          setUserInfoMissing(!res?.dept || !res?.college_roll)
          checkIfRegistered(res.user_id)
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [isAuthenticated, user]);

  const checkIfRegistered=async(e)=>{
    try{
      const response = await axios.get('http://localhost:3412/get_user_event_names',{
        params:{user_uuid: e}
      })

      const eventData = response.data.data;

      if (Array.isArray(eventData)) {
        const isRegistered = eventData.some(item => item.event_id.toString() === event_id.toString());
      }

      if (isRegistered) {
        setIsRegistered(true);
      } else {
        console.log('User is not registered for this event');
      }

      setCheckedRegistration(true);

    }catch(error){
      console.error('Error check if registered:-',error);
    }
  }

  useEffect(() => {
    setFormData({
      name: userData?.name || user?.name || "",
      dept: userData?.dept || "",
      college_roll: userData?.college_roll || "",
      email: user?.email || "",
      contact_no: userData?.contact_no || "",
      team_name: "",
      team_member_email: Array(teamSize - 1).fill(""),
    });
  }, [user, userData, teamSize]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    
  setFormData(prev => ({ ...prev, [name]: value }));
  if (requiredFields[name] && value.trim() && formErrors[name]) {
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  }

    if (name === "contact_no") {
      
      if (!/^\d*$/.test(value)) {
        setContactError("Only numbers are allowed");
      } else if (value.length > 0 && value.length < 10) {
        setContactError("Enter a valid 10-digit phone number");
      } else {
        setContactError(""); 
        setFormErrors(prev => ({ ...prev, [name]: "" }));
      }
    }
  
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  
  const handleUpdatedInfo = async () => {
    const contactValue = formData.contact_no.trim();
    const deptValue = formData.dept.trim();
    const rollValue = formData.college_roll.trim();
    const nameValue = formData.name;
    const isValidContact = contactValue.length === 10 && /^\d+$/.test(contactValue);
    const isValidDept = deptValue.length > 0;
    const isValidRoll = rollValue.length > 0;

    if ((isContactMissing && isValidContact) || (isUserInfoMissing && isValidDept && isValidRoll)) {
      try {
        await axios.post("http://localhost:3412/update-user", {
          email: user.email,
          name: nameValue,
          phone: contactValue,
          department:deptValue, 
          classRoll:rollValue
        });
        setIsContactMissing(false);
        setUserInfoMissing(false);
        console.log("User Info updated successfully");
      } catch (error) {
        console.error("Error updating contact number:", error);
      }
    }

  };

  const handleTeamMemberChange = (index, value, type) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (type === "team_member_email") {
      setEmailErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[index] = value && !emailRegex.test(value) ? "Invalid email address" : "";
        return newErrors;
      });
    }
  
    setFormData((prevData) => {
      const updatedMembers = [...prevData[type]];
      updatedMembers[index] = value;
      return { ...prevData, [type]: updatedMembers };
    });
  };
  //validate submission + required fields
  const [touched, setTouched] = useState({
    name: false,
    contact_no: false,
    dept: false, 
    college_roll: false,  
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    contact_no: "",
    dept: "", 
    college_roll: "",  
  });
  const requiredFields = {
    name: true,
    dept: true,          
    college_roll: true,  
    contact_no: true,
    //team_name: teamEvent, 
  };
  const handleBlur = (e) => {
  const { name, value } = e.target;
  
  // Mark field as touched
  setTouched(prev => ({ ...prev, [name]: true }));

  // Only validate if field is required
  if (requiredFields[name]) {
    if (!value.trim()) {
      setFormErrors(prev => ({ ...prev, [name]: "This field is required" }));
    } else if (name === "contact_no") {
      if (value.length !== 10) {
        setFormErrors(prev => ({ ...prev, [name]: "Enter a valid 10-digit number" }));
      } else {
        setFormErrors(prev => ({ ...prev, [name]: "" }));
      }
    } else {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  }
};
const validateForm = () => {
 
  const isNameValid = !!formData.name.trim();
  const isDeptValid = !!formData.dept.trim();
  const isRollValid = !!formData.college_roll.trim();
  const isContactValid = formData.contact_no.length === 10;
  //const isTeamNameValid = teamEvent ? !!formData.team_name.trim() : true;

  return isNameValid && isDeptValid && isRollValid && isContactValid  ;//&& isTeamNameValid
};
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 pt-20 pb-16"
      style={{
        backgroundImage: `url(${RegitrationBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/60 opacity-60 z-0"></div>
      <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-6 w-full max-w-lg text-white mx-4 sm:mx-0 relative overflow-hidden mt-4 z-0">
        <h1 className="text-5xl bg-gradient-to-r from-[#FFFFFF] to-[#FF7474] bg-clip-text text-transparent font-semibold text-center mb-6 pb-2">
          <span>Register Here !!!!</span>
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* User Details */}
          <div>
            <label className="block text-md mb-1">Your Name {requiredFields.name && <span className="text-red-500 text-xl">*</span>}</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur}
              className={`w-full px-3 py-2 bg-transparent border-b-4 ${
                formErrors.name ? "border-red-500" : "border-[#f4aaaa]"
              }`} />
              {touched.name && formErrors.name && (
              <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-md mb-1">Department {requiredFields.dept && <span className="text-red-500 text-xl">*</span>}</label>
            <input type="text" name="dept" value={formData.dept} onChange={handleChange} onBlur={handleBlur}
              className={`w-full px-3 py-2 bg-transparent border-b-4 ${
                touched.dept && formErrors.dept ? "border-red-500" : "border-[#f4aaaa]"
              }`}/>
              {touched.dept && formErrors.dept && (
                <p className="text-sm text-red-500 mt-1">{formErrors.dept}</p>
              )}
          </div>
          <div>
            <label className="block text-sm mb-1">College Roll Number {requiredFields.college_roll && <span className="text-red-500 text-xl">*</span>}</label>
            <input type="text" name="college_roll" value={formData.college_roll} onChange={handleChange} onBlur={handleBlur}
            className={`w-full px-3 py-2 bg-transparent border-b-4 ${
              touched.college_roll && formErrors.college_roll ? "border-red-500" : "border-[#f4aaaa]"
            }`} />
            {touched.college_roll && formErrors.college_roll && (
              <p className="text-sm text-red-500 mt-1">{formErrors.college_roll}</p>
            )}
          </div>
          <div>
            <label className="block text-md mb-1">Email ID</label>
            <input type="email" name="email" value={formData.email} readOnly className="w-full px-3 py-2 bg-transparent border-b-4 border-[#f4aaaa]" />
          </div>
          <div className="mb-4">
          {isContactMissing && (
            <p className="text-md text-yellow-600 mb-2">
              You haven't updated your contact number. If you add your contact number here, it will be updated in your profile.
            </p>
          )}

          <label className="block text-md mb-1">Phone No. {requiredFields.contact_no && <span className="text-red-500 text-xl">*</span>}</label>
          <input
            type="text"
            name="contact_no"
            value={formData.contact_no}
            onChange={handleChange}
            required
            onBlur={handleBlur}
            className={`w-full px-3 py-2 bg-transparent border-b-4 ${
              touched.contact_no && (formErrors.contact_no || contactError) 
                ? "border-red-500" 
                : "border-[#f4aaaa]"
            }`}
            />
              {touched.contact_no && formErrors.contact_no && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.contact_no}</p>
                )}
                {touched.contact_no && contactError && !formErrors.contact_no && (
                  <p className="text-sm text-red-500 mt-1">{contactError}</p>
                )}
        </div>


          {/* Team Section */}
          {teamEvent && (
            <>
              <div>
                <label className="block text-md mb-1">Team Name</label>
                <input type="text" name="team_name" value={formData.team_name} onChange={handleChange} className="w-full px-3 py-2 bg-transparent border-b-4 border-[#f4aaaa]" />
              </div>
              {formData.team_member_email.map((member, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-md mb-1">Team Member {index + 2} Email</label>
                  <input
                    type="email"
                    value={member}
                    onChange={(e) => handleTeamMemberChange(index, e.target.value, "team_member_email")}
                    className={`w-full px-3 py-2 bg-transparent border-b-4 ${
                      emailErrors[index] ? "border-red-500" : "border-[#f4aaaa]"
                    }`}//teammmembers email warning message
                    //className="w-full px-3 py-2 bg-transparent border-b-4 border-[#f4aaaa]"
                  />
                  {/*{emailErrors[index] && (
                    <p className="text-red-500 text-sm mt-1">{emailErrors[index]}</p>
                  )}*/}
                </div>
              ))}

            </>
          )}

            {checkedRegistration && (
              <div className="text-center mt-4">
                {isRegistered ? (
                  <p className="text-lg text-pink-300 font-semibold bg-gradient-to-tr from-black/60 to-purple-800/80 border-l-4 border-pink-400 p-3 rounded-md shadow-md">You are already registered for this event.</p>
                ) : (
                  <button
                  disabled={isLoading}
                  onClick={() => {
                    if (validateForm()) {
                      playClickSound();
                    }
                  }}
                  type="submit"
                  className={`px-8 py-3 rounded-full text-[#8B49A9] text-2xl font-semibold ${
                    !validateForm() || isLoading
                      ? " bg-gradient-to-bl from-purple-500 to-white text-violet-900 cursor-not-allowed"
                      : "bg-gradient-to-tr from-[#FFFDFD] to-[#DA7AFF]"
                  }`}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
                )}
              </div>
            )}
        </form>
            <AnimatePresence>
              {showPopup && (
                <Motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.5 } }}
                  className="fixed inset-0 flex items-center justify-center z-50 px-4"
                >
                  <div className="bg-gradient-to-br from-[#101010] via-[#2e026d] to-[#6e1e91] backdrop-blur-lg text-white px-6 py-6 rounded-2xl shadow-[0_0_30px_rgba(186,85,211,0.7)] border border-white/10 text-center w-full max-w-md animate-fade-in">
                    <h1 className="text-lg font-extrabold mb-3  ">
                    🎉 Registration Successful!
                    </h1>
                    <p className="text-base font-medium text-white/90"> We've sent a confirmation email to your inbox. 📩
                    </p>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>

      </div>
    </div>
  );
};

export default Registration;