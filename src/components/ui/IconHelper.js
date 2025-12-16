import {
    FaTrophy, FaMedal, FaCrown, FaStar, FaHeart, FaBolt, FaShieldAlt, FaGem,
    FaBook, FaFeather, FaScroll, FaDragon, FaFire, FaWater, FaLeaf, FaSnowflake
} from 'react-icons/fa';

import { GiBroadsword, GiCheckedShield, GiWizardFace, GiSpellBook, GiBookmarklet } from 'react-icons/gi';

// Define the available icons repository
export const iconRepository = {
    // Ranks/Rewards
    "FaTrophy": FaTrophy,
    "FaMedal": FaMedal,
    "FaCrown": FaCrown,
    "FaStar": FaStar,
    "FaGem": FaGem,

    // Elements/Nature
    "FaFire": FaFire,
    "FaBolt": FaBolt,
    "FaWater": FaWater,
    "FaLeaf": FaLeaf,
    "FaSnowflake": FaSnowflake,

    // Books/Story
    "FaBook": FaBook,
    "FaFeather": FaFeather,
    "FaScroll": FaScroll,
    "GiSpellBook": GiSpellBook,
    "GiBookmarklet": GiBookmarklet,

    // Fantasy
    "FaDragon": FaDragon,
    "FaShieldAlt": FaShieldAlt,
    "GiBroadsword": GiBroadsword,
    "GiCheckedShield": GiCheckedShield,
    "GiWizardFace": GiWizardFace,

    // Misc
    "FaHeart": FaHeart,
};

export const IconRenderer = ({ iconName, className }) => {
    const IconComponent = iconRepository[iconName] || FaMedal; // Default
    return <IconComponent className={className} />;
};
