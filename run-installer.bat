@echo off
setlocal enabledelayedexpansion

:: Vérification des prérequis
echo Verification des prerequis...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git n'est pas installe.
    exit /b 1
)

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker n'est pas installe.
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker Compose n'est pas installe.
    exit /b 1
)

:: Clonage du dépôt
echo Telechargement de l'application depuis GitHub...
if exist Algoforge (
    echo Suppression de l'ancien dossier Algoforge...
    rmdir /s /q Algoforge
)

git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git Algoforge
if %errorlevel% neq 0 (
    echo Echec du clonage du depot.
    exit /b 1
)

cd Algoforge

:: Mise à jour des sous-modules
echo Mise a jour des sous-modules...
git submodule update --init --recursive
if %errorlevel% neq 0 (
    echo Echec de la mise a jour des sous-modules.
    exit /b 1
)

:: Renommage du fichier template.env en .env
if not exist template.env (
    echo Le fichier 'template.env' est introuvable.
    exit /b 1
)
copy /y template.env .env

:: Configuration des ports
:pgadmin_port
set /p pgadmin_port="Veuillez saisir le port pour pgAdmin (par defaut 5300) : "
if "%pgadmin_port%"=="" set pgadmin_port=5300
for /f "delims=0123456789" %%A in ("%pgadmin_port%") do (
    echo Le port doit etre un nombre valide.
    goto pgadmin_port
)

if %pgadmin_port% lss 1024 if %pgadmin_port% gtr 65535 (
    echo Le port doit etre entre 1024 et 65535.
    goto pgadmin_port
)

:app_port
set /p port="Veuillez saisir le port pour l'application (par defaut 5205) : "
if "%port%"=="" set port=5205
for /f "delims=0123456789" %%A in ("%port%") do (
    echo Le port doit etre un nombre valide.
    goto app_port
)

if %port% lss 1024 if %port% gtr 65535 if %port%==%pgadmin_port% (
    echo Le port doit etre entre 1024 et 65535 et different de pgAdmin.
    goto app_port
)

:: Modification du fichier .env
powershell -Command "(Get-Content .env) -replace 'PORT=.*', 'PORT=%port%' -replace 'PGADMIN_PORT=.*', 'PGADMIN_PORT=%pgadmin_port%' | Set-Content .env"

set /p edit="Voulez-vous modifier d'autres parametres ? (o/N) : "
if /i "%edit%"=="o" notepad .env

:: Démarrage de l'application avec Docker Compose
echo Demarrage de l'application avec Docker Compose...
if not exist docker-compose.yml (
    echo Le fichier docker-compose.yml est introuvable.
    exit /b 1
)

docker compose up -d
if %errorlevel% neq 0 (
    echo Une erreur est survenue.
    set /p delete="Voulez-vous supprimer Algoforge ? (O/n) : "
    if /i "%delete%"=="o" (
        cd ..
        rmdir /s /q Algoforge
    )
    exit /b 1
)

echo Installation terminee avec succes !
exit /b 0
