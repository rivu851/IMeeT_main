import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import signupRoutes from "./signup.js"
import userDetailRoute from "./user_details.js"
import eventFetchRoute from "./fetchEvents.js"
import updateUser from "./userProfile.js"
import registerParticipant from "./submitRegistrationFrom.js"
import festTeam from "./get_event_members.js"
import gallery from "./gallery.js"


dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true
  }));
app.use(express.json());
const PORT = 3412;

/* supabase init */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(signupRoutes);
app.use(userDetailRoute);
app.use(eventFetchRoute);
app.use(updateUser);
app.use(registerParticipant);
app.use('/gallery',gallery)
app.use(festTeam);



app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});