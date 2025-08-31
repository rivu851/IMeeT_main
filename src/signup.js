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

router.post("/add-user", async (req, res) => {
    const { user } = req.body;
    if (!user || !user.email || !user.name) {
        return res.status(400).json({ success: false, message: "User data missing" });
    }

    
    try {
        const email = user.email;
        const name = user.name;
        const contact_no = null;
        
        
        if(email && email.endsWith("@rcciit.org.in")){
            
            const deptMatch = email.match(/^[a-zA-Z]+/)
            if (!deptMatch)
                return res.status(400).json({ message: "Invalid email format" })
                
            const department = deptMatch[0].toUpperCase();
            
            const rollNumberMatch = email.match(/^([a-zA-Z]+\d+)@/);
            let rollNumber = rollNumberMatch ? rollNumberMatch[1] : null;
            if(rollNumber) rollNumber = rollNumber.toUpperCase();
        
            const yearMatch = email.match(/(\d{4})\d{3}@/);
            const year = yearMatch ? parseInt(yearMatch[1]) : null;
            
            if (!year || !rollNumber) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            
            const currentYear = new Date().getFullYear();
            const academicYear = currentYear - year;

            const { data, error } = await supabaseClient
                .from("user_participants")
                .select("user_id")
                .eq("email", email);
                
            if (data.length ==0) {
                const { data:insertdata, error:inserterror } = await supabaseClient
                .from("user_participants")
                .insert([{ name, email, dept: department,contact_no: contact_no,year:academicYear,college_roll:rollNumber}]);
                if (inserterror) {
                    return res.status(500).json({ error: "Error inserting into Supabase", details: error });
                }
                return res.status(200).json({ message: "Data inserted successfully", data:insertdata });
            } else if (error) {
                throw new Error("Error fetching user: " + error.message);
            }else{
            }
        }
        else{
            const { data, error } = await supabaseClient
                .from("user_participants")
                .select("user_id")
                .eq("email", email);
                
            if (data.length ==0) {
                const { data: halfuser, error: err } = await supabaseClient
                    .from("user_participants")
                    .insert([{ name, email }]);
                if (err) {
                    return res.status(500).json({ error: "Error inserting into Supabase", details: err });
                }
                return res.status(200).json({ message: "Data inserted successfully", data: halfuser });
                } else if (error) {
                    throw new Error("Error fetching user: " + error.message);
                }
        }
    } catch (err) {
        console.log('GGWP')
        return res.status(500).json({ error: "Server Error", details: err.message });
    }
});

export default router