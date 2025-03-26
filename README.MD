<div align=center>
    <img src="logo.png" style="width:128px" alt="Le logo d'AlgoForge"/>
    </br>
    </br>
    <a href="https://bing-chill-inc.github.io/wikiforge/" target="_blank">Wiki</a>
    -
    <a href="https://bing-chill-inc.github.io/wikiforge/docs/tutorial/self-host/install/" target="_blank">Doc d'installation</a>
    <h1>AlgoForge</h1>
</div>

## Table des matières

- [Table des matières](#table-des-matières)
- [Pitch](#pitch)
- [Fonctionnalités de l'application](#fonctionnalités-de-lapplication)
- [Utilisation / Installation](#utilisation--installation)
  - [Version en ligne](#version-en-ligne)
  - [Autres versions](#autres-versions)
- [Comment contribuer au projet ?](#comment-contribuer-au-projet-)
- [Identité collaborateurs](#identité-collaborateurs)

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

- Espace cloud pour la gestion des algorithmes:
  - Dossiers pour organiser les algorithmes.
  - Partage d'algorithmes possible avec d'autres utilisateurs, en lecture seule ou en lecture/écriture.
- Editeur d'algorithme complet:
  - Plusieurs thèmes.
  - Importation d'algorithmes.
  - Exportation d'algorithmes sous différent formats, avec une sélection ou tout l'algorithme.
  - Bibliotheque d'algorithmes, privée et publique.
  - Décomposition des algorithmes sur un autre plan de travail pour une meilleure lisibilité.
  - Zoom dynamique, raccourcis clavier, menu contextuel complet.

## Utilisation / Installation

AlgoForge est utilisable de deux manières différentes: en ligne sur un navigateur ou en local sur un ordinateur (avec une installation simple docker-compose ou même manuelle).

### Version en ligne

Pour utiliser AlgoForge en ligne, vous pouvez vous rendre sur ce lien : [https://algoforge.fr/](https://algoforge.fr/)

### Autres versions

Pour utiliser les autres versions d'Algoforge disponibles (application de bureau, ou hébergée en local), veuillez consulter la [documentation](https://bing-chill-inc.github.io/wikiforge/docs/tutorial/self-host/install/).

## Comment contribuer au projet ?

Vous avez une idée d'amélioration à mettre en place et/ou voulez contribuer à ce projet ?
Voici comment procéder :

1. **Forkez** le projet en cliquant sur le bouton **Fork** sur GitHub.
2. **Clonez** votre fork en local :

   ```sh
   git clone --recurse-submodules https://github.com/Bing-Chill-inc/Algoforge-main.git
   cd Algoforge-main
   ```

3. **Créez une nouvelle branche** pour vos modifications :

   ```sh
   git checkout -b feat/ma-nouvelle-fonctionnalite
   ```

4. **Apportez vos modifications**, puis enregistrez-les :

   ```sh
   git add .
   git commit -m "Ajout d'une nouvelle fonctionnalité"
   ```

5. **Poussez vos modifications** sur votre fork :

   ```sh
   git push origin ma-nouvelle-fonctionnalite
   ```

6. **Créez une Pull Request** depuis votre dépôt forké sur GitHub.
7. **Attendez la revue** et apportez des corrections si nécessaire.

> [!IMPORTANT]
> Si vous ne savez pas comment installer l'application en local, référez vous à la [documentation](https://bing-chill-inc.github.io/wikiforge/docs/tutorial/self-host/install/).

Merci d'avance ! 💜

## Identité collaborateurs

- Esteban BACKES: [**@Eliossore**](https://github.com/Eliossore)
- Jokin SUARES: [**@Feror-BotMaker**](https://github.com/Feror-BotMaker)
- Maxime JACOB-SAUSSEREAU: [**@Fetnmax**](https://github.com/Fetnmax)
- Fabien SPROCQ: [**@Sprocq**](https://github.com/Sprocq)
- Samuel CURRAN: [**@SamuelCURRAN0**](https://github.com/SamuelCURRAN0)
- Mathieu FOISSAC: [**@ToxykAuBleu**](https://github.com/ToxykAuBleu)
- Adrien HIRIBARREN TOUYA: [**@Alakamar**](https://github.com/Alakamar)
- Lucas MARROT: [**@LucasMarrot**](https://github.com/LucasMarrot)
- Romain LABORDE: [**@RomLabo**](https://github.com/RomLabo)
