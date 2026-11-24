import { PRODUCTS, FREE_DELIVERY_ABOVE } from '@/lib/products'
export const SERVICES = [
  {
    id: 'training',
    icon: '🎓',
    title: 'Dog Training',
    shortDesc: 'Professional obedience & behavior training',
    description: 'Expert trainers use positive reinforcement methods to teach obedience, agility, and behavior correction. From puppies to adults.',
    features: ['Basic obedience', 'Advanced commands', 'Behavior correction', 'Agility training', 'Puppy classes'],
    price: { basic: 1200, standard: 2500, premium: 4500 },
    duration: '60 min',
    color: '#E8622A',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'walking',
    icon: '🦮',
    title: 'Dog Walking',
    shortDesc: 'Daily walks by certified dog walkers',
    description: 'Certified, background-checked dog walkers provide safe, fun walks tailored to your dog\'s energy level and health needs.',
    features: ['GPS tracked walks', 'Certified walkers', 'Group or solo walks', 'Photo updates', 'Weather adaptive'],
    price: { basic: 400, standard: 700, premium: 1200 },
    duration: '30–60 min',
    color: '#2E7D32',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'healthcheckup',
    icon: '🩺',
    title: 'Health Checkup',
    shortDesc: 'Comprehensive wellness examinations',
    description: 'Full-body health assessments by licensed veterinarians. Early detection of health issues keeps your dog happy longer.',
    features: ['Full body exam', 'Blood work panel', 'Dental check', 'Weight & nutrition', 'Health certificate'],
    price: { basic: 800, standard: 1800, premium: 3500 },
    duration: '45 min',
    color: '#1565C0',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'vaccination',
    icon: '💉',
    title: 'Vaccinations',
    shortDesc: 'Timely immunizations & deworming',
    description: 'Stay on schedule with all essential vaccines. Our vet team tracks your dog\'s immunization history and sends reminders.',
    features: ['Core vaccines', 'Deworming', 'Anti-rabies', 'Immunity booster', 'Digital records'],
    price: { basic: 500, standard: 1000, premium: 2000 },
    duration: '20 min',
    color: '#6A1B9A',
    image: 'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'grooming',
    icon: '✂️',
    title: 'Dog Grooming',
    shortDesc: 'Spa-level grooming & styling',
    description: 'From basic baths to full grooming packages — your dog leaves looking and smelling amazing. Breed-specific styling available.',
    features: ['Bath & blow dry', 'Haircut & styling', 'Nail trimming', 'Ear cleaning', 'Paw care'],
    price: { basic: 600, standard: 1200, premium: 2500 },
    duration: '90 min',
    color: '#AD1457',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'daycare',
    icon: '🏠',
    title: 'Dog Daycare',
    shortDesc: 'Safe, fun supervised daycare',
    description: 'Drop your dog off for a full day of supervised play, socialization, and rest in a safe, loving environment.',
    features: ['Supervised play', 'Socialization', 'Meals provided', 'CCTV monitoring', 'Daily reports'],
    price: { basic: 700, standard: 1400, premium: 2800 },
    duration: 'Full day',
    color: '#E65100',
    image: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'emergency',
    icon: '🚨',
    title: 'Emergency Care',
    shortDesc: '24/7 emergency vet consultation',
    description: 'Round-the-clock emergency consultations and rapid response care for urgent health situations.',
    features: ['24/7 availability', 'Video consult', 'Home visits', 'Rapid response', 'Specialist referral'],
    price: { basic: 1500, standard: 3000, premium: 6000 },
    duration: 'As needed',
    color: '#B71C1C',
    image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'nutrition',
    icon: '🥗',
    title: 'Nutrition Planning',
    shortDesc: 'Custom diet plans by pet nutritionists',
    description: 'Personalized nutrition plans designed for your dog\'s breed, age, weight, and health goals by certified pet nutritionists.',
    features: ['Custom meal plans', 'Allergy screening', 'Supplement advice', 'Weight management', 'Monthly review'],
    price: { basic: 900, standard: 1800, premium: 3200 },
    duration: '30 min consult',
    color: '#388E3C',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
  },
]

