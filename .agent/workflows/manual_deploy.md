---
description: Manual Deployment to Netlify (Bypassing PowerShell Restrictions)
---

To manually deploy the application to Netlify, especially if PowerShell scripts are disabled on your system:

1.  Open the terminal.
2.  Navigate to the project directory: `c:\Users\MCK\Documents\GMZNAPKS\gmznAPKs`
3.  Run the deployment command using `cmd /c` to bypass PowerShell script execution policies:

// turbo

```powershell
cmd /c netlify deploy --prod
```

This command will:

1.  Build the project (via `npm run build`).
2.  Upload the `dist` folder and `netlify/functions` to Netlify.
3.  Publish it to the production URL.
