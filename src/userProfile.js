import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import multer from 'multer'

dotenv.config();
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

/* Supabase init */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

router.post('/update-user',upload.single("image"),async(req,res)=>{
    const { email, phone, name, department, classRoll } = req.body;
    const file = req.file;

    if (!email) {
        return res.status(400).json({ success: false, message: "User email is required" });
    }
    try {
        let imageUrl = null;

        const { data: userData, error: fetchError } = await supabaseClient
            .from("user_participants")
            .select("image_url")
            .eq("email", email)
            .single();
            if (fetchError) {
            console.error("Error fetching user:", fetchError.message);
            return res.status(500).json({ success: false, message: "Could not fetch user" });
            }

        if (file) {
            if (userData?.image_url) {
                const publicPath = userData.image_url.replace(`${SUPABASE_URL}/storage/v1/object/public/participants/`, "");
                const { error: deleteError } = await supabaseClient.storage.from("participants").remove([publicPath]);
                if (deleteError) {
                  console.error("Failed to delete old image:", deleteError.message);
                } else {
                  console.log(`Deleted previous image: ${publicPath}`);
                }
            }

            const filePath = `participants/file_${Date.now()}`;
            const { data, error } = await supabaseClient.storage
                .from("participants")
                .upload(filePath, file.buffer, { contentType: file.mimetype , upsert:true });
            if (error) throw error;

            imageUrl = `${SUPABASE_URL}/storage/v1/object/public/participants/${filePath}`;
        }

        const updateData = {};
        let yearMatch = classRoll.match(/\d{4}/);
        const admissionYear = yearMatch ? parseInt(yearMatch[0]) : null;
        const currentYear = new Date().getFullYear();
        const academicYear = currentYear - admissionYear;
        if (phone) updateData.contact_no = phone;
        if (imageUrl) updateData.image_url = imageUrl;
        if (classRoll) updateData.college_roll = classRoll.toUpperCase();
        if (department) updateData.dept = department.toUpperCase();
        if (name) updateData.name = name;
        if(academicYear<=4) updateData.year = academicYear

        if (Object.keys(updateData).length > 0) {
            await supabaseClient.from("user_participants").update(updateData).eq("email", email);
            res.status(200).json({ success: true, message: "Profile updated successfully" });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
})

export default router;
