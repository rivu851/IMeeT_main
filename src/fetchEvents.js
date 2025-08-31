import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });


dotenv.config();
const router = express.Router();

/* Supabase init */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

router.get('/allEvents',async(req,res)=>{
    try{
        const {data,error} = await supabaseClient
        .from('events')
        .select('*');

        if(error){
            return res.status(400).json({error:'Error fetching events data',details:error})
        }

        return res.status(200).json({message:"Events Data fetched succesfully",data:data})
    }catch(error){
        return res.status(500).json({error:"Server error",details:error})
    }
})

router.get('/eventDetails', async (req, res) => {
    try {
        const { event_id } = req.query; 
        if (!event_id) {
            return res.status(400).json({ error: "Event ID is required", message: "Event ID not found in backend" });
        }

        const eventIdNumber = parseInt(event_id, 10);
        if (isNaN(eventIdNumber)) {
            return res.status(400).json({ error: "Invalid Event ID", message: "Event ID must be a number" });
        }
        
        const { data, error } = await supabaseClient
            .rpc('get_event_details', { event_id_param: eventIdNumber });

        if (error) {
            console.error("Error fetching event details:", error);
            return res.status(500).json({ error: "Failed to fetch event details", details: error.message });
        }

        return res.status(200).json({ message: "Event details fetched successfully", data:data});
    } catch (error) {
        console.error("Unexpected server error:", error);
        return res.status(500).json({ error: "Server error for event details", details: error.message });
    }
});


export default router;