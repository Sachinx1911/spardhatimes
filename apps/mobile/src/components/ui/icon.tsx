import {
  AlertCircle,
  Aperture,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleDot,
  ClipboardList,
  Clock,
  CloudOff,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  GraduationCap,
  Headphones,
  Home,
  Info,
  LayoutGrid,
  Lightbulb,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  MoreVertical,
  Newspaper,
  Pencil,
  Phone,
  PlayCircle,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  User,
  UserCircle,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native';

import { colors } from '@/theme/tokens';

/**
 * App मधलं एकमेव चिन्ह-घटक.
 *
 * Design spec **Lucide** सांगते, पण app आधी Ionicons वर बांधला होता आणि नावं
 * एकोणीस files मध्ये विखुरली आहेत. प्रत्येक file मध्ये Lucide चा घटक थेट आयात
 * केला असता तर तीच नावं पुन्हा पुन्हा ठरवावी लागली असती आणि दोन screens वर एकाच
 * गोष्टीला वेगळी चिन्हं आली असती.
 *
 * म्हणून नकाशा इथे एकाच ठिकाणी. Screens अर्थपूर्ण नाव देतात (`"bookmark"`),
 * इथे ते Lucide च्या घटकाशी जोडलं जातं. चिन्ह बदलायचं असेल तर एकच ओळ बदलते.
 *
 * नावं मुद्दाम Ionicons चीच ठेवली आहेत — त्यामुळे एकोणीस files मध्ये फक्त आयात
 * आणि tag बदलला, बाकी काहीही हात लावावा लागला नाही. `-outline` शेवट Lucide मध्ये
 * नसतो (तिथे सगळीच चिन्हं रेषांची असतात), म्हणून तो गाळला जातो.
 */
const MAP: Record<string, LucideIcon> = {
  // ── दिशा ──
  'arrow-back': ArrowLeft,
  'arrow-forward': ArrowRight,
  'chevron-back': ChevronLeft,
  'chevron-forward': ChevronRight,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  close: X,
  'close-circle': XCircle,
  menu: Menu,

  // ── खालची पट्टी ──
  home: Home,
  school: GraduationCap,
  'person-circle': UserCircle,
  person: User,
  profile: UserCircle,

  // ── अभ्यास ──
  book: BookOpen,
  library: BookMarked,
  learn: BookOpen,
  'document-text': FileText,
  reader: FileText,
  'file-tray': FileText,
  clipboard: ClipboardList,
  tests: ClipboardList,
  'play-circle': PlayCircle,
  newspaper: Newspaper,
  'current-affairs': Newspaper,

  // ── खुणा ──
  bookmark: Bookmark,
  bookmarks: Bookmark,
  star: Star,
  'shield-checkmark': ShieldCheck,
  shield: Shield,
  'badge-check': BadgeCheck,
  ribbon: Trophy,
  trophy: Trophy,
  disc: Target,
  aperture: Aperture,
  locate: Target,

  // ── स्थिती ──
  'checkmark-circle': CheckCircle2,
  'radio-button-on': CircleDot,
  'radio-button-off': Circle,
  checkmark: Check,
  'alert-circle': AlertCircle,
  'information-circle': Info,
  'cloud-offline': CloudOff,
  refresh: RefreshCw,
  sparkles: Sparkles,

  // ── आकडेवारी ──
  analytics: BarChart3,
  'stats-chart': BarChart3,
  'trending-up': TrendingUp,
  podium: Trophy,
  bulb: Lightbulb,

  // ── क्रिया ──
  search: Search,
  filter: Filter,
  funnel: Filter,
  grid: LayoutGrid,
  settings: Settings,
  pencil: Pencil,
  trash: Trash2,
  download: Download,
  'share-social': Share2,
  open: ExternalLink,
  'log-out': LogOut,
  login: LogOut,
  lock: Lock,
  'lock-closed': Lock,
  'ellipsis-horizontal': MoreHorizontal,
  'ellipsis-vertical': MoreVertical,
  time: Clock,
  tag: Tag,
  pricetag: Tag,
  'bag-handle': ShoppingBag,
  globe: Globe,

  // ── संपर्क ──
  call: Phone,
  'chatbubble-ellipses': MessageCircle,
  'logo-whatsapp': MessageSquare,
  headset: Headphones,
  notifications: Bell,
};

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

/**
 * नाव न सापडल्यास **वर्तुळ दाखवतो, कोसळत नाही** — एका चुकीच्या नावासाठी पूर्ण
 * screen जाणं चुकीचं. Development मध्ये console वर इशारा येतो म्हणजे ते सुटत नाही.
 */
export function Icon({ name, size = 24, color = colors.text }: IconProps) {
  const key = name.replace(/-outline$/, '');
  const Cmp = MAP[key];

  if (!Cmp) {
    if (__DEV__) console.warn(`Icon: "${name}" चा नकाशा नाही — icon.tsx मध्ये जोडा.`);
    return <Circle size={size} color={color} />;
  }

  return <Cmp size={size} color={color} />;
}
