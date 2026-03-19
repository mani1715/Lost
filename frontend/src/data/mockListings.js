export const mockListings = [
  {
    id: 1,
    title: "Cozy Studio Room in Downtown",
    type: "room",
    mode: "rent",
    price: 450,
    duration: "month",
    location: "Downtown, San Francisco",
    status: "available",
    description: "A comfortable studio room perfect for students or young professionals. Close to public transport and amenities. This cozy space features modern furnishings and all the essentials you need for comfortable living.",
    features: ["WiFi", "Furnished", "Shared Kitchen", "Parking"],
    bedrooms: 1,
    bathrooms: 1,
    size: 350,
    coordinates: { lat: 37.7749, lng: -122.4194 },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260066-6bc344607a44?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
      verified: true,
      responseTime: "2 hours",
      joinedDate: "2022-03"
    },
    reviews: [
      { id: 1, author: "Mike Chen", rating: 5, comment: "Great place, very clean and comfortable!", date: "2024-01-15" },
      { id: 2, author: "Emma Wilson", rating: 4, comment: "Good location, friendly owner.", date: "2024-01-10" }
    ],
    rating: 4.5,
    reviewCount: 12,
    availability: {
      availableFrom: "2024-02-01",
      minStay: "1 month",
      maxStay: "12 months"
    },
    verified: true,
    featured: true
  },
  {
    id: 2,
    title: "Spacious 3BR Family House",
    type: "house",
    mode: "rent",
    price: 2500,
    duration: "month",
    location: "Suburb Area, Austin",
    status: "rented",
    description: "Beautiful family home with large backyard, perfect for families. Modern kitchen and spacious living areas. Recently renovated with high-end finishes throughout.",
    features: ["WiFi", "Parking", "Garden", "Pet-Friendly", "Washer/Dryer"],
    bedrooms: 3,
    bathrooms: 2,
    size: 1800,
    coordinates: { lat: 30.2672, lng: -97.7431 },
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "David Martinez",
      avatar: "https://i.pravatar.cc/150?img=12",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021-08"
    },
    reviews: [
      { id: 1, author: "Linda Brown", rating: 5, comment: "Perfect for our family, great neighborhood!", date: "2024-01-20" },
      { id: 2, author: "Tom Harris", rating: 5, comment: "Excellent property, highly recommend.", date: "2024-01-12" },
      { id: 3, author: "Amy Lee", rating: 4, comment: "Nice house, good amenities.", date: "2023-12-28" }
    ],
    rating: 4.8,
    reviewCount: 24,
    availability: {
      availableFrom: "2024-03-01",
      minStay: "6 months",
      maxStay: "24 months"
    },
    verified: true,
    featured: true
  },
  {
    id: 3,
    title: "Mountain View Lodge",
    type: "lodge",
    mode: "rent",
    price: 150,
    duration: "night",
    location: "Mountain Resort, Colorado",
    status: "available",
    description: "Scenic lodge with breathtaking mountain views. Perfect for weekend getaways and outdoor enthusiasts. Enjoy hiking, skiing, and nature at its finest.",
    features: ["WiFi", "Fireplace", "Parking", "Kitchen", "Balcony"],
    bedrooms: 2,
    bathrooms: 1,
    size: 900,
    coordinates: { lat: 39.5501, lng: -105.7821 },
    images: [
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Jennifer Taylor",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: true,
      responseTime: "3 hours",
      joinedDate: "2020-11"
    },
    reviews: [
      { id: 1, author: "Robert King", rating: 5, comment: "Amazing views, very peaceful!", date: "2024-01-18" },
      { id: 2, author: "Susan White", rating: 5, comment: "Perfect mountain retreat.", date: "2024-01-05" }
    ],
    rating: 4.9,
    reviewCount: 18,
    availability: {
      availableFrom: "immediate",
      minStay: "2 nights",
      maxStay: "14 nights"
    },
    verified: true,
    featured: false
  },
  {
    id: 4,
    title: "Modern Bachelor Room",
    type: "room",
    mode: "rent",
    price: 80,
    duration: "week",
    location: "City Center, Seattle",
    status: "rented",
    description: "Contemporary room with all modern amenities. Ideal for short-term stays and business travelers. Walking distance to major tech companies and transit.",
    features: ["WiFi", "AC", "Desk", "Private Entrance"],
    bedrooms: 1,
    bathrooms: 1,
    size: 250,
    coordinates: { lat: 47.6062, lng: -122.3321 },
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?img=8",
      verified: false,
      responseTime: "6 hours",
      joinedDate: "2023-05"
    },
    reviews: [
      { id: 1, author: "Chris Brown", rating: 4, comment: "Good for short stays.", date: "2024-01-14" }
    ],
    rating: 4.2,
    reviewCount: 6,
    availability: {
      availableFrom: "immediate",
      minStay: "1 week",
      maxStay: "8 weeks"
    },
    verified: false,
    featured: false
  },
  {
    id: 5,
    title: "Beachfront Villa",
    type: "house",
    mode: "rent",
    price: 300,
    duration: "night",
    location: "Coastal Area, Miami",
    status: "available",
    description: "Luxury beachfront property with direct beach access. Perfect for vacation rentals and special occasions. Stunning ocean views from every room.",
    features: ["WiFi", "Pool", "Beach Access", "Parking", "BBQ Area"],
    bedrooms: 4,
    bathrooms: 3,
    size: 2500,
    coordinates: { lat: 25.7617, lng: -80.1918 },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Maria Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=9",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2021-02"
    },
    reviews: [
      { id: 1, author: "James Wilson", rating: 5, comment: "Absolutely stunning property!", date: "2024-01-22" },
      { id: 2, author: "Patricia Moore", rating: 5, comment: "Dream vacation home.", date: "2024-01-16" },
      { id: 3, author: "John Davis", rating: 4, comment: "Great location and amenities.", date: "2024-01-08" }
    ],
    rating: 4.7,
    reviewCount: 31,
    availability: {
      availableFrom: "immediate",
      minStay: "3 nights",
      maxStay: "30 nights"
    },
    verified: true,
    featured: true
  },
  {
    id: 6,
    title: "Rustic Cabin Lodge",
    type: "lodge",
    mode: "rent",
    price: 120,
    duration: "night",
    location: "Forest Area, Oregon",
    status: "available",
    description: "Charming wooden cabin surrounded by nature. Ideal for peaceful retreats and hiking adventures. Experience true wilderness living.",
    features: ["Fireplace", "Kitchen", "Parking", "Pet-Friendly"],
    bedrooms: 2,
    bathrooms: 1,
    size: 800,
    coordinates: { lat: 43.8041, lng: -120.5542 },
    images: [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Michael Brown",
      avatar: "https://i.pravatar.cc/150?img=13",
      verified: true,
      responseTime: "4 hours",
      joinedDate: "2022-06"
    },
    reviews: [
      { id: 1, author: "Karen Smith", rating: 5, comment: "So peaceful and relaxing!", date: "2024-01-19" },
      { id: 2, author: "Brian Jones", rating: 4, comment: "Great escape from the city.", date: "2024-01-11" }
    ],
    rating: 4.6,
    reviewCount: 15,
    availability: {
      availableFrom: "2024-02-15",
      minStay: "2 nights",
      maxStay: "14 nights"
    },
    verified: true,
    featured: false
  },
  {
    id: 7,
    title: "Luxury Penthouse Room",
    type: "room",
    mode: "rent",
    price: 1200,
    duration: "month",
    location: "Manhattan, New York",
    status: "available",
    description: "Premium room in exclusive penthouse. Stunning city views and access to building amenities. Live in luxury in the heart of Manhattan.",
    features: ["WiFi", "Gym Access", "Concierge", "Rooftop Access"],
    bedrooms: 1,
    bathrooms: 1,
    size: 500,
    coordinates: { lat: 40.7831, lng: -73.9712 },
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Victoria Chang",
      avatar: "https://i.pravatar.cc/150?img=10",
      verified: true,
      responseTime: "30 minutes",
      joinedDate: "2020-09"
    },
    reviews: [
      { id: 1, author: "Daniel Park", rating: 5, comment: "Incredible views and amenities!", date: "2024-01-21" },
      { id: 2, author: "Rachel Green", rating: 5, comment: "Worth every penny.", date: "2024-01-13" }
    ],
    rating: 4.9,
    reviewCount: 28,
    availability: {
      availableFrom: "2024-04-01",
      minStay: "3 months",
      maxStay: "12 months"
    },
    verified: true,
    featured: true
  },
  {
    id: 8,
    title: "Suburban Family Home",
    type: "house",
    mode: "rent",
    price: 1800,
    duration: "month",
    location: "Suburban, Portland",
    status: "rented",
    description: "Comfortable family house in quiet neighborhood. Great schools nearby and family-friendly environment. Perfect for long-term family living.",
    features: ["WiFi", "Parking", "Garden", "Washer/Dryer", "Storage"],
    bedrooms: 3,
    bathrooms: 2,
    size: 1600,
    coordinates: { lat: 45.5152, lng: -122.6784 },
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Thomas Anderson",
      avatar: "https://i.pravatar.cc/150?img=14",
      verified: true,
      responseTime: "2 hours",
      joinedDate: "2021-12"
    },
    reviews: [
      { id: 1, author: "Nancy Miller", rating: 4, comment: "Nice family home.", date: "2024-01-17" },
      { id: 2, author: "George Taylor", rating: 5, comment: "Perfect for our needs.", date: "2024-01-09" }
    ],
    rating: 4.5,
    reviewCount: 19,
    availability: {
      availableFrom: "2024-03-15",
      minStay: "12 months",
      maxStay: "36 months"
    },
    verified: true,
    featured: false
  },
  {
    id: 9,
    title: "Lake View Lodge",
    type: "lodge",
    mode: "rent",
    price: 180,
    duration: "night",
    location: "Lakeside, Minnesota",
    status: "available",
    description: "Peaceful lodge overlooking serene lake. Perfect for fishing, boating, and relaxation. Escape to tranquility.",
    features: ["WiFi", "Dock Access", "Fireplace", "Kitchen", "Parking"],
    bedrooms: 3,
    bathrooms: 2,
    size: 1200,
    coordinates: { lat: 46.7296, lng: -94.6859 },
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Elizabeth Moore",
      avatar: "https://i.pravatar.cc/150?img=20",
      verified: true,
      responseTime: "3 hours",
      joinedDate: "2022-01"
    },
    reviews: [
      { id: 1, author: "William Johnson", rating: 5, comment: "Beautiful lake views!", date: "2024-01-20" },
      { id: 2, author: "Barbara Wilson", rating: 4, comment: "Very relaxing stay.", date: "2024-01-12" }
    ],
    rating: 4.7,
    reviewCount: 22,
    availability: {
      availableFrom: "immediate",
      minStay: "2 nights",
      maxStay: "21 nights"
    },
    verified: true,
    featured: false
  },
  {
    id: 10,
    title: "Student-Friendly Room",
    type: "room",
    mode: "rent",
    price: 350,
    duration: "month",
    location: "University District, Boston",
    status: "available",
    description: "Affordable room near campus. Perfect for students with study area and quiet environment. Close to university and public transport.",
    features: ["WiFi", "Desk", "Shared Kitchen", "Laundry"],
    bedrooms: 1,
    bathrooms: 1,
    size: 300,
    coordinates: { lat: 42.3601, lng: -71.0589 },
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260066-6bc344607a44?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Richard Davis",
      avatar: "https://i.pravatar.cc/150?img=15",
      verified: false,
      responseTime: "5 hours",
      joinedDate: "2023-09"
    },
    reviews: [
      { id: 1, author: "Sarah Thompson", rating: 4, comment: "Good for students.", date: "2024-01-15" }
    ],
    rating: 4.0,
    reviewCount: 8,
    availability: {
      availableFrom: "2024-02-01",
      minStay: "3 months",
      maxStay: "12 months"
    },
    verified: false,
    featured: false
  },
  {
    id: 11,
    title: "Downtown Loft House",
    type: "house",
    mode: "rent",
    price: 3200,
    duration: "month",
    location: "Downtown, Chicago",
    status: "available",
    description: "Modern loft-style house with high ceilings and contemporary design. Walking distance to entertainment, dining, and nightlife.",
    features: ["WiFi", "Parking", "Gym", "Rooftop", "Smart Home"],
    bedrooms: 2,
    bathrooms: 2,
    size: 1400,
    coordinates: { lat: 41.8781, lng: -87.6298 },
    images: [
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Jessica Lee",
      avatar: "https://i.pravatar.cc/150?img=16",
      verified: true,
      responseTime: "1 hour",
      joinedDate: "2020-07"
    },
    reviews: [
      { id: 1, author: "Mark Wilson", rating: 5, comment: "Amazing loft in perfect location!", date: "2024-01-23" },
      { id: 2, author: "Laura Martinez", rating: 5, comment: "Love the modern design.", date: "2024-01-14" }
    ],
    rating: 4.8,
    reviewCount: 35,
    availability: {
      availableFrom: "2024-05-01",
      minStay: "6 months",
      maxStay: "24 months"
    },
    verified: true,
    featured: true
  },
  {
    id: 12,
    title: "Ski Resort Lodge",
    type: "lodge",
    mode: "rent",
    price: 250,
    duration: "night",
    location: "Ski Resort, Vermont",
    status: "rented",
    description: "Cozy lodge at ski resort. Ski-in/ski-out access and perfect for winter sports enthusiasts. Après-ski paradise.",
    features: ["WiFi", "Fireplace", "Hot Tub", "Ski Storage", "Parking"],
    bedrooms: 3,
    bathrooms: 2,
    size: 1500,
    coordinates: { lat: 44.2601, lng: -72.5754 },
    images: [
      "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Christopher White",
      avatar: "https://i.pravatar.cc/150?img=17",
      verified: true,
      responseTime: "2 hours",
      joinedDate: "2021-11"
    },
    reviews: [
      { id: 1, author: "Melissa Clark", rating: 5, comment: "Perfect ski getaway!", date: "2024-01-24" },
      { id: 2, author: "Kevin Brown", rating: 5, comment: "Great location and amenities.", date: "2024-01-18" },
      { id: 3, author: "Jennifer Garcia", rating: 4, comment: "Cozy and comfortable.", date: "2024-01-10" }
    ],
    rating: 4.8,
    reviewCount: 27,
    availability: {
      availableFrom: "immediate",
      minStay: "3 nights",
      maxStay: "14 nights"
    },
    verified: true,
    featured: false
  },
  {
    id: 13,
    title: "Artist's Loft Room",
    type: "room",
    mode: "rent",
    price: 650,
    duration: "month",
    location: "Arts District, Los Angeles",
    status: "available",
    description: "Creative space in vibrant arts district. High ceilings, natural light, perfect for artists and creatives. Inspiring environment.",
    features: ["WiFi", "Natural Light", "High Ceilings", "Workspace"],
    bedrooms: 1,
    bathrooms: 1,
    size: 450,
    coordinates: { lat: 34.0522, lng: -118.2437 },
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Amanda Foster",
      avatar: "https://i.pravatar.cc/150?img=21",
      verified: true,
      responseTime: "4 hours",
      joinedDate: "2022-04"
    },
    reviews: [
      { id: 1, author: "Carlos Rodriguez", rating: 5, comment: "Perfect creative space!", date: "2024-01-22" },
      { id: 2, author: "Emily Chen", rating: 4, comment: "Love the natural light.", date: "2024-01-16" }
    ],
    rating: 4.6,
    reviewCount: 14,
    availability: {
      availableFrom: "2024-03-01",
      minStay: "1 month",
      maxStay: "12 months"
    },
    verified: true,
    featured: false
  },
  {
    id: 14,
    title: "Garden View Cottage",
    type: "house",
    mode: "rent",
    price: 2200,
    duration: "month",
    location: "Suburbs, Nashville",
    status: "available",
    description: "Charming cottage with beautiful garden. Peaceful setting while being close to city amenities. Perfect blend of nature and convenience.",
    features: ["WiFi", "Garden", "Parking", "Patio", "Pet-Friendly"],
    bedrooms: 2,
    bathrooms: 2,
    size: 1300,
    coordinates: { lat: 36.1627, lng: -86.7816 },
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1592595896616-c37162298647?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Patricia Thompson",
      avatar: "https://i.pravatar.cc/150?img=22",
      verified: true,
      responseTime: "3 hours",
      joinedDate: "2021-05"
    },
    reviews: [
      { id: 1, author: "Steven Anderson", rating: 5, comment: "Beautiful garden and peaceful!", date: "2024-01-25" },
      { id: 2, author: "Michelle Davis", rating: 4, comment: "Lovely cottage.", date: "2024-01-19" }
    ],
    rating: 4.7,
    reviewCount: 16,
    availability: {
      availableFrom: "2024-04-01",
      minStay: "6 months",
      maxStay: "24 months"
    },
    verified: true,
    featured: false
  },
  {
    id: 15,
    title: "Riverside Retreat Lodge",
    type: "lodge",
    mode: "rent",
    price: 200,
    duration: "night",
    location: "Riverside, Montana",
    status: "available",
    description: "Secluded riverside lodge perfect for nature lovers. Enjoy fishing, kayaking, and wildlife watching. Ultimate peaceful escape.",
    features: ["WiFi", "Fireplace", "Deck", "Kitchen", "Fishing Access"],
    bedrooms: 2,
    bathrooms: 1,
    size: 1000,
    coordinates: { lat: 46.8797, lng: -110.3626 },
    images: [
      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop"
    ],
    owner: {
      name: "Robert Nelson",
      avatar: "https://i.pravatar.cc/150?img=18",
      verified: true,
      responseTime: "5 hours",
      joinedDate: "2022-08"
    },
    reviews: [
      { id: 1, author: "Dorothy Martinez", rating: 5, comment: "So peaceful and scenic!", date: "2024-01-26" },
      { id: 2, author: "Andrew Wilson", rating: 5, comment: "Perfect for fishing trip.", date: "2024-01-20" }
    ],
    rating: 4.9,
    reviewCount: 20,
    availability: {
      availableFrom: "immediate",
      minStay: "2 nights",
      maxStay: "14 nights"
    },
    verified: true,
    featured: false
  }
];
