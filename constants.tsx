
import { Category, TransactionType } from './types';

export const BS_MONTHS = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

export const BS_MONTHS_NEPALI = [
  "वैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कात्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
];

export const BS_DAYS_NEPALI = [
  "आइत", "सोम", "मंगल", "बुध", "बिही", "शुक्र", "शनि"
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'fa-utensils', color: 'bg-orange-500', type: TransactionType.EXPENSE, isDefault: true },
  { id: 'transport', name: 'Transport', icon: 'fa-car', color: 'bg-blue-500', type: TransactionType.EXPENSE, isDefault: true },
  { id: 'rent', name: 'Rent', icon: 'fa-home', color: 'bg-purple-500', type: TransactionType.EXPENSE, isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: 'fa-shopping-bag', color: 'bg-pink-500', type: TransactionType.EXPENSE, isDefault: true },
  { id: 'bills', name: 'Bills', icon: 'fa-file-invoice-dollar', color: 'bg-red-500', type: TransactionType.EXPENSE, isDefault: true },
  { id: 'health', name: 'Health', icon: 'fa-heartbeat', color: 'bg-emerald-500', type: TransactionType.EXPENSE, isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: 'fa-film', color: 'bg-indigo-500', type: TransactionType.EXPENSE, isDefault: true },
  { id: 'transfer-exp', name: 'Transfer', icon: 'fa-right-left', color: 'bg-slate-600', type: TransactionType.EXPENSE, isDefault: true },
  { id: 'other', name: 'Other', icon: 'fa-ellipsis-h', color: 'bg-gray-500', type: TransactionType.EXPENSE, isDefault: true },
  { id: 'salary', name: 'Salary', icon: 'fa-wallet', color: 'bg-green-600', type: TransactionType.INCOME, isDefault: true },
  { id: 'freelance', name: 'Freelance', icon: 'fa-laptop-code', color: 'bg-teal-500', type: TransactionType.INCOME, isDefault: true },
  { id: 'gift', name: 'Gift', icon: 'fa-gift', color: 'bg-amber-500', type: TransactionType.INCOME, isDefault: true },
  { id: 'investment', name: 'Investment', icon: 'fa-chart-line', color: 'bg-lime-600', type: TransactionType.INCOME, isDefault: true },
  { id: 'transfer-inc', name: 'Transfer', icon: 'fa-right-left', color: 'bg-slate-600', type: TransactionType.INCOME, isDefault: true },
  { id: 'other-inc', name: 'Other', icon: 'fa-plus-circle', color: 'bg-gray-600', type: TransactionType.INCOME, isDefault: true },
];

export const AVAILABLE_ICONS = [
  'fa-utensils', 'fa-burger', 'fa-pizza-slice', 'fa-bowl-food', 'fa-mug-hot', 'fa-coffee',
  'fa-car', 'fa-bus', 'fa-train', 'fa-plane', 'fa-bicycle', 'fa-motorcycle', 'fa-gas-pump',
  'fa-house', 'fa-building', 'fa-couch', 'fa-bed', 'fa-bath', 'fa-plug', 'fa-droplet', 'fa-bolt', 'fa-wifi',
  'fa-shopping-bag', 'fa-cart-shopping', 'fa-bag-shopping', 'fa-shirt', 'fa-gem',
  'fa-file-invoice-dollar', 'fa-credit-card', 'fa-receipt', 'fa-wallet', 'fa-money-bill-wave', 'fa-coins', 'fa-bank', 'fa-vault',
  'fa-heart-pulse', 'fa-capsules', 'fa-stethoscope', 'fa-hospital', 'fa-spa', 'fa-scissors', 'fa-soap',
  'fa-film', 'fa-gamepad', 'fa-music', 'fa-tv', 'fa-ticket', 'fa-palette', 'fa-camera',
  'fa-book', 'fa-graduation-cap', 'fa-school', 'fa-microscope',
  'fa-laptop-code', 'fa-mobile-screen-button', 'fa-headphones', 'fa-sim-card',
  'fa-gift', 'fa-chart-line', 'fa-briefcase', 'fa-hand-holding-dollar', 'fa-landmark', 'fa-piggy-bank',
  'fa-dumbbell', 'fa-person-running', 'fa-mountain', 'fa-umbrella-beach',
  'fa-dog', 'fa-cat', 'fa-paw', 'fa-baby', 'fa-tree', 'fa-shield-heart',
  'fa-tools', 'fa-broom', 'fa-wine-glass', 'fa-bottle-water',
  'fa-right-left', 'fa-plus-circle', 'fa-ellipsis-h', 'fa-star', 'fa-circle-info'
];

export const AVAILABLE_COLORS = [
  'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
  'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
  'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];
