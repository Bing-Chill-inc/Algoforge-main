# Verification des prerequis.
function Check-Requirements {
    Write-Host "Verification des prerequis..."
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "Git n'est pas installe. Veuillez l'installer depuis https://git-scm.com/downloads."
        exit 1
    }
    if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
        Write-Host "Bun n'est pas installe. Veuillez l'installer depuis https://bun.sh/."
        exit 1
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
            exit 1
        }
        return
    }

    Write-Host "Telechargement de l'application depuis GitHub..."
    try {
        git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git
    }
    catch {
        Write-Host "Echec du clonage du depot. Verifiez votre connexion internet."
        exit 1
    }

    try {
        Rename-Item -Path "Algoforge-main" -NewName "Algoforge"
    }
    catch {
        Write-Host "Echec du renommage du dossier 'Algoforge-main' en 'Algoforge'."
        Del-Repository
        exit 1
    }

    try {
        Set-Location -Path "Algoforge"
    }
    catch {
        Write-Host "Le dossier 'Algoforge' n'existe pas. Verifiez le clonage du depot."
        exit 1
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
        exit 1
    }

    Write-Host "Mise a jour des sous-modules..."
    try {
        git submodule update --init --recursive
    }
    catch {
        Write-Host "Echec de la mise a jour des sous-modules."
        Del-Repository
        exit 1
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
                exit 1
            }
        }
        else {
            Write-Host "Demarrage de l'application avec le fichier '.env' existant..."
            return
        }
    }

    if (-not (Test-Path -Path "template-local.env")) {
        Write-Host "Le fichier 'template-local.env' est introuvable. Assurez-vous que le depot a ete clone correctement."
        exit 1
    }

    try {
        Copy-Item -Path "template-local.env" -Destination "template-local-copy.env"
    }
    catch {
        Write-Host "Echec de la copie du fichier 'template-local.env'."
        Del-Repository
        exit 1
    }

    try {
        Rename-Item -Path "template-local-copy.env" -NewName ".env"
    }
    catch {
        Write-Host "Echec du renommage du fichier 'template-local.env' en '.env'."
        Del-Repository
        exit 1
    }
}

# Lancer l'application avec bun.
function Start-Application {
    Write-Host "Demarrage de l'application avec Bun..."
    try {
        Set-Location -Path "src/back"
    }
    catch {
        Write-Host "Le dossier 'src/back' n'existe pas. Verifiez le clonage du depot."
        exit 1
    }

    try {
        bun run prod
    }
    catch {
        Write-Host "Echec du demarrage de l'application. Verifiez votre installation de Bun."
        Del-Repository
        exit 1
    }
}

# Demander si l'utilisateur souhaite supprimer le dossier Algoforge / Algoforge-main.
function Del-Repository {
    $del_response = Read-Host "Voulez-vous supprimer le dossier 'Algoforge' ou 'Algoforge-main' ? (O/n)"
    if ($del_response -eq "o" -or $del_response -eq "O" -or $del_response -eq "") {
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
    exit 1
}

# Execution des fonctions.
Check-Requirements
Clone-Repository
Update-Repository
Rename-EnvFile
Start-Application

# Recuperation du port a partir du fichier .env.
$port = (Get-Content -Path ".env" | Select-String -Pattern "^PORT =").ToString().Split("=")[1].Trim()

Write-Host "L'application est en train de demarrer en arriere-plan !"
Write-Host "Ouvrez un navigateur et entrez l'adresse: http://localhost:$port"
