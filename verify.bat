@echo off
REM BookBridge Project Verification Script (Windows)

echo.
echo ====================================================
echo   BookBridge Project Verification
echo ====================================================
echo.

setlocal enabledelayedexpansion
set PASSED=0
set FAILED=0

REM Check Project Structure
echo 01 Checking Project Structure...
if not exist "%CD%\backend\" (
    echo [X] backend/
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] backend/
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\frontend\" (
    echo [X] frontend/
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] frontend/
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\database\" (
    echo [X] database/
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] database/
    set /a PASSED=!PASSED!+1
)

echo.
echo 02 Checking Backend Files...
if not exist "%CD%\backend\package.json" (
    echo [X] backend\package.json
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] backend\package.json
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\backend\.env.example" (
    echo [X] backend\.env.example
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] backend\.env.example
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\backend\src\server.js" (
    echo [X] backend\src\server.js
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] backend\src\server.js
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\backend\src\config\database.js" (
    echo [X] backend\src\config\database.js
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] backend\src\config\database.js
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\backend\src\controllers\authController.js" (
    echo [X] backend\src\controllers\authController.js
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] backend\src\controllers\authController.js
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\backend\src\controllers\bookController.js" (
    echo [X] backend\src\controllers\bookController.js
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] backend\src\controllers\bookController.js
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\backend\src\controllers\reviewController.js" (
    echo [X] backend\src\controllers\reviewController.js
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] backend\src\controllers\reviewController.js
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\backend\src\controllers\transactionController.js" (
    echo [X] backend\src\controllers\transactionController.js
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] backend\src\controllers\transactionController.js
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\backend\src\controllers\adminController.js" (
    echo [X] backend\src\controllers\adminController.js
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] backend\src\controllers\adminController.js
    set /a PASSED=!PASSED!+1
)

echo.
echo 03 Checking Frontend Files...
if not exist "%CD%\frontend\package.json" (
    echo [X] frontend\package.json
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] frontend\package.json
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\frontend\.env.example" (
    echo [X] frontend\.env.example
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] frontend\.env.example
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\frontend\src\App.js" (
    echo [X] frontend\src\App.js
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] frontend\src\App.js
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\frontend\src\App.css" (
    echo [X] frontend\src\App.css
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] frontend\src\App.css
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\frontend\src\context\AuthContext.js" (
    echo [X] frontend\src\context\AuthContext.js
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] frontend\src\context\AuthContext.js
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\frontend\src\services\api.js" (
    echo [X] frontend\src\services\api.js
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] frontend\src\services\api.js
    set /a PASSED=!PASSED!+1
)

echo.
echo 04 Checking Database Files...
if not exist "%CD%\database\schema.sql" (
    echo [X] database\schema.sql
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] database\schema.sql
    set /a PASSED=!PASSED!+1
)

echo.
echo 05 Checking Documentation...
if not exist "%CD%\README.md" (
    echo [X] README.md
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] README.md
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\QUICKSTART.md" (
    echo [X] QUICKSTART.md
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] QUICKSTART.md
    set /a PASSED=!PASSED!+1
)

if not exist "%CD%\ARCHITECTURE.md" (
    echo [X] ARCHITECTURE.md
    set /a FAILED=!FAILED!+1
) else (
    echo [OK] ARCHITECTURE.md
    set /a PASSED=!PASSED!+1
)

echo.
echo ====================================================
if !FAILED! equ 0 (
    echo All checks passed! Your project is ready.
    echo.
    echo Quick Start:
    echo   1. Run: install.bat (automated setup)
    echo   OR
    echo   2. cd backend ^&^& npm install
    echo   3. cd ..\frontend ^&^& npm install
    echo   4. Set up MySQL from database\schema.sql
    echo   5. Create .env files from .env.example
    echo   6. npm run dev (backend terminal)
    echo   7. npm start (frontend terminal)
) else (
    echo !FAILED! checks failed!
)
echo ====================================================
echo.

pause
