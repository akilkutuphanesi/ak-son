@echo off
echo ==============================================
echo Akil Kutuphanesi Backend Sunucusu Baslatiliyor
echo ==============================================
echo.
echo Lutfen bu pencereyi kapatmayin.
echo Baglanti adresi: http://0.0.0.0:8000 (Herkes erisebilir)
echo.

call venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
