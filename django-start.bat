@echo off
echo Activando entorno virtual y ejecutando Django...
powershell -Command "cd 'C:\Users\fnand\OneDrive\Documentos\GitHub\investcapital-backend'; .\venv\Scripts\Activate.ps1; python manage.py runserver 0.0.0.0:8000"
pause