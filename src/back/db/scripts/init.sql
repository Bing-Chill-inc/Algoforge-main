CREATE TABLE IF NOT EXISTS Utilisateur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    adresseMail VARCHAR(255) NOT NULL,
    mdpHash VARCHAR(255) NOT NULL,
    dateInscription DATE NOT NULL,
    theme INT NOT NULL,
    urlPfp VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Dossier (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    idParent INT,
    FOREIGN KEY (idParent) REFERENCES Dossier(id)
);

CREATE TABLE IF NOT EXISTS Algorithme (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    dateCreation DATE NOT NULL,
    dateModification DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS PermDossier (
    idUtilisateur INT NOT NULL,
    idDossier INT NOT NULL,
    droits VARCHAR(255) NOT NULL,
    PRIMARY KEY (idUtilisateur, idDossier),
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(id),
    FOREIGN KEY (idDossier) REFERENCES Dossier(id)
);

CREATE TABLE IF NOT EXISTS PermAlgorithme (
    idUtilisateur INT NOT NULL,
    idAlgorithme INT NOT NULL,
    droits VARCHAR(255) NOT NULL,
    PRIMARY KEY (idUtilisateur, idAlgorithme),
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(id),
    FOREIGN KEY (idAlgorithme) REFERENCES Algorithme(id)
);
