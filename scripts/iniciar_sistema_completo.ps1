# Iniciar Backend
Start-Process powershell -ArgumentList 'node backend.js' -WindowStyle Normal

# Iniciar Frontend
Start-Process powershell -ArgumentList 'cd frontend; npm install; npm start' -WindowStyle Normal

# Iniciar Nginx
Start-Process "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -ArgumentList "-c $PWD\nginx.conf" -WindowStyle Normal 