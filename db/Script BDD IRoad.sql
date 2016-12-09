-- Table Grade

DROP TABLE IF EXISTS `grade`;
CREATE TABLE IF NOT EXISTS `grade` (
  `grade` varchar(25) NOT NULL UNIQUE,
  `score` varchar(250) NOT NULL,
  PRIMARY KEY (`grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Table Icone

DROP TABLE IF EXISTS `icone`;
CREATE TABLE IF NOT EXISTS `icone` (
  `icone` varchar(25) NOT NULL UNIQUE,
  `image` varchar(250) NOT NULL,
  PRIMARY KEY (`icone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Table Type_Signalement

DROP TABLE IF EXISTS `type_signalement`;
CREATE TABLE IF NOT EXISTS `type_signalement` (
  `libelle_type` varchar(25) NOT NULL UNIQUE,
  `image` varchar(250) NOT NULL,
  PRIMARY KEY (`libelle_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Table Utilisateur

DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE IF NOT EXISTS `utilisateur` (
  `login` varchar(45) NOT NULL UNIQUE,
  `password` varchar(45) NOT NULL,
  `avatar` varchar(45) NOT NULL,
  `nom` varchar(45) NOT NULL,
  `prenom` varchar(45) NOT NULL,
  `adress` varchar(125) NOT NULL,
  `is_visible` tinyint(1) DEFAULT '1',
  `lat_user` float(25) NOT NULL,
  `lng_user` float(25) NOT NULL,
  `date_inscription` date NOT NULL,
  `points` int(11) DEFAULT NULL,
  `icone` varchar(45) NOT NULL,
  `grade` varchar(45) NOT NULL,
  PRIMARY KEY (`login`),
  KEY `user_ibfk_1` (`icone`),
  KEY `user_ibfk_2` (`grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contraintes pour la Table Utilisateur
--
ALTER TABLE `utilisateur`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`icone`) REFERENCES `icone` (`icone`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `user_ibfk_2` FOREIGN KEY (`grade`) REFERENCES `grade` (`grade`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- Table Sous_Type_Signalement

DROP TABLE IF EXISTS `sous_type_signalement`;
CREATE TABLE IF NOT EXISTS `sous_type_signalement` (
  `libelle_sous_type` varchar(25) NOT NULL UNIQUE,
  `image` varchar(250) NOT NULL,
  `libelle_type` varchar(25) NOT NULL,
  PRIMARY KEY (`libelle_sous_type`),
  KEY `sous_type_ibfk_1` (`libelle_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contraintes pour la Table Sous_Type_Signalement
--
ALTER TABLE `sous_type_signalement`
  ADD CONSTRAINT `sous_type_ibfk_1` FOREIGN KEY (`libelle_type`) REFERENCES `type_signalement` (`libelle_type`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- Table Signalement

DROP TABLE IF EXISTS `signalement`;
CREATE TABLE IF NOT EXISTS `signalement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(45) NOT NULL UNIQUE,
  `longitude` float NOT NULL,
  `latitude` float NOT NULL,
  `date_signalement` date NOT NULL,
  `note` int(11) DEFAULT '0',
  `libelle_type` varchar(25) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `signalement_ibfk_1` (`libelle_type`),
  KEY `signalement_ibfk_2` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;

--
-- Contraintes pour la Table Signalement
--
ALTER TABLE `signalement`
  ADD CONSTRAINT `signalement_ibfk_1` FOREIGN KEY (`libelle_type`) REFERENCES `type_signalement` (`libelle_type`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `signalement_ibfk_2` FOREIGN KEY (`login`) REFERENCES `utilisateur` (`login`) ON DELETE NO ACTION ON UPDATE CASCADE;