import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv'
import * as fs from 'fs';
import path from 'path';
dotenv.config({ path: '../.env' });

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_KEY!;
const supabase = createClient( url, key);

async function fetchmembers() {
    const { data, error } = await supabase.from('users_members').select('name,role,event_id');
    if (error) throw error;
    return data as { name: string; event_id : number ; role: string }[];
}

function getImageName(name: string): string {
    const parts = name.toLowerCase().split(/\s+/);
    return parts.join("");
}

async function fetchPublicURLsAndUpdate() {
    const members = await fetchmembers();
  
    const { data: files, error } = await supabase.storage.from('members').list('', {
      limit: 1000,
    });
  
    if (error) {
      console.error("Error fetching files from bucket:", error.message);
      return;
    }
  
    for (const member of members) {
        const imageName = getImageName(member.name);

        const matchedFile = files?.find(file =>
          file.name.toLowerCase().includes(imageName)
        );
        if (matchedFile) {
          const { data: publicUrlData } = supabase.storage
            .from('members')
            .getPublicUrl(matchedFile.name);
    
          const publicUrl = publicUrlData.publicUrl;
    
          const { error: updateError } = await supabase
            .from('users_members')
            .update({ img_url: publicUrl })
            .eq('name', member.name);
    
          if (updateError) {
            console.error(`Failed to update img_url for ${member.name}:`, updateError.message);
          } else {
            console.log(`Updated img_url for ${member.name}: ${publicUrl}`);
          }
        } else {
          console.log(`No image found for ${member.name}`);
        }
      }
    }
    fetchPublicURLsAndUpdate().catch(console.error);