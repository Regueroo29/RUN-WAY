CREATE DATABASE  IF NOT EXISTS `runway_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `runway_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: runway_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `target_id` int DEFAULT NULL,
  `details` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=367 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,3,'login',NULL,'','2026-04-07 10:49:07'),(2,3,'update_profile',NULL,'','2026-04-07 10:49:15'),(3,3,'update_profile',NULL,'','2026-04-07 10:49:24'),(4,3,'switch_role',NULL,'Switched to visitor','2026-04-07 10:49:36'),(5,3,'switch_role',NULL,'Switched to designer','2026-04-07 10:49:43'),(6,3,'switch_role',NULL,'Switched to visitor','2026-04-07 10:50:29'),(7,3,'update_profile',NULL,'','2026-04-07 10:50:34'),(8,3,'switch_role',NULL,'Switched to designer','2026-04-07 10:50:37'),(9,3,'update_profile',NULL,'','2026-04-07 10:51:26'),(10,3,'switch_role',NULL,'Switched to visitor','2026-04-07 10:51:30'),(11,3,'switch_role',NULL,'Switched to designer','2026-04-07 10:52:34'),(12,3,'upload_design',1,'Uploaded: IRyS','2026-04-07 10:52:45'),(13,3,'switch_role',NULL,'Switched to visitor','2026-04-07 10:52:53'),(14,3,'rate_design',1,'Rated 3 stars','2026-04-07 10:53:31'),(15,1,'login',NULL,'','2026-04-07 10:54:32'),(16,1,'switch_role',NULL,'Switched to visitor','2026-04-07 10:54:45'),(17,1,'switch_role',NULL,'Switched to designer','2026-04-07 10:55:23'),(18,1,'upload_design',2,'Uploaded: BABATA','2026-04-07 10:55:48'),(19,1,'switch_role',NULL,'Switched to visitor','2026-04-07 10:55:52'),(20,3,'login',NULL,'','2026-04-07 10:56:07'),(21,3,'login',NULL,'','2026-04-07 10:57:34'),(22,3,'switch_role',NULL,'Switched to visitor','2026-04-07 11:08:13'),(23,3,'like_design',1,'','2026-04-07 11:08:20'),(24,3,'like_design',2,'','2026-04-07 11:08:22'),(25,3,'rate_design',2,'Rated 5 stars','2026-04-07 11:08:30'),(26,1,'login',NULL,'','2026-04-07 11:08:51'),(27,1,'like_design',1,'','2026-04-07 11:08:55'),(28,1,'follow',3,'','2026-04-07 11:09:03'),(29,3,'login',NULL,'','2026-04-07 11:09:28'),(30,3,'switch_role',NULL,'Switched to visitor','2026-04-07 11:09:38'),(31,3,'switch_role',NULL,'Switched to designer','2026-04-07 11:09:52'),(32,3,'switch_role',NULL,'Switched to visitor','2026-04-07 11:10:13'),(33,3,'switch_role',NULL,'Switched to designer','2026-04-07 11:11:36'),(34,3,'edit_design',1,'Edited: IRyS','2026-04-07 11:11:43'),(35,3,'switch_role',NULL,'Switched to visitor','2026-04-07 11:11:47'),(36,3,'switch_role',NULL,'Switched to designer','2026-04-07 11:14:41'),(37,3,'switch_role',NULL,'Switched to visitor','2026-04-07 11:15:26'),(38,3,'rate_design',1,'Rated 5 stars','2026-04-07 11:15:42'),(39,3,'switch_role',NULL,'Switched to designer','2026-04-07 11:15:45'),(40,3,'login',NULL,'','2026-04-07 18:45:48'),(41,3,'switch_role',NULL,'Switched to visitor','2026-04-07 18:46:00'),(42,3,'follow',1,'','2026-04-07 18:46:09'),(43,3,'rate_design',1,'Rated 3 stars','2026-04-07 18:46:24'),(44,3,'rate_design',1,'Rated 5 stars','2026-04-07 18:46:32'),(45,1,'login',NULL,'','2026-04-07 18:46:57'),(46,1,'switch_role',NULL,'Switched to visitor','2026-04-07 18:47:07'),(47,1,'rate_design',1,'Rated 3 stars','2026-04-07 18:47:15'),(48,1,'rate_design',2,'Rated 3 stars','2026-04-07 18:47:18'),(49,1,'rate_design',2,'Rated 4 stars','2026-04-07 18:47:39'),(50,1,'rate_design',2,'Rated 3 stars','2026-04-07 18:47:43'),(51,1,'rate_design',2,'Rated 4 stars','2026-04-07 18:47:46'),(52,1,'rate_design',2,'Rated 3 stars','2026-04-07 18:47:50'),(53,1,'rate_design',2,'Rated 4 stars','2026-04-07 18:47:53'),(54,1,'switch_role',NULL,'Switched to designer','2026-04-07 18:48:15'),(55,1,'switch_role',NULL,'Switched to visitor','2026-04-07 18:48:26'),(56,3,'login',NULL,'','2026-04-07 18:49:17'),(57,3,'switch_role',NULL,'Switched to designer','2026-04-07 18:52:54'),(58,3,'switch_role',NULL,'Switched to visitor','2026-04-07 18:52:59'),(59,3,'login',NULL,'','2026-04-07 19:10:06'),(60,3,'switch_role',NULL,'Switched to visitor','2026-04-07 19:10:11'),(61,3,'switch_role',NULL,'Switched to designer','2026-04-07 19:14:09'),(62,3,'switch_role',NULL,'Switched to visitor','2026-04-07 19:14:11'),(63,3,'switch_role',NULL,'Switched to designer','2026-04-07 19:14:23'),(64,1,'login',NULL,'','2026-04-07 19:14:41'),(65,1,'switch_role',NULL,'Switched to visitor','2026-04-07 19:14:47'),(66,1,'switch_role',NULL,'Switched to designer','2026-04-07 19:14:53'),(67,1,'switch_role',NULL,'Switched to visitor','2026-04-07 19:15:04'),(68,3,'login',NULL,'','2026-04-07 19:15:22'),(69,3,'switch_role',NULL,'Switched to visitor','2026-04-07 19:15:28'),(70,3,'follow',1,'','2026-04-07 19:21:33'),(71,3,'update_profile',NULL,'','2026-04-07 19:22:31'),(72,3,'switch_role',NULL,'Switched to designer','2026-04-07 19:23:12'),(73,3,'switch_role',NULL,'Switched to visitor','2026-04-07 19:23:48'),(74,3,'login',NULL,'','2026-04-07 19:49:32'),(75,3,'login',NULL,'','2026-04-08 04:42:48'),(76,3,'switch_role',NULL,'Switched to visitor','2026-04-08 04:44:13'),(77,1,'login',NULL,'','2026-04-08 04:45:48'),(78,3,'login',NULL,'','2026-04-08 04:50:24'),(79,3,'login',NULL,'','2026-04-08 04:56:05'),(80,3,'follow',1,'','2026-04-08 05:05:04'),(81,1,'login',NULL,'','2026-04-08 05:05:25'),(82,1,'like_design',2,'','2026-04-08 05:05:40'),(83,1,'like_design',1,'','2026-04-08 05:05:58'),(84,1,'rate_design',1,'Rated 4 stars','2026-04-08 05:06:35'),(85,1,'rate_design',1,'Rated 5 stars','2026-04-08 05:06:39'),(86,1,'rate_design',1,'Rated 4 stars','2026-04-08 05:06:44'),(87,1,'like_design',1,'','2026-04-08 05:13:07'),(88,1,'like_design',2,'','2026-04-08 05:13:08'),(89,1,'rate_design',1,'Rated 2 stars','2026-04-08 05:13:10'),(90,1,'rate_design',1,'Rated 3 stars','2026-04-08 05:13:11'),(91,1,'rate_design',1,'Rated 4 stars','2026-04-08 05:13:11'),(92,1,'rate_design',1,'Rated 5 stars','2026-04-08 05:13:12'),(93,1,'rate_design',1,'Rated 4 stars','2026-04-08 05:13:12'),(94,1,'follow',3,'','2026-04-08 05:14:09'),(95,3,'login',NULL,'','2026-04-08 05:14:31'),(96,3,'like_design',2,'','2026-04-08 05:14:37'),(97,3,'login',NULL,'','2026-04-08 18:50:17'),(98,3,'upload_design',3,'Uploaded: Pumpkin Night','2026-04-08 18:52:47'),(99,3,'like_design',3,'','2026-04-08 19:02:33'),(100,3,'delete_design',3,'','2026-04-08 19:11:34'),(101,3,'upload_design',4,'Uploaded: Pumpkin Night','2026-04-08 19:12:31'),(102,3,'follow',1,'','2026-04-08 19:17:10'),(103,3,'like_design',4,'','2026-04-08 19:17:13'),(104,3,'like_design',2,'','2026-04-08 19:20:12'),(105,3,'like_design',2,'','2026-04-08 19:20:18'),(106,3,'rate_design',2,'Rated 4 stars','2026-04-08 19:36:21'),(107,3,'rate_design',2,'Rated 5 stars','2026-04-08 19:36:22'),(108,3,'like_design',2,'','2026-04-08 19:36:25'),(109,3,'like_design',1,'','2026-04-08 19:36:35'),(110,3,'like_design',1,'','2026-04-08 19:36:41'),(111,3,'follow',1,'','2026-04-08 19:54:39'),(112,3,'like_design',1,'','2026-04-08 19:56:58'),(113,3,'like_design',2,'','2026-04-08 19:57:05'),(114,3,'like_design',4,'','2026-04-08 19:57:14'),(115,3,'like_design',4,'','2026-04-08 19:57:19'),(116,1,'login',NULL,'','2026-04-08 19:57:49'),(117,1,'like_design',4,'','2026-04-08 19:57:55'),(118,1,'like_design',2,'','2026-04-08 19:57:55'),(119,1,'like_design',4,'','2026-04-08 19:58:00'),(120,1,'like_design',2,'','2026-04-08 19:58:02'),(121,1,'edit_design',2,'Edited: BABATA','2026-04-08 19:58:38'),(122,3,'login',NULL,'','2026-04-08 19:58:50'),(123,3,'login',NULL,'','2026-04-08 19:59:23'),(124,3,'login',NULL,'','2026-04-11 04:58:44'),(125,3,'like_design',2,'','2026-04-11 04:59:31'),(126,3,'like_design',1,'','2026-04-11 04:59:35'),(127,3,'login',NULL,'','2026-04-11 08:46:37'),(128,3,'edit_design',1,'Edited: IRyS','2026-04-11 08:47:36'),(129,3,'edit_design',1,'Edited: IRyS','2026-04-11 08:47:50'),(130,3,'edit_design',1,'Edited: Adrien Brody','2026-04-11 08:48:05'),(131,3,'delete_design',4,'','2026-04-11 08:48:15'),(132,3,'edit_design',1,'Edited: Adrien Brody','2026-04-11 08:48:17'),(133,3,'edit_design',1,'Edited: Adrien Brody','2026-04-11 08:54:48'),(134,3,'login',NULL,'','2026-04-11 08:58:02'),(135,3,'edit_design',1,'Edited: Adrien Brody','2026-04-11 08:58:09'),(136,3,'edit_design',1,'Edited: Adrien Brody','2026-04-11 08:58:17'),(137,3,'edit_design',1,'Edited: Adrien Brody','2026-04-11 08:58:22'),(138,3,'edit_design',1,'Edited: Adrien Brody','2026-04-11 09:00:12'),(139,1,'login',NULL,'','2026-04-11 09:00:34'),(140,3,'login',NULL,'','2026-04-11 09:31:56'),(141,3,'edit_design',1,'Edited: Adrien Brody','2026-04-11 09:32:08'),(142,3,'upload_design',5,'Uploaded: Adrien Brody','2026-04-11 09:33:41'),(143,3,'delete_design',5,'','2026-04-11 09:34:09'),(144,3,'edit_design',1,'Edited: Adrien Brodyawdawdwad','2026-04-11 09:34:17'),(145,3,'edit_design',1,'Edited: Adrien Brody','2026-04-11 09:34:25'),(146,3,'update_profile',NULL,'','2026-04-11 09:39:24'),(147,3,'update_profile',NULL,'','2026-04-11 09:39:33'),(148,8,'register',NULL,'New visitor registered','2026-04-12 18:05:45'),(149,8,'login',NULL,'','2026-04-12 18:06:41'),(150,1,'login',NULL,'','2026-04-12 18:07:02'),(151,3,'login',NULL,'','2026-04-12 18:07:33'),(152,3,'password_change',NULL,'','2026-04-12 18:07:50'),(153,3,'login',NULL,'','2026-04-12 18:08:01'),(154,8,'login',NULL,'','2026-04-12 18:11:38'),(155,8,'login',NULL,'','2026-04-12 18:12:06'),(156,2,'login',NULL,'','2026-04-12 18:19:23'),(157,2,'login',NULL,'','2026-04-12 18:21:17'),(158,2,'login',NULL,'','2026-04-12 19:08:16'),(159,3,'login',NULL,'','2026-04-12 19:08:42'),(160,3,'edit_design',1,'Edited: Adrien Brody','2026-04-12 19:09:12'),(161,3,'edit_design',1,'Edited: Adrien Brody','2026-04-12 19:11:13'),(162,3,'upload_design',6,'Uploaded: Adrien Brody','2026-04-12 19:22:39'),(163,3,'edit_design',1,'Edited: IRyS','2026-04-12 19:22:59'),(164,8,'login',NULL,'','2026-04-12 19:23:13'),(165,2,'login',NULL,'','2026-04-12 19:53:07'),(166,8,'login',NULL,'','2026-04-12 19:53:28'),(167,2,'login',NULL,'','2026-04-12 19:53:39'),(168,3,'login',NULL,'','2026-04-12 19:54:01'),(169,1,'login',NULL,'','2026-04-12 19:54:34'),(170,2,'login',NULL,'','2026-04-12 19:54:52'),(171,3,'login',NULL,'','2026-04-12 19:56:18'),(172,8,'login',NULL,'','2026-04-12 19:56:56'),(173,2,'login',NULL,'','2026-04-13 11:27:21'),(174,3,'login',NULL,'','2026-04-13 11:38:03'),(175,3,'follow',1,'','2026-04-13 11:46:46'),(176,3,'like_design',2,'','2026-04-13 11:46:53'),(177,3,'like_design',1,'','2026-04-13 11:46:57'),(178,3,'like_design',2,'','2026-04-13 11:47:02'),(179,1,'login',NULL,'','2026-04-13 11:56:29'),(180,3,'login',NULL,'','2026-04-13 13:09:41'),(181,8,'login',NULL,'','2026-04-13 16:28:07'),(182,3,'login',NULL,'','2026-04-13 16:50:22'),(183,2,'login',NULL,'','2026-04-13 17:00:41'),(184,8,'login',NULL,'','2026-04-13 17:00:54'),(185,3,'login',NULL,'','2026-04-13 17:02:00'),(186,1,'login',NULL,'','2026-04-13 17:02:29'),(187,2,'login',NULL,'','2026-04-13 17:02:43'),(188,3,'login',NULL,'','2026-04-13 17:03:46'),(189,3,'like_design',1,'','2026-04-13 17:03:52'),(190,1,'login',NULL,'','2026-04-13 17:04:03'),(191,2,'login',NULL,'','2026-04-13 17:04:38'),(192,2,'login',NULL,'','2026-04-14 03:38:38'),(193,3,'login',NULL,'','2026-04-14 03:40:28'),(194,2,'login',NULL,'','2026-04-14 04:34:54'),(195,8,'login',NULL,'','2026-04-14 04:35:09'),(196,3,'login',NULL,'','2026-04-14 04:37:21'),(197,3,'edit_design',1,'Edited: IRyS','2026-04-14 04:37:56'),(198,2,'login',NULL,'','2026-04-14 04:38:27'),(199,3,'login',NULL,'','2026-04-14 04:45:57'),(200,3,'login',NULL,'','2026-04-14 14:02:47'),(201,3,'like_design',2,'','2026-04-14 14:03:04'),(202,3,'like_design',1,'','2026-04-14 14:03:08'),(203,2,'login',NULL,'','2026-04-14 14:31:37'),(204,3,'login',NULL,'','2026-04-14 14:32:20'),(205,3,'update_profile',NULL,'','2026-04-14 14:32:36'),(206,3,'login',NULL,'','2026-04-14 15:38:34'),(207,8,'login',NULL,'','2026-04-16 23:46:56'),(208,9,'register',NULL,'New visitor registered','2026-04-16 23:47:21'),(209,9,'login',NULL,'','2026-04-16 23:47:47'),(210,9,'upload_design',7,'Uploaded: adada','2026-04-16 23:48:13'),(211,9,'upload_design',8,'Uploaded: adadwds','2026-04-16 23:48:21'),(212,2,'login',NULL,'','2026-04-16 23:48:53'),(213,1,'login',NULL,'','2026-04-16 23:51:50'),(214,1,'like_design',2,'','2026-04-16 23:52:07'),(215,1,'like_design',7,'','2026-04-16 23:52:18'),(216,3,'login',NULL,'','2026-04-16 23:52:29'),(217,3,'password_change',NULL,'','2026-04-16 23:53:13'),(218,3,'login',NULL,'','2026-04-16 23:53:34'),(219,3,'upload_design',9,'Uploaded: ab','2026-04-16 23:53:41'),(220,1,'login',NULL,'','2026-04-16 23:54:03'),(221,1,'login',NULL,'','2026-04-16 23:54:27'),(222,1,'password_change',NULL,'','2026-04-16 23:54:42'),(223,1,'login',NULL,'','2026-04-16 23:54:52'),(224,1,'upload_design',10,'Uploaded: rw','2026-04-16 23:55:02'),(225,1,'upload_design',11,'Uploaded: bg','2026-04-16 23:55:10'),(226,1,'upload_design',12,'Uploaded: ads','2026-04-16 23:55:22'),(227,1,'upload_design',13,'Uploaded: asfaw','2026-04-16 23:55:34'),(228,8,'login',NULL,'','2026-04-16 23:55:47'),(229,1,'login',NULL,'','2026-04-16 23:56:18'),(230,1,'upload_design',14,'Uploaded: sadawf','2026-04-16 23:56:28'),(231,1,'upload_design',15,'Uploaded: awfag','2026-04-16 23:56:39'),(232,2,'login',NULL,'','2026-04-16 23:56:48'),(233,3,'login',NULL,'','2026-04-16 23:57:16'),(234,2,'login',NULL,'','2026-04-17 01:02:07'),(235,8,'login',NULL,'','2026-04-17 01:02:49'),(236,3,'login',NULL,'','2026-04-17 01:03:10'),(237,1,'login',NULL,'','2026-04-17 01:03:26'),(238,2,'login',NULL,'','2026-04-17 01:10:28'),(239,8,'login',NULL,'','2026-04-17 01:12:08'),(240,1,'login',NULL,'','2026-04-17 01:12:53'),(241,3,'login',NULL,'','2026-04-17 01:14:44'),(242,1,'login',NULL,'','2026-04-17 01:15:32'),(243,10,'register',NULL,'New visitor registered','2026-04-17 01:18:40'),(244,2,'login',NULL,'','2026-04-17 01:19:27'),(245,10,'login',NULL,'','2026-04-17 01:19:45'),(246,2,'login',NULL,'','2026-04-17 01:19:54'),(247,10,'login',NULL,'','2026-04-17 01:20:39'),(248,3,'login',NULL,'','2026-04-17 01:21:03'),(249,1,'login',NULL,'','2026-04-17 01:21:33'),(250,2,'login',NULL,'','2026-04-17 16:47:56'),(251,9,'login',NULL,'','2026-04-17 16:48:25'),(252,2,'login',NULL,'','2026-04-17 17:02:37'),(253,10,'login',NULL,'','2026-04-17 17:03:47'),(254,3,'login',NULL,'','2026-04-17 17:04:37'),(255,1,'login',NULL,'','2026-04-17 17:06:14'),(256,3,'login',NULL,'','2026-04-17 17:26:54'),(257,1,'login',NULL,'','2026-04-17 17:27:05'),(258,1,'upload_design',16,'Uploaded: aga','2026-04-17 17:27:13'),(259,10,'login',NULL,'','2026-04-17 17:27:24'),(260,8,'login',NULL,'','2026-04-17 17:27:38'),(261,2,'login',NULL,'','2026-04-17 17:28:19'),(262,9,'login',NULL,'','2026-04-17 17:28:34'),(263,9,'upload_design',17,'Uploaded: awfasa','2026-04-17 17:28:43'),(264,10,'login',NULL,'','2026-04-17 17:28:56'),(265,2,'login',NULL,'','2026-04-17 17:31:20'),(266,2,'login',NULL,'','2026-04-17 18:06:31'),(267,10,'login',NULL,'','2026-04-17 18:06:56'),(268,3,'login',NULL,'','2026-04-17 18:07:10'),(269,3,'edit_design',9,'Edited: abss','2026-04-17 18:15:54'),(270,10,'login',NULL,'','2026-04-17 18:16:08'),(271,3,'login',NULL,'','2026-04-17 18:16:22'),(272,3,'upload_design',18,'Uploaded: awdas','2026-04-17 18:16:41'),(273,2,'login',NULL,'','2026-04-17 18:16:57'),(274,10,'login',NULL,'','2026-04-17 18:17:04'),(275,10,'login',NULL,'','2026-04-17 18:18:07'),(276,10,'login',NULL,'','2026-04-17 18:18:27'),(277,3,'update_profile',NULL,'','2026-04-17 18:19:24'),(278,3,'rate_design',9,'Rated 4 stars','2026-04-17 18:19:41'),(279,3,'rate_design',9,'Rated 4 stars','2026-04-17 18:19:42'),(280,3,'rate_design',9,'Rated 4 stars','2026-04-17 18:19:43'),(281,3,'rate_design',9,'Rated 1 stars','2026-04-17 18:19:43'),(282,3,'rate_design',9,'Rated 1 stars','2026-04-17 18:19:45'),(283,3,'rate_design',9,'Rated 5 stars','2026-04-17 18:19:46'),(284,3,'like_design',9,'','2026-04-17 18:19:47'),(285,3,'rate_design',9,'Rated 3 stars','2026-04-17 18:19:59'),(286,3,'login',NULL,'','2026-04-17 21:03:27'),(287,3,'upload_design',19,'Uploaded: efgsdgdsr','2026-04-17 21:03:49'),(288,3,'delete_design',19,'','2026-04-17 21:04:09'),(289,10,'login',NULL,'','2026-04-17 21:04:29'),(290,2,'login',NULL,'','2026-04-17 21:04:58'),(291,9,'login',NULL,'','2026-04-17 21:06:09'),(292,1,'login',NULL,'','2026-04-17 21:08:22'),(293,1,'delete_design',10,'','2026-04-17 21:08:27'),(294,2,'login',NULL,'','2026-04-17 21:08:43'),(295,1,'upload_design',20,'Uploaded: awdasda','2026-04-17 21:09:17'),(296,2,'login',NULL,'','2026-04-17 21:09:48'),(297,1,'delete_design',20,'','2026-04-17 21:09:51'),(298,1,'delete_design',16,'','2026-04-17 21:09:59'),(299,1,'upload_design',21,'Uploaded: asgaswegas','2026-04-17 21:10:10'),(304,2,'login',NULL,'','2026-04-17 21:24:26'),(305,12,'register',NULL,'New visitor registered','2026-04-17 21:26:07'),(306,12,'login',NULL,'','2026-04-17 21:26:32'),(307,8,'login',NULL,'','2026-04-17 21:27:03'),(308,2,'login',NULL,'','2026-04-18 14:02:35'),(309,2,'login',NULL,'','2026-04-18 15:21:01'),(310,3,'login',NULL,'','2026-04-18 15:21:19'),(311,8,'login',NULL,'','2026-04-18 15:21:37'),(312,10,'login',NULL,'','2026-04-18 15:21:46'),(313,10,'like_design',2,'','2026-04-18 15:23:07'),(314,10,'like_design',21,'','2026-04-18 15:23:07'),(315,10,'like_design',8,'','2026-04-18 15:23:08'),(316,10,'like_design',23,'','2026-04-18 15:23:08'),(317,10,'like_design',11,'','2026-04-18 15:23:09'),(318,10,'like_design',13,'','2026-04-18 15:23:09'),(319,10,'like_design',14,'','2026-04-18 15:23:10'),(320,10,'like_design',15,'','2026-04-18 15:23:10'),(321,10,'like_design',22,'','2026-04-18 15:23:17'),(322,10,'like_design',9,'','2026-04-18 15:23:18'),(323,10,'like_design',7,'','2026-04-18 15:23:18'),(324,10,'like_design',17,'','2026-04-18 15:23:19'),(325,10,'like_design',1,'','2026-04-18 15:46:50'),(326,10,'like_design',21,'','2026-04-18 15:47:49'),(327,2,'login',NULL,'','2026-04-18 17:25:29'),(328,2,'login',NULL,'','2026-04-19 09:33:44'),(329,3,'login',NULL,'','2026-04-19 09:34:25'),(330,1,'login',NULL,'','2026-04-19 09:34:39'),(331,8,'login',NULL,'','2026-04-19 09:34:58'),(332,1,'upload_design',24,'Uploaded: a','2026-04-19 09:35:55'),(333,1,'edit_design',24,'Edited: ','2026-04-19 09:35:59'),(334,1,'edit_design',24,'Edited: ads','2026-04-19 09:36:05'),(335,1,'delete_design',24,'','2026-04-19 09:36:08'),(336,10,'login',NULL,'','2026-04-19 09:36:23'),(337,3,'login',NULL,'','2026-04-19 10:25:51'),(338,2,'login',NULL,'','2026-04-19 12:28:42'),(339,2,'login',NULL,'','2026-04-19 12:28:58'),(340,10,'login',NULL,'','2026-04-19 12:30:16'),(341,2,'login',NULL,'','2026-04-19 13:04:35'),(342,2,'login',NULL,'','2026-04-19 13:06:03'),(343,10,'login',NULL,'','2026-04-19 13:08:57'),(344,3,'login',NULL,'','2026-04-19 13:11:29'),(345,1,'login',NULL,'','2026-04-19 13:11:46'),(346,2,'login',NULL,'','2026-04-19 22:28:13'),(347,1,'login',NULL,'','2026-04-19 22:29:04'),(348,1,'upload_design',25,'Uploaded: your my heart','2026-04-19 22:29:39'),(349,10,'login',NULL,'','2026-04-19 22:29:57'),(350,10,'like_design',25,'','2026-04-19 22:30:04'),(351,1,'login',NULL,'','2026-04-19 22:30:28'),(352,1,'login',NULL,'','2026-04-19 22:30:42'),(353,10,'login',NULL,'','2026-04-19 22:30:58'),(354,1,'delete_design',25,'','2026-04-19 22:31:05'),(355,1,'login',NULL,'','2026-04-19 22:31:55'),(356,13,'register',NULL,'New designer registered','2026-04-19 22:33:01'),(357,13,'login',NULL,'','2026-04-19 22:33:11'),(358,13,'upload_design',26,'Uploaded: sadasdasd','2026-04-19 22:33:17'),(359,8,'login',NULL,'','2026-04-19 22:33:46'),(360,14,'register',NULL,'New visitor registered','2026-04-19 22:34:25'),(361,14,'login',NULL,'','2026-04-19 22:34:36'),(362,14,'like_design',26,'','2026-04-19 22:35:03'),(363,14,'rate_design',26,'Rated 5 stars','2026-04-19 22:35:13'),(364,13,'like_design',26,'','2026-04-19 22:35:40'),(365,3,'login',NULL,'','2026-04-20 18:04:44'),(366,2,'login',NULL,'','2026-04-20 18:16:41');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `designs`
