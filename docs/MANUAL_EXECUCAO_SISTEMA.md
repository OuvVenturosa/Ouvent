# MANUAL COMPLETO DE EXECUÇÃO E ENCERRAMENTO DO SISTEMA

## 1. PRÉ-REQUISITOS
- Node.js instalado
- NPM instalado
- Nginx instalado (ou disponível em: C:\Users\Bruno Galindo\Documents\nginx-1.29.0)
- Permissão para executar scripts PowerShell

---

## 2. ESTRUTURA DO SISTEMA
- **Backend:** Node.js (`backend.js` ou `server.js`)
- **Frontend:** React (pasta `frontend/`)
- **Nginx:** Proxy reverso (`nginx.conf`)

---

## 3. INICIANDO O SISTEMA

### 3.1. Usando Script PowerShell (Recomendado)

1. Abra o PowerShell na pasta raiz do projeto.
2. Execute:
   ```powershell
   ./iniciar_sistema_completo.ps1
   ```
   Isso abrirá três janelas:
   - Backend
   - Frontend
   - Nginx

#### Conteúdo do `iniciar_sistema_completo.ps1`:
```powershell
# Iniciar Backend
Start-Process powershell -ArgumentList 'node backend.js' -WindowStyle Normal

# Iniciar Frontend
Start-Process powershell -ArgumentList 'cd frontend; npm install; npm start' -WindowStyle Normal

# Iniciar Nginx
Start-Process "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -ArgumentList "-c $PWD\nginx.conf" -WindowStyle Normal
```

> Se aparecer erro de permissão, execute:
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

### 3.2. Usando Script BAT (Windows)

Crie um arquivo chamado `executar_sistema_completo.bat` com o conteúdo:
```bat
@echo off
start cmd /k "node backend.js"
start cmd /k "cd frontend && npm install && npm start"
start "" "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -c "%cd%\nginx.conf"
```
Execute dando dois cliques no arquivo.

---

### 3.3. Execução Manual (Terminal)

**Terminal 1 – Backend:**
```powershell
node backend.js
```

**Terminal 2 – Frontend:**
```powershell
cd frontend
npm install
npm start
```

**Terminal 3 – Nginx:**
```powershell
"C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -c "$PWD\nginx.conf"
```

---

## 4. ACESSANDO O SISTEMA
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001) (ou porta configurada)

---

## 5. ENCERRANDO O SISTEMA

### 5.1. Encerrando Backend e Frontend
- Feche as janelas do terminal/powershell abertas para backend e frontend (ou pressione `Ctrl + C` em cada terminal).

### 5.2. Encerrando Nginx
- No PowerShell ou Prompt de Comando, execute:
```powershell
"C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -s stop
```

#### Script PowerShell para Encerrar Tudo (`fechar_sistema_completo.ps1`):
```powershell
# Encerra Backend e Frontend (fecha janelas manualmente)
# Encerra Nginx
Start-Process "C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -ArgumentList "-s stop" -WindowStyle Hidden
```

#### Script BAT para Encerrar Nginx (`fechar_nginx.bat`):
```bat
@echo off
"C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -s stop
```

---

## 6. DICAS E OBSERVAÇÕES
- Sempre aguarde o carregamento completo de cada janela antes de acessar o sistema.
- Se houver erro de porta ocupada, feche processos antigos ou reinicie o computador.
- Se aparecer erro de permissão para scripts, use o comando de `Set-ExecutionPolicy` mostrado acima.
- Para dúvidas ou problemas, consulte os arquivos de log ou envie a mensagem de erro para suporte.

---

## 7. RESUMO DOS PRINCIPAIS COMANDOS

### Iniciar Sistema (PowerShell):
```powershell
./iniciar_sistema_completo.ps1
```

### Iniciar Sistema (BAT):
```bat
executar_sistema_completo.bat
```

### Encerrar Nginx (PowerShell ou CMD):
```powershell
"C:\Users\Bruno Galindo\Documents\nginx-1.29.0\nginx.exe" -s stop
```

### Encerrar Nginx (BAT):
```bat
fechar_nginx.bat
```

---

**Pronto! Siga este manual para executar e encerrar o sistema de forma segura e prática.** 