
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
        if (content.includes("import postgres from 'postgres';")) {
            content = content.replace("import postgres from 'postgres';", "import { neon } from '@neondatabase/serverless';");
            
            // Replace initialization
            // Old: const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
            // New: const sql = neon(process.env.DATABASE_URL!);
            content = content.replace(
                /const sql = postgres\(process\.env\.DATABASE_URL!,\s*{\s*ssl:\s*'require'\s*}\);/g, 
                "const sql = neon(process.env.DATABASE_URL!);"
            );
             // Also handle case where spacing might be different
             content = content.replace(
                /const sql = postgres\(process\.env\.DATABASE_URL!,\s*\{.*\}\);/g, 
                "const sql = neon(process.env.DATABASE_URL!);"
            );
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`Reverted ${file}`);
    }
});
