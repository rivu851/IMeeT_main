import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
import { details } from "framer-motion/client";
import e from "express";
dotenv.config({ path: '../.env' });


dotenv.config();
const router = express.Router();

/* Supabase init */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);


//participant details fetch
router.get("/participant-details", async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const { data, error } = await supabaseClient
            .from("user_participants")
            .select('*')
            .eq("email", email)
            .limit(1);

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(500).json({ success: false, message: "Error fetching data", error });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "Data fetched successfully", data: data[0] });

    } catch (err) {
        console.error("Server Error:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

router.get("/get_user_event_names",async(req,res)=>{
    try{
        const {user_uuid} = req.query;
        const {data,error} = await supabaseClient.rpc('get_user_event_names',{
            user_uuid:user_uuid,
        })

        if(error){
            return res.status(400).json({message:"Data did not fetched properly",details:error});
        }

        res.status(200).json({message:"Data fetched succesfully",data:data});
    }catch(error){
        res.status(500).json({message:"Server error in fetching event data of user profile",details:error});
    }
})

router.get("/get_user_teams",async(req,res)=>{
    const {user_uuid} = req.query;
    try{
        const {data,error} = await supabaseClient.rpc('get_user_teams',{
            input_user_id:user_uuid,
        })

        if(error){
            return res.status(400).json({message:'error fetching user registered temas',details:error})
        }

        return res.status(200).json({message:'Team details fetched succesfully',data:data});
    }catch(error){
        return res.status(500).json({mesage:'Server error fetching user teams',details:error})
    }
})


export default router;