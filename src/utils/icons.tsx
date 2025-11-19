/**
 * Centralized Icon System
 * Professional icons replacing emojis throughout the application
 * Using React Icons library (https://react-icons.github.io/react-icons/)
 */

import {
  // Calendar & Time
  FaCalendarAlt,
  FaCalendarCheck,
  FaCalendarPlus,
  FaClock,
  
  // Communication & Video
  FaVideo,
  FaVideoSlash,
  FaPhone,
  FaEnvelope,
  FaMicrophone,
  FaMicrophoneSlash,
  FaCamera,
  FaComments,
  FaHeadphones,
  FaGraduationCap,
  FaBuilding,
  FaMobileAlt,
  
  // Documents & Files
  FaFileAlt,
  FaFileMedical,
  FaNotesMedical,
  FaClipboardList,
  FaDownload,
  
  // Medical & Health
  FaUserMd,
  FaHospital,
  FaBriefcaseMedical,
  FaHeartbeat,
  FaStethoscope,
  
  // User & People
  FaUser,
  FaUsers,
  FaUserCircle,
  FaUserPlus,
  
  // Actions
  FaEdit,
  FaTrash,
  FaSave,
  FaPlus,
  FaTimes,
  FaCheck,
  
  // Navigation
  FaArrowLeft,
  FaArrowRight,
  FaHome,
  
  // Status & Alerts
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCircle,
  
  // Business & Admin
  FaChartLine,
  FaDollarSign,
  FaCreditCard,
  FaReceipt,
  FaBriefcase,
  
  // Settings & Tools
  FaCog,
  FaSearch,
  FaFilter,
  FaBolt,
  
  // Misc
  FaStar,
  FaBook,
  FaBell,
  FaLock,
  FaUnlock,
  FaEye,
  FaPrint,
  FaShareAlt,
  FaBookmark,
  FaMapMarkerAlt,
  FaLink,
  FaLightbulb,
} from 'react-icons/fa';

// Icon size configurations
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

// Common icon props type
export interface IconProps {
  size?: keyof typeof IconSizes | number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

// Helper function to get icon size
export const getIconSize = (size: keyof typeof IconSizes | number = 'md'): number => {
  return typeof size === 'number' ? size : IconSizes[size];
};

/**
 * Application-wide icon components
 * These replace emojis with professional icons
 */

// Calendar & Appointments
export const CalendarIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaCalendarAlt size={getIconSize(size)} {...props} />
);

export const CalendarCheckIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaCalendarCheck size={getIconSize(size)} {...props} />
);

export const CalendarPlusIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaCalendarPlus size={getIconSize(size)} {...props} />
);

export const ClockIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaClock size={getIconSize(size)} {...props} />
);

// Video & Communication
export const VideoIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaVideo size={getIconSize(size)} {...props} />
);

export const VideoSlashIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaVideoSlash size={getIconSize(size)} {...props} />
);

export const MicrophoneIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaMicrophone size={getIconSize(size)} {...props} />
);

export const MicrophoneSlashIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaMicrophoneSlash size={getIconSize(size)} {...props} />
);

export const CameraIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaCamera size={getIconSize(size)} {...props} />
);

export const PhoneIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaPhone size={getIconSize(size)} {...props} />
);

export const EmailIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaEnvelope size={getIconSize(size)} {...props} />
);

export const ChatIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaComments size={getIconSize(size)} {...props} />
);

export const AudioIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaHeadphones size={getIconSize(size)} {...props} />
);

export const GraduationIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaGraduationCap size={getIconSize(size)} {...props} />
);

export const BuildingIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaBuilding size={getIconSize(size)} {...props} />
);

export const MobileIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaMobileAlt size={getIconSize(size)} {...props} />
);

// Documents
export const DocumentIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaFileAlt size={getIconSize(size)} {...props} />
);

export const ClipboardIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaClipboardList size={getIconSize(size)} {...props} />
);

export const NotesIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaNotesMedical size={getIconSize(size)} {...props} />
);

export const MedicalFileIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaFileMedical size={getIconSize(size)} {...props} />
);

// Medical & Health
export const DoctorIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaUserMd size={getIconSize(size)} {...props} />
);

export const HospitalIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaHospital size={getIconSize(size)} {...props} />
);

export const MedicalBagIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaBriefcaseMedical size={getIconSize(size)} {...props} />
);

