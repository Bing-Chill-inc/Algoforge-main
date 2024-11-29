# Algoforge

![Le logo d'AlgoForge](logo.png)

## Table des matières

-   [Pitch](#pitch)
-   [Fonctionnalités de l'application (WIP)](#fonctionnalités-de-lapplication)
-   [Utilisation](#utilisation)
    -   [Version en ligne](#version-en-ligne)
    -   [Version docker](#version-docker)
        -   [Programmes requis](#programmes-requis)
        -   [Installation](#installation)
    -   [Version manuelle](#version-manuelle)
        -   [Programmes requis](#programmes-requis-1)
        -   [Installation](#installation-1)
    -   [Version de bureau (WIP)](#version-de-bureau)
-   [Identité collaborateurs](#identité-collaborateurs)
-   [Structure des dossiers (WIP)](#structure-des-dossiers)

## Pitch

**AlgoForge** est une application de **conception d'algorithmes** qui offre de nombreux avantages aux utilisateurs. Notre produit a pour objectif de faire mieux que ce que l’on connaît depuis déjà plus de 15 ans. Il se veut simple, épuré et surtout rapide d’utilisation.

A la demande de beaucoup d’étudiants et d’enseignants impliqués dans le processus de création d’algorithmes, nous imaginons un **outil répondant à ces attentes**. C’est pour cela qu’il nous tient à cœur de le rendre **gratuit et open source**.

Parce que AlgoForge n’est pas seulement une application qui permet de concevoir des algorithmes, c’est aussi une **clé** pour beaucoup d’étudiants vers une expérience **d'apprentissage** sans tracas inutile qui pourrait être évité avec le bon outil.

Cet outil, nous le savons, se doit de répondre à tous les problèmes de ses prédécesseurs et même si cela n’est pas tâche aisée, nous savons que son existence profitera à de nombreuses personnes.

Si AlgoForge sait se différencier de ses concurrents, c’est parce qu'elle est conçue par et pour des étudiants qui ont eu le temps d'appréhender les problèmes récurrents mais aussi les avantages notables des différentes applications de conception d’algorithmes, nos concurrents qui nous ont permis de guider une réflexion dans la création d'AlgoForge.

Pour pallier les problèmes rencontrés lors de l’utilisation de Tabula Rasa, l’interface d'AlgoForge s'adaptera à la résolution de l’écran sur lequel il est utilisé. Le rendu dynamique de l'algorithme dans l'application sera similaire au rendu obtenu en utilisant les fonctions d'exportation.

Dans le rendu dynamique, les cases auront une taille flexible et le texte qu’elles contiennent ne reviendra pas à la ligne sauf si nécessaire pour une meilleure lisibilité. Le texte sera clairement visible dans ce mode de rendu car il aura la taille appropriée pour s'adapter à la boîte. Lors du rendu en png, jpg, pdf ou svg, la taille du texte s'adaptera aux boîtes pour éviter les débordements, et le texte ne débordera pas.

Et comme la taille du texte sera définie pour chaque boîte individuellement, même si une instruction est un peu longue, cela n'aura pas d'impact sur la taille du texte de tout le document. De plus, puisque le rendu dynamique sera similaire au rendu final, il sera facile de prédire le rendu du logiciel avant qu'il ne soit exporté. L’application proposera également une commande de retour arrière ("CTRL+Z") et d’autres raccourcis claviers, ce qui sera très utile pour la conception d'algorithmes.

C’est pour toutes ces raisons que notre application saura satisfaire ses utilisateurs, que ce soit les étudiants ou les enseignants du BUT informatique de Bayonne, elle fluidifiera la conception d’algorithmes et rendra cette tâche redondante un peu plus agréable.

**AlgoForge** est également **indépendant du système** d’exploitation de par sa nature d’application web, fonctionnant sur n'importe quel ordinateur avec un navigateur web, ce qui la rend compatible avec tous les systèmes d'exploitation. En outre, étant basée sur le web, elle est disponible en ligne, à tout moment et de n'importe où, sans **aucune limitation de temps ou de lieu**.

L'application proposera également, dans la mesure du possible, une **assistance à la conception** en détectant certaines erreurs de conception (exemples : Pas de conditions d’arrêt dans une structure itérative, plus de 7 sous-problèmes,…). Enfin, la plateforme collaborative permet aux utilisateurs de **travailler ensemble** sur des projets et de partager leurs algorithmes avec d'autres membres de la communauté, ce qui facilite le travail en groupe et accélère le processus créatif.

En somme, **AlgoForge** est une application de conception d'algorithmes pratique et facile à utiliser, qui offre un respect parfait du formalisme de l’IUT informatique de Bayonne et permet une collaboration entre les utilisateurs par le biais de partage d’algorithmes. Sa gratuité et sa particularité d’être une application web en font un choix idéal pour les étudiants en informatique et tous ceux qui cherchent à concevoir des algorithmes rapidement et efficacement.

Précédemment nommé I Need Algo, **AlgoForge** a changé de nom pour aborder un aspect plus professionnel et sérieux. Nous apprécions le côté humoristique du jeu de mots avec Anne Hidalgo. Mais, sachant qu’il ne fait en fait pas vraiment de sens avec l’application et que cette boutade n’est intemporelle, nous avons opté pour ce nouveau nom que nous pensons plus élégant et qui durera dans le temps.

## Fonctionnalités de l'application

-   Espace cloud pour la gestion des algorithmes:
    -   Dossiers pour organiser les algorithmes.
    -   Partage d'algorithmes possible avec d'autres utilisateurs, en lecture seule ou en lecture/écriture.
-   Editeur d'algorithme complet:
    -   Plusieurs thèmes.
    -   Importation d'algorithmes.
    -   Exportation d'algorithmes sous différent formats, avec une sélection ou tout l'algorithme.
    -   Détection d'anomalies dans l'algorithme.
    -   Bibliotheque d'algorithmes, privée et publique.
    -   Imbrication des algorithmes dans d'autres algorithmes pour une meilleure lisibilité.
    -   Zoom dynamique, raccourcis clavier, menu contextuel complet.

## Utilisation

AlgoForge est utilisable de deux manières différentes: en ligne sur un navigateur ou en local sur un ordinateur (avec une installation simple docker-compose ou même manuelle).

### Version en ligne

Pour utiliser AlgoForge en ligne, vous pouvez vous rendre sur ce lien : https://algoforge.fr/

### Version docker

La version docker de l'application comprend une base de données PostgreSQL ainsi que l'application PGAdmin pour la gestion de la base de données.

#### Programmes requis

-   Rendre disponible 2 ports: l'un pour l'application et l'autre pour PGAdmin.
-   Installer [git](https://git-scm.com/downloads).
-   Installer [Docker](https://docker.com).

> [!CAUTION]
> Docker doit être démarré quand vous voulez utiliser l’application.

#### Installation

1. Télécharger le programme grâce à la commande git suivante:

```
git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge.git
```

2. Se placer dans le dossier Algoforge:

```
cd Algoforge
```

3. Renommer le fichier template.env en .env:

```
mv template.env .env
```

4. Modifier le fichier .env pour ajouter les informations de connexion à la base de données.
    > [!CAUTION]  
    > Si vous utilisez notre version de docker-compose, vous devez utiliser comme base de données PostgreSQL.
5. Lancer l’application avec la commande suivante:

```
docker-compose up --wait
```

L’application est maintenant disponible ! Ouvrez un navigateur et entrez l'adresse: http://localhost:5205

### Version manuelle

#### Programmes requis

-   Rendre disponible 1 port pour l'application.
-   Installer [git](https://git-scm.com/downloads).
-   Installer [Bun](https://bun.sh), testé avec la version 1.1.34.

#### Installation:

1. Télécharger le programme grâce à la commande git suivante:

```
git clone --depth 1 --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge.git
```

2. Se placer dans le dossier Algoforge:

```
cd Algoforge
```

3. Renommer le fichier template.env en .env:

```
mv template.env .env
```

4. Modifier le fichier .env pour ajouter les informations de connexion à la base de données.
5. Se placer dans le dossier back-end:

```
cd src/back-end
```

6. Lancer l’application avec la commande suivante:

```
bun run prod
```

_(Cette dernière va directement télécharger et installer les dépendances nécessaires)_

L’application est maintenant disponible ! Ouvrez un navigateur et entrez l'adresse: http://localhost:3000

### Version de bureau

WIP

## Identité collaborateurs

-   Esteban BACKES: [**@Eliossore**](https://github.com/Eliossore)
-   Jokin SUARES: [**@Feror-BotMaker**](https://github.com/Feror-BotMaker)
-   Maxime JACOB-SAUSSEREAU: [**@Fetnmax**](https://github.com/Fetnmax)
-   Fabien SPROCQ: [**@Sprocq**](https://github.com/Sprocq)
-   Samuel CURRAN: [**@SamuelCURRAN0**](https://github.com/SamuelCURRAN0)
-   Mathieu FOISSAC: [**@ToxykAuBleu**](https://github.com/ToxykAuBleu)
-   Adrien HIRIBARREN TOUYA: [**@Alakamar**](https://github.com/Alakamar)
-   Lucas MARROT: [**@LucasMarrot**](https://github.com/LucasMarrot)
-   Romain LABORDE: [**@RomLabo**](https://github.com/RomLabo)

## Structure des dossiers

(WIP)

-   Le dossier src héberge le Code de l'algorithme