--

DROP TABLE IF EXISTS `designs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `designs` (
  `design_id` int NOT NULL AUTO_INCREMENT,
  `designer_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `image_url` varchar(500) NOT NULL,
  `season` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('active','hidden','under_review') DEFAULT 'active',
  `moderation_reason` text,
  `moderated_by` int DEFAULT NULL,
  `moderated_at` timestamp NULL DEFAULT NULL,
  `appeal_message` text,
  PRIMARY KEY (`design_id`),
  KEY `designer_id` (`designer_id`),
  CONSTRAINT `designs_ibfk_1` FOREIGN KEY (`designer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `designs`
--

LOCK TABLES `designs` WRITE;
/*!40000 ALTER TABLE `designs` DISABLE KEYS */;
INSERT INTO `designs` VALUES (1,3,'IRySjjyjyjy','IRyStocrats awdjjy','/uploads/1776179553400-730695335.jpg','Spring 2026','2026-04-07 10:52:45','2026-04-14 15:12:33','active','',NULL,'2026-04-12 19:56:06',NULL),(2,1,'image','image posted','/uploads/1776637757601-195448562.jpg','Spring 2026','2026-04-07 10:55:48','2026-04-19 22:29:17','active',NULL,NULL,NULL,NULL),(7,9,'adadassss','dadadadad','/uploads/1776383309777-287512695.jpg','Spring 2026','2026-04-16 23:48:13','2026-04-16 23:48:29','active',NULL,NULL,NULL,NULL),(8,9,'adadwds','wdsafwaf','/uploads/1776383301941-524709734.jpg','Spring 2026','2026-04-16 23:48:21','2026-04-16 23:48:21','active',NULL,NULL,NULL,NULL),(9,3,'abss','abss','/uploads/1776449792594-474683667.jpg','Spring 2026','2026-04-16 23:53:41','2026-04-17 18:16:32','active',NULL,NULL,NULL,NULL),(11,1,'bg','bg','/uploads/1776383710701-842639838.jpg','Spring 2026','2026-04-16 23:55:10','2026-04-16 23:55:10','active',NULL,NULL,NULL,NULL),(13,1,'asfaw','gdsge','/uploads/1776383734922-196676388.jpg','Spring 2026','2026-04-16 23:55:34','2026-04-16 23:55:34','active',NULL,NULL,NULL,NULL),(14,1,'sadawf','awdas','/uploads/1776383788426-86846932.jpg','Spring 2026','2026-04-16 23:56:28','2026-04-16 23:56:28','active',NULL,NULL,NULL,NULL),(15,1,'awfag','awdfdg','/uploads/1776383799296-426958237.jpeg','Spring 2026','2026-04-16 23:56:39','2026-04-16 23:56:39','active',NULL,NULL,NULL,NULL),(17,9,'awfasa','sgasgg','/uploads/1776446922547-99434774.jpg','Spring 2026','2026-04-17 17:28:42','2026-04-17 17:28:42','active',NULL,NULL,NULL,NULL),(21,1,'asgaswegas','gagawawf','/uploads/1776460210760-946114159.jpg','Spring 2026','2026-04-17 21:10:10','2026-04-17 21:10:10','active',NULL,NULL,NULL,NULL),(26,13,'d','a','/uploads/1776638131431-557199522.jpg','Fall 2026','2026-04-19 22:33:17','2026-04-19 22:35:31','active',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `designs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `follow_id` int NOT NULL AUTO_INCREMENT,
  `follower_id` int NOT NULL,
  `designer_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follow_id`),
  UNIQUE KEY `unique_follow` (`follower_id`,`designer_id`),
  KEY `designer_id` (`designer_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`designer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
INSERT INTO `follows` VALUES (5,1,3,'2026-04-08 05:14:09'),(8,3,1,'2026-04-13 11:46:46');
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `design_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `unique_like` (`user_id`,`design_id`),
  KEY `design_id` (`design_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`design_id`) REFERENCES `designs` (`design_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (6,1,1,'2026-04-08 05:13:07'),(30,3,2,'2026-04-14 14:03:04'),(31,3,1,'2026-04-14 14:03:08'),(32,1,2,'2026-04-16 23:52:07'),(33,1,7,'2026-04-16 23:52:18'),(35,10,2,'2026-04-18 15:23:07'),(37,10,8,'2026-04-18 15:23:08'),(39,10,11,'2026-04-18 15:23:09'),(40,10,13,'2026-04-18 15:23:09'),(41,10,14,'2026-04-18 15:23:10'),(42,10,15,'2026-04-18 15:23:10'),(44,10,9,'2026-04-18 15:23:18'),(45,10,7,'2026-04-18 15:23:18'),(46,10,17,'2026-04-18 15:23:19'),(47,10,1,'2026-04-18 15:46:50'),(48,10,21,'2026-04-18 15:47:49'),(50,14,26,'2026-04-19 22:35:03'),(51,13,26,'2026-04-19 22:35:40');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moderation_logs`
--

DROP TABLE IF EXISTS `moderation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moderation_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `target_type` enum('user','design') NOT NULL,
  `target_id` int NOT NULL,
  `action` varchar(50) NOT NULL,
  `reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `moderation_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moderation_logs`
--

LOCK TABLES `moderation_logs` WRITE;
/*!40000 ALTER TABLE `moderation_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `moderation_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `rating_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `design_id` int NOT NULL,
  `rating` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rating_id`),
  UNIQUE KEY `unique_rating` (`user_id`,`design_id`),
  KEY `design_id` (`design_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`design_id`) REFERENCES `designs` (`design_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
INSERT INTO `ratings` VALUES (1,3,1,5,'2026-04-07 10:53:31'),(2,3,2,5,'2026-04-07 11:08:30'),(3,1,1,4,'2026-04-07 18:47:15'),(4,1,2,4,'2026-04-07 18:47:17'),(5,3,9,3,'2026-04-17 18:19:41'),(6,14,26,5,'2026-04-19 22:35:13');
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('suspension','design_hidden','design_deleted','warning') NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('visitor','designer','admin') NOT NULL DEFAULT 'visitor',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(100) DEFAULT NULL,
  `bio` text,
  `brand_name` varchar(200) DEFAULT NULL,
  `specialty` varchar(200) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `website` varchar(300) DEFAULT NULL,
  `instagram` varchar(200) DEFAULT NULL,
  `facebook` varchar(200) DEFAULT NULL,
  `twitter` varchar(200) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `status` enum('active','suspended','banned') DEFAULT 'active',
  `suspension_reason` text,
  `suspension_end_date` datetime DEFAULT NULL,
  `moderated_by` int DEFAULT NULL,
  `moderated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'littlemingming','littlemingming','',NULL,NULL,'$2b$10$HjepzvEPAAdWejmhZmgZzuoyAk5gBDiE6DKtVPpOpZsIHqjwfv2LC','designer','2026-04-05 10:35:01','littlemingming@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active',NULL,NULL,NULL,'2026-04-19 22:31:22'),(2,'admin','admin','',NULL,NULL,'$2b$10$joTZda6Un/WlT34ZqUxHgu8bYZ7LF5QQc7OUEjqJ1QGyZ8OstTYuS','admin','2026-04-07 09:43:21','admin@aphronique.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active',NULL,NULL,NULL,NULL),(3,'Jhamirex Reguero T.','Jhamirex Reguero T.','',NULL,NULL,'$2b$10$.Z6HXVRY.a12dJKklJe3P.mwPcN6omlCNNqdE1nJdz2sh.MPYXZha','designer','2026-04-07 09:47:10','reguero39@gmail.com','katz','IRyStocrats',NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/1775900373865-84052692.jpg',NULL,'active',NULL,NULL,NULL,NULL),(8,'admin2','admin2','',NULL,NULL,'$2b$10$joTZda6Un/WlT34ZqUxHgu8bYZ7LF5QQc7OUEjqJ1QGyZ8OstTYuS','admin','2026-04-12 18:05:45','admin2@runway.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active',NULL,NULL,NULL,NULL),(9,'awdawdawd','awdawdawd','',NULL,NULL,'$2b$10$mI6aY8w0yF5q7cDcgPvbfOeN.W7bh5ikfnbApa2YSYrNgZJ5xR3/6','designer','2026-04-16 23:47:21','awd@awd.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active',NULL,NULL,NULL,'2026-04-17 21:05:27'),(10,'designer123','designer123','',NULL,NULL,'$2b$10$Ch.DI64p/C454B65oNJ1ROv0tvNwa/6jVV/wEllcr6VVX1Netvmki','visitor','2026-04-17 01:18:40','designer@design',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active',NULL,NULL,NULL,'2026-04-17 18:17:31'),(12,'awds awds','awds','awds','2009-11-16','male','$2b$10$oeGxayd68V4lg6t8KqGtiOw4PFOEQ6CTINdxPiBRV2SUd4RDhv4mO','visitor','2026-04-17 21:26:07','awds@awds.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active',NULL,NULL,NULL,NULL),(13,'Jhamirex Reguero','Jhamirex','Reguero','2010-08-30','male','$2b$10$6WWjaT/QpmU3ODfhMBm5Pekx8o.LeA6PfwD/2t4MCMFRoHcX6ZUmS','designer','2026-04-19 22:33:01','jhamir@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active',NULL,NULL,NULL,NULL),(14,'reguero jhamir','reguero','jhamir','2008-07-10','male','$2b$10$hFIBKXFrk8UBqnpQbfv3zelf0XyKPJUXxm8MUr87qZ0WvOC2cLBmu','visitor','2026-04-19 22:34:25','reguero@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21  2:54:44
