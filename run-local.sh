#!/bin/bash

# Vérification des prérequis.
check_requirements() {
	echo "⚙️ Vérification des prérequis..."
    command -v git >/dev/null 2>&1 || { echo >&2 "⚠️ Git n'est pas installé. Veuillez l'installer depuis https://git-scm.com/downloads."; exit 1; }
    command -v bun >/dev/null 2>&1 || { echo >&2 "⚠️ Bun n'est pas installé. Veuillez l'installer depuis https://bun.sh/."; exit 1; }
}

# Cloner le dépôt GitHub.
clone_repository() {
    if [ -d "Algoforge" ]; then
        if [ "$(pwd)" != "$(pwd)/Algoforge" ]; then
			return
        fi
        echo "⚙️ Le dossier 'Algoforge' existe déjà. Passage à l'étape suivante..."
        cd Algoforge || { echo "⚠️ Le dossier 'Algoforge' n'existe pas. Vérifiez le nom du dossier."; exit 1; }
        return
    fi

	echo "⚙️ Téléchargement de l'application depuis GitHub..."
	git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git || { echo "Échec du clonage du dépôt. Vérifiez votre connexion internet."; exit 1; }
	mv Algoforge-main Algoforge || { echo "⚠️ Échec du renommage du dossier 'Algoforge-main' en 'Algoforge'."; del_repository; exit 1; }
	cd Algoforge || { echo "⚠️ Le dossier 'Algoforge' n'existe pas. Vérifiez le clonage du dépôt."; exit 1; }
}

# Mettre à jour le dépôt GitHub.
update_repository() {
	echo "⚙️ Mise à jour des sous-modules..."
	git pull || { echo "⚠️ Échec de la mise à jour du dépôt. Vérifiez votre connexion internet."; del_repository; exit 1; }
	echo "⚙️ Mise à jour des sous-modules..."
	git submodule update --init --recursive || { echo "⚠️ Échec de la mise à jour des sous-modules."; del_repository; exit 1; }
}

# Renommer le fichier template-local.env en .env.
rename_env_file() {
	if [ ! -f "template-local.env" ]; then
    	echo "⚠️ Le fichier 'template-local.env' est introuvable. Assurez-vous que le dépôt a été cloné correctement."
    	exit 1
	fi
	mv template-local.env .env || { echo "⚠️ Échec du renommage du fichier 'template-local.env' en '.env'."; del_repository; exit 1; }
}

# Lancer l'application avec bun.
start_application() {
	echo "⚙️ Démarrage de l'application avec Bun..."
    cd src/back || { echo "⚠️ Le dossier 'src/back' n'existe pas. Vérifiez le clonage du dépôt."; exit 1; }
    bun run prod || { echo "⚠️ Échec du démarrage de l'application. Vérifiez votre installation de Bun."; del_repository; exit 1; }
}

# Demander si l'utilisateur souhaite supprimer le dossier Algoforge / Algoforge-main.
del_repository() {
	echo "Voulez-vous supprimer le dossier 'Algoforge' ou 'Algoforge-main' ? (O/n)"
	read del_response
	if [ "$del_response" = "o" ] || [ "$del_response" = "O" ] || [ "$del_response" = "" ]; then
    	[ -d "Algoforge" ] && rm -rf Algoforge
    	[ -d "Algoforge-main" ] && rm -rf Algoforge-main
		[ "$(pwd)" != "$(pwd)/Algoforge" ] && cd .. && rm -rf Algoforge
	fi
	exit 1
}

# Exécution des fonctions.
check_requirements
clone_repository
update_repository
rename_env_file
start_application

# Récupération du port à partir du fichier .env.
port=$(grep -oP '(?<=^PORT =).*' .env)

echo "✔️ L'application est en train de démarrer en arrière-plan !"
echo "Ouvrez un navigateur et entrez l'adresse: http://localhost:$port"