import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv'
import * as fs from 'fs';
import path from 'path';
dotenv.config({ path: '../.env' });

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_KEY!;
const supabase = createClient( url, key);
const FolderPath = "C:\\Users\\User\\Downloads\\dher";

async function fetchmembers() {
    const { data, error } = await supabase.from('users_members').select('name,role,event_id');
    if (error) throw error;
    return data as { name: string; event_id : number ; role: string }[];
}

function getSimplifiedName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z]/g, '');
  }

async function uploadToSupabaseBucket(filename: string, savingname: string) {
    const filePath = path.join(FolderPath, filename);
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`Uploading ${filename} as ${savingname}.jpg`);
    const { error } = await supabase.storage.from('members').upload(`${savingname}.jpg`, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
    });
    
    if (error)  console.error(`Failed to upload ${savingname}.jpg:`, error.message);
    else console.log(`Uploaded ${savingname}.jpg to Supabase bucket`)
}

async function main() {
    const files = fs.readdirSync(FolderPath);
    console.log(files)
    const events = await fetchmembers();
    console.log(events)
    
    for (const file of files) {
        const fileBaseName = path.parse(file).name;
        const simplifiedFile = getSimplifiedName(fileBaseName);
    
        const matched = events.find(event => {
          const simplifiedName = getSimplifiedName(event.name);
          return simplifiedFile.includes(simplifiedName);
        });
    
        if (matched) {
          const savingName = getSimplifiedName(matched.name);
          console.log(`Matched "${file}" with "${matched.name}" (role: ${matched.role}, event_id: ${matched.event_id})`);
          await uploadToSupabaseBucket(file, savingName);
        } else {
          console.log(`No match found for ${file}`);
        }
      }
}
main().catch(error => {
    console.error(`Error in main: ${error}`);
});