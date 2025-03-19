# Vérification des prérequis.
function Check-Requirements {
    Write-Host "Verification des prerequis..."
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "Git n'est pas installe." -ForegroundColor Red
        exit 1
    }
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "Docker n'est pas installe." -ForegroundColor Red
        exit 1
    }
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Host "Docker Compose n'est pas installe." -ForegroundColor Red
        exit 1
    }
}

# Cloner le dépôt GitHub.
function Clone-Repository {
    Write-Host "Telechargement de l'application depuis GitHub..."
    if (Test-Path "Algoforge") {
        Write-Host "Suppression de l'ancien dossier Algoforge..."
        Remove-Item -Recurse -Force "Algoforge"
    }

    git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git Algoforge
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Echec du clonage du depot." -ForegroundColor Red
        exit 1
    }

    Set-Location -Path "Algoforge"
}

# Mise à jour des sous-modules Git.
function Update-Repository {
    Write-Host "Mise à jour des sous-modules..."
    git submodule update --init --recursive
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Echec de la mise à jour des sous-modules." -ForegroundColor Red
        exit 1
    }
}

# Renommer le fichier template-docker.env en .env.
function Rename-Env-File {
    if (-not (Test-Path "template-docker.env")) {
        Write-Host "Le fichier 'template-docker.env' est introuvable." -ForegroundColor Red
        exit 1
    }
    Copy-Item -Path "template-docker.env" -Destination ".env" -Force
}

# Configuration des ports.
function Edit-Env-File {
    do {
        $pgadmin_port = Read-Host "Veuillez saisir le port pour pgAdmin (par defaut 5300)"
        
        if ([string]::IsNullOrWhiteSpace($pgadmin_port)) { $pgadmin_port = 5300 }
        if ($pgadmin_port -match '^\d+$') { $pgadmin_port = [int]$pgadmin_port } else { $pgadmin_port = 0 }

        if ($pgadmin_port -lt 1024 -or $pgadmin_port -gt 65535) {
            Write-Host "Le port doit etre entre 1024 et 65535." -ForegroundColor Yellow
        }
    } while ($pgadmin_port -lt 1024 -or $pgadmin_port -gt 65535)

    do {
        $port = Read-Host "Veuillez saisir le port pour l'application (par defaut 5205)"
        
        if ([string]::IsNullOrWhiteSpace($port)) { $port = 5205 }
        if ($port -match '^\d+$') { $port = [int]$port } else { $port = 0 }

        if ($port -lt 1024 -or $port -gt 65535 -or $port -eq $pgadmin_port) {
            Write-Host "Le port doit etre entre 1024 et 65535 et different de pgAdmin." -ForegroundColor Yellow
        }
    } while ($port -lt 1024 -or $port -gt 65535 -or $port -eq $pgadmin_port)

    (Get-Content .env) | ForEach-Object { $_ -replace "PORT=.*", "PORT=$port" -replace "PGADMIN_PORT=.*", "PGADMIN_PORT=$pgadmin_port" } | Set-Content .env

    $edit = Read-Host "Voulez-vous modifier d'autres parametres ? (o/N)"
    if ($edit -eq "o" -or $edit -eq "O") {
        Write-Host "Modification du fichier .env..."
        notepad .env
    }
}

# Démarrage de l'application avec Docker Compose.
function Start-Application {
    Write-Host "Demarrage de l'application avec Docker Compose..."
    
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Host "Le fichier docker-compose.yml est introuvable." -ForegroundColor Red
        exit 1
    }

    docker compose up -d

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Une erreur est survenue." -ForegroundColor Red
        $delete = Read-Host "Voulez-vous supprimer Algoforge ? (O/n)"
        if ($delete -eq "o" -or $delete -eq "O" -or [string]::IsNullOrWhiteSpace($delete)) {
            Set-Location ..
            Remove-Item -Recurse -Force "Algoforge"
        }
        exit 1
    }
}

# Exécution des fonctions.
Check-Requirements
Clone-Repository
Update-Repository
Rename-Env-File
Edit-Env-File
Start-Application
