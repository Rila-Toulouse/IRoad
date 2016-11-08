-- phpMyAdmin SQL Dump
-- version 4.5.5.1
-- http://www.phpmyadmin.net
--
-- Client :  127.0.0.1
-- Généré le :  Jeu 13 Octobre 2016 à 14:50
-- Version du serveur :  5.7.11
-- Version de PHP :  5.6.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `iroaddb`
--

-- --------------------------------------------------------

--
-- Structure de la table `grade`
--

CREATE TABLE `grade` (
  `Id` int(11) NOT NULL,
  `Libelle` varchar(50) NOT NULL,
  `Score` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `icone`
--

CREATE TABLE `icone` (
  `Id` int(11) NOT NULL,
  `Image` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `signale`
--

CREATE TABLE `signale` (
  `Id` int(11) NOT NULL,
  `Id_Signalement` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `signalement`
--

CREATE TABLE `signalement` (
  `Id` int(11) NOT NULL,
  `Longitude` float NOT NULL,
  `Latitude` float NOT NULL,
  `DateSignalement` date NOT NULL,
  `Note` int(11) DEFAULT NULL,
  `Id_TypeSignalement` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `soustypesignalement`
--

CREATE TABLE `soustypesignalement` (
  `Id` int(11) NOT NULL,
  `Libelle` varchar(250) NOT NULL,
  `Id_TypeSignalement` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `typesignalement`
--

CREATE TABLE `typesignalement` (
  `Id` int(11) NOT NULL,
  `Libelle` varchar(250) NOT NULL,
  `Image` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contenu de la table `typesignalement`
--

INSERT INTO `typesignalement` (`Id`, `Libelle`, `Image`) VALUES
(1, 'embouteillage', NULL),
(2, 'police', NULL),
(3, 'accident', NULL),
(4, 'danger', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `Id` int(11) NOT NULL,
  `Nom` varchar(250) NOT NULL,
  `Prenom` varchar(250) NOT NULL,
  `Adresse` varchar(500) NOT NULL,
  `DateInscription` date NOT NULL,
  `IsVisible` tinyint(1) DEFAULT NULL,
  `Points` int(11) DEFAULT NULL,
  `Id_Icone` int(11) NOT NULL,
  `Id_Grade` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Index pour les tables exportées
--

--
-- Index pour la table `grade`
--
ALTER TABLE `grade`
  ADD PRIMARY KEY (`Id`);

--
-- Index pour la table `icone`
--
ALTER TABLE `icone`
  ADD PRIMARY KEY (`Id`);

--
-- Index pour la table `signale`
--
ALTER TABLE `signale`
  ADD PRIMARY KEY (`Id`,`Id_Signalement`),
  ADD KEY `FK_Signale_Id_Signalement` (`Id_Signalement`);

--
-- Index pour la table `signalement`
--
ALTER TABLE `signalement`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `FK_Signalement_Id_TypeSignalement` (`Id_TypeSignalement`);

--
-- Index pour la table `soustypesignalement`
--
ALTER TABLE `soustypesignalement`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `FK_SousTypeSignalement_Id_TypeSignalement` (`Id_TypeSignalement`);

--
-- Index pour la table `typesignalement`
--
ALTER TABLE `typesignalement`
  ADD PRIMARY KEY (`Id`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `FK_Utilisateur_Id_Icone` (`Id_Icone`),
  ADD KEY `FK_Utilisateur_Id_Grade` (`Id_Grade`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `grade`
--
ALTER TABLE `grade`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `icone`
--
ALTER TABLE `icone`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `signalement`
--
ALTER TABLE `signalement`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `soustypesignalement`
--
ALTER TABLE `soustypesignalement`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT pour la table `typesignalement`
--
ALTER TABLE `typesignalement`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `signale`
--
ALTER TABLE `signale`
  ADD CONSTRAINT `FK_Signale_Id` FOREIGN KEY (`Id`) REFERENCES `utilisateur` (`Id`),
  ADD CONSTRAINT `FK_Signale_Id_Signalement` FOREIGN KEY (`Id_Signalement`) REFERENCES `signalement` (`Id`);

--
-- Contraintes pour la table `signalement`
--
ALTER TABLE `signalement`
  ADD CONSTRAINT `FK_Signalement_Id_TypeSignalement` FOREIGN KEY (`Id_TypeSignalement`) REFERENCES `typesignalement` (`Id`);

--
-- Contraintes pour la table `soustypesignalement`
--
ALTER TABLE `soustypesignalement`
  ADD CONSTRAINT `FK_SousTypeSignalement_Id_TypeSignalement` FOREIGN KEY (`Id_TypeSignalement`) REFERENCES `typesignalement` (`Id`);

--
-- Contraintes pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD CONSTRAINT `FK_Utilisateur_Id_Grade` FOREIGN KEY (`Id_Grade`) REFERENCES `grade` (`Id`),
  ADD CONSTRAINT `FK_Utilisateur_Id_Icone` FOREIGN KEY (`Id_Icone`) REFERENCES `icone` (`Id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
