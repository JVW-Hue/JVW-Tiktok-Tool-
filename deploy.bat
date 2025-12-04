@echo off
echo ========================================
echo   Deploying Login Fix to GitHub
echo ========================================
echo.
echo Adding all changes...
git add .
echo.
echo Committing changes...
git commit -m "Fix login network errors - increase rate limits and improve API calls"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Render will auto-deploy in 2-3 minutes
echo Check your Render dashboard for deployment status
echo.
pause
