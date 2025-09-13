@echo off
echo ===================================================
echo AVVIO BACKEND ATECO LOCALE (BACKUP)
echo ===================================================
echo.
echo Il backend verra' avviato su http://localhost:8080
echo.
echo NOTA: Questo e' un backup nel caso Render non funzioni
echo       L'app continuera' a usare Render come primario
echo.
cd ..\..\Celerya_Cyber_Ateco
echo Installazione dipendenze Python...
python -m pip install pandas flask flask-cors openpyxl
echo.
echo Avvio backend ATECO su porta 8080...
python ateco_lookup.py
pause