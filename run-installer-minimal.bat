@echo off
@chcp 65001 > nul

:: Vérification des prérequis.
:check_requirements
echo ⚙️ Vérification des prérequis...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Git n'est pas installé. Veuillez l'installer depuis https://git-scm.com/downloads.
    exit /b 1
)
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Docker n'est pas installé. Veuillez l'installer depuis https://docker.com.
    exit /b 1
)
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Docker Compose n'est pas installé. Veuillez l'installer depuis https://docs.docker.com/compose/install/.
    exit /b 1
)

:: Cloner le dépôt GitHub.
:clone_repository
echo ⚙️ Téléchargement de l'application depuis GitHub...
if exist "Algoforge" (
    echo ⚠️ Le dossier 'Algoforge' existe déjà. Veuillez le supprimer ou choisir un autre emplacement.
    goto del_repository
)
git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git
if %errorlevel% neq 0 (
    echo Échec du clonage du dépôt. Vérifiez votre connexion internet.
    exit /b 1
)
rename Algoforge-main Algoforge
if %errorlevel% neq 0 (
    echo ⚠️ Échec du renommage du dossier 'Algoforge-main' en 'Algoforge'.
    goto del_repository
)
cd Algoforge
if %errorlevel% neq 0 (
    echo ⚠️ Le dossier 'Algoforge' n'existe pas. Vérifiez le clonage du dépôt.
    exit /b 1
)

:: Mettre à jour le dépôt GitHub.
:update_repository
echo ⚙️ Mise à jour des sous-modules...
git submodule update --init --recursive
if %errorlevel% neq 0 (
    echo ⚠️ Échec de la mise à jour des sous-modules.
    goto del_repository
)

:: Renommer le fichier template.env en .env.
:rename_env_file
if not exist "template.env" (
    echo ⚠️ Le fichier 'template.env' est introuvable. Assurez-vous que le dépôt a été cloné correctement.
    exit /b 1
)
rename template.env .env
if %errorlevel% neq 0 (
    echo ⚠️ Échec du renommage du fichier 'template.env' en '.env'.
    goto del_repository
)

:: Lancer l'application avec docker compose.
:start_application
echo ⚙️ Démarrage de l'application avec Docker Compose...
docker compose up --wait
if %errorlevel% neq 0 (
    echo ⚠️ Échec du démarrage de l'application avec docker compose.
    goto del_repository
)

echo ✔️ L'application est en train de se démarrer en arrière plan !
echo Ouvrez un navigateur et entrez l'adresse: http://localhost:5205 (par défaut)
exit /b 0

:: Demander si l'utilisateur souhaite supprimer le dossier Algoforge / Algoforge-main.
:del_repository
set /p response=Voulez-vous supprimer le dossier 'Algoforge' ou 'Algoforge-main' ? (o/n) 
if /i "%response%"=="o" (
    if exist "Algoforge" rd /s /q Algoforge
    if exist "Algoforge-main" rd /s /q Algoforge-main
)
exit /b 1