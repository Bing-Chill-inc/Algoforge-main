#!/bin/bash

# Vérification des prérequis.
check_requirements() {
	echo "⚙️ Vérification des prérequis..."
	command -v git >/dev/null 2>&1 || { echo >&2 "⚠️ Git n'est pas installé. Veuillez l'installer depuis https://git-scm.com/downloads."; exit 1; }
	command -v docker >/dev/null 2>&1 || { echo >&2 "⚠️ Docker n'est pas installé. Veuillez l'installer depuis https://docker.com."; exit 1; }
	docker compose version >/dev/null 2>&1 || { echo >&2 "⚠️ Docker Compose n'est pas installé. Veuillez l'installer depuis https://docs.docker.com/compose/install/."; exit 1; }
}

# Cloner ou mettre à jour le dépôt GitHub.
clone_or_update_repository() {
	if [ "$(basename "$(pwd)")" == "Algoforge" ]; then
		echo "⚙️ Le dossier 'Algoforge' existe déjà et vous êtes actuellement dedans. Mise à jour du dépôt..."
		git pull || { echo "⚠️ Échec de la mise à jour du dépôt. Vérifiez votre connexion internet."; exit 1; }
		git submodule update --init --recursive || { echo "⚠️ Échec de la mise à jour des sous-modules."; exit 1; }
		return
	fi

	if [ -d "Algoforge" ]; then
		echo "⚙️ Le dossier 'Algoforge' existe déjà. Mise à jour du dépôt..."
		cd Algoforge || { echo "⚠️ Le dossier 'Algoforge' n'existe pas. Vérifiez le nom du dossier."; exit 1; }
		git pull || { echo "⚠️ Échec de la mise à jour du dépôt. Vérifiez votre connexion internet."; exit 1; }
		git submodule update --init --recursive || { echo "⚠️ Échec de la mise à jour des sous-modules."; exit 1; }
		return
	fi

	echo "⚙️ Téléchargement de l'application depuis GitHub..."
	git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git || { echo "Échec du clonage du dépôt. Vérifiez votre connexion internet."; exit 1; }
	mv Algoforge-main Algoforge || { echo "⚠️ Échec du renommage du dossier 'Algoforge-main' en 'Algoforge'."; exit 1; }
	cd Algoforge || { echo "⚠️ Le dossier 'Algoforge' n'existe pas. Vérifiez le clonage du dépôt."; exit 1; }
}

# Renommer le fichier template-docker.env en .env.
rename_env_file() {
	if [ -f ".env" ]; then
		echo "⚠️ Le fichier '.env' existe déjà. Voulez-vous le réinitialiser ? (o/N)"
		read response
		if [ "$response" = "o" ] || [ "$response" = "O" ]; then
			rm .env || { echo "⚠️ Échec de la suppression du fichier '.env'."; exit 1; }
		else
			echo "⚙️ Utilisation du fichier '.env' existant..."
			return
		fi
	fi

	if [ ! -f "template-docker.env" ]; then
		echo "⚠️ Le fichier 'template-docker.env' est introuvable. Assurez-vous que le dépôt a été cloné correctement."
		exit 1
	fi
	cp template-docker.env .env || { echo "⚠️ Échec de la copie du fichier 'template-docker.env'."; exit 1; }
}

# Vérification et ajustement du type de base de données.
check_database_type() {
    echo "⚙️ Vérification du type de base de données..."
    db_type=$(grep -oP '(?<=^DATABASE_TYPE=).*' .env)
    db_name=$(grep -oP '(?<=^DATABASE_NAME=).*' .env)
    if [ "$db_type" != "postgres" ]; then
        echo "⚠️ Le type de base de données est incorrect. Ajustement à 'postgres'."
        sed -i 's/^DATABASE_TYPE=.*/DATABASE_TYPE=postgres/' .env
    fi
    if [ "$db_name" != "db_algoforge" ]; then
        echo "⚠️ Le nom de la base de données est incorrect. Ajustement à 'db_algoforge'."
        sed -i 's/^DATABASE_NAME=.*/DATABASE_NAME=db_algoforge/' .env
    fi
}

# Modifier le fichier .env pour ajouter les informations de connexion à la base de données.
edit_env_file() {
	echo "Souhaitez-vous modifier les informations de connexion à la base de données (modifier le .env) ? (o/N)"
	read response
	if [ "$response" != "o" ] && [ "$response" != "O" ]; then
		return
	fi

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
	docker compose up --wait || { echo "⚠️ Échec du démarrage de l'application avec docker compose."; exit 1; }
}

# Exécution des fonctions.
check_requirements
clone_or_update_repository
rename_env_file
check_database_type
edit_env_file
start_application

# Récupération du port à partir du fichier .env.
port=$(grep -oP '(?<=^PORT=).*' .env)

echo "✔️ L'application est en train de démarrer en arrière-plan !"
echo "Ouvrez un navigateur et entrez l'adresse: http://localhost:$port"