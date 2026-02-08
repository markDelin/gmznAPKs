
@echo off
echo Deploying to Netlify...
call npx -y netlify-cli deploy --prod
