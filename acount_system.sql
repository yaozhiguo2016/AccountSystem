/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50520
Source Host           : localhost:3306
Source Database       : acount_system

Target Server Type    : MYSQL
Target Server Version : 50520
File Encoding         : 65001

Date: 2017-04-11 19:23:27
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `message`
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `mail_id` varchar(50) NOT NULL,
  `guest_name` varchar(50) DEFAULT NULL,
  `guest_mail` varchar(50) DEFAULT NULL,
  `mail_content` varchar(300) DEFAULT NULL,
  `createTime` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`mail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of message
-- ----------------------------

-- ----------------------------
-- Table structure for `user`
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varchar(60) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(50) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `loginCount` int(10) DEFAULT NULL,
  `createTime` bigint(13) DEFAULT NULL,
  `state` smallint(1) DEFAULT '0' COMMENT '账户是否处于激活状态，0未激活，1激活',
  `validateCode` varchar(30) DEFAULT NULL COMMENT '注册账户时生成的验证码，用于邮件激活',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('673C354C-1E87-4637-8AB0-5AFEA43CE2F5', 'yaozhiguo', '202cb962ac59075b964b07152d234b70', 'yaozhiguo86@163.com', '1', '1491904462750', '1', 'na8OIPuBKqpaYXe8fFCMPQdv');
