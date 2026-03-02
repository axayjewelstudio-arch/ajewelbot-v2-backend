const CATEGORIES = {
  retail: {
    'Face Jewellery': {
      id: 'face',
      subcategories: {
        'Ear Jewellery': ['Hoops and Bali', 'Studs', 'Jhumkas', 'Chandbalis', 'Ear Cuffs'],
        'Nose Jewellery': ['Nose Pins', 'Nose Rings', 'Nath'],
        'Maang Tikka': ['Traditional', 'Contemporary'],
        'Forehead Jewellery': ['Matha Patti', 'Borla']
      }
    },
    'Hand and Wrist Jewellery': {
      id: 'hand',
      subcategories: {
        'Bangles': ['Traditional', 'Contemporary', 'Kada'],
        'Bracelets': ['Chain', 'Charm', 'Cuff'],
        'Rings': ['Engagement', 'Wedding', 'Fashion'],
        'Hand Harness': ['Traditional', 'Contemporary']
      }
    },
    'Neck and Collar Jewellery': {
      id: 'neck',
      subcategories: {
        'Necklaces': ['Choker', 'Princess', 'Matinee', 'Opera'],
        'Pendants': ['Solitaire', 'Locket', 'Statement'],
        'Chains': ['Gold', 'Silver', 'Platinum'],
        'Collar Necklaces': ['Traditional', 'Contemporary']
      }
    },
    'Bridal Collection': {
      id: 'bridal',
      subcategories: {
        'Bridal Sets': ['Complete Set', 'Half Set'],
        'Wedding Jewellery': ['Mangalsutra', 'Toe Rings', 'Waist Belt'],
        'Engagement': ['Rings', 'Sets']
      }
    },
    'Gifting and Sets': {
      id: 'gifting',
      subcategories: {
        'Gift Sets': ['For Her', 'For Him', 'Couple Sets'],
        'Occasion Based': ['Birthday', 'Anniversary', 'Festival']
      }
    }
  },
  b2b: {
    'Face Jewellery': {
      id: 'face_b2b',
      subcategories: {
        'Ear Jewellery Files': ['Hoops', 'Studs', 'Jhumkas'],
        'Nose Jewellery Files': ['Pins', 'Rings'],
        'Maang Tikka Files': ['Traditional', 'Modern']
      }
    },
    'Hand and Wrist Jewellery': {
      id: 'hand_b2b',
      subcategories: {
        'Bangles Files': ['Traditional', 'Contemporary'],
        'Rings Files': ['Engagement', 'Wedding', 'Fashion']
      }
    },
    'Neck and Collar Jewellery': {
      id: 'neck_b2b',
      subcategories: {
        'Necklace Files': ['Choker', 'Long'],
        'Pendant Files': ['Solitaire', 'Statement']
      }
    },
    'Bridal Collection': {
      id: 'bridal_b2b',
      subcategories: {
        'Bridal Set Files': ['Complete', 'Half Set']
      }
    },
    'Gifting and Sets': {
      id: 'gifting_b2b',
      subcategories: {
        'Gift Set Files': ['For Her', 'For Him']
      }
    }
  }
};

exports.getCategories = (customerType = 'Retail') => {
  return CATEGORIES[customerType.toLowerCase()] || CATEGORIES.retail;
};

exports.getSubcategories = (category, customerType = 'Retail') => {
  const categories = CATEGORIES[customerType.toLowerCase()] || CATEGORIES.retail;
  return categories[category]?.subcategories || {};
};

exports.getStyles = (category, subcategory, customerType = 'Retail') => {
  const categories = CATEGORIES[customerType.toLowerCase()] || CATEGORIES.retail;
  return categories[category]?.subcategories[subcategory] || [];
};

exports.mapShopifyCollection = (collectionTitle) => {
  const mapping = {
    'Face Jewellery': 'Face Jewellery',
    'Earrings': 'Face Jewellery',
    'Necklaces': 'Neck and Collar Jewellery',
    'Rings': 'Hand and Wrist Jewellery',
    'Bridal': 'Bridal Collection',
    'Gifts': 'Gifting and Sets'
  };
  
  return mapping[collectionTitle] || collectionTitle;
};
