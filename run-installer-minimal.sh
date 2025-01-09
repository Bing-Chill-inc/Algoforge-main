#!/bin/bash

# Vérification des prérequis.
check_requirements() {
    echo "⚙️ Vérification des prérequis...\n"
    git -v >/dev/null 2>&1 || { echo >&2 "⚠️ Git n'est pas installé. Veuillez l'installer depuis https://git-scm.com/downloads."; exit 1; }
    docker -v >/dev/null 2>&1 || { echo >&2 "⚠️ Docker n'est pas installé. Veuillez l'installer depuis https://docker.com."; exit 1; }
    docker compose -v >/dev/null 2>&1 || { echo >&2 "⚠️ Docker Compose n'est pas installé. Veuillez l'installer depuis https://docs.docker.com/compose/install/."; exit 1; }
}

# Cloner le dépôt GitHub.
clone_repository() {
    echo "⚙️ Téléchargement de l'application depuis GitHub...\n"
    if [ -d "Algoforge" ]; then
        echo "⚠️ Le dossier 'Algoforge' existe déjà. Veuillez le supprimer ou choisir un autre emplacement."
        del_repository
        exit 1
    fi

    git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git || { echo "Échec du clonage du dépôt. Vérifiez votre connexion internet."; exit 1; }
    mv Algoforge-main Algoforge || { echo "⚠️ Échec du renommage du dossier 'Algoforge-main' en 'Algoforge'."; del_repository; exit 1; }
    cd Algoforge || { echo "⚠️ Le dossier 'Algoforge' n'existe pas. Vérifiez le clonage du dépôt."; exit 1; }
}

# Mettre à jour le dépôt GitHub.
update_repository() {
    echo "⚙️ Mise à jour des sous-modules...\n"
    git submodule update --init --recursive || { echo "⚠️ Échec de la mise à jour des sous-modules."; del_repository; exit 1; }
}

# Renommer le fichier template.env en .env.
rename_env_file() {
    if [ ! -f "template.env" ]; then
        echo "⚠️ Le fichier 'template.env' est introuvable. Assurez-vous que le dépôt a été cloné correctement."
        exit 1
    fi
    mv template.env .env || { echo "⚠️ Échec du renommage du fichier 'template.env' en '.env'."; del_repository; exit 1; }
}

# Génération d'une clé secrète pour l'application.
generate_secret_key() {
    echo "⚙️ Génération d'une clé secrète pour l'application...\n"
    secret_key=$(openssl rand -base64 32)
    sed -i 's/SECRET_KEY=template_key/SECRET_KEY='$secret_key'/g' .env
}

# Lancer l'application avec docker compose.
start_application() {
    echo "⚙️ Démarrage de l'application avec Docker Compose...\n"
    docker compose up --wait || { echo "⚠️ Échec du démarrage de l'application avec docker compose."; del_repository; exit 1; }
}

# Demander si l'utilisateur souhaite supprimer le dossier Algoforge / Algoforge-main.
del_repository() {
    echo "Voulez-vous supprimer le dossier 'Algoforge' ou 'Algoforge-main' ? (o/n)"
    read response
    if [ "$response" = "o" ]; then
        [ -d "Algoforge" ] && rm -rf Algoforge
        [ -d "Algoforge-main" ] && rm -rf Algoforge-main
    fi
    exit 1
}

# Exécution des fonctions.
check_requirements
clone_repository
update_repository
rename_env_file
start_application

echo "✔️ L'application est en train de se démarrer en arrière plan !\n Ouvrez un navigateur et entrez l'adresse: http://localhost:5205 (par défaut)"