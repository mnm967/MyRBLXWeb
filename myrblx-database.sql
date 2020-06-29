-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 29, 2020 at 11:42 AM
-- Server version: 10.4.6-MariaDB
-- PHP Version: 7.3.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `myrblx`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_earnings`
--

CREATE TABLE `admin_earnings` (
  `id` int(11) NOT NULL,
  `offerId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `offerwall` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `admin_group_details`
--

CREATE TABLE `admin_group_details` (
  `id` int(11) NOT NULL,
  `groupName` text NOT NULL,
  `groupId` int(11) NOT NULL,
  `groupAdminCookie` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `admin_settings`
--

CREATE TABLE `admin_settings` (
  `id` int(11) NOT NULL,
  `nextRobuxDropTime` datetime NOT NULL,
  `nextGiveawayTime` datetime NOT NULL,
  `username` text NOT NULL DEFAULT 'admin-user',
  `password` text NOT NULL DEFAULT 'rdr456vtwa##'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `admin_settings`
--

INSERT INTO `admin_settings` (`id`, `nextRobuxDropTime`, `nextGiveawayTime`, `username`, `password`) VALUES
(1, '2020-06-05 17:30:15', '2020-06-06 04:30:15', 'admin-user', 'rdr456vtwa##');

-- --------------------------------------------------------

--
-- Table structure for table `available_offerwalls`
--

CREATE TABLE `available_offerwalls` (
  `id` int(11) NOT NULL,
  `offerwallName` text NOT NULL,
  `url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `available_offerwalls`
--

INSERT INTO `available_offerwalls` (`id`, `offerwallName`, `url`) VALUES
(1, 'AdworkMedia', 'http://lockwall.xyz/wall/6rh/[RBX_USER_ID]'),
(2, 'Gillo Quiz Site', 'https://quizunit.com/');

-- --------------------------------------------------------

--
-- Table structure for table `earnings`
--

CREATE TABLE `earnings` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `transactionId` int(11) NOT NULL,
  `amountEarned` double NOT NULL,
  `offerwall` varchar(75) NOT NULL,
  `username` text NOT NULL,
  `dateEarned` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `giveaway_participants`
--

CREATE TABLE `giveaway_participants` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `giveawayId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `giveaway_winners`
--

CREATE TABLE `giveaway_winners` (
  `id` int(11) NOT NULL,
  `giveawayId` int(11) NOT NULL,
  `winnerUserId` int(11) NOT NULL,
  `prizeAmount` int(11) NOT NULL,
  `winnerUsername` text NOT NULL,
  `dateCompleted` datetime NOT NULL DEFAULT current_timestamp(),
  `winnerChance` double NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `pending_giveaways`
--

CREATE TABLE `pending_giveaways` (
  `id` int(11) NOT NULL,
  `prizeAmount` int(11) NOT NULL,
  `endDate` datetime NOT NULL,
  `startDate` datetime NOT NULL DEFAULT current_timestamp(),
  `participatingUsers` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `pending_robux_drop`
--

CREATE TABLE `pending_robux_drop` (
  `id` int(11) NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `robuxAmount` int(11) NOT NULL,
  `isComplete` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `promo_codes`
--

CREATE TABLE `promo_codes` (
  `id` int(11) NOT NULL,
  `code` text NOT NULL,
  `isRedeemed` int(11) NOT NULL DEFAULT 0,
  `dateCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `robuxAmount` int(11) NOT NULL,
  `redeemedUserId` int(11) NOT NULL DEFAULT -1,
  `dateRedeemed` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `promo_earnings`
--

CREATE TABLE `promo_earnings` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `code` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `description` text NOT NULL,
  `link` text NOT NULL,
  `imageUrl` text NOT NULL,
  `robuxAmount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `referral_earnings`
--

CREATE TABLE `referral_earnings` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `amountEarned` double NOT NULL,
  `referredUserId` int(11) NOT NULL,
  `referredUsername` text NOT NULL,
  `referredUserEarned` int(11) NOT NULL,
  `dateEarned` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `robux_drop_winners`
--

CREATE TABLE `robux_drop_winners` (
  `id` int(11) NOT NULL,
  `winnerUserId1` int(11) NOT NULL,
  `winnerUserId2` int(11) DEFAULT NULL,
  `winnerUserId3` int(11) DEFAULT NULL,
  `winnerUsername1` text DEFAULT NULL,
  `winnerUsername2` text DEFAULT NULL,
  `winnerUsername3` text DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `robuxAmount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `social_earnings`
--

CREATE TABLE `social_earnings` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `amountEarned` double NOT NULL,
  `social_name` text NOT NULL,
  `username` text NOT NULL,
  `dateEarned` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` text NOT NULL,
  `currentPoints` double NOT NULL DEFAULT 0,
  `pointsEarned` double NOT NULL DEFAULT 0,
  `dateCreated` datetime NOT NULL DEFAULT current_timestamp(),
  `isBanned` tinyint(1) NOT NULL DEFAULT 0,
  `dailyLoginPrize` int(11) NOT NULL DEFAULT 0,
  `lastDailyLoginDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user_referrals`
--

CREATE TABLE `user_referrals` (
  `id` int(11) NOT NULL,
  `referrerUserId` int(11) NOT NULL,
  `referredUserId` int(11) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user_withdrawals`
--

CREATE TABLE `user_withdrawals` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `robuxAmount` int(11) NOT NULL,
  `robloxUsername` text NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `isReferralEarning` tinyint(1) NOT NULL DEFAULT 0,
  `isUserNotified` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_earnings`
--
ALTER TABLE `admin_earnings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin_group_details`
--
ALTER TABLE `admin_group_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin_settings`
--
ALTER TABLE `admin_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `available_offerwalls`
--
ALTER TABLE `available_offerwalls`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `earnings`
--
ALTER TABLE `earnings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `giveaway_participants`
--
ALTER TABLE `giveaway_participants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `giveaway_winners`
--
ALTER TABLE `giveaway_winners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pending_giveaways`
--
ALTER TABLE `pending_giveaways`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pending_robux_drop`
--
ALTER TABLE `pending_robux_drop`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `promo_codes`
--
ALTER TABLE `promo_codes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `promo_earnings`
--
ALTER TABLE `promo_earnings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `referral_earnings`
--
ALTER TABLE `referral_earnings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `robux_drop_winners`
--
ALTER TABLE `robux_drop_winners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `social_earnings`
--
ALTER TABLE `social_earnings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_referrals`
--
ALTER TABLE `user_referrals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_withdrawals`
--
ALTER TABLE `user_withdrawals`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_earnings`
--
ALTER TABLE `admin_earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin_group_details`
--
ALTER TABLE `admin_group_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin_settings`
--
ALTER TABLE `admin_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `available_offerwalls`
--
ALTER TABLE `available_offerwalls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `earnings`
--
ALTER TABLE `earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `giveaway_participants`
--
ALTER TABLE `giveaway_participants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `giveaway_winners`
--
ALTER TABLE `giveaway_winners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pending_giveaways`
--
ALTER TABLE `pending_giveaways`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pending_robux_drop`
--
ALTER TABLE `pending_robux_drop`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promo_codes`
--
ALTER TABLE `promo_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promo_earnings`
--
ALTER TABLE `promo_earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `referral_earnings`
--
ALTER TABLE `referral_earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `robux_drop_winners`
--
ALTER TABLE `robux_drop_winners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `social_earnings`
--
ALTER TABLE `social_earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_referrals`
--
ALTER TABLE `user_referrals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_withdrawals`
--
ALTER TABLE `user_withdrawals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
