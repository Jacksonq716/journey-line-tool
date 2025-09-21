import React from 'react'
import { 
  User, Star, Home, Briefcase, GraduationCap, Car, Plane, Coffee, Camera, 
  Music, Book, Trophy, Gift, MapPin, Phone, Mail, MessageCircle, Settings, Palette, 
  Code, Laptop, Smartphone, Headphones, Globe, Mountain, Gamepad2, Dumbbell, Pizza, 
  ShoppingBag, Lightbulb, Target, Zap, Rocket, Shield, Key, Bell, Flag, Anchor, 
  Compass, Flame, Leaf, Sun, Moon, Cloud, Umbrella, Snowflake, Battery, Wifi, 
  Bluetooth, Mic, Eye, Search, Filter, Edit, Save, Trash2, Plus, Minus, Check, 
  AlertCircle, Info, HelpCircle, Calendar, Clock, Play, Heart
} from 'lucide-react'

const CircleIcon = () => React.createElement('div', { className: 'icon-circle' })

// 创建画布图标渲染组件
const CanvasIcon = ({ IconComponent, size = 30 }) => {
  const iconRef = React.useRef(null)
  
  React.useEffect(() => {
    if (iconRef.current && IconComponent !== CircleIcon) {
      // 清空容器
      iconRef.current.innerHTML = ''
      // 创建临时DOM来渲染图标
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>`
      const svg = tempDiv.querySelector('svg')
      
      // 使用React.createElement创建图标组件
      const iconElement = React.createElement(IconComponent, { size })
      // 这里需要一个不同的方法来在canvas上渲染
    }
  }, [IconComponent, size])
  
  return React.createElement('div', { ref: iconRef })
}

// 为每个图标添加SVG路径数据，用于在画布上渲染
const iconPaths = {
  'user': 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
  'heart': 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', // 空心爱心
  'home': 'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'star': 'm12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', // 空心星星
  'coffee': 'M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z',
  'work': 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  'book': 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20',
  'music': 'm9 18V5l12-2v13',
  'trophy': 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6',
}

// 生成SVG字符串
export const getIconSVG = (iconKey, size = 30, color = '#000') => {
  const path = iconPaths[iconKey]
  if (!path) return null
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="${path}"/>
  </svg>`
}

export const iconLibrary = {
  'circle': { component: CircleIcon, name: 'Basic Circle' },
  // 人物与生活 - 使用空心版本
  'user': { component: User, name: 'Personal' },
  'heart': { component: Heart, name: 'Love' },
  'home': { component: Home, name: 'Family' },
  'coffee': { component: Coffee, name: 'Lifestyle' },
  'pizza': { component: Pizza, name: 'Food' },
  'shopping': { component: ShoppingBag, name: 'Shopping' },
  'dumbbell': { component: Dumbbell, name: 'Fitness' },
  // 工作与学习
  'work': { component: Briefcase, name: 'Work' },
  'education': { component: GraduationCap, name: 'Education' },
  'book': { component: Book, name: 'Learning' },
  'lightbulb': { component: Lightbulb, name: 'Idea' },
  'target': { component: Target, name: 'Goal' },
  'laptop': { component: Laptop, name: 'Computer' },
  'code': { component: Code, name: 'Programming' },
  'palette': { component: Palette, name: 'Design' },
  // 娱乐与爱好
  'music': { component: Music, name: 'Music' },
  'camera': { component: Camera, name: 'Photography' },
  'gamepad': { component: Gamepad2, name: 'Gaming' },
  'headphones': { component: Headphones, name: 'Audio' },
  'play': { component: Play, name: 'Media' },
  // 成就与奖励
  'star': { component: Star, name: 'Achievement' },
  'trophy': { component: Trophy, name: 'Award' },
  'gift': { component: Gift, name: 'Gift' },
  'flag': { component: Flag, name: 'Milestone' },
  'rocket': { component: Rocket, name: 'Launch' },
  'zap': { component: Zap, name: 'Energy' }
}

export const getIconSymbol = (iconKey) => {
  // 统一使用线条风格的简洁符号，与Lucide图标保持一致
  const symbols = {
    // 人物与生活 - 线条风格
    'user': '👤', 'heart': '♡', 'home': '🏠', 'coffee': '☕', 'pizza': '🍕',
    'shopping': '🛒', 'dumbbell': '🏋',
    // 工作与学习 - 线条风格 
    'work': '💼', 'education': '🎓', 'book': '📚', 'lightbulb': '💡',
    'target': '🎯', 'laptop': '💻', 'code': '<>', 'palette': '🎨',
    // 娱乐与爱好 - 线条风格
    'music': '♪', 'camera': '📷', 'gamepad': '🎮', 'headphones': '🎧', 'play': '▶',
    // 成就与奖励 - 线条风格
    'star': '☆', 'trophy': '🏆', 'gift': '🎁', 'flag': '🚩', 'rocket': '🚀', 'zap': '⚡',
    // 旅行与交通 - 线条风格
    'travel': '✈', 'car': '🚗', 'location': '📍', 'compass': '🧭', 'mountain': '⛰', 'globe': '🌍',
    // 通信与联系 - 线条风格
    'phone': '📞', 'mail': '✉', 'message': '💬', 'smartphone': '📱',
    'wifi': '📶', 'bluetooth': '📡',
    // 时间与日程 - 线条风格
    'calendar': '📅', 'clock': '🕐', 'bell': '🔔', 'sun': '☀', 'moon': '🌙',
    // 天气与自然 - 线条风格
    'cloud': '☁', 'umbrella': '☂', 'snowflake': '❄', 'leaf': '🍃', 'flame': '🔥',
    // 工具与系统 - 线条风格
    'settings': '⚙', 'shield': '🛡', 'key': '🔑', 'battery': '🔋', 'search': '🔍',
    'edit': '✏', 'save': '💾', 'trash': '🗑', 'plus': '+', 'check': '✓', 'info': 'ℹ', 'help': '?'
  }
  return symbols[iconKey] || '●'
}