export const BriefcaseIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaBriefcase size={getIconSize(size)} {...props} />
);

export const HeartbeatIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaHeartbeat size={getIconSize(size)} {...props} />
);

export const StethoscopeIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaStethoscope size={getIconSize(size)} {...props} />
);

// Users & People
export const UserIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaUser size={getIconSize(size)} {...props} />
);

export const UsersIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaUsers size={getIconSize(size)} {...props} />
);

export const UserCircleIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaUserCircle size={getIconSize(size)} {...props} />
);

export const UserPlusIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaUserPlus size={getIconSize(size)} {...props} />
);

// Actions
export const EditIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaEdit size={getIconSize(size)} {...props} />
);

export const DeleteIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaTrash size={getIconSize(size)} {...props} />
);

export const SaveIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaSave size={getIconSize(size)} {...props} />
);

export const PlusIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaPlus size={getIconSize(size)} {...props} />
);

export const CloseIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaTimes size={getIconSize(size)} {...props} />
);

export const CheckIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaCheck size={getIconSize(size)} {...props} />
);

// Status Icons
export const CheckCircleIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaCheckCircle size={getIconSize(size)} {...props} />
);

export const ErrorCircleIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaTimesCircle size={getIconSize(size)} {...props} />
);

export const WarningIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaExclamationTriangle size={getIconSize(size)} {...props} />
);

export const InfoIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaInfoCircle size={getIconSize(size)} {...props} />
);

// Business & Finance
export const ChartIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaChartLine size={getIconSize(size)} {...props} />
);

export const DashboardIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaChartLine size={getIconSize(size)} {...props} />
);

export const DollarIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaDollarSign size={getIconSize(size)} {...props} />
);

export const CreditCardIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaCreditCard size={getIconSize(size)} {...props} />
);

export const ReceiptIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaReceipt size={getIconSize(size)} {...props} />
);

// Settings & Tools
export const SettingsIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaCog size={getIconSize(size)} {...props} />
);

export const SearchIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaSearch size={getIconSize(size)} {...props} />
);

export const FilterIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaFilter size={getIconSize(size)} {...props} />
);

export const BoltIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaBolt size={getIconSize(size)} {...props} />
);

// Navigation
export const HomeIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaHome size={getIconSize(size)} {...props} />
);

export const BackIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaArrowLeft size={getIconSize(size)} {...props} />
);

export const ForwardIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaArrowRight size={getIconSize(size)} {...props} />
);

// Misc
export const StarIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaStar size={getIconSize(size)} {...props} />
);

export const BookIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaBook size={getIconSize(size)} {...props} />
);

export const BellIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaBell size={getIconSize(size)} {...props} />
);

export const LockIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaLock size={getIconSize(size)} {...props} />
);

export const UnlockIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaUnlock size={getIconSize(size)} {...props} />
);

export const PrintIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaPrint size={getIconSize(size)} {...props} />
);

export const EyeIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaEye size={getIconSize(size)} {...props} />
);

export const ShareIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaShareAlt size={getIconSize(size)} {...props} />
);

export const BookmarkIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaBookmark size={getIconSize(size)} {...props} />
);

export const LocationIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaMapMarkerAlt size={getIconSize(size)} {...props} />
);

export const LinkIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaLink size={getIconSize(size)} {...props} />
);

export const LightbulbIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaLightbulb size={getIconSize(size)} {...props} />
);

export const CircleIcon = ({ size = 'md', color, ...props }: IconProps & { color?: string }) => (
  <FaCircle size={getIconSize(size)} color={color} {...props} />
);

export const DownloadIcon = ({ size = 'md', ...props }: IconProps) => (
  <FaDownload size={getIconSize(size)} {...props} />
);

/**
 * Icon mapping for easy emoji replacement
 * Use this object to quickly find the right icon for any emoji
 */
