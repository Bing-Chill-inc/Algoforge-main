#!/bin/bash

# Vérification des prérequis.
check_requirements() {
    echo "⚙️ Vérification des prérequis..."
    command -v git >/dev/null 2>&1 || { echo >&2 "⚠️ Git n'est pas installé. Veuillez l'installer depuis https://git-scm.com/downloads."; read -p "Appuyez sur Entrée pour continuer..."; return; }
    command -v bun >/dev/null 2>&1 || { echo >&2 "⚠️ Bun n'est pas installé. Veuillez l'installer depuis https://bun.sh/."; read -p "Appuyez sur Entrée pour continuer..."; return; }
}

# Cloner le dépôt GitHub.
clone_repository() {
    if [ "$(basename "$(pwd)")" == "Algoforge" ]; then
        echo "⚙️ Le dossier 'Algoforge' existe déjà et vous êtes actuellement dedans. Passage à l'étape suivante..."
        read -p "Appuyez sur Entrée pour continuer..."
        return
    fi

    if [ -d "Algoforge" ]; then
        echo "⚙️ Le dossier 'Algoforge' existe déjà. Passage à l'étape suivante..."
        cd Algoforge || { echo "⚠️ Le dossier 'Algoforge' n'existe pas. Vérifiez le nom du dossier."; read -p "Appuyez sur Entrée pour continuer..."; return; }
        read -p "Appuyez sur Entrée pour continuer..."
        return
    fi

    echo "⚙️ Téléchargement de l'application depuis GitHub..."
    git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git || { echo "Échec du clonage du dépôt. Vérifiez votre connexion internet."; read -p "Appuyez sur Entrée pour continuer..."; return; }
    mv Algoforge-main Algoforge || { echo "⚠️ Échec du renommage du dossier 'Algoforge-main' en 'Algoforge'."; del_repository; read -p "Appuyez sur Entrée pour continuer..."; return; }
    cd Algoforge || { echo "⚠️ Le dossier 'Algoforge' n'existe pas. Vérifiez le clonage du dépôt."; read -p "Appuyez sur Entrée pour continuer..."; return; }
}

# Mettre à jour le dépôt GitHub.
update_repository() {
    echo "⚙️ Mise à jour des sous-modules..."
    git pull || { echo "⚠️ Échec de la mise à jour du dépôt. Vérifiez votre connexion internet."; del_repository; read -p "Appuyez sur Entrée pour continuer..."; return; }
    echo "⚙️ Mise à jour des sous-modules..."
    git submodule update --init --recursive || { echo "⚠️ Échec de la mise à jour des sous-modules."; del_repository; read -p "Appuyez sur Entrée pour continuer..."; return; }
}

# Renommer le fichier template-local.env en .env.
rename_env_file() {
    if [ -f ".env" ]; then
        echo "⚠️ Le fichier '.env' existe déjà. Voulez-vous le réinitialiser ? (o/N)."
        read response
        if [ "$response" = "o" ] || [ "$response" = "O" ]; then
            rm .env || { echo "⚠️ Échec de la suppression du fichier '.env'."; del_repository; read -p "Appuyez sur Entrée pour continuer..."; return; }
        else
            echo "⚙️ Démarrage de l'application avec le fichier '.env' existant..."
            read -p "Appuyez sur Entrée pour continuer..."
            return
        fi
    fi

    if [ ! -f "template-local.env" ]; then
        echo "⚠️ Le fichier 'template-local.env' est introuvable. Assurez-vous que le dépôt a été cloné correctement."
        read -p "Appuyez sur Entrée pour continuer..."
        return
    fi
    cp template-local.env .env || { echo "⚠️ Échec de la copie du fichier 'template-local.env'."; del_repository; read -p "Appuyez sur Entrée pour continuer..."; return; }
}

# Vérification et ajustement du type de base de données.
check_database_type() {
    echo "⚙️ Vérification du type de base de données..."
    db_type=$(grep -oP '(?<=^DATABASE_TYPE = ).*' .env)
    db_name=$(grep -oP '(?<=^DATABASE_NAME = ).*' .env)
    if [ "$db_type" != "\"sqlite\"" ]; then
        echo "⚠️ Le type de base de données est incorrect. Ajustement à 'sqlite'."
        sed -i 's/^DATABASE_TYPE = .*/DATABASE_TYPE = "sqlite"/' .env
    fi
    if [ "$db_name" != "\"db_algoforge.sqlite\"" ]; then
        echo "⚠️ Le nom de la base de données est incorrect. Ajustement à 'db_algoforge.sqlite'."
        sed -i 's/^DATABASE_NAME = .*/DATABASE_NAME = "db_algoforge.sqlite"/' .env
    fi

    echo "✅ Type et nom de la base de données vérifiés et ajustés."
}

# Lancer l'application avec bun.
start_application() {
    echo "⚙️ Démarrage de l'application avec Bun..."
    cd src/back || { echo "⚠️ Le dossier 'src/back' n'existe pas. Vérifiez le clonage du dépôt."; read -p "Appuyez sur Entrée pour continuer..."; return; }
    bun run prod || { echo "⚠️ Échec du démarrage de l'application. Vérifiez votre installation de Bun."; del_repository; read -p "Appuyez sur Entrée pour continuer..."; return; }
}

# Demander si l'utilisateur souhaite supprimer le dossier Algoforge / Algoforge-main.
del_repository() {
    echo "Voulez-vous supprimer le dossier 'Algoforge' ou 'Algoforge-main' ? (o/N)"
    read del_response
    if [ "$del_response" = "o" ] || [ "$del_response" = "O" ]; then
        [ -d "Algoforge" ] && rm -rf Algoforge
        [ -d "Algoforge-main" ] && rm -rf Algoforge-main
        [ "$(basename "$(pwd)")" == "Algoforge" ] && cd .. && rm -rf Algoforge
    fi
    read -p "Appuyez sur Entrée pour continuer..."
}

# Exécution des fonctions.
check_requirements
clone_repository
update_repository
rename_env_file
check_database_type
start_application

# Récupération du port à partir du fichier .env.
port=$(grep -oP '(?<=^PORT = ).*' .env)

echo "✔️ L'application est en train de démarrer en arrière-plan !"
echo "Ouvrez un navigateur et entrez l'adresse: http://localhost:$port"
read -p "Appuyez sur Entrée pour continuer..."