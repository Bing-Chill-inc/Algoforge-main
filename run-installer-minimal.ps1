# Vérification des prérequis.
function Check-Requirements {
    Write-Host "⚙️ Vérification des prérequis..."
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "⚠️ Git n'est pas installé. Veuillez l'installer depuis https://git-scm.com/downloads."
        exit 1
    }
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "⚠️ Docker n'est pas installé. Veuillez l'installer depuis https://docker.com."
        exit 1
    }
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "⚠️ Docker Compose n'est pas installé. Veuillez l'installer depuis https://docs.docker.com/compose/install/."
        exit 1
    }
}

# Cloner le dépôt GitHub.
function Clone-Repository {
    Write-Host "⚙️ Téléchargement de l'application depuis GitHub..."
    if (Test-Path "Algoforge") {
        Write-Error "⚠️ Le dossier 'Algoforge' existe déjà. Veuillez le supprimer ou choisir un autre emplacement."
        exit 1
    }

    git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Échec du clonage du dépôt. Vérifiez votre connexion internet."
        exit 1
    }

    Rename-Item -Path "Algoforge-main" -NewName "Algoforge"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "⚠️ Échec du renommage du dossier 'Algoforge-main' en 'Algoforge'."
        exit 1
    }

    Set-Location -Path "Algoforge"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "⚠️ Le dossier 'Algoforge' n'existe pas. Vérifiez le clonage du dépôt."
        exit 1
    }
}

# Mettre à jour le dépôt GitHub.
function Update-Repository {
    Write-Host "⚙️ Mise à jour des sous-modules..."
    git submodule update --init --recursive
    if ($LASTEXITCODE -ne 0) {
        Write-Error "⚠️ Échec de la mise à jour des sous-modules."
        exit 1
    }
}

# Renommer le fichier template.env en .env.
function Rename-Env-File {
    if (-not (Test-Path "template.env")) {
        Write-Error "⚠️ Le fichier 'template.env' est introuvable. Assurez-vous que le dépôt a été cloné correctement."
        exit 1
    }
    Rename-Item -Path "template.env" -NewName ".env"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "⚠️ Échec du renommage du fichier 'template.env' en '.env'."
        exit 1
    }
}

# Lancer l'application avec docker-compose.
function Start-Application {
    Write-Host "⚙️ Démarrage de l'application avec Docker Compose..."
    docker-compose up --wait
    if ($LASTEXITCODE -ne 0) {
        Write-Error "⚠️ Échec du démarrage de l'application avec docker-compose."
        exit 1
    }
}

# Exécution des fonctions.
Check-Requirements
Clone-Repository
Update-Repository
Rename-Env-File
Generate-Secret-Key
Start-Application

Write-Host "✔️ L'application est maintenant disponible dans quelques secondes ! Ouvrez un navigateur et entrez l'adresse: http://localhost:5205"