/**
 * Seed Data for Revision City
 * Contains the structure for all 11 IGCSE subjects
 * Run the generate-content.ts script to populate with AI content
 */

export const SUBJECTS_DATA = {
  mathematics: {
    name: 'Mathematics',
    description: 'Numbers, algebra, geometry, statistics and more.',
    icon: '📐',
    color: 'from-blue-500 to-indigo-600',
    topics: [
      {
        name: 'Number',
        description: 'Integers, fractions, decimals, percentages',
        subtopics: ['Types of Numbers', 'Fractions and Decimals', 'Percentages', 'Ratio and Proportion', 'Standard Form', 'Bounds and Approximation'],
      },
      {
        name: 'Algebra',
        description: 'Expressions, equations, inequalities, sequences',
        subtopics: ['Algebraic Expressions', 'Linear Equations', 'Simultaneous Equations', 'Quadratic Equations', 'Inequalities', 'Sequences and Patterns'],
      },
      {
        name: 'Geometry',
        description: 'Shapes, angles, transformations, vectors',
        subtopics: ['Angles and Lines', 'Triangles', 'Quadrilaterals and Polygons', 'Circles', 'Transformations', 'Vectors'],
      },
      {
        name: 'Mensuration',
        description: 'Perimeter, area, volume, surface area',
        subtopics: ['Perimeter and Area', 'Volume', 'Surface Area', 'Arc Length and Sector Area', 'Compound Shapes'],
      },
      {
        name: 'Trigonometry',
        description: 'Sine, cosine, tangent, applications',
        subtopics: ['Right-Angled Triangles', 'Sine Rule', 'Cosine Rule', 'Area of Triangle', 'Bearings', '3D Trigonometry'],
      },
      {
        name: 'Statistics',
        description: 'Data handling, averages, probability',
        subtopics: ['Collecting Data', 'Averages and Range', 'Representing Data', 'Scatter Graphs', 'Cumulative Frequency'],
      },
      {
        name: 'Probability',
        description: 'Chance, tree diagrams, combined events',
        subtopics: ['Basic Probability', 'Combined Events', 'Tree Diagrams', 'Conditional Probability', 'Venn Diagrams'],
      },
    ],
  },

  english: {
    name: 'English',
    description: 'Language, literature, writing and comprehension skills.',
    icon: '📚',
    color: 'from-amber-500 to-orange-600',
    topics: [
      {
        name: 'Reading Comprehension',
        description: 'Understanding and analyzing texts',
        subtopics: ['Explicit Information', 'Implicit Meaning', 'Writer\'s Purpose', 'Language Analysis', 'Comparing Texts'],
      },
      {
        name: 'Writing Skills',
        description: 'Narrative, descriptive, argumentative writing',
        subtopics: ['Narrative Writing', 'Descriptive Writing', 'Argumentative Writing', 'Persuasive Writing', 'Report Writing', 'Letter Writing'],
      },
      {
        name: 'Grammar',
        description: 'Sentence structure, punctuation, vocabulary',
        subtopics: ['Sentence Types', 'Punctuation', 'Tenses', 'Active and Passive Voice', 'Direct and Indirect Speech'],
      },
      {
        name: 'Literary Techniques',
        description: 'Figurative language, narrative techniques',
        subtopics: ['Metaphor and Simile', 'Personification', 'Imagery', 'Tone and Mood', 'Irony', 'Symbolism'],
      },
    ],
  },

  biology: {
    name: 'Biology',
    description: 'The study of living organisms and life processes.',
    icon: '🧬',
    color: 'from-green-500 to-emerald-600',
    topics: [
      {
        name: 'Cells',
        description: 'Cell structure, division, and organisation',
        subtopics: ['Cell Structure', 'Cell Membrane', 'Mitosis', 'Meiosis', 'Levels of Organisation', 'Stem Cells'],
      },
      {
        name: 'Biological Molecules',
        description: 'Carbohydrates, proteins, lipids, enzymes',
        subtopics: ['Carbohydrates', 'Proteins', 'Lipids', 'Enzymes', 'DNA Structure'],
      },
      {
        name: 'Human Nutrition',
        description: 'Diet, digestion, absorption',
        subtopics: ['Balanced Diet', 'Digestive System', 'Enzymes in Digestion', 'Absorption', 'Deficiency Diseases'],
      },
      {
        name: 'Plant Nutrition',
        description: 'Photosynthesis and mineral requirements',
        subtopics: ['Photosynthesis', 'Leaf Structure', 'Limiting Factors', 'Mineral Requirements'],
      },
      {
        name: 'Transport',
        description: 'Circulatory system, plant transport',
        subtopics: ['Blood and Blood Vessels', 'The Heart', 'Circulation', 'Xylem and Phloem', 'Transpiration'],
      },
      {
        name: 'Respiration',
        description: 'Aerobic and anaerobic respiration',
        subtopics: ['Aerobic Respiration', 'Anaerobic Respiration', 'Gas Exchange', 'Respiratory System'],
      },
      {
        name: 'Coordination',
        description: 'Nervous system, hormones',
        subtopics: ['Nervous System', 'Reflex Actions', 'The Eye', 'Hormones', 'Homeostasis'],
      },
      {
        name: 'Reproduction',
        description: 'Human and plant reproduction',
        subtopics: ['Male Reproductive System', 'Female Reproductive System', 'Menstrual Cycle', 'Fertilisation', 'Plant Reproduction'],
      },
      {
        name: 'Inheritance',
        description: 'Genetics, variation, natural selection',
        subtopics: ['Chromosomes and Genes', 'Monohybrid Inheritance', 'Codominance', 'Sex Determination', 'Mutations'],
      },
      {
        name: 'Ecology',
        description: 'Ecosystems, food chains, human impact',
        subtopics: ['Ecosystems', 'Food Chains and Webs', 'Energy Flow', 'Carbon Cycle', 'Nitrogen Cycle', 'Human Impact'],
      },
    ],
  },

  chemistry: {
    name: 'Chemistry',
    description: 'Elements, compounds, reactions and matter.',
    icon: '⚗️',
    color: 'from-purple-500 to-violet-600',
    topics: [
      {
        name: 'Atomic Structure',
        description: 'Atoms, elements, periodic table',
        subtopics: ['Atomic Structure', 'Electron Configuration', 'Isotopes', 'Periodic Table', 'Groups and Periods'],
      },
      {
        name: 'Bonding',
        description: 'Ionic, covalent, metallic bonding',
        subtopics: ['Ionic Bonding', 'Covalent Bonding', 'Metallic Bonding', 'Properties of Structures', 'Giant Structures'],
      },
      {
        name: 'Stoichiometry',
        description: 'Moles, equations, calculations',
        subtopics: ['Relative Masses', 'The Mole', 'Chemical Equations', 'Reacting Masses', 'Concentration', 'Gas Volumes'],
      },
      {
        name: 'Electrochemistry',
        description: 'Electrolysis, cells, reactivity',
        subtopics: ['Electrolysis', 'Products of Electrolysis', 'Electroplating', 'Cells and Batteries'],
      },
      {
        name: 'Energy Changes',
        description: 'Exothermic and endothermic reactions',
        subtopics: ['Exothermic Reactions', 'Endothermic Reactions', 'Energy Level Diagrams', 'Bond Energies'],
      },
      {
        name: 'Rates of Reaction',
        description: 'Factors affecting rate, catalysts',
        subtopics: ['Measuring Rate', 'Collision Theory', 'Effect of Concentration', 'Effect of Temperature', 'Catalysts'],
      },
      {
        name: 'Acids and Bases',
        description: 'pH, neutralisation, salts',
        subtopics: ['Acids and Alkalis', 'pH Scale', 'Neutralisation', 'Making Salts', 'Titrations'],
      },
      {
        name: 'Organic Chemistry',
        description: 'Hydrocarbons, polymers, alcohols',
        subtopics: ['Alkanes', 'Alkenes', 'Alcohols', 'Carboxylic Acids', 'Polymers', 'Fuels'],
      },
    ],
  },

  physics: {
    name: 'Physics',
    description: 'Forces, energy, waves, electricity and magnetism.',
    icon: '⚛️',
    color: 'from-cyan-500 to-blue-600',
    topics: [
      {
        name: 'Motion',
        description: 'Speed, velocity, acceleration',
        subtopics: ['Distance and Displacement', 'Speed and Velocity', 'Acceleration', 'Distance-Time Graphs', 'Velocity-Time Graphs', 'Equations of Motion'],
      },
      {
        name: 'Forces',
        description: 'Newton\'s laws, friction, pressure',
        subtopics: ['Types of Forces', 'Newton\'s Laws', 'Friction', 'Moments', 'Pressure', 'Pressure in Fluids'],
      },
      {
        name: 'Energy',
        description: 'Energy transfers, work, power',
        subtopics: ['Forms of Energy', 'Energy Transfers', 'Work Done', 'Power', 'Efficiency', 'Energy Resources'],
      },
      {
        name: 'Thermal Physics',
        description: 'Heat, temperature, thermal properties',
        subtopics: ['Temperature', 'Thermal Expansion', 'Specific Heat Capacity', 'Latent Heat', 'Heat Transfer'],
      },
      {
        name: 'Waves',
        description: 'Sound, light, electromagnetic spectrum',
        subtopics: ['Wave Properties', 'Reflection', 'Refraction', 'Total Internal Reflection', 'Sound Waves', 'Electromagnetic Spectrum'],
      },
      {
        name: 'Electricity',
        description: 'Circuits, resistance, power',
        subtopics: ['Current and Charge', 'Voltage', 'Resistance', 'Series and Parallel Circuits', 'Electrical Power', 'Domestic Electricity'],
      },
      {
        name: 'Magnetism',
        description: 'Magnetic fields, electromagnets',
        subtopics: ['Magnets and Fields', 'Electromagnets', 'The Motor Effect', 'Electric Motors', 'Electromagnetic Induction', 'Transformers'],
      },
      {
        name: 'Radioactivity',
        description: 'Nuclear physics, radiation',
        subtopics: ['Atomic Structure', 'Radioactive Decay', 'Alpha, Beta, Gamma', 'Half-Life', 'Uses of Radiation', 'Nuclear Fission'],
      },
    ],
  },

  french: {
    name: 'French',
    description: 'French language skills: reading, writing, listening and speaking.',
    icon: '🇫🇷',
    color: 'from-rose-500 to-pink-600',
    topics: [
      {
        name: 'Personal Information',
        description: 'Describing yourself, family, friends',
        subtopics: ['Introducing Yourself', 'Family Members', 'Physical Descriptions', 'Personality', 'Relationships'],
      },
      {
        name: 'Daily Life',
        description: 'Routine, home, local area',
        subtopics: ['Daily Routine', 'House and Home', 'Local Area', 'Helping at Home', 'Directions'],
      },
      {
        name: 'School',
        description: 'Education, subjects, school life',
        subtopics: ['School Subjects', 'School Routine', 'Describing School', 'Future Plans', 'School Rules'],
      },
      {
        name: 'Free Time',
        description: 'Hobbies, sports, entertainment',
        subtopics: ['Hobbies', 'Sports', 'Music and Film', 'Reading', 'Technology'],
      },
      {
        name: 'Travel',
        description: 'Holidays, transport, accommodation',
        subtopics: ['Holiday Destinations', 'Transport', 'Accommodation', 'Weather', 'Problems on Holiday'],
      },
      {
        name: 'Grammar',
        description: 'Tenses, agreements, structures',
        subtopics: ['Present Tense', 'Perfect Tense', 'Imperfect Tense', 'Future Tense', 'Negatives', 'Adjectives'],
      },
    ],
  },

  spanish: {
    name: 'Spanish',
    description: 'Spanish language skills: reading, writing, listening and speaking.',
    icon: '🇪🇸',
    color: 'from-red-500 to-orange-600',
    topics: [
      {
        name: 'Personal Information',
        description: 'Describing yourself, family, friends',
        subtopics: ['Introducing Yourself', 'Family Members', 'Physical Descriptions', 'Personality', 'Relationships'],
      },
      {
        name: 'Daily Life',
        description: 'Routine, home, local area',
        subtopics: ['Daily Routine', 'House and Home', 'Local Area', 'Helping at Home', 'Directions'],
      },
      {
        name: 'School',
        description: 'Education, subjects, school life',
        subtopics: ['School Subjects', 'School Routine', 'Describing School', 'Future Plans', 'School Rules'],
      },
      {
        name: 'Free Time',
        description: 'Hobbies, sports, entertainment',
        subtopics: ['Hobbies', 'Sports', 'Music and Film', 'Reading', 'Technology'],
      },
      {
        name: 'Travel',
        description: 'Holidays, transport, accommodation',
        subtopics: ['Holiday Destinations', 'Transport', 'Accommodation', 'Weather', 'Problems on Holiday'],
      },
      {
        name: 'Grammar',
        description: 'Tenses, agreements, structures',
        subtopics: ['Present Tense', 'Preterite Tense', 'Imperfect Tense', 'Future Tense', 'Negatives', 'Adjectives'],
      },
    ],
  },

  business: {
    name: 'Business',
    description: 'Business concepts, management and enterprise.',
    icon: '💼',
    color: 'from-slate-500 to-gray-600',
    topics: [
      {
        name: 'Business Activity',
        description: 'Purpose of business, stakeholders',
        subtopics: ['Purpose of Business', 'Business Stakeholders', 'Business Sectors', 'Business Objectives'],
      },
      {
        name: 'People in Business',
        description: 'Motivation, leadership, organisation',
        subtopics: ['Motivation', 'Leadership Styles', 'Organisation Structure', 'Recruitment', 'Training'],
      },
      {
        name: 'Marketing',
        description: 'Market research, marketing mix',
        subtopics: ['Market Research', 'Marketing Mix', 'Product', 'Price', 'Place', 'Promotion'],
      },
      {
        name: 'Operations',
        description: 'Production, quality, location',
        subtopics: ['Production Methods', 'Quality Management', 'Location Decisions', 'Inventory Management'],
      },
      {
        name: 'Finance',
        description: 'Costs, revenue, financial statements',
        subtopics: ['Costs and Revenue', 'Break-Even Analysis', 'Cash Flow', 'Financial Statements', 'Sources of Finance'],
      },
      {
        name: 'External Environment',
        description: 'Government, economy, ethics',
        subtopics: ['Government Influence', 'Economic Environment', 'Business Ethics', 'Environmental Concerns'],
      },
    ],
  },

  economics: {
    name: 'Economics',
    description: 'Micro and macroeconomics, markets and government policy.',
    icon: '📈',
    color: 'from-teal-500 to-cyan-600',
    topics: [
      {
        name: 'Basic Economic Problem',
        description: 'Scarcity, choice, opportunity cost',
        subtopics: ['Scarcity', 'Choice and Opportunity Cost', 'Economic Systems', 'Production Possibility Curves'],
      },
      {
        name: 'Price System',
        description: 'Demand, supply, price determination',
        subtopics: ['Demand', 'Supply', 'Price Determination', 'Price Elasticity', 'Market Changes'],
      },
      {
        name: 'Government Intervention',
        description: 'Price controls, taxes, subsidies',
        subtopics: ['Maximum Prices', 'Minimum Prices', 'Indirect Taxes', 'Subsidies', 'Market Failure'],
      },
      {
        name: 'International Trade',
        description: 'Trade, exchange rates, globalisation',
        subtopics: ['Benefits of Trade', 'Protection', 'Exchange Rates', 'Balance of Payments', 'Globalisation'],
      },
      {
        name: 'Macroeconomics',
        description: 'Inflation, unemployment, growth',
        subtopics: ['Economic Growth', 'Inflation', 'Unemployment', 'Government Policies', 'Fiscal Policy', 'Monetary Policy'],
      },
    ],
  },

  history: {
    name: 'History',
    description: '20th century world history and historical skills.',
    icon: '🏛️',
    color: 'from-yellow-500 to-amber-600',
    topics: [
      {
        name: 'World War One',
        description: 'Causes, events, consequences',
        subtopics: ['Causes of WW1', 'The Western Front', 'Key Battles', 'End of the War', 'Treaty of Versailles'],
      },
      {
        name: 'Rise of Dictators',
        description: 'Hitler, Mussolini, Stalin',
        subtopics: ['Rise of Hitler', 'Nazi Germany', 'Rise of Mussolini', 'Fascist Italy', 'Stalin\'s USSR'],
      },
      {
        name: 'World War Two',
        description: 'Causes, events, consequences',
        subtopics: ['Causes of WW2', 'Key Events', 'The Holocaust', 'End of the War', 'Consequences'],
      },
      {
        name: 'Cold War',
        description: 'Origins, events, end of Cold War',
        subtopics: ['Origins', 'Berlin and Germany', 'Cuban Missile Crisis', 'Vietnam War', 'End of Cold War'],
      },
      {
        name: 'Source Skills',
        description: 'Analyzing and evaluating sources',
        subtopics: ['Using Sources', 'Reliability', 'Utility', 'Cross-Referencing', 'Interpretations'],
      },
    ],
  },

  geography: {
    name: 'Geography',
    description: 'Physical and human geography, environmental management.',
    icon: '🌍',
    color: 'from-lime-500 to-green-600',
    topics: [
      {
        name: 'Rivers',
        description: 'River processes, landforms, flooding',
        subtopics: ['Drainage Basins', 'River Processes', 'Upper Course Features', 'Middle/Lower Course', 'Flooding', 'River Management'],
      },
      {
        name: 'Coasts',
        description: 'Coastal processes, landforms, management',
        subtopics: ['Waves', 'Coastal Erosion', 'Erosion Landforms', 'Deposition Landforms', 'Coastal Management'],
      },
      {
        name: 'Weather and Climate',
        description: 'Weather systems, climate change',
        subtopics: ['Weather and Climate', 'Weather Instruments', 'Tropical Storms', 'Climate Change', 'Microclimates'],
      },
      {
        name: 'Population',
        description: 'Population change, migration',
        subtopics: ['Population Distribution', 'Population Change', 'Demographic Transition', 'Migration', 'Population Policies'],
      },
      {
        name: 'Settlement',
        description: 'Urban areas, urbanisation',
        subtopics: ['Settlement Patterns', 'Urban Land Use', 'Urbanisation', 'Urban Problems', 'Urban Planning'],
      },
      {
        name: 'Economic Activity',
        description: 'Industry, development, globalisation',
        subtopics: ['Economic Sectors', 'Farming', 'Industry', 'Tourism', 'Development Indicators', 'Globalisation'],
      },
    ],
  },
};

export type SubjectKey = keyof typeof SUBJECTS_DATA;
