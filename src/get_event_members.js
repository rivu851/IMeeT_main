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

router.get('/team-details', async (req, res) => {
    try{
        const {data,error} = await supabaseClient
        .from('users_members')
        .select('*');

        if(error){
            return res.status(400).json({error:'Error fetching members data',details:error})
        }

        return res.status(200).json({message:"Members data fetched succesfully",data:data})
    }catch(error){
        return res.status(500).json({error:"Server error",details:error})
    }
})

export default router;