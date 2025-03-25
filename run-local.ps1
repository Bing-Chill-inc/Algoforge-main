# Verification des prerequis.
function Check-Requirements {
    Write-Host "Verification des prerequis..."
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "Git n'est pas installe. Veuillez l'installer depuis https://git-scm.com/downloads."
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }
    if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
        Write-Host "Bun n'est pas installe. Veuillez l'installer depuis https://bun.sh/"
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }
}

# Cloner le depot GitHub.
function Clone-Repository {
    $currentFolder = Split-Path -Leaf -Path (Get-Location)
    if ($currentFolder -eq "Algoforge") {
        Write-Host "Le dossier 'Algoforge' existe deja et vous etes actuellement dedans. Passage a l'etape suivante..."
        return
    }

    if (Test-Path -Path "Algoforge") {
        Write-Host "Le dossier 'Algoforge' existe deja. Passage a l'etape suivante..."
        try {
            Set-Location -Path "Algoforge"
        }
        catch {
            Write-Host "Le dossier 'Algoforge' n'existe pas. Verifiez le nom du dossier."
            return
        }
        return
    }

    Write-Host "Telechargement de l'application depuis GitHub..."
    try {
        git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git
    }
    catch {
        Write-Host "Echec du clonage du depot. Verifiez votre connexion internet."
        return
    }

    try {
        Rename-Item -Path "Algoforge-main" -NewName "Algoforge"
    }
    catch {
        Write-Host "Echec du renommage du dossier 'Algoforge-main' en 'Algoforge'."
        Del-Repository
        return
    }

    try {
        Set-Location -Path "Algoforge"
    }
    catch {
        Write-Host "Le dossier 'Algoforge' n'existe pas. Verifiez le clonage du depot."
        return
    }
}

# Mettre a jour le depot GitHub.
function Update-Repository {
    Write-Host "Mise a jour du depot..."
    try {
        git pull
    }
    catch {
        Write-Host "Echec de la mise a jour du depot. Verifiez votre connexion internet."
        Del-Repository
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }

    Write-Host "Mise a jour des sous-modules..."
    try {
        git submodule update --init --recursive
    }
    catch {
        Write-Host "Echec de la mise a jour des sous-modules."
        Del-Repository
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }
}

# Renommer le fichier template-local.env en .env.
function Rename-EnvFile {
    if (Test-Path -Path ".env") {
        Write-Host "Le fichier '.env' existe deja."
        $response = Read-Host "Voulez-vous le reinitialiser ? (o/N)"
        if ($response -eq "o" -or $response -eq "O") {
            try {
                Remove-Item -Path ".env"
            }
            catch {
                Write-Host "Echec de la suppression du fichier '.env'."
                Del-Repository
                return
            }
        }
        else {
            Write-Host "Demarrage de l'application avec le fichier '.env' existant..."
            return
        }
    }

    if (-not (Test-Path -Path "template-local.env")) {
        Write-Host "Le fichier 'template-local.env' est introuvable. Assurez-vous que le depot a ete clone correctement."
        return
    }

    try {
        Copy-Item -Path "template-local.env" -Destination "template-local-copy.env"
    }
    catch {
        Write-Host "Echec de la copie du fichier 'template-local.env'."
        Del-Repository
        return
    }

    try {
        Rename-Item -Path "template-local-copy.env" -NewName ".env"
    }
    catch {
        Write-Host "Echec du renommage du fichier 'template-local.env' en '.env'."
        Del-Repository
        return
    }
}

# Vérification et ajustement du type de base de données.
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

    # Vérification et correction de DATABASE_TYPE
    if ($db_type -ne "sqlite") {
        Write-Host "Le type de base de donnees est incorrect. Ajustement a 'sqlite'." -ForegroundColor Yellow
        (Get-Content .env) | ForEach-Object { $_ -replace "^DATABASE_TYPE\s*=.*", 'DATABASE_TYPE = "sqlite"' } | Set-Content .env
    }

    # Vérification et correction de DATABASE_NAME
    if ($db_name -ne "db_algoforge.sqlite") {
        Write-Host "Le nom de la base de donnees est incorrect. Ajustement a 'db_algoforge.sqlite'." -ForegroundColor Yellow
        (Get-Content .env) | ForEach-Object { $_ -replace "^DATABASE_NAME\s*=.*", 'DATABASE_NAME = "db_algoforge.sqlite"' } | Set-Content .env
    }

    Write-Host "Type de base de donnees et nom de la base de donnees verifiés et ajustés si necessaire." -ForegroundColor Green
}

# Lancer l'application avec bun.
function Start-Application {
    Write-Host "Demarrage de l'application avec Bun..."
    try {
        Set-Location -Path "src/back"
    }
    catch {
        Write-Host "Le dossier 'src/back' n'existe pas. Verifiez le clonage du depot."
        Read-Host -Prompt "Appuyez sur Entree pour continuer..."
        return
    }

    try {
        bun run prod
        if ($LASTEXITCODE -ne 0) {
            throw "Echec du demarrage de l'application. Verifiez votre installation de Bun."
        }
    }
    catch {
        Write-Host "Echec du demarrage de l'application. Verifiez votre installation de Bun."
        Del-Repository
        return
    }

    # Recuperation du port a partir du fichier .env.
    $port = (Get-Content -Path "../../.env" | Select-String -Pattern "^PORT =").ToString().Split("=")[1].Trim()

    Write-Host "L'application est en train de demarrer en arriere-plan !"
    Write-Host "Ouvrez un navigateur et entrez l'adresse: http://localhost:$port"
    Read-Host -Prompt "Appuyez sur Entree pour continuer..."
}

# Demander si l'utilisateur souhaite supprimer le dossier Algoforge / Algoforge-main.
function Del-Repository {
    $del_response = Read-Host "Voulez-vous supprimer le dossier 'Algoforge' ou 'Algoforge-main' ? (o/N)"
    if ($del_response -eq "o" -or $del_response -eq "O") {
        $currentFolder = Split-Path -Leaf -Path (Get-Location)
        
        if ($currentFolder -eq "Algoforge") {
            Set-Location -Path ".."
            Remove-Item -Path "Algoforge" -Recurse -Force
        }
        
        if (Test-Path -Path "Algoforge") {
            Remove-Item -Path "Algoforge" -Recurse -Force
        }
        
        if (Test-Path -Path "Algoforge-main") {
            Remove-Item -Path "Algoforge-main" -Recurse -Force
        }
    }
    Read-Host -Prompt "Appuyez sur Entree pour continuer..."
    return
}

# Execution des fonctions.
Check-Requirements
Clone-Repository
Update-Repository
Rename-EnvFile
Check-Database-Type
Start-Application