export const IconMap = {
  // Calendar & Time
  '📅': CalendarIcon,
  '🗓️': CalendarCheckIcon,
  '⏰': ClockIcon,
  '⏱️': ClockIcon,
  '🕐': ClockIcon,
  
  // Video & Communication
  '🎥': VideoIcon,
  '📞': PhoneIcon,
  '📧': EmailIcon,
  '💬': ChatIcon,
  '💭': ChatIcon,
  
  // Documents
  '📋': ClipboardIcon,
  '📄': DocumentIcon,
  '📝': NotesIcon,
  '📃': DocumentIcon,
  
  // Medical
  '🩺': StethoscopeIcon,
  '🏥': HospitalIcon,
  '💊': MedicalBagIcon,
  '💼': MedicalBagIcon,
  '👨‍⚕️': DoctorIcon,
  '👩‍⚕️': DoctorIcon,
  
  // People
  '👤': UserIcon,
  '👥': UsersIcon,
  '👨': UserIcon,
  '👩': UserIcon,
  
  // Actions
  '✏️': EditIcon,
  '🗑️': DeleteIcon,
  '💾': SaveIcon,
  '➕': PlusIcon,
  '✖️': CloseIcon,
  '✅': CheckIcon,
  '❌': ErrorCircleIcon,
  
  // Status
  '✓': CheckCircleIcon,
  '✔️': CheckCircleIcon,
  '⚠️': WarningIcon,
  'ℹ️': InfoIcon,
  
  // Business
  '📊': ChartIcon,
  '📈': ChartIcon,
  '💳': CreditCardIcon,
  '💰': DollarIcon,
  '🧾': ReceiptIcon,
  
  // Settings
  '⚙️': SettingsIcon,
  '🔍': SearchIcon,
  '🔧': SettingsIcon,
  
  // Navigation
  '🏠': HomeIcon,
  '◀️': BackIcon,
  '▶️': ForwardIcon,
  
  // Misc
  '⭐': StarIcon,
  '📚': BookIcon,
  '📖': BookIcon,
  '🔔': BellIcon,
  '🔒': LockIcon,
  '🔓': UnlockIcon,
  '🖨️': PrintIcon,
  '⬇️': DownloadIcon,
} as const;

/**
 * Convert emoji string to icon component
 * @param emoji - The emoji string (e.g., '📄', '📚')
 * @param size - Icon size (default: 'md')
 * @param props - Additional props to pass to the icon
 * @returns React component for the icon, or DocumentIcon as fallback
 */
export const getIconFromEmoji = (emoji: string, size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md', props?: any) => {
  const IconComponent = IconMap[emoji as keyof typeof IconMap];
  if (IconComponent) {
    return <IconComponent size={size} {...props} />;
  }
  // Fallback to DocumentIcon if emoji not found
  return <DocumentIcon size={size} {...props} />;
};

// Export all icons as default for easy importing
export default {
  // Sizes
  IconSizes,
  getIconSize,
  
  // Calendar & Time
  CalendarIcon,
  CalendarCheckIcon,
  CalendarPlusIcon,
  ClockIcon,
  
  // Video & Communication
  VideoIcon,
  VideoSlashIcon,
  PhoneIcon,
  EmailIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  CameraIcon,
  CircleIcon,
  ChatIcon,
  AudioIcon,
  GraduationIcon,
  BuildingIcon,
  MobileIcon,
  
  // Documents
  DocumentIcon,
  ClipboardIcon,
  NotesIcon,
  MedicalFileIcon,
  
  // Medical
  DoctorIcon,
  HospitalIcon,
  MedicalBagIcon,
  BriefcaseIcon,
  HeartbeatIcon,
  StethoscopeIcon,
  
  // Users
  UserIcon,
  UsersIcon,
  UserCircleIcon,
  UserPlusIcon,
  
  // Actions
  EditIcon,
  DeleteIcon,
  SaveIcon,
  PlusIcon,
  CloseIcon,
  CheckIcon,
  
  // Status
  CheckCircleIcon,
  ErrorCircleIcon,
  WarningIcon,
  InfoIcon,
  
  // Business
  ChartIcon,
  DashboardIcon,
  DollarIcon,
  CreditCardIcon,
  ReceiptIcon,
  
  // Settings
  SettingsIcon,
  SearchIcon,
  FilterIcon,
  BoltIcon,
  
  // Navigation
  HomeIcon,
  BackIcon,
  ForwardIcon,
  
  // Misc
  StarIcon,
  BookIcon,
  BellIcon,
  LockIcon,
  UnlockIcon,
  PrintIcon,
  DownloadIcon,
  EyeIcon,
  ShareIcon,
  BookmarkIcon,
  LocationIcon,
  LinkIcon,
  LightbulbIcon,
  
  // Icon Map
  IconMap,
  getIconFromEmoji,
};

