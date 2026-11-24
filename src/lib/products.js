// Shop catalogue — single source of truth (used by the shop pages AND by the server to price orders).
// ⚠ Prices are INDICATIVE. Update price / mrp / size to your real stock before going live.
// ⚠ Product images in /public/products are generated placeholders — replace each with a real
//    photo by dropping a file in /public/products and changing the "image" path (e.g. "/products/my-photo.jpg").
// To add a product: copy any object below, give it a UNIQUE "slug", and edit the fields.

export const SHOP_CATEGORIES = [
  { id: 'all', label: 'All Products', icon: '🛍️' },
  { id: 'dog', label: 'Dog Food', icon: '🐶' },
  { id: 'cat', label: 'Cat Food', icon: '🐱' },
]

export const PRODUCT_TYPES = ['Dry Food', 'Wet Food', 'Puppy Food', 'Kitten Food', 'Senior', 'Treats']

export const FREE_DELIVERY_ABOVE = 999 // ₹
export const DELIVERY_FEE = 49 // ₹ when below the free-delivery amount

export const PRODUCTS = [
  {
    "slug": "pedigree-adult-dry-dog-food-chicken-vegetables",
    "name": "Adult Dry Dog Food – Chicken & Vegetables",
    "brand": "Pedigree",
    "category": "dog",
    "type": "Dry Food",
    "tagline": "Everyday nutrition for adult dogs",
    "description": "A pocket-friendly complete diet for adult dogs with real chicken flavour and vegetables. Delivers the protein, vitamins and minerals most adult dogs need every day.",
    "highlights": [
      "Complete & balanced daily nutrition",
      "Supports strong muscles and healthy digestion",
      "Crunchy kibble helps keep teeth cleaner",
      "Added vitamins & minerals for skin and coat"
    ],
    "suitableFor": "Adult (1 year+), all breeds",
    "feeding": "Feeding amount depends on your dog's weight, age and activity. Follow the pack's feeding chart, split into 2 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/pedigree-adult-dry-dog-food-chicken-vegetables.svg",
    "variants": [
      {
        "size": "1.2 kg",
        "price": 260,
        "mrp": 299
      },
      {
        "size": "3 kg",
        "price": 570,
        "mrp": 650
      },
      {
        "size": "10 kg",
        "price": 1650,
        "mrp": 1880
      }
    ]
  },
  {
    "slug": "pedigree-puppy-dry-dog-food-chicken-milk",
    "name": "Puppy Dry Dog Food – Chicken & Milk",
    "brand": "Pedigree",
    "category": "dog",
    "type": "Puppy Food",
    "tagline": "Gentle start for growing puppies",
    "description": "A soft-bite kibble with chicken and milk for puppies weaning onto solid food. Supports healthy growth, strong bones and teeth.",
    "highlights": [
      "Made for growing puppies (2–12 months)",
      "Supports bone, teeth and brain development",
      "Easy-to-chew small kibble",
      "Balanced calcium & phosphorus for healthy growth"
    ],
    "suitableFor": "Puppy (2–12 months)",
    "feeding": "Feed puppies 3–4 small meals a day until about 4 months, then 2–3 meals. Follow the pack chart for their weight and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/pedigree-puppy-dry-dog-food-chicken-milk.svg",
    "variants": [
      {
        "size": "1.2 kg",
        "price": 280,
        "mrp": 320
      },
      {
        "size": "3 kg",
        "price": 610,
        "mrp": 690
      },
      {
        "size": "10 kg",
        "price": 1750,
        "mrp": 1980
      }
    ]
  },
  {
    "slug": "pedigree-adult-wet-dog-food-pouches-chicken-liver-gravy",
    "name": "Adult Wet Dog Food Pouches – Chicken & Liver Gravy",
    "brand": "Pedigree",
    "category": "dog",
    "type": "Wet Food",
    "tagline": "Juicy chunks in tasty gravy",
    "description": "Tender chunks in gravy that turn any bowl of kibble into a special meal. Perfect for fussy eaters and dogs who need extra hydration.",
    "highlights": [
      "High-moisture meal that dogs love",
      "Great as a topper or a full meal",
      "Soft texture, ideal for fussy eaters or older dogs",
      "Tasty gravy to encourage hydration"
    ],
    "suitableFor": "Adult dogs, all breeds",
    "feeding": "Serve at room temperature. Follow the pack chart; wet food can replace part of the dry ration. Refrigerate leftovers in a covered container and use within 24 hours.",
    "image": "/products/pedigree-adult-wet-dog-food-pouches-chicken-liver-gravy.svg",
    "variants": [
      {
        "size": "Pack of 6 × 70 g",
        "price": 150,
        "mrp": 174
      },
      {
        "size": "Pack of 15 × 70 g",
        "price": 360,
        "mrp": 420
      }
    ]
  },
  {
    "slug": "royal-canin-maxi-adult-dry-dog-food",
    "name": "Maxi Adult Dry Dog Food",
    "brand": "Royal Canin",
    "category": "dog",
    "type": "Dry Food",
    "tagline": "Precision nutrition for large breeds",
    "description": "Tailored for adult dogs of 26–44 kg. A kibble shaped to encourage chewing, with nutrients that support joints and digestion in big dogs.",
    "highlights": [
      "Complete & balanced daily nutrition",
      "Supports strong muscles and healthy digestion",
      "Crunchy kibble helps keep teeth cleaner",
      "Added vitamins & minerals for skin and coat"
    ],
    "suitableFor": "Adult large breeds (26–44 kg)",
    "feeding": "Feeding amount depends on your dog's weight, age and activity. Follow the pack's feeding chart, split into 2 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/royal-canin-maxi-adult-dry-dog-food.svg",
    "variants": [
      {
        "size": "4 kg",
        "price": 3650,
        "mrp": 3950
      },
      {
        "size": "10 kg",
        "price": 8100,
        "mrp": 8700
      },
      {
        "size": "15 kg",
        "price": 11500,
        "mrp": 12400
      }
    ]
  },
  {
    "slug": "royal-canin-mini-puppy-dry-dog-food",
    "name": "Mini Puppy Dry Dog Food",
    "brand": "Royal Canin",
    "category": "dog",
    "type": "Puppy Food",
    "tagline": "For small-breed puppies up to 10 months",
    "description": "A small kibble designed for tiny jaws, with antioxidants to support natural defences during the first months of life.",
    "highlights": [
      "Made for growing puppies (2–12 months)",
      "Supports bone, teeth and brain development",
      "Easy-to-chew small kibble",
      "Balanced calcium & phosphorus for healthy growth"
    ],
    "suitableFor": "Small-breed puppy (up to 10 kg adult weight)",
    "feeding": "Feed puppies 3–4 small meals a day until about 4 months, then 2–3 meals. Follow the pack chart for their weight and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/royal-canin-mini-puppy-dry-dog-food.svg",
    "variants": [
      {
        "size": "800 g",
        "price": 830,
        "mrp": 899
      },
      {
        "size": "2 kg",
        "price": 1900,
        "mrp": 2050
      },
      {
        "size": "4 kg",
        "price": 3550,
        "mrp": 3850
      }
    ]
  },
  {
    "slug": "royal-canin-labrador-retriever-adult-dry-dog-food",
    "name": "Labrador Retriever Adult Dry Dog Food",
    "brand": "Royal Canin",
    "category": "dog",
    "type": "Dry Food",
    "tagline": "Breed-specific nutrition for Labradors",
    "description": "Formulated for the Labrador's appetite and body shape. Helps maintain ideal weight and supports healthy joints.",
    "highlights": [
      "Complete & balanced daily nutrition",
      "Supports strong muscles and healthy digestion",
      "Crunchy kibble helps keep teeth cleaner",
      "Added vitamins & minerals for skin and coat"
    ],
    "suitableFor": "Adult Labrador Retrievers (15 months+)",
    "feeding": "Feeding amount depends on your dog's weight, age and activity. Follow the pack's feeding chart, split into 2 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/royal-canin-labrador-retriever-adult-dry-dog-food.svg",
    "variants": [
      {
        "size": "3 kg",
        "price": 3150,
        "mrp": 3400
      },
      {
        "size": "12 kg",
        "price": 10600,
        "mrp": 11400
      }
    ]
  },
  {
    "slug": "drools-focus-adult-dry-dog-food-chicken-egg",
    "name": "Focus Adult Dry Dog Food – Chicken & Egg",
    "brand": "Drools",
    "category": "dog",
    "type": "Dry Food",
    "tagline": "High-protein daily nutrition",
    "description": "A value-for-money kibble with chicken and egg protein to support lean muscle, energy and a healthy coat.",
    "highlights": [
      "Complete & balanced daily nutrition",
      "Supports strong muscles and healthy digestion",
      "Crunchy kibble helps keep teeth cleaner",
      "Added vitamins & minerals for skin and coat"
    ],
    "suitableFor": "Adult (1 year+), all breeds",
    "feeding": "Feeding amount depends on your dog's weight, age and activity. Follow the pack's feeding chart, split into 2 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/drools-focus-adult-dry-dog-food-chicken-egg.svg",
    "variants": [
      {
        "size": "3 kg",
        "price": 749,
        "mrp": 899
      },
      {
        "size": "10 kg",
        "price": 2199,
        "mrp": 2650
      },
      {
        "size": "20 kg",
        "price": 3999,
        "mrp": 4800
      }
    ]
  },
  {
    "slug": "drools-optimum-puppy-dry-dog-food-chicken",
    "name": "Optimum Puppy Dry Dog Food – Chicken",
    "brand": "Drools",
    "category": "dog",
    "type": "Puppy Food",
    "tagline": "Complete nutrition for growing pups",
    "description": "Balanced calcium, protein and DHA-rich nutrition to support brain development and sturdy bones in puppies.",
    "highlights": [
      "Made for growing puppies (2–12 months)",
      "Supports bone, teeth and brain development",
      "Easy-to-chew small kibble",
      "Balanced calcium & phosphorus for healthy growth"
    ],
    "suitableFor": "Puppy (2–12 months)",
    "feeding": "Feed puppies 3–4 small meals a day until about 4 months, then 2–3 meals. Follow the pack chart for their weight and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/drools-optimum-puppy-dry-dog-food-chicken.svg",
    "variants": [
      {
        "size": "1.2 kg",
        "price": 420,
        "mrp": 499
      },
      {
        "size": "3 kg",
        "price": 899,
        "mrp": 1049
      },
      {
        "size": "10 kg",
        "price": 2599,
        "mrp": 3099
      }
    ]
  },
  {
    "slug": "drools-chicken-chew-sticks-dog-treats",
    "name": "Chicken Chew Sticks Dog Treats",
    "brand": "Drools",
    "category": "dog",
    "type": "Treats",
    "tagline": "Chewy sticks for training & fun",
    "description": "Slow-chew sticks that keep dogs busy and make a great reward. Easy to break into small pieces for training sessions.",
    "highlights": [
      "Healthy reward for training and bonding",
      "Easy to carry and break into pieces",
      "Bite-sized rewards dogs love",
      "Feed as a treat, not a replacement for meals"
    ],
    "suitableFor": "Adult dogs and puppies (3 months+)",
    "feeding": "Treats should be no more than about 10% of daily calories. Give 1–3 pieces a day depending on size, with fresh water available.",
    "image": "/products/drools-chicken-chew-sticks-dog-treats.svg",
    "variants": [
      {
        "size": "150 g",
        "price": 199,
        "mrp": 240
      },
      {
        "size": "450 g",
        "price": 499,
        "mrp": 590
      }
    ]
  },
  {
    "slug": "purina-pro-plan-adult-medium-breed-chicken-rice",
    "name": "Adult Medium Breed – Chicken & Rice",
    "brand": "Purina Pro Plan",
    "category": "dog",
    "type": "Dry Food",
    "tagline": "Performance nutrition with real chicken",
    "description": "A chicken-based, vet-trusted recipe that supports lean muscle, immunity and digestion for medium-sized dogs.",
    "highlights": [
      "Complete & balanced daily nutrition",
      "Supports strong muscles and healthy digestion",
      "Crunchy kibble helps keep teeth cleaner",
      "Added vitamins & minerals for skin and coat"
    ],
    "suitableFor": "Adult medium breeds (10–25 kg)",
    "feeding": "Feeding amount depends on your dog's weight, age and activity. Follow the pack's feeding chart, split into 2 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/purina-pro-plan-adult-medium-breed-chicken-rice.svg",
    "variants": [
      {
        "size": "3 kg",
        "price": 2450,
        "mrp": 2650
      },
      {
        "size": "12 kg",
        "price": 8400,
        "mrp": 9000
      }
    ]
  },
  {
    "slug": "farmina-n-d-pumpkin-chicken-pomegranate-adult-mini",
    "name": "Pumpkin Chicken & Pomegranate Adult Mini",
    "brand": "Farmina N&D",
    "category": "dog",
    "type": "Dry Food",
    "tagline": "Grain-free recipe for small dogs",
    "description": "A grain-free, low-glycaemic recipe with pumpkin and pomegranate for small-breed adults. High in animal protein with natural antioxidants.",
    "highlights": [
      "Complete & balanced daily nutrition",
      "Supports strong muscles and healthy digestion",
      "Crunchy kibble helps keep teeth cleaner",
      "Added vitamins & minerals for skin and coat"
    ],
    "suitableFor": "Adult small breeds (up to 10 kg)",
    "feeding": "Feeding amount depends on your dog's weight, age and activity. Follow the pack's feeding chart, split into 2 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/farmina-n-d-pumpkin-chicken-pomegranate-adult-mini.svg",
    "variants": [
      {
        "size": "800 g",
        "price": 1150,
        "mrp": 1250
      },
      {
        "size": "2.5 kg",
        "price": 2750,
        "mrp": 2990
      },
      {
        "size": "7 kg",
        "price": 6300,
        "mrp": 6800
      }
    ]
  },
  {
    "slug": "hills-science-diet-adult-small-bites-dry-dog-food-chicken-barley",
    "name": "Adult Small Bites Dry Dog Food – Chicken & Barley",
    "brand": "Hill's Science Diet",
    "category": "dog",
    "type": "Dry Food",
    "tagline": "Vet-recommended everyday nutrition",
    "description": "Clinically proven antioxidant blend to support immunity, with small bites that suit small and medium mouths.",
    "highlights": [
      "Complete & balanced daily nutrition",
      "Supports strong muscles and healthy digestion",
      "Crunchy kibble helps keep teeth cleaner",
      "Added vitamins & minerals for skin and coat"
    ],
    "suitableFor": "Adult small & toy breeds",
    "feeding": "Feeding amount depends on your dog's weight, age and activity. Follow the pack's feeding chart, split into 2 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/hills-science-diet-adult-small-bites-dry-dog-food-chicken-barley.svg",
    "variants": [
      {
        "size": "2 kg",
        "price": 2800,
        "mrp": 3050
      },
      {
        "size": "6 kg",
        "price": 6900,
        "mrp": 7400
      }
    ]
  },
  {
    "slug": "hills-science-diet-mature-adult-7-dry-dog-food-chicken",
    "name": "Mature Adult 7+ Dry Dog Food – Chicken",
    "brand": "Hill's Science Diet",
    "category": "dog",
    "type": "Senior",
    "tagline": "Support for dogs in their golden years",
    "description": "Supports mobility, vitality and kidney health in dogs aged 7 and up, with highly digestible ingredients.",
    "highlights": [
      "Tailored for dogs 7 years and older",
      "Supports joint comfort and mobility",
      "Easy-to-digest recipe",
      "Controlled calories to help maintain healthy weight"
    ],
    "suitableFor": "Senior dogs (7 years+)",
    "feeding": "Feeding amount depends on your dog's weight, age and activity. Follow the pack's feeding chart, split into 2 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/hills-science-diet-mature-adult-7-dry-dog-food-chicken.svg",
    "variants": [
      {
        "size": "2 kg",
        "price": 2950,
        "mrp": 3200
      },
      {
        "size": "6 kg",
        "price": 7300,
        "mrp": 7800
      }
    ]
  },
  {
    "slug": "canine-creek-ultra-premium-adult-dry-dog-food-chicken",
    "name": "Ultra Premium Adult Dry Dog Food – Chicken",
    "brand": "Canine Creek",
    "category": "dog",
    "type": "Dry Food",
    "tagline": "Premium recipe, made in India",
    "description": "A premium dry food made in India with a meat-rich recipe, suited to everyday feeding of adult dogs.",
    "highlights": [
      "Complete & balanced daily nutrition",
      "Supports strong muscles and healthy digestion",
      "Crunchy kibble helps keep teeth cleaner",
      "Added vitamins & minerals for skin and coat"
    ],
    "suitableFor": "Adult (1 year+), all breeds",
    "feeding": "Feeding amount depends on your dog's weight, age and activity. Follow the pack's feeding chart, split into 2 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/canine-creek-ultra-premium-adult-dry-dog-food-chicken.svg",
    "variants": [
      {
        "size": "3 kg",
        "price": 1650,
        "mrp": 1850
      },
      {
        "size": "10 kg",
        "price": 4700,
        "mrp": 5200
      }
    ]
  },
  {
    "slug": "himalaya-healthy-pet-food-puppy-dry-chicken-rice",
    "name": "Healthy Pet Food Puppy Dry – Chicken & Rice",
    "brand": "Himalaya",
    "category": "dog",
    "type": "Puppy Food",
    "tagline": "Herbal-enriched nutrition for pups",
    "description": "Made with chicken and rice and fortified with herbal ingredients to support immunity and healthy digestion in growing puppies.",
    "highlights": [
      "Made for growing puppies (2–12 months)",
      "Supports bone, teeth and brain development",
      "Easy-to-chew small kibble",
      "Balanced calcium & phosphorus for healthy growth"
    ],
    "suitableFor": "Puppy (2–12 months)",
    "feeding": "Feed puppies 3–4 small meals a day until about 4 months, then 2–3 meals. Follow the pack chart for their weight and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/himalaya-healthy-pet-food-puppy-dry-chicken-rice.svg",
    "variants": [
      {
        "size": "1.2 kg",
        "price": 430,
        "mrp": 499
      },
      {
        "size": "3 kg",
        "price": 990,
        "mrp": 1150
      }
    ]
  },
  {
    "slug": "dogsee-chew-himalayan-cheese-dog-treat",
    "name": "Chew Himalayan Cheese Dog Treat",
    "brand": "Dogsee",
    "category": "dog",
    "type": "Treats",
    "tagline": "Long-lasting natural cheese chew",
    "description": "A hard, slow-dissolving chew made from yak-milk cheese — a protein-rich treat that keeps dogs happily busy.",
    "highlights": [
      "Healthy reward for training and bonding",
      "Easy to carry and break into pieces",
      "Bite-sized rewards dogs love",
      "Feed as a treat, not a replacement for meals"
    ],
    "suitableFor": "Dogs of all ages (not for very small puppies)",
    "feeding": "Treats should be no more than about 10% of daily calories. Give 1–3 pieces a day depending on size, with fresh water available.",
    "image": "/products/dogsee-chew-himalayan-cheese-dog-treat.svg",
    "variants": [
      {
        "size": "Small 70 g",
        "price": 349,
        "mrp": 399
      },
      {
        "size": "Medium 150 g",
        "price": 649,
        "mrp": 749
      }
    ]
  },
  {
    "slug": "pedigree-dentastix-daily-dental-chews-medium-breed",
    "name": "Dentastix Daily Dental Chews – Medium Breed",
    "brand": "Pedigree",
    "category": "dog",
    "type": "Treats",
    "tagline": "Daily chew for cleaner teeth",
    "description": "A daily chew with a unique X-shape to help reduce tartar build-up and freshen breath when given regularly.",
    "highlights": [
      "Healthy reward for training and bonding",
      "Easy to carry and break into pieces",
      "Bite-sized rewards dogs love",
      "Feed as a treat, not a replacement for meals"
    ],
    "suitableFor": "Adult dogs 10–25 kg",
    "feeding": "Treats should be no more than about 10% of daily calories. Give 1–3 pieces a day depending on size, with fresh water available.",
    "image": "/products/pedigree-dentastix-daily-dental-chews-medium-breed.svg",
    "variants": [
      {
        "size": "7 sticks",
        "price": 190,
        "mrp": 210
      },
      {
        "size": "28 sticks",
        "price": 650,
        "mrp": 720
      }
    ]
  },
  {
    "slug": "whiskas-adult-dry-cat-food-ocean-fish",
    "name": "Adult Dry Cat Food – Ocean Fish",
    "brand": "Whiskas",
    "category": "cat",
    "type": "Dry Food",
    "tagline": "Ocean-fish taste cats love",
    "description": "A complete and balanced crunchy kibble with real fish flavour that supports healthy skin, coat and vision.",
    "highlights": [
      "Complete & balanced daily nutrition for cats",
      "Supports healthy vision and heart (taurine)",
      "Crunchy kibble with a taste cats enjoy",
      "Supports shiny coat and healthy skin"
    ],
    "suitableFor": "Adult cats (1 year+)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/whiskas-adult-dry-cat-food-ocean-fish.svg",
    "variants": [
      {
        "size": "480 g",
        "price": 175,
        "mrp": 199
      },
      {
        "size": "1.2 kg",
        "price": 380,
        "mrp": 430
      },
      {
        "size": "3 kg",
        "price": 845,
        "mrp": 960
      },
      {
        "size": "7 kg",
        "price": 1760,
        "mrp": 1990
      }
    ]
  },
  {
    "slug": "whiskas-kitten-junior-dry-cat-food-ocean-fish",
    "name": "Kitten (Junior) Dry Cat Food – Ocean Fish",
    "brand": "Whiskas",
    "category": "cat",
    "type": "Kitten Food",
    "tagline": "Growing-up nutrition for kittens",
    "description": "Small, easy-to-chew kibble with nutrients to support rapid growth and a strong immune system in kittens.",
    "highlights": [
      "Designed for kittens up to 12 months",
      "Supports growth, immunity and brain development",
      "Small kibble sized for tiny mouths",
      "Rich in protein and essential fatty acids"
    ],
    "suitableFor": "Kitten (2–12 months)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/whiskas-kitten-junior-dry-cat-food-ocean-fish.svg",
    "variants": [
      {
        "size": "480 g",
        "price": 185,
        "mrp": 210
      },
      {
        "size": "1.1 kg",
        "price": 380,
        "mrp": 440
      },
      {
        "size": "3 kg",
        "price": 895,
        "mrp": 1020
      }
    ]
  },
  {
    "slug": "whiskas-adult-wet-cat-food-pouches-tuna-in-jelly",
    "name": "Adult Wet Cat Food Pouches – Tuna in Jelly",
    "brand": "Whiskas",
    "category": "cat",
    "type": "Wet Food",
    "tagline": "Tender tuna in silky jelly",
    "description": "Succulent tuna pieces in jelly — a moisture-rich meal that cats find hard to resist and helps keep them hydrated.",
    "highlights": [
      "Moist, tender meal cats find irresistible",
      "Helps increase daily water intake",
      "Soft texture, easy to eat",
      "Can be fed alone or mixed with dry food"
    ],
    "suitableFor": "Adult cats (1 year+)",
    "feeding": "Serve at room temperature. Follow the pack chart; wet food can replace part of the dry ration. Refrigerate leftovers in a covered container and use within 24 hours.",
    "image": "/products/whiskas-adult-wet-cat-food-pouches-tuna-in-jelly.svg",
    "variants": [
      {
        "size": "Pack of 6 × 85 g",
        "price": 170,
        "mrp": 198
      },
      {
        "size": "Pack of 12 × 85 g",
        "price": 330,
        "mrp": 384
      }
    ]
  },
  {
    "slug": "me-o-adult-dry-cat-food-tuna",
    "name": "Adult Dry Cat Food – Tuna",
    "brand": "Me-O",
    "category": "cat",
    "type": "Dry Food",
    "tagline": "Tuna flavour, complete nutrition",
    "description": "A tasty tuna-flavoured kibble with taurine for heart and eye health and added vitamins for a glossy coat.",
    "highlights": [
      "Complete & balanced daily nutrition for cats",
      "Supports healthy vision and heart (taurine)",
      "Crunchy kibble with a taste cats enjoy",
      "Supports shiny coat and healthy skin"
    ],
    "suitableFor": "Adult cats (1 year+)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/me-o-adult-dry-cat-food-tuna.svg",
    "variants": [
      {
        "size": "1.2 kg",
        "price": 360,
        "mrp": 420
      },
      {
        "size": "3 kg",
        "price": 820,
        "mrp": 950
      },
      {
        "size": "7 kg",
        "price": 1690,
        "mrp": 1950
      }
    ]
  },
  {
    "slug": "me-o-kitten-dry-cat-food-ocean-fish",
    "name": "Kitten Dry Cat Food – Ocean Fish",
    "brand": "Me-O",
    "category": "cat",
    "type": "Kitten Food",
    "tagline": "Perfectly sized bites for kittens",
    "description": "Nutritionally balanced for kittens with DHA to support brain development and calcium for strong bones and teeth.",
    "highlights": [
      "Designed for kittens up to 12 months",
      "Supports growth, immunity and brain development",
      "Small kibble sized for tiny mouths",
      "Rich in protein and essential fatty acids"
    ],
    "suitableFor": "Kitten (2–12 months)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/me-o-kitten-dry-cat-food-ocean-fish.svg",
    "variants": [
      {
        "size": "1.1 kg",
        "price": 380,
        "mrp": 440
      },
      {
        "size": "3 kg",
        "price": 850,
        "mrp": 980
      }
    ]
  },
  {
    "slug": "me-o-creamy-treats-cat-lickable-snack-tuna-pack-of-4",
    "name": "Creamy Treats Cat Lickable Snack – Tuna (Pack of 4)",
    "brand": "Me-O",
    "category": "cat",
    "type": "Treats",
    "tagline": "Squeeze-and-lick treat",
    "description": "A smooth, lickable treat served straight from the tube. Great for bonding, medicine time or rewarding good behaviour.",
    "highlights": [
      "Tasty reward for training and bonding",
      "Soft or crunchy bites cats love",
      "Easy to portion",
      "Feed as a treat alongside a complete diet"
    ],
    "suitableFor": "Cats and kittens (3 months+)",
    "feeding": "Treats should be no more than about 10% of daily calories. Give 1–3 pieces a day depending on size, with fresh water available.",
    "image": "/products/me-o-creamy-treats-cat-lickable-snack-tuna-pack-of-4.svg",
    "variants": [
      {
        "size": "4 × 15 g",
        "price": 99,
        "mrp": 120
      },
      {
        "size": "12 × 15 g",
        "price": 275,
        "mrp": 330
      }
    ]
  },
  {
    "slug": "royal-canin-indoor-adult-dry-cat-food",
    "name": "Indoor Adult Dry Cat Food",
    "brand": "Royal Canin",
    "category": "cat",
    "type": "Dry Food",
    "tagline": "Made for cats that live indoors",
    "description": "Helps reduce stool odour and supports healthy weight for less-active indoor cats, with a kibble that encourages chewing.",
    "highlights": [
      "Complete & balanced daily nutrition for cats",
      "Supports healthy vision and heart (taurine)",
      "Crunchy kibble with a taste cats enjoy",
      "Supports shiny coat and healthy skin"
    ],
    "suitableFor": "Adult indoor cats (1–7 years)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/royal-canin-indoor-adult-dry-cat-food.svg",
    "variants": [
      {
        "size": "400 g",
        "price": 520,
        "mrp": 570
      },
      {
        "size": "2 kg",
        "price": 2450,
        "mrp": 2650
      },
      {
        "size": "4 kg",
        "price": 4500,
        "mrp": 4850
      }
    ]
  },
  {
    "slug": "royal-canin-kitten-dry-cat-food",
    "name": "Kitten Dry Cat Food",
    "brand": "Royal Canin",
    "category": "cat",
    "type": "Kitten Food",
    "tagline": "Supports natural defences in kittens",
    "description": "Complete nutrition for kittens 4–12 months, with antioxidants and prebiotics to support immunity and digestion.",
    "highlights": [
      "Designed for kittens up to 12 months",
      "Supports growth, immunity and brain development",
      "Small kibble sized for tiny mouths",
      "Rich in protein and essential fatty acids"
    ],
    "suitableFor": "Kitten (4–12 months)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/royal-canin-kitten-dry-cat-food.svg",
    "variants": [
      {
        "size": "400 g",
        "price": 510,
        "mrp": 560
      },
      {
        "size": "2 kg",
        "price": 2350,
        "mrp": 2550
      },
      {
        "size": "4 kg",
        "price": 4350,
        "mrp": 4700
      }
    ]
  },
  {
    "slug": "royal-canin-persian-adult-dry-cat-food",
    "name": "Persian Adult Dry Cat Food",
    "brand": "Royal Canin",
    "category": "cat",
    "type": "Dry Food",
    "tagline": "Breed-specific nutrition for Persians",
    "description": "A uniquely shaped kibble that is easy for flat-faced Persians to pick up, with nutrients for a long, healthy coat.",
    "highlights": [
      "Complete & balanced daily nutrition for cats",
      "Supports healthy vision and heart (taurine)",
      "Crunchy kibble with a taste cats enjoy",
      "Supports shiny coat and healthy skin"
    ],
    "suitableFor": "Adult Persian cats (12 months+)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/royal-canin-persian-adult-dry-cat-food.svg",
    "variants": [
      {
        "size": "400 g",
        "price": 560,
        "mrp": 620
      },
      {
        "size": "2 kg",
        "price": 2700,
        "mrp": 2900
      }
    ]
  },
  {
    "slug": "royal-canin-sterilised-adult-dry-cat-food",
    "name": "Sterilised Adult Dry Cat Food",
    "brand": "Royal Canin",
    "category": "cat",
    "type": "Dry Food",
    "tagline": "Weight support after neutering",
    "description": "Controlled calories and moderate fat help neutered cats keep an ideal weight, with nutrients for urinary health.",
    "highlights": [
      "Complete & balanced daily nutrition for cats",
      "Supports healthy vision and heart (taurine)",
      "Crunchy kibble with a taste cats enjoy",
      "Supports shiny coat and healthy skin"
    ],
    "suitableFor": "Adult spayed/neutered cats (1–7 years)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/royal-canin-sterilised-adult-dry-cat-food.svg",
    "variants": [
      {
        "size": "400 g",
        "price": 540,
        "mrp": 590
      },
      {
        "size": "2 kg",
        "price": 2550,
        "mrp": 2750
      },
      {
        "size": "4 kg",
        "price": 4700,
        "mrp": 5050
      }
    ]
  },
  {
    "slug": "purina-pro-plan-adult-cat-dry-food-chicken-rice",
    "name": "Adult Cat Dry Food – Chicken & Rice",
    "brand": "Purina Pro Plan",
    "category": "cat",
    "type": "Dry Food",
    "tagline": "Chicken-first recipe for adult cats",
    "description": "A chicken-and-rice recipe that supports lean muscle, healthy digestion and strong immunity in adult cats.",
    "highlights": [
      "Complete & balanced daily nutrition for cats",
      "Supports healthy vision and heart (taurine)",
      "Crunchy kibble with a taste cats enjoy",
      "Supports shiny coat and healthy skin"
    ],
    "suitableFor": "Adult cats (1 year+)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/purina-pro-plan-adult-cat-dry-food-chicken-rice.svg",
    "variants": [
      {
        "size": "1.5 kg",
        "price": 1850,
        "mrp": 2000
      },
      {
        "size": "3 kg",
        "price": 3400,
        "mrp": 3700
      }
    ]
  },
  {
    "slug": "sheba-adult-wet-cat-food-pouches-tuna-fillets-in-gravy",
    "name": "Adult Wet Cat Food Pouches – Tuna Fillets in Gravy",
    "brand": "Sheba",
    "category": "cat",
    "type": "Wet Food",
    "tagline": "A premium treat-like meal",
    "description": "Premium-style tuna fillets in a rich gravy. A special-occasion meal or a topper that makes dry food exciting again.",
    "highlights": [
      "Moist, tender meal cats find irresistible",
      "Helps increase daily water intake",
      "Soft texture, easy to eat",
      "Can be fed alone or mixed with dry food"
    ],
    "suitableFor": "Adult cats (1 year+)",
    "feeding": "Serve at room temperature. Follow the pack chart; wet food can replace part of the dry ration. Refrigerate leftovers in a covered container and use within 24 hours.",
    "image": "/products/sheba-adult-wet-cat-food-pouches-tuna-fillets-in-gravy.svg",
    "variants": [
      {
        "size": "Pack of 6 × 85 g",
        "price": 330,
        "mrp": 384
      },
      {
        "size": "Pack of 12 × 85 g",
        "price": 640,
        "mrp": 744
      }
    ]
  },
  {
    "slug": "hills-science-diet-adult-indoor-dry-cat-food-chicken",
    "name": "Adult Indoor Dry Cat Food – Chicken",
    "brand": "Hill's Science Diet",
    "category": "cat",
    "type": "Dry Food",
    "tagline": "Vet-recommended indoor nutrition",
    "description": "Supports healthy weight and digestion for indoor cats with natural fibre, antioxidants and vitamins.",
    "highlights": [
      "Complete & balanced daily nutrition for cats",
      "Supports healthy vision and heart (taurine)",
      "Crunchy kibble with a taste cats enjoy",
      "Supports shiny coat and healthy skin"
    ],
    "suitableFor": "Adult indoor cats (1–6 years)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/hills-science-diet-adult-indoor-dry-cat-food-chicken.svg",
    "variants": [
      {
        "size": "1.5 kg",
        "price": 1950,
        "mrp": 2150
      },
      {
        "size": "4 kg",
        "price": 4400,
        "mrp": 4800
      }
    ]
  },
  {
    "slug": "drools-adult-dry-cat-food-ocean-fish",
    "name": "Adult Dry Cat Food – Ocean Fish",
    "brand": "Drools",
    "category": "cat",
    "type": "Dry Food",
    "tagline": "Ocean-fish recipe at a great value",
    "description": "A complete, balanced everyday kibble with omega fatty acids to support a shiny coat and healthy skin.",
    "highlights": [
      "Complete & balanced daily nutrition for cats",
      "Supports healthy vision and heart (taurine)",
      "Crunchy kibble with a taste cats enjoy",
      "Supports shiny coat and healthy skin"
    ],
    "suitableFor": "Adult cats (1 year+)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/drools-adult-dry-cat-food-ocean-fish.svg",
    "variants": [
      {
        "size": "1.2 kg",
        "price": 330,
        "mrp": 399
      },
      {
        "size": "3 kg",
        "price": 755,
        "mrp": 899
      },
      {
        "size": "7 kg",
        "price": 1590,
        "mrp": 1899
      }
    ]
  },
  {
    "slug": "farmina-n-d-pumpkin-adult-cat-chicken-pomegranate",
    "name": "Pumpkin Adult Cat – Chicken & Pomegranate",
    "brand": "Farmina N&D",
    "category": "cat",
    "type": "Dry Food",
    "tagline": "Grain-free, low-glycaemic recipe",
    "description": "A grain-free, animal-protein-rich recipe with pumpkin and pomegranate to support digestion and natural defences.",
    "highlights": [
      "Complete & balanced daily nutrition for cats",
      "Supports healthy vision and heart (taurine)",
      "Crunchy kibble with a taste cats enjoy",
      "Supports shiny coat and healthy skin"
    ],
    "suitableFor": "Adult cats (1 year+)",
    "feeding": "Feeding amount depends on your cat's weight, age and activity. Follow the pack's feeding chart, split into 2–3 meals a day, and keep fresh water available. Change food gradually over 7 days.",
    "image": "/products/farmina-n-d-pumpkin-adult-cat-chicken-pomegranate.svg",
    "variants": [
      {
        "size": "300 g",
        "price": 560,
        "mrp": 620
      },
      {
        "size": "1.5 kg",
        "price": 2450,
        "mrp": 2650
      },
      {
        "size": "5 kg",
        "price": 6900,
        "mrp": 7400
      }
    ]
  },
  {
    "slug": "whiskas-temptations-crunchy-cat-treats-chicken",
    "name": "Temptations Crunchy Cat Treats – Chicken",
    "brand": "Whiskas",
    "category": "cat",
    "type": "Treats",
    "tagline": "Crunchy outside, soft inside",
    "description": "Pillow-shaped treats with a crunchy shell and a soft centre — a favourite reward for training and play.",
    "highlights": [
      "Tasty reward for training and bonding",
      "Soft or crunchy bites cats love",
      "Easy to portion",
      "Feed as a treat alongside a complete diet"
    ],
    "suitableFor": "Adult cats and kittens (3 months+)",
    "feeding": "Treats should be no more than about 10% of daily calories. Give 1–3 pieces a day depending on size, with fresh water available.",
    "image": "/products/whiskas-temptations-crunchy-cat-treats-chicken.svg",
    "variants": [
      {
        "size": "85 g",
        "price": 199,
        "mrp": 229
      },
      {
        "size": "3 × 85 g",
        "price": 549,
        "mrp": 640
      }
    ]
  }
]

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug)
export const startingPrice = (p) => Math.min(...p.variants.map((v) => v.price))
export const discountPct = (v) => (v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0)
export const findVariant = (p, size) => p?.variants.find((v) => v.size === size)
