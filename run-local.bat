@echo off
setlocal enabledelayedexpansion

REM Verification des prerequis.
call :check_requirements
call :clone_repository
call :update_repository
call :rename_env_file
call :check_database_type
call :start_application

goto :eof

:check_requirements
echo Verification des prerequis...
where git >nul 2>&1 || (
    echo Git n'est pas installe. Veuillez l'installer depuis https://git-scm.com/downloads.
    pause
    goto :eof
)
where bun >nul 2>&1 || (
    echo Bun n'est pas installe. Veuillez l'installer depuis https://bun.sh/.
    pause
    goto :eof
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
        pause
        goto :eof
    )
    exit /b 0
)

echo Telechargement de l'application depuis GitHub...
git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git || (
    echo Echec du clonage du depot. Verifiez votre connexion internet.
    pause
    goto :eof
)
rename Algoforge-main Algoforge || (
    echo Echec du renommage du dossier 'Algoforge-main' en 'Algoforge'.
    call :del_repository
    pause
    goto :eof
)
cd Algoforge || (
    echo Le dossier 'Algoforge' n'existe pas. Verifiez le clonage du depot.
    pause
    goto :eof
)
exit /b 0

:update_repository
echo Mise a jour du depot...
git pull || (
    echo Echec de la mise a jour du depot. Verifiez votre connexion internet.
    call :del_repository
    pause
    goto :eof
)
echo Mise a jour des sous-modules...
git submodule update --init --recursive || (
    echo Echec de la mise a jour des sous-modules.
    call :del_repository
    pause
    goto :eof
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
            pause
            goto :eof
        )
    ) else (
        echo Demarrage de l'application avec le fichier '.env' existant...
        exit /b 0
    )
)

if not exist template-local.env (
    echo Le fichier 'template-local.env' est introuvable. Assurez-vous que le depot a ete clone correctement.
    pause
    goto :eof
)
copy template-local.env template-local-copy.env || (
    echo Echec de la copie du fichier 'template-local.env'.
    call :del_repository
    pause
    goto :eof
)
rename template-local-copy.env .env || (
    echo Echec du renommage du fichier 'template-local.env' en '.env'.
    call :del_repository
    pause
    goto :eof
)
exit /b 0

:check_database_type

echo Verification du type de base de donnees...

:: Initialiser les variables
set "db_type="
set "db_name="

:: Lire les valeurs actuelles de DATABASE_TYPE et DATABASE_NAME
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    set "var=%%a"
    set "val=%%b"
    
    :: Supprimer les espaces avant/après
    set "var=!var: =!"
    set "val=!val: =!"

    :: Vérifier si c'est DATABASE_TYPE
    if /i "!var!"=="DATABASE_TYPE" set "db_type=!val!"
    if /i "!var!"=="DATABASE_NAME" set "db_name=!val!"
)

:: Enlever le premier et dernier caractere de db_type et db_name
set "db_type=!db_type:~1,-1!"
set "db_name=!db_name:~1,-1!"

:: Vérification et correction de DATABASE_TYPE
if not "!db_type!"=="sqlite" (
    echo Le type de base de donnees est incorrect. Ajustement a "sqlite".
    (echo DATABASE_TYPE = "sqlite") > temp.env
    findstr /v /r "^DATABASE_TYPE *= *" .env >> temp.env
    move /y temp.env .env > nul
)

:: Vérification et correction de DATABASE_NAME
if not "!db_name!"=="db_algoforge.sqlite" (
    echo Le nom de la base de donnees est incorrect. Ajustement a "db_algoforge.sqlite".
    (echo DATABASE_NAME = "db_algoforge.sqlite") > temp.env
    findstr /v /r "^DATABASE_NAME *= *" .env >> temp.env
    move /y temp.env .env > nul
)

exit /b 0

:start_application
echo Demarrage de l'application avec Bun...
cd src\back || (
    echo Le dossier 'src\back' n'existe pas. Verifiez le clonage du depot.
    pause
    goto :eof
)
bun run prod || (
    echo Echec du demarrage de l'application. Verifiez votre installation de Bun.
    call :del_repository
    pause
    goto :eof
)

REM Recuperation du port a partir du fichier .env
for /f "tokens=3 delims== " %%a in ('findstr /b "PORT =" ..\.\.env') do set "port=%%a"

echo L'application est en train de demarrer en arriere-plan !
echo Ouvrez un navigateur et entrez l'adresse: http://localhost:!port!
pause
exit /b 0

:del_repository
echo Voulez-vous supprimer le dossier 'Algoforge' ou 'Algoforge-main' ? ^(o/N^)
set /p del_response=
if /i "!del_response!" == "o" goto :do_delete
if /i "!del_response!" == "O" goto :do_delete
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
pause