export const BREEDS = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Dachshund', 'Yorkshire Terrier',
  'Boxer', 'Siberian Husky', 'Shih Tzu', 'Great Dane', 'Doberman Pinscher',
  'Border Collie', 'Maltese', 'Cocker Spaniel', 'Pug', 'Indian Spitz',
  'Rajapalayam', 'Kombai', 'Mudhol Hound', 'Chippiparai', 'Mixed Breed / Other',
]

// Add REAL customer reviews here (with permission). The homepage section stays hidden while this list is empty.
// Shape: { name, location, dog, text, rating, avatar: 'AB', color: '#E8622A' }
export const TESTIMONIALS = []

// Homepage / About numbers. Only TRUE, checkable figures belong here. To show your own real numbers, set
// NEXT_PUBLIC_STATS in Vercel, e.g.  "320+|Dogs Served;12|Trainers;4|Cities"  (value|label pairs separated by ;)
const ICONS = ['🐕', '👨‍⚕️', '🏙️', '⭐']
const envStats = (process.env.NEXT_PUBLIC_STATS || '').split(';').map((x) => x.trim()).filter(Boolean)
  .map((x, i) => { const [value, label] = x.split('|'); return value && label ? { value: value.trim(), label: label.trim(), icon: ICONS[i % ICONS.length] } : null }).filter(Boolean)
export const STATS = envStats.length ? envStats : [
  { value: String(SERVICES.length), label: 'Dog Care Services', icon: '🐾' },
  { value: `${PRODUCTS.length}+`, label: 'Shop Products', icon: '🛍️' },
  { value: 'COD', label: 'Cash on Delivery', icon: '💵' },
  { value: 'Free', label: `Delivery above ₹${FREE_DELIVERY_ABOVE.toLocaleString('en-IN')}`, icon: '🚚' },
]

export const PLANS = {
  basic:    { label: 'Basic',    color: 'gray',   badge: '' },
  standard: { label: 'Standard', color: 'orange',  badge: 'Most Popular' },
  premium:  { label: 'Premium',  color: 'brown',  badge: 'Best Value' },
}

export const NAV_LINKS = [
  { href: '/',            label: 'Home' },
  { href: '/services',   label: 'Services' },
  { href: '/shop',       label: 'Shop' },
  { href: '/about',      label: 'About' },
  { href: '/contact',    label: 'Contact' },
]

export const DOG_IMAGES = {
  hero1: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80',
  hero2: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80',
  about: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=800&auto=format&fit=crop&q=80',
  happy1: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80',
  happy2: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=600&auto=format&fit=crop&q=80',
  happy3: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&auto=format&fit=crop&q=80',
  pup1:   'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&auto=format&fit=crop&q=80',
  pup2:   'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=600&auto=format&fit=crop&q=80',
}

export const HOW_IT_WORKS = [
  { icon: '📝', title: 'Create your account', text: 'Sign up in under a minute and add your dog’s profile — breed, age, health notes.' },
  { icon: '🗓️', title: 'Pick a service & slot', text: 'Choose training, walking, grooming, vet care and more — with transparent plan pricing.' },
  { icon: '🏡', title: 'We take it from there', text: 'Visit our centre or opt for a home visit. Track bookings and health records from your dashboard.' },
]

export const FAQS = [
  { q: 'How do I book a service?', a: 'Create a free account, add your dog, then choose a service, plan, date and time slot from your dashboard. You will see the final price before you confirm.' },
  { q: 'Can I get a home visit?', a: 'Yes. Select “home visit” while booking and add your address. A flat ₹200 home-visit fee is added to the plan price.' },
  { q: 'Can I cancel or reschedule a booking?', a: 'You can cancel an upcoming booking from your dashboard before it starts. To reschedule, cancel and book a new slot, or contact our team and we will help.' },
  { q: 'Which cities do you serve?', a: 'Tell us your city on the contact page and we will confirm whether we can serve you.' },
  { q: 'Are my dog’s health records stored?', a: 'Yes. Each dog profile keeps vaccination and health records so you always have them in one place, accessible only from your account.' },
  { q: 'What if I need urgent help?', a: 'Call us on the number on the contact page. For serious emergencies, please go to your nearest veterinary hospital immediately.' },
]

export const TIME_SLOTS = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM']
