import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.get('/:year', async (req, res) => {
    const { year } = req.params;
    try {
      const { data, error } = await supabase.storage.from('gallery').list(year, {
        limit: 100,
      });
  
      if (error) throw error;
  
      const publicUrls = data
        .filter(file => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
        .map(file => {
          return supabase.storage.from('gallery').getPublicUrl(`${year}/${file.name}`).data.publicUrl;
        });
  
      res.status(200).json({ images: publicUrls });
    } catch (err) {
      console.error("Error fetching images:", err);
      res.status(500).json({ error: "Failed to fetch images." });
    }
});
  
export default router;