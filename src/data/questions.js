const questions = [
  {
    id: 0,
    question: "Where are you starting from?",
    subtitle: "We'll plan your journey from here",
    type: "input",
    inputType: "text",
    placeholder: "e.g. Mumbai, India",
    icon: "🏠"
  },
  {
    id: 1,
    question: "Where do you want to travel?",
    subtitle: "Your adventure starts with a destination",
    type: "input",
    inputType: "text",
    placeholder: "e.g. Goa, India",
    icon: "🌍"
  },
  {
    id: 2,
    question: "How many days is your trip?",
    subtitle: "We'll plan every day to perfection",
    type: "input",
    inputType: "number",
    placeholder: "e.g. 7",
    icon: "📅",
    min: 1,
    max: 90
  },
  {
    id: 3,
    question: "What's your travel pace?",
    subtitle: "How much do you want to pack in each day?",
    type: "options",
    options: [
      { id: "Relaxed",  text: "Relaxed",    description: "Slow mornings, few stops",   emoji: "🌅" },
      { id: "Moderate", text: "Moderate",   description: "Balanced exploration",        emoji: "🚶" },
      { id: "Fast-Paced",     text: "Fast-Paced", description: "See everything possible",    emoji: "⚡" }
    ]
  },
  {
    id: 4,
    question: "What's your daily budget?",
    subtitle: "We'll recommend experiences within your range",
    type: "input",
    inputType: "number",
    placeholder: "e.g. 3000",
    icon: "💰",
    prefix: "₹",
    min: 100
  },
  {
    id: 5,
    question: "What kind of trip do you want?",
    subtitle: "Pick the vibe that excites you most",
    type: "options",
    options: [
      { id: "Adventure",   text: "Adventure",   description: "Thrills & outdoor activities", emoji: "🏔️" },
      { id: "Culture",     text: "Cultural",    description: "History, art & local life",    emoji: "🏛️" },
      { id: "Relaxation",  text: "Relaxation",  description: "Unwind & recharge fully",      emoji: "🌴" },
      { id: "Food & Drink",        text: "Food & Drink",description: "Local cuisine & cafés",        emoji: "🍜" },
      { id: "Nightlife",   text: "Nightlife",   description: "Clubs, bars & social scenes",  emoji: "🌃" },
      { id: "Nature",      text: "Nature",      description: "Landscapes & wildlife",        emoji: "🌿" }
    ]
  },
  {
    id: 6,
    question: "What's your food preference?",
    subtitle: "We'll suggest restaurants you'll actually love",
    type: "options",
    options: [
      { id: "Vegetarian", text: "Vegetarian",   description: "Plant-based, no meat",        emoji: "🥗" },
      { id: "Non-Veg",    text: "Non-Veg",      description: "All foods including meat",     emoji: "🍖" },
      { id: "Vegan",      text: "Vegan",        description: "No animal products at all",    emoji: "🌱" },
      { id: "Seafood Lover",    text: "Seafood Lover",description: "Fresh fish & ocean delights", emoji: "🦞" }
    ]
  }
]

export default questions
