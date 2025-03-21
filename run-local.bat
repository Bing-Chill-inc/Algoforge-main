@echo off
setlocal enabledelayedexpansion

REM Verification des prerequis.
call :check_requirements
call :clone_repository
call :update_repository
call :rename_env_file
call :start_application

goto :eof

:check_requirements
echo Verification des prerequis...
where git >nul 2>&1 || (
    echo Git n'est pas installe. Veuillez l'installer depuis https://git-scm.com/downloads.
    exit /b 1
)
where bun >nul 2>&1 || (
    echo Bun n'est pas installe. Veuillez l'installer depuis https://bun.sh/.
    exit /b 1
)
exit /b 0

:clone_repository
for %%I in (.) do set "CURRENT_DIR=%%~nxI"
if "%CURRENT_DIR%" == "Algoforge" (
    echo Le dossier 'Algoforge' existe deja et vous etes actuellement dedans. Passage a l'etape suivante...
    exit /b 0
)

if exist Algoforge (
    echo Le dossier 'Algoforge' existe deja. Passage a l'etape suivante...
    cd Algoforge || (
        echo Le dossier 'Algoforge' n'existe pas. Verifiez le nom du dossier.
        exit /b 1
    )
    exit /b 0
)

echo Telechargement de l'application depuis GitHub...
git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git || (
    echo Echec du clonage du depot. Verifiez votre connexion internet.
    exit /b 1
)
rename Algoforge-main Algoforge || (
    echo Echec du renommage du dossier 'Algoforge-main' en 'Algoforge'.
    call :del_repository
    exit /b 1
)
cd Algoforge || (
    echo Le dossier 'Algoforge' n'existe pas. Verifiez le clonage du depot.
    exit /b 1
)
exit /b 0

:update_repository
echo Mise a jour du depot...
git pull || (
    echo Echec de la mise a jour du depot. Verifiez votre connexion internet.
    call :del_repository
    exit /b 1
)
echo Mise a jour des sous-modules...
git submodule update --init --recursive || (
    echo Echec de la mise a jour des sous-modules.
    call :del_repository
    exit /b 1
)
echo Sous-modules mis a jour avec succes.
exit /b 0

:rename_env_file
if exist ".\.env" (
    echo Le fichier '.env' existe deja.
    echo Voulez-vous le reinitialiser ^(o/N^)
    set /p response=
    if /i "!response!" == "o" (
        del .env || (
            echo Echec de la suppression du fichier '.env'.
            call :del_repository
            exit /b 1
        )
    ) else (
        echo Demarrage de l'application avec le fichier '.env' existant...
        exit /b 0
    )
)

if not exist template-local.env (
    echo Le fichier 'template-local.env' est introuvable. Assurez-vous que le depot a ete clone correctement.
    exit /b 1
)
copy template-local.env template-local-copy.env || (
    echo Echec de la copie du fichier 'template-local.env'.
    call :del_repository
    exit /b 1
)
rename template-local-copy.env .env || (
    echo Echec du renommage du fichier 'template-local.env' en '.env'.
    call :del_repository
    exit /b 1
)
exit /b 0

:start_application
echo Demarrage de l'application avec Bun...
cd src\back || (
    echo Le dossier 'src\back' n'existe pas. Verifiez le clonage du depot.
    exit /b 1
)
bun run prod || (
    echo Echec du demarrage de l'application. Verifiez votre installation de Bun.
    call :del_repository
    exit /b 1
)

REM Recuperation du port a partir du fichier .env
for /f "tokens=3 delims== " %%a in ('findstr /b "PORT =" ..\.\.env') do set "port=%%a"

echo L'application est en train de demarrer en arriere-plan !
echo Ouvrez un navigateur et entrez l'adresse: http://localhost:!port!
exit /b 0

:del_repository
echo Voulez-vous supprimer le dossier 'Algoforge' ou 'Algoforge-main' ? ^(O/n^)
set /p del_response=
if /i "!del_response!" == "o" goto :do_delete
if /i "!del_response!" == "O" goto :do_delete
if "!del_response!" == "" goto :do_delete
exit /b 1

:do_delete
if exist Algoforge rd /s /q Algoforge
if exist Algoforge-main rd /s /q Algoforge-main
for %%I in (.) do if "%%~nxI" == "Algoforge" (
    cd ..
    rd /s /q Algoforge
)
exit /b 1

:eof
