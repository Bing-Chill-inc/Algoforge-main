CREATE TABLE IF NOT EXISTS utilisateur (
    id SERIAL PRIMARY KEY,
    adressemail VARCHAR(255) NOT NULL,
    pseudo VARCHAR(255) NOT NULL,
    mdphash VARCHAR(255) NOT NULL,
    dateinscription BIGINT NOT NULL,
    theme INT NOT NULL DEFAULT 0,
    urlpfp VARCHAR(255),
    isverified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS token (
    token VARCHAR(255) PRIMARY KEY,
    datecreation BIGINT NOT NULL,
    dateexpiration BIGINT NOT NULL,
    idutilisateur INT NOT NULL,
    FOREIGN KEY (idutilisateur) REFERENCES utilisateur(id)
);

CREATE TABLE IF NOT EXISTS dossier (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL DEFAULT 'Nouveau dossier',
    datecreation BIGINT NOT NULL,
    datemodification BIGINT NOT NULL,
    idparent INT,
    FOREIGN KEY (idparent) REFERENCES dossier(id)
);

CREATE TABLE IF NOT EXISTS algorithme (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL DEFAULT 'Nouvel algorithme',
    datecreation BIGINT NOT NULL,
    datemodification BIGINT NOT NULL,
    iddossier INT NOT NULL,
    FOREIGN KEY (iddossier) REFERENCES dossier(id)
);

CREATE TABLE IF NOT EXISTS permdossier (
    idutilisateur INT NOT NULL,
    iddossier INT NOT NULL,
    droits VARCHAR(255) NOT NULL,
    PRIMARY KEY (idutilisateur, iddossier),
    FOREIGN KEY (idutilisateur) REFERENCES utilisateur(id),
    FOREIGN KEY (iddossier) REFERENCES dossier(id)
);

CREATE TABLE IF NOT EXISTS permalgorithme (
    idutilisateur INT NOT NULL,
    idalgorithme INT NOT NULL,
    droits VARCHAR(255) NOT NULL,
    PRIMARY KEY (idutilisateur, idalgorithme),
    FOREIGN KEY (idutilisateur) REFERENCES utilisateur(id),
    FOREIGN KEY (idalgorithme) REFERENCES algorithme(id)
);
