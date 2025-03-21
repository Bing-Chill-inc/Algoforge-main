#!/bin/bash

# Vérification des prérequis.
check_requirements() {
	echo "⚙️ Vérification des prérequis..."
	command -v git >/dev/null 2>&1 || { echo >&2 "⚠️ Git n'est pas installé. Veuillez l'installer depuis https://git-scm.com/downloads."; exit 1; }
	command -v docker >/dev/null 2>&1 || { echo >&2 "⚠️ Docker n'est pas installé. Veuillez l'installer depuis https://docker.com."; exit 1; }
	docker compose version >/dev/null 2>&1 || { echo >&2 "⚠️ Docker Compose n'est pas installé. Veuillez l'installer depuis https://docs.docker.com/compose/install/."; exit 1; }
}

# Cloner le dépôt GitHub.
clone_repository() {
	echo "⚙️ Téléchargement de l'application depuis GitHub..."
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
	echo "⚙️ Mise à jour des sous-modules..."
	git submodule update --init --recursive || { echo "⚠️ Échec de la mise à jour des sous-modules."; del_repository; exit 1; }
}

# Renommer le fichier template-docker.env en .env.
rename_env_file() {
	if [ ! -f "template-docker.env" ]; then
    	echo "⚠️ Le fichier 'template-docker.env' est introuvable. Assurez-vous que le dépôt a été cloné correctement."
    	exit 1
	fi
	mv template-docker.env .env || { echo "⚠️ Échec du renommage du fichier 'template-docker.env' en '.env'."; del_repository; exit 1; }
}

# Modifier le fichier .env pour ajouter les informations de connexion à la base de données.
edit_env_file() {
	echo "Pour les valeurs par défaut, appuyez sur Entrée."

	# Modification des ports pour éviter les conflits.
	echo "Veuillez saisir le port que vous souhaitez utiliser pour l'application (par défaut 5205) :"
	read port

	if [ -z "$port" ]; then
    	port=5205
	fi

	while ! echo "$port" | grep -qE '^[0-9]+$' || [ "$port" -lt 1024 ] || [ "$port" -gt 65535 ]; do
    	echo "⚠️ Le port doit être un nombre entier entre 1024 et 65535."
    	read port
    	if [ -z "$port" ]; then
        	port=5205
    	fi
	done

	sed -i "s/5205/$port/g" .env

	echo "Veuillez saisir le port que vous souhaitez utiliser pour pgadmin (par défaut 5300) :"
	read pgadmin_port

	if [ -z "$pgadmin_port" ]; then
    	pgadmin_port=5300
	fi

	while ! echo "$pgadmin_port" | grep -qE '^[0-9]+$' || [ "$pgadmin_port" -lt 1024 ] || [ "$pgadmin_port" -gt 65535 ] || [ "$pgadmin_port" -eq "$port" ]; do
    	echo "⚠️ Le port doit être un nombre entier entre 1024 et 65535, et différent du port de l'application."
    	read pgadmin_port
    	if [ -z "$pgadmin_port" ]; then
        	pgadmin_port=5300
    	fi
	done

	sed -i "s/5300/$pgadmin_port/g" .env

	# Demander à l'utilisateur s'il souhaite modifier le fichier .env.
	echo "Souhaitez-vous modifier les informations de connexion à la base de données (modifier le .env) ? (o/N)"
	read response
	if [ "$response" = "o" ] || [ "$response" = "O" ]; then
    	nano .env
	fi
}

# Lancer l'application avec docker compose.
start_application() {
	echo "⚙️ Démarrage de l'application avec Docker Compose..."
	docker compose up --wait || { echo "⚠️ Échec du démarrage de l'application avec docker compose."; del_repository; exit 1; }
}

# Demander si l'utilisateur souhaite supprimer le dossier Algoforge / Algoforge-main.
del_repository() {
	echo "Voulez-vous supprimer le dossier 'Algoforge' ou 'Algoforge-main' ? (O/n)"
	read del_response
	if [ "$del_response" = "o" ] || [ "$del_response" = "O" ] || [ "$del_response" = "" ]; then
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
edit_env_file
start_application

echo "✔️ L'application est en train de démarrer en arrière-plan !"
echo "Ouvrez un navigateur et entrez l'adresse: http://localhost:$port"