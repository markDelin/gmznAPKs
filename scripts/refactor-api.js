
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiDir = path.join(__dirname, '../api');

fs.readdirSync(apiDir).forEach(file => {
    if (file.endsWith('.ts')) {
        const filePath = path.join(apiDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace imports
        if (content.includes('@neondatabase/serverless')) {
            content = content.replace("import { neon } from '@neondatabase/serverless';", "import postgres from 'postgres';");
            content = content.replace('import { neon } from "@neondatabase/serverless";', "import postgres from 'postgres';");
            
            // Replace initialization
            content = content.replace(
                /const sql = neon\(process\.env\.DATABASE_URL.*\);/g, 
                "const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });"
            );
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
