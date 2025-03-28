# Verification des prerequis.
function Check-Requirements {
    Write-Host "Verification des prerequis..."
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "Git n'est pas installe." -ForegroundColor Red
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "Docker n'est pas installe." -ForegroundColor Red
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Host "Docker Compose n'est pas installe." -ForegroundColor Red
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }
}

# Cloner ou mettre a jour le depôt GitHub.
function Clone-Or-Update-Repository {
    if ((Get-Location).Path -match "Algoforge$") {
        Write-Host "Le dossier 'Algoforge' existe deja et vous etes actuellement dedans. Mise a jour du depot..."
        git pull
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Echec de la mise a jour du depot." -ForegroundColor Red
            Read-Host -Prompt "Appuyez sur Entree pour continuer..."
            return
        }
        git submodule update --init --recursive
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Echec de la mise a jour des sous-modules." -ForegroundColor Red
            Read-Host -Prompt "Appuyez sur Entree pour continuer..."
            return
        }
        return
    }

    if (Test-Path "Algoforge") {
        Write-Host "Le dossier 'Algoforge' existe deja. Mise a jour du depot..."
        Set-Location -Path "Algoforge"
        git pull
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Echec de la mise a jour du depot." -ForegroundColor Red
            Read-Host -Prompt "Appuyez sur Entree pour continuer..."
            return
        }
        git submodule update --init --recursive
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Echec de la mise a jour des sous-modules." -ForegroundColor Red
            Read-Host -Prompt "Appuyez sur Entree pour continuer..."
            return
        }
        return
    }

    Write-Host "Telechargement de l'application depuis GitHub..."
    git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git Algoforge
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Echec du clonage du depot." -ForegroundColor Red
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }
    Set-Location -Path "Algoforge"
}

# Renommer le fichier template-docker.env en .env.
function Rename-Env-File {
    if (Test-Path ".env") {
        $response = Read-Host "Le fichier '.env' existe deja. Voulez-vous le reinitialiser ? (o/N)"
        if ($response -eq "o" -or $response -eq "O") {
            Remove-Item -Path ".env"
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Echec de la suppression du fichier '.env'." -ForegroundColor Red
                Read-Host -Prompt "Appuyez sur Entree pour continuer..."
                return
            }
        } else {
            Write-Host "Utilisation du fichier '.env' existant..."
            return
        }
    }

    if (-not (Test-Path "template-docker.env")) {
        Write-Host "Le fichier 'template-docker.env' est introuvable." -ForegroundColor Red
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }
    Copy-Item -Path "template-docker.env" -Destination ".env"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Echec de la copie du fichier 'template-docker.env'." -ForegroundColor Red
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }
}

# Verification et ajustement du type de base de donnees.
function Check-Database-Type {
    Write-Host "Verification du type de base de donnees..."

    # Initialiser les variables
    $db_type = ""
    $db_name = ""

    # Lire les valeurs actuelles de DATABASE_TYPE et DATABASE_NAME
    foreach ($line in Get-Content ".env") {
        if ($line -match "^DATABASE_TYPE\s*=\s*(.+)$") {
            $db_type = $matches[1].Trim('"')
        }
        if ($line -match "^DATABASE_NAME\s*=\s*(.+)$") {
            $db_name = $matches[1].Trim('"')
        }
    }

    # Verification et correction de DATABASE_TYPE
    if ($db_type -ne "postgres") {
        Write-Host "Le type de base de donnees est incorrect. Ajustement a 'postgres'." -ForegroundColor Yellow
        (Get-Content .env) | ForEach-Object { $_ -replace "^DATABASE_TYPE\s*=.*", 'DATABASE_TYPE = "postgres"' } | Set-Content .env
    }

    # Verification et correction de DATABASE_NAME
    if ($db_name -ne "db_algoforge") {
        Write-Host "Le nom de la base de donnees est incorrect. Ajustement a 'db_algoforge'." -ForegroundColor Yellow
        (Get-Content .env) | ForEach-Object { $_ -replace "^DATABASE_NAME\s*=.*", 'DATABASE_NAME = "db_algoforge"' } | Set-Content .env
    }

    Write-Host "Type de base de donnees et nom de la base de donnees verifies et ajustes si necessaire." -ForegroundColor Green
}

# Modifier le fichier .env pour ajouter les informations de connexion a la base de donnees.
function Edit-Env-File {
    $response = Read-Host "Souhaitez-vous modifier les informations de connexion a la base de donnees (modifier le .env) ? (o/N)"
    if ($response -ne "o" -and $response -ne "O") {
        return
    }

    Write-Host "Pour les valeurs par defaut, appuyez sur Entree."

    # Modification des ports pour eviter les conflits.
    do {
        $port = Read-Host "Veuillez saisir le port que vous souhaitez utiliser pour l'application (par defaut 5205)"
        if ([string]::IsNullOrWhiteSpace($port)) { $port = 5205 }
    } while (-not ($port -match '^\d+$') -or $port -lt 1024 -or $port -gt 65535)

    (Get-Content .env) | ForEach-Object { $_ -replace "5205", "$port" } | Set-Content .env

    do {
        $pgadmin_port = Read-Host "Veuillez saisir le port que vous souhaitez utiliser pour pgadmin (par defaut 5300)"
        if ([string]::IsNullOrWhiteSpace($pgadmin_port)) { $pgadmin_port = 5300 }
    } while (-not ($pgadmin_port -match '^\d+$') -or $pgadmin_port -lt 1024 -or $pgadmin_port -gt 65535 -or $pgadmin_port -eq $port)

    (Get-Content .env) | ForEach-Object { $_ -replace "5300", "$pgadmin_port" } | Set-Content .env

    $response = Read-Host "Souhaitez-vous modifier les informations de connexion a la base de donnees (modifier le .env) ? (o/N)"
    if ($response -eq "o" -or $response -eq "O") {
        notepad .env
    }
}

# Demarrer l'application avec docker compose.
function Start-Application {
    Write-Host "Demarrage de l'application avec Docker Compose..."
    docker compose up --wait
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Echec du demarrage de l'application avec docker compose." -ForegroundColor Red
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }
}

# Execution des fonctions.
Check-Requirements
Clone-Or-Update-Repository
Rename-Env-File
Check-Database-Type
Edit-Env-File
Start-Application

# Recuperation du port a partir du fichier .env.
$port = (Get-Content .env | Select-String -Pattern '^PORT =').ToString().Split('=')[1].Trim()

Write-Host "L'application est en train de demarrer en arriere-plan !"
Write-Host "Ouvrez un navigateur et entrez l'adresse: http://localhost:$port"
Read-Host -Prompt "Appuyez sur Entree pour continuer..."