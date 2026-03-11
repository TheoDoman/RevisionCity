-- ============================================================
-- Edexcel IGCSE Structure Migration
-- Run this against your Supabase database
-- ============================================================

-- Step 1: Add exam_board column to subjects table
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS exam_board TEXT DEFAULT 'cambridge';

-- Step 2: Backfill existing subjects as Cambridge
UPDATE subjects SET exam_board = 'cambridge' WHERE exam_board IS NULL OR exam_board = '';

-- ============================================================
-- Step 3: Insert Edexcel IGCSE Subjects
-- ============================================================

INSERT INTO subjects (id, name, slug, description, icon, color, topic_count, exam_board)
VALUES
  (gen_random_uuid(), 'Mathematics A', 'mathematics', 'Number, algebra, geometry, statistics and probability — aligned to Edexcel IGCSE 4MA1.', '📐', 'from-blue-500 to-indigo-600', 5, 'edexcel'),
  (gen_random_uuid(), 'Biology', 'biology', 'Living organisms, cell biology, genetics, ecology and use of biological resources.', '🧬', 'from-green-500 to-emerald-600', 5, 'edexcel'),
  (gen_random_uuid(), 'Chemistry', 'chemistry', 'Principles of chemistry, organic chemistry, physical chemistry and industrial processes.', '⚗️', 'from-purple-500 to-violet-600', 5, 'edexcel'),
  (gen_random_uuid(), 'Physics', 'physics', 'Forces, electricity, waves, energy, radioactivity and astrophysics — Edexcel IGCSE 4PH1.', '⚛️', 'from-cyan-500 to-blue-600', 8, 'edexcel')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Step 4: Insert Topics + Subtopics for each subject
-- We use CTEs to capture the inserted IDs
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- MATHEMATICS A
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_subject_id UUID;
  v_topic_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE slug = 'mathematics' AND exam_board = 'edexcel' LIMIT 1;

  -- Topic 1: Number
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Number', 'number', 'Integers, fractions, decimals, percentages, surds, standard form, indices and bounds.', 1, 8)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Integers and Place Value', 'integers-and-place-value', 'Understand and use integers, ordering numbers and place value.', 1, ARRAY['Order positive and negative integers', 'Use place value to multiply and divide']),
    (gen_random_uuid(), v_topic_id, 'Fractions and Decimals', 'fractions-and-decimals', 'Work with fractions, recurring decimals and converting between forms.', 2, ARRAY['Add, subtract, multiply and divide fractions', 'Convert between fractions and decimals']),
    (gen_random_uuid(), v_topic_id, 'Percentages', 'percentages', 'Percentage calculations including percentage change, reverse percentages and compound interest.', 3, ARRAY['Calculate percentage of a quantity', 'Find percentage change', 'Apply compound interest formula']),
    (gen_random_uuid(), v_topic_id, 'Powers, Roots and Surds', 'powers-roots-surds', 'Index laws, square roots, cube roots, and simplifying surds.', 4, ARRAY['Apply index laws', 'Simplify surds', 'Calculate nth roots']),
    (gen_random_uuid(), v_topic_id, 'Standard Form', 'standard-form', 'Writing numbers in standard form and performing calculations.', 5, ARRAY['Write numbers in standard form', 'Add, subtract, multiply and divide in standard form']),
    (gen_random_uuid(), v_topic_id, 'Ratio and Proportion', 'ratio-and-proportion', 'Ratio, direct and inverse proportion, and proportional reasoning.', 6, ARRAY['Simplify ratios', 'Solve direct and inverse proportion problems']),
    (gen_random_uuid(), v_topic_id, 'Bounds and Estimation', 'bounds-and-estimation', 'Upper and lower bounds, error intervals, and estimation strategies.', 7, ARRAY['Find upper and lower bounds', 'Use bounds in calculations', 'Estimate answers']),
    (gen_random_uuid(), v_topic_id, 'Number Problems and Applications', 'number-problems', 'Real-world number problems, financial mathematics and problem-solving.', 8, ARRAY['Solve financial problems', 'Apply number skills to real contexts']);

  -- Topic 2: Algebra
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Algebra', 'algebra', 'Expressions, equations, inequalities, sequences and functions.', 2, 8)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Algebraic Expressions', 'algebraic-expressions', 'Simplifying, expanding and factorising expressions.', 1, ARRAY['Simplify algebraic expressions', 'Expand brackets', 'Factorise expressions']),
    (gen_random_uuid(), v_topic_id, 'Linear Equations and Inequalities', 'linear-equations', 'Solving linear equations and inequalities in one and two variables.', 2, ARRAY['Solve linear equations', 'Solve linear inequalities', 'Represent inequalities on a number line']),
    (gen_random_uuid(), v_topic_id, 'Quadratic Equations', 'quadratic-equations', 'Factorising, completing the square and using the quadratic formula.', 3, ARRAY['Factorise quadratics', 'Complete the square', 'Use the quadratic formula']),
    (gen_random_uuid(), v_topic_id, 'Simultaneous Equations', 'simultaneous-equations', 'Solving systems of linear and one quadratic equation simultaneously.', 4, ARRAY['Solve simultaneous linear equations', 'Solve simultaneous equations graphically']),
    (gen_random_uuid(), v_topic_id, 'Sequences', 'sequences', 'Arithmetic and geometric sequences, nth term formulae.', 5, ARRAY['Find the nth term of arithmetic sequences', 'Identify geometric sequences', 'Sum of arithmetic sequences']),
    (gen_random_uuid(), v_topic_id, 'Functions and Graphs', 'functions-and-graphs', 'Plotting and interpreting linear, quadratic, cubic and reciprocal graphs.', 6, ARRAY['Plot and interpret linear graphs', 'Sketch quadratic and cubic graphs', 'Find intersections graphically']),
    (gen_random_uuid(), v_topic_id, 'Algebraic Fractions', 'algebraic-fractions', 'Simplifying, adding, subtracting, multiplying and dividing algebraic fractions.', 7, ARRAY['Simplify algebraic fractions', 'Add and subtract algebraic fractions']),
    (gen_random_uuid(), v_topic_id, 'Differentiation and Calculus', 'differentiation', 'Basic differentiation, finding gradients and turning points.', 8, ARRAY['Differentiate polynomials', 'Find stationary points', 'Interpret derivative as gradient']);

  -- Topic 3: Geometry
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Geometry', 'geometry', 'Angles, polygons, circles, Pythagoras, trigonometry and 3D shapes.', 3, 8)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Angles and Lines', 'angles-and-lines', 'Angle properties, parallel lines, triangles and polygons.', 1, ARRAY['Calculate missing angles', 'Apply angle properties of parallel lines', 'Sum of interior and exterior angles']),
    (gen_random_uuid(), v_topic_id, 'Polygons and Area', 'polygons-and-area', 'Properties of polygons and calculating areas of 2D shapes.', 2, ARRAY['Find area of triangles, quadrilaterals and circles', 'Calculate arc length and sector area']),
    (gen_random_uuid(), v_topic_id, 'Circles', 'circles', 'Circle theorems, arc length, sector area and tangents.', 3, ARRAY['Apply circle theorems', 'Calculate circumference and area', 'Find arc length and sector area']),
    (gen_random_uuid(), v_topic_id, 'Pythagoras Theorem', 'pythagoras', 'Applying Pythagoras in 2D and 3D problems.', 4, ARRAY['Apply Pythagoras theorem in 2D', 'Apply Pythagoras theorem in 3D']),
    (gen_random_uuid(), v_topic_id, 'Trigonometry', 'trigonometry', 'SOHCAHTOA, sine and cosine rules, and trigonometric graphs.', 5, ARRAY['Apply SOHCAHTOA', 'Use sine and cosine rules', 'Calculate area using 1/2 ab sin C']),
    (gen_random_uuid(), v_topic_id, '3D Shapes and Volume', '3d-shapes', 'Surface area and volume of prisms, cylinders, pyramids, cones and spheres.', 6, ARRAY['Calculate surface area of 3D shapes', 'Calculate volume of 3D shapes']),
    (gen_random_uuid(), v_topic_id, 'Similarity and Congruence', 'similarity-and-congruence', 'Conditions for congruence, similar shapes and scale factors.', 7, ARRAY['Identify congruent shapes', 'Use scale factors for similar shapes', 'Relate areas and volumes with scale factors']),
    (gen_random_uuid(), v_topic_id, 'Construction and Loci', 'construction-and-loci', 'Geometrical constructions, loci and regions.', 8, ARRAY['Construct triangles and bisectors', 'Describe and draw loci']);

  -- Topic 4: Statistics and Probability
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Statistics and Probability', 'statistics-and-probability', 'Data representation, averages, probability and combined events.', 4, 6)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Data Collection and Representation', 'data-collection', 'Types of data, sampling, bar charts, pie charts, histograms and frequency diagrams.', 1, ARRAY['Distinguish types of data', 'Draw and interpret statistical diagrams']),
    (gen_random_uuid(), v_topic_id, 'Averages and Spread', 'averages-and-spread', 'Mean, median, mode and range from raw data and frequency tables.', 2, ARRAY['Calculate mean, median, mode and range', 'Estimate mean from grouped data']),
    (gen_random_uuid(), v_topic_id, 'Cumulative Frequency and Box Plots', 'cumulative-frequency', 'Cumulative frequency graphs, quartiles, interquartile range and box plots.', 3, ARRAY['Draw and interpret cumulative frequency graphs', 'Find quartiles and interquartile range']),
    (gen_random_uuid(), v_topic_id, 'Basic Probability', 'basic-probability', 'Probability scale, experimental and theoretical probability.', 4, ARRAY['Calculate theoretical probability', 'Understand relative frequency', 'Use probability in real contexts']),
    (gen_random_uuid(), v_topic_id, 'Combined Events and Tree Diagrams', 'combined-events', 'Mutually exclusive, independent events, Venn diagrams and tree diagrams.', 5, ARRAY['Add and multiply probabilities', 'Draw and use tree diagrams', 'Use Venn diagrams for probability']),
    (gen_random_uuid(), v_topic_id, 'Scatter Graphs and Correlation', 'scatter-graphs', 'Plotting scatter graphs, correlation, lines of best fit.', 6, ARRAY['Plot and interpret scatter graphs', 'Describe correlation', 'Draw and use lines of best fit']);

  -- Topic 5: Vectors and Transformation Geometry
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Vectors and Transformation Geometry', 'vectors-and-transformation-geometry', 'Column vectors, vector arithmetic, and geometric transformations.', 5, 5)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Introduction to Vectors', 'introduction-to-vectors', 'Column vectors, magnitude, adding and subtracting vectors.', 1, ARRAY['Write vectors in column form', 'Add and subtract vectors', 'Find vector magnitude']),
    (gen_random_uuid(), v_topic_id, 'Vector Geometry', 'vector-geometry', 'Using vectors to prove geometric results and describe paths.', 2, ARRAY['Describe journeys using vectors', 'Prove geometric results with vectors']),
    (gen_random_uuid(), v_topic_id, 'Reflections and Rotations', 'reflections-and-rotations', 'Reflecting in lines and rotating about a point.', 3, ARRAY['Reflect shapes in lines', 'Rotate shapes about a point']),
    (gen_random_uuid(), v_topic_id, 'Translations and Enlargements', 'translations-and-enlargements', 'Translating shapes and enlarging with positive, negative and fractional scale factors.', 4, ARRAY['Translate shapes using vectors', 'Enlarge shapes with given scale factor and centre']),
    (gen_random_uuid(), v_topic_id, 'Combined Transformations', 'combined-transformations', 'Performing and describing sequences of transformations.', 5, ARRAY['Perform combined transformations', 'Describe transformations precisely']);

  -- Update topic_count
  UPDATE subjects SET topic_count = 5 WHERE id = v_subject_id;
END $$;

-- ─────────────────────────────────────────────────────────────
-- BIOLOGY
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_subject_id UUID;
  v_topic_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE slug = 'biology' AND exam_board = 'edexcel' LIMIT 1;

  -- Topic 1: Nature and Variety of Living Organisms
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'The Nature and Variety of Living Organisms', 'nature-and-variety-of-living-organisms', 'Characteristics of life, classification of organisms and diversity.', 1, 5)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Characteristics of Living Organisms', 'characteristics-of-living-organisms', 'The seven life processes: MRS GREN.', 1, ARRAY['List and describe the seven characteristics of living organisms', 'Apply MRS GREN to examples']),
    (gen_random_uuid(), v_topic_id, 'Classification of Organisms', 'classification-of-organisms', 'The five kingdoms: animals, plants, fungi, bacteria and protists.', 2, ARRAY['Classify organisms into the five kingdoms', 'Describe features of each kingdom']),
    (gen_random_uuid(), v_topic_id, 'Unicellular Organisms', 'unicellular-organisms', 'Amoeba, Euglena, Paramecium and other unicellular organisms.', 3, ARRAY['Describe features of unicellular organisms', 'Explain how unicellular organisms carry out life processes']),
    (gen_random_uuid(), v_topic_id, 'Viruses', 'viruses', 'Structure and nature of viruses; how they differ from living organisms.', 4, ARRAY['Describe the structure of a virus', 'Explain why viruses are not considered living organisms']),
    (gen_random_uuid(), v_topic_id, 'Biodiversity', 'biodiversity', 'Species, habitats, adaptation and the importance of biodiversity.', 5, ARRAY['Define biodiversity', 'Explain the importance of maintaining biodiversity']);

  -- Topic 2: Structures and Functions
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Structures and Functions in Living Organisms', 'structures-and-functions', 'Cell biology, nutrition, respiration, gas exchange, excretion and the nervous system.', 2, 8)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Cell Structure', 'cell-structure', 'Plant and animal cell structure, organelles and functions.', 1, ARRAY['Identify organelles in animal and plant cells', 'State functions of organelles', 'Compare plant and animal cells']),
    (gen_random_uuid(), v_topic_id, 'Biological Molecules', 'biological-molecules', 'Carbohydrates, proteins, lipids, water and minerals.', 2, ARRAY['Describe functions of carbohydrates, proteins and lipids', 'Carry out food tests for biological molecules']),
    (gen_random_uuid(), v_topic_id, 'Enzymes', 'enzymes', 'Enzyme action, denaturation, and factors affecting enzyme activity.', 3, ARRAY['Explain lock and key model', 'Describe effect of pH and temperature on enzymes', 'Explain denaturation']),
    (gen_random_uuid(), v_topic_id, 'Nutrition in Humans', 'nutrition-in-humans', 'Human digestive system, nutrient absorption and diet.', 4, ARRAY['Trace the path of food through the digestive system', 'Describe absorption of nutrients', 'Explain the consequences of poor diet']),
    (gen_random_uuid(), v_topic_id, 'Respiration', 'respiration', 'Aerobic and anaerobic respiration, ATP and energy.', 5, ARRAY['Write word and symbol equations for aerobic respiration', 'Describe anaerobic respiration in humans and yeast', 'Explain the role of ATP']),
    (gen_random_uuid(), v_topic_id, 'Gas Exchange', 'gas-exchange', 'Gas exchange in the lungs and in plants.', 6, ARRAY['Describe the structure of the alveoli', 'Explain adaptations for efficient gas exchange', 'Describe gas exchange in leaf mesophyll']),
    (gen_random_uuid(), v_topic_id, 'Excretion', 'excretion', 'The kidney structure, filtration, reabsorption and osmoregulation.', 7, ARRAY['Describe kidney structure', 'Explain ultrafiltration and selective reabsorption', 'Explain the role of ADH']),
    (gen_random_uuid(), v_topic_id, 'Nervous System and Homeostasis', 'nervous-system', 'Neurones, reflex arc, homeostasis and hormonal control.', 8, ARRAY['Describe the structure of a motor neurone', 'Draw and explain a reflex arc', 'Explain negative feedback in homeostasis']);

  -- Topic 3: Reproduction and Inheritance
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Reproduction and Inheritance', 'reproduction-and-inheritance', 'Cell division, sexual and asexual reproduction, genetics and evolution.', 3, 6)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Cell Division', 'cell-division', 'Mitosis and meiosis: stages, differences and significance.', 1, ARRAY['Describe the stages of mitosis', 'Compare mitosis and meiosis', 'Explain the importance of cell division']),
    (gen_random_uuid(), v_topic_id, 'Sexual Reproduction in Humans', 'sexual-reproduction-humans', 'Fertilisation, embryo development and the menstrual cycle.', 2, ARRAY['Describe human fertilisation', 'Explain the menstrual cycle', 'Describe development of the embryo']),
    (gen_random_uuid(), v_topic_id, 'Sexual Reproduction in Plants', 'sexual-reproduction-plants', 'Pollination, fertilisation and seed dispersal.', 3, ARRAY['Describe the structure of a flower', 'Explain pollination and fertilisation in plants', 'Describe methods of seed dispersal']),
    (gen_random_uuid(), v_topic_id, 'Genetics and Inheritance', 'genetics-and-inheritance', 'DNA, chromosomes, monohybrid crosses, dominant and recessive alleles.', 4, ARRAY['Explain the relationship between genes and proteins', 'Use genetic crosses to predict offspring ratios', 'Interpret pedigree diagrams']),
    (gen_random_uuid(), v_topic_id, 'Variation and Evolution', 'variation-and-evolution', 'Continuous and discontinuous variation, natural selection and evolution.', 5, ARRAY['Distinguish continuous and discontinuous variation', 'Explain natural selection with examples', 'Describe evidence for evolution']),
    (gen_random_uuid(), v_topic_id, 'Selective Breeding and Genetic Engineering', 'selective-breeding', 'How selective breeding works and basic genetic engineering techniques.', 6, ARRAY['Explain selective breeding', 'Describe genetic engineering techniques', 'Evaluate uses of genetic engineering']);

  -- Topic 4: Ecology and the Environment
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Ecology and the Environment', 'ecology-and-the-environment', 'Ecosystems, energy flow, nutrient cycles and human impact.', 4, 5)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Ecosystems and Populations', 'ecosystems-and-populations', 'Biotic and abiotic factors, food chains, webs and population dynamics.', 1, ARRAY['Define ecosystem, habitat and population', 'Construct and interpret food chains and webs', 'Explain limiting factors for population size']),
    (gen_random_uuid(), v_topic_id, 'Energy Flow', 'energy-flow', 'Energy transfer through food chains, trophic levels and energy pyramids.', 2, ARRAY['Explain energy transfer between trophic levels', 'Calculate efficiency of energy transfer', 'Draw pyramids of numbers, biomass and energy']),
    (gen_random_uuid(), v_topic_id, 'Nutrient Cycles', 'nutrient-cycles', 'The carbon cycle and nitrogen cycle.', 3, ARRAY['Describe the carbon cycle', 'Describe the nitrogen cycle', 'Explain the role of microorganisms in nutrient cycles']),
    (gen_random_uuid(), v_topic_id, 'Human Impact on the Environment', 'human-impact', 'Pollution, deforestation, climate change and conservation.', 4, ARRAY['Describe effects of human activities on the environment', 'Explain causes and consequences of climate change', 'Evaluate conservation methods']),
    (gen_random_uuid(), v_topic_id, 'Adaptation and Competition', 'adaptation-and-competition', 'How organisms adapt to their environment and compete for resources.', 5, ARRAY['Describe how organisms adapt to their environment', 'Explain intraspecific and interspecific competition']);

  -- Topic 5: Use of Biological Resources
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Use of Biological Resources', 'use-of-biological-resources', 'Food production, selective breeding, genetic engineering and microorganisms.', 5, 5)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Food Production — Crops', 'food-production-crops', 'Fertilisers, pesticides, biological pest control and greenhouse farming.', 1, ARRAY['Explain the use of fertilisers and pesticides', 'Describe biological pest control', 'Evaluate intensive farming methods']),
    (gen_random_uuid(), v_topic_id, 'Food Production — Animals', 'food-production-animals', 'Factory farming, fish farming and food chains.', 2, ARRAY['Describe factory farming', 'Explain fish farming methods', 'Evaluate food production efficiency']),
    (gen_random_uuid(), v_topic_id, 'Selective Breeding', 'selective-breeding-resources', 'Selective breeding in plants and animals for desired traits.', 3, ARRAY['Explain the process of selective breeding', 'Give examples of selective breeding in agriculture']),
    (gen_random_uuid(), v_topic_id, 'Genetic Modification', 'genetic-modification', 'Techniques and applications of genetic modification in food production.', 4, ARRAY['Describe the process of genetic modification', 'Evaluate the risks and benefits of GM crops']),
    (gen_random_uuid(), v_topic_id, 'Microorganisms in Food Production', 'microorganisms-food', 'Yeast, bacteria and fungi in brewing, baking and biotechnology.', 5, ARRAY['Explain how yeast is used in brewing and baking', 'Describe fermentation', 'Explain how bacteria produce yoghurt']);

  UPDATE subjects SET topic_count = 5 WHERE id = v_subject_id;
END $$;

-- ─────────────────────────────────────────────────────────────
-- CHEMISTRY
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_subject_id UUID;
  v_topic_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE slug = 'chemistry' AND exam_board = 'edexcel' LIMIT 1;

  -- Topic 1: Principles of Chemistry
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Principles of Chemistry', 'principles-of-chemistry', 'Atomic structure, the periodic table, chemical bonding, formulae and equations.', 1, 8)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'States of Matter', 'states-of-matter', 'Solids, liquids and gases; melting, boiling and changes of state.', 1, ARRAY['Describe properties of solids, liquids and gases', 'Explain changes of state in terms of energy and particle movement']),
    (gen_random_uuid(), v_topic_id, 'Atomic Structure', 'atomic-structure', 'Protons, neutrons, electrons, atomic number, mass number and isotopes.', 2, ARRAY['Describe the structure of an atom', 'Define atomic number and mass number', 'Explain what isotopes are']),
    (gen_random_uuid(), v_topic_id, 'The Periodic Table', 'the-periodic-table', 'History of the periodic table, groups, periods and electron configurations.', 3, ARRAY['Describe the structure of the periodic table', 'Write electron configurations for elements 1-20', 'Explain trends in the periodic table']),
    (gen_random_uuid(), v_topic_id, 'Chemical Bonding', 'chemical-bonding', 'Ionic, covalent and metallic bonding; structures and properties.', 4, ARRAY['Explain ionic bonding with dot-and-cross diagrams', 'Explain covalent bonding', 'Describe metallic bonding and metallic properties']),
    (gen_random_uuid(), v_topic_id, 'Chemical Formulae and Equations', 'formulae-and-equations', 'Writing formulae, balancing equations and state symbols.', 5, ARRAY['Write and balance chemical equations', 'Use state symbols', 'Calculate relative molecular mass']),
    (gen_random_uuid(), v_topic_id, 'Moles and Stoichiometry', 'moles-and-stoichiometry', 'The mole concept, Avogadro constant and reacting mass calculations.', 6, ARRAY['Define the mole', 'Calculate moles from mass and vice versa', 'Calculate reacting masses from equations']),
    (gen_random_uuid(), v_topic_id, 'Titrations and Concentrations', 'titrations', 'Titration calculations and concentration of solutions.', 7, ARRAY['Calculate concentration from moles and volume', 'Describe how to carry out a titration', 'Perform titration calculations']),
    (gen_random_uuid(), v_topic_id, 'Empirical and Molecular Formulae', 'empirical-formulae', 'Calculating empirical formulae from experimental data.', 8, ARRAY['Calculate empirical formula from percentage composition', 'Determine molecular formula from empirical formula and Mr']);

  -- Topic 2: Chemistry of the Elements
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Chemistry of the Elements', 'chemistry-of-the-elements', 'Groups 1, 7 and 0, transition metals, metals, acids and salts.', 2, 8)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Group 1 — Alkali Metals', 'alkali-metals', 'Properties and reactions of Group 1 elements.', 1, ARRAY['Describe properties of alkali metals', 'Describe their reaction with water and oxygen', 'Explain trends down Group 1']),
    (gen_random_uuid(), v_topic_id, 'Group 7 — Halogens', 'halogens', 'Properties and reactions of Group 7 elements, including displacement reactions.', 2, ARRAY['Describe properties of halogens', 'Explain halogen displacement reactions', 'Explain trends down Group 7']),
    (gen_random_uuid(), v_topic_id, 'Group 0 — Noble Gases', 'noble-gases', 'Properties and uses of noble gases.', 3, ARRAY['Explain why noble gases are unreactive', 'Describe uses of noble gases']),
    (gen_random_uuid(), v_topic_id, 'Transition Metals', 'transition-metals', 'Properties and uses of transition metals and their compounds.', 4, ARRAY['Describe properties of transition metals', 'Explain uses of transition metal catalysts', 'Describe reactions of iron and copper']),
    (gen_random_uuid(), v_topic_id, 'Metals and Non-metals', 'metals-and-non-metals', 'Reactivity series, reactions of metals with acids, water and oxygen.', 5, ARRAY['List metals in order of reactivity', 'Predict products of metal reactions', 'Explain displacement reactions']),
    (gen_random_uuid(), v_topic_id, 'Acids, Bases and Salts', 'acids-bases-salts', 'pH, neutralisation, salt preparation and precipitation reactions.', 6, ARRAY['Define acids and bases', 'Describe methods of salt preparation', 'Carry out neutralisation calculations']),
    (gen_random_uuid(), v_topic_id, 'Redox Reactions', 'redox-reactions', 'Oxidation and reduction in terms of oxygen, hydrogen and electrons.', 7, ARRAY['Define oxidation and reduction', 'Identify oxidising and reducing agents', 'Write half-equations']),
    (gen_random_uuid(), v_topic_id, 'Identifying Ions and Gases', 'identifying-ions', 'Flame tests, precipitate tests and gas tests.', 8, ARRAY['Describe flame tests for metal ions', 'Describe tests for common anions', 'Describe tests for common gases']);

  -- Topic 3: Organic Chemistry
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Organic Chemistry', 'organic-chemistry', 'Alkanes, alkenes, alcohols, carboxylic acids, esters and polymers.', 3, 6)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Introduction to Organic Chemistry', 'intro-organic-chemistry', 'Hydrocarbons, homologous series, functional groups and naming conventions.', 1, ARRAY['Define hydrocarbon and homologous series', 'Name simple organic compounds using IUPAC rules', 'Describe functional groups']),
    (gen_random_uuid(), v_topic_id, 'Alkanes', 'alkanes', 'Structure, properties and reactions of alkanes; fractional distillation and cracking.', 2, ARRAY['Draw structural formulae of alkanes', 'Describe combustion of alkanes', 'Explain fractional distillation of crude oil', 'Describe cracking']),
    (gen_random_uuid(), v_topic_id, 'Alkenes', 'alkenes', 'Structure, properties and reactions of alkenes; addition reactions and polymerisation.', 3, ARRAY['Draw structural formulae of alkenes', 'Describe addition reactions with bromine and hydrogen', 'Explain addition polymerisation']),
    (gen_random_uuid(), v_topic_id, 'Alcohols', 'alcohols', 'Structure, properties, uses and reactions of alcohols.', 4, ARRAY['Describe properties of alcohols', 'Explain fermentation to produce ethanol', 'Describe oxidation of alcohols']),
    (gen_random_uuid(), v_topic_id, 'Carboxylic Acids and Esters', 'carboxylic-acids-esters', 'Properties of carboxylic acids, esterification and uses.', 5, ARRAY['Describe properties of carboxylic acids', 'Explain esterification', 'Identify and name simple esters']),
    (gen_random_uuid(), v_topic_id, 'Polymers', 'polymers', 'Addition and condensation polymers, properties and disposal.', 6, ARRAY['Describe addition polymerisation', 'Describe condensation polymerisation', 'Evaluate environmental impacts of polymers']);

  -- Topic 4: Physical Chemistry
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Physical Chemistry', 'physical-chemistry', 'Energetics, rates of reaction, reversible reactions and electrochemistry.', 4, 6)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Energetics', 'energetics', 'Exothermic and endothermic reactions, bond energy calculations and enthalpy.', 1, ARRAY['Distinguish exothermic and endothermic reactions', 'Calculate energy change using bond energies', 'Draw energy profile diagrams']),
    (gen_random_uuid(), v_topic_id, 'Rates of Reaction', 'rates-of-reaction', 'Factors affecting rate: concentration, temperature, surface area, catalysts.', 2, ARRAY['Explain how concentration, temperature, surface area and catalysts affect rate', 'Describe collision theory', 'Calculate rate of reaction from graphs']),
    (gen_random_uuid(), v_topic_id, 'Reversible Reactions and Equilibrium', 'equilibrium', 'Dynamic equilibrium, Le Chatelier''s principle and the Haber process.', 3, ARRAY['Define dynamic equilibrium', 'Apply Le Chatelier''s principle', 'Explain the conditions used in the Haber process']),
    (gen_random_uuid(), v_topic_id, 'Electrochemistry and Electrolysis', 'electrolysis', 'Electrolysis of molten and aqueous solutions; electrode products.', 4, ARRAY['Explain how electrolysis works', 'Predict products at electrodes', 'Describe electrolysis of brine']),
    (gen_random_uuid(), v_topic_id, 'Cells and Batteries', 'cells-and-batteries', 'Electrochemical cells, fuel cells and uses.', 5, ARRAY['Describe how an electrochemical cell works', 'Explain hydrogen fuel cells', 'Evaluate energy storage technologies']),
    (gen_random_uuid(), v_topic_id, 'Water and Solutions', 'water-and-solutions', 'Hard water, softening, solubility and water testing.', 6, ARRAY['Explain temporary and permanent hardness', 'Describe methods to soften water', 'Interpret solubility curves']);

  -- Topic 5: Chemistry in Society
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Chemistry in Society', 'chemistry-in-society', 'Extraction of metals, the Contact and Haber processes, water treatment and pollution.', 5, 5)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Extraction and Uses of Metals', 'extraction-of-metals', 'Methods of extraction related to reactivity; electrolysis and reduction by carbon.', 1, ARRAY['Explain why extraction method depends on reactivity', 'Describe extraction of iron in a blast furnace', 'Describe extraction of aluminium by electrolysis']),
    (gen_random_uuid(), v_topic_id, 'Industrial Processes', 'industrial-processes', 'The Haber process for ammonia, the Contact process for sulfuric acid.', 2, ARRAY['Describe the Haber process', 'Describe the Contact process', 'Explain compromise conditions in industrial processes']),
    (gen_random_uuid(), v_topic_id, 'Water Treatment', 'water-treatment', 'Stages of water treatment; chlorination and fluoridation.', 3, ARRAY['Describe the stages of water treatment', 'Evaluate chlorination and fluoridation']),
    (gen_random_uuid(), v_topic_id, 'Air and Atmospheric Pollution', 'atmospheric-pollution', 'Composition of the atmosphere, combustion products and their effects.', 4, ARRAY['State the composition of clean air', 'Describe sources and effects of air pollutants', 'Explain how catalytic converters work']),
    (gen_random_uuid(), v_topic_id, 'Fertilisers and Sustainability', 'fertilisers-sustainability', 'Nitrogen, phosphorus and potassium fertilisers; sustainability in the chemical industry.', 5, ARRAY['Explain why fertilisers are needed', 'Describe how NPK fertilisers are made', 'Evaluate environmental impact of fertiliser use']);

  UPDATE subjects SET topic_count = 5 WHERE id = v_subject_id;
END $$;

-- ─────────────────────────────────────────────────────────────
-- PHYSICS
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_subject_id UUID;
  v_topic_id UUID;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE slug = 'physics' AND exam_board = 'edexcel' LIMIT 1;

  -- Topic 1: Forces and Motion
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Forces and Motion', 'forces-and-motion', 'Speed, velocity, acceleration, Newton''s laws, momentum and terminal velocity.', 1, 6)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Speed, Velocity and Acceleration', 'speed-velocity-acceleration', 'Definitions, equations and calculations involving motion.', 1, ARRAY['Calculate speed, velocity and acceleration', 'Interpret distance-time and velocity-time graphs', 'Apply equations of motion']),
    (gen_random_uuid(), v_topic_id, 'Newton''s Laws of Motion', 'newtons-laws', 'Newton''s three laws and their applications.', 2, ARRAY['State and apply Newton''s three laws', 'Calculate resultant force', 'Explain inertia']),
    (gen_random_uuid(), v_topic_id, 'Forces and Resultants', 'forces-and-resultants', 'Types of forces, free body diagrams and resolving forces.', 3, ARRAY['Identify types of forces', 'Draw free body diagrams', 'Resolve forces in two dimensions']),
    (gen_random_uuid(), v_topic_id, 'Momentum and Collisions', 'momentum', 'Momentum, conservation of momentum and impulse.', 4, ARRAY['Calculate momentum', 'Apply conservation of momentum', 'Explain impulse and change in momentum']),
    (gen_random_uuid(), v_topic_id, 'Terminal Velocity and Friction', 'terminal-velocity', 'Air resistance, friction and terminal velocity.', 5, ARRAY['Explain terminal velocity', 'Describe how friction affects motion', 'Interpret velocity-time graphs with air resistance']),
    (gen_random_uuid(), v_topic_id, 'Work, Energy and Power', 'work-energy-power', 'Work done, kinetic and potential energy, power and efficiency.', 6, ARRAY['Calculate work done', 'Apply the equations for kinetic and potential energy', 'Calculate power and efficiency']);

  -- Topic 2: Electricity
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Electricity', 'electricity', 'Circuits, resistance, Ohm''s law, series and parallel circuits, and electrical power.', 2, 6)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Current, Voltage and Resistance', 'current-voltage-resistance', 'Definitions, units and measuring electrical quantities.', 1, ARRAY['Define current, voltage and resistance', 'Describe how to measure electrical quantities', 'Apply Ohm''s law']),
    (gen_random_uuid(), v_topic_id, 'Series and Parallel Circuits', 'series-parallel-circuits', 'Rules for current and voltage in series and parallel circuits.', 2, ARRAY['Apply rules for series circuits', 'Apply rules for parallel circuits', 'Calculate total resistance in series and parallel']),
    (gen_random_uuid(), v_topic_id, 'Electrical Components', 'electrical-components', 'Resistors, thermistors, LDRs, diodes and other components.', 3, ARRAY['Describe I-V characteristics of components', 'Explain how thermistors and LDRs work', 'Draw circuit symbols']),
    (gen_random_uuid(), v_topic_id, 'Electrical Power and Energy', 'electrical-power-energy', 'Power, energy and calculating electricity costs.', 4, ARRAY['Calculate electrical power', 'Calculate electrical energy transferred', 'Calculate cost of electricity']),
    (gen_random_uuid(), v_topic_id, 'Mains Electricity and Safety', 'mains-electricity', 'AC and DC, mains supply, fuses, earthing and safety.', 5, ARRAY['Distinguish AC and DC', 'Explain the function of fuses and circuit breakers', 'Describe the three-pin plug wiring']),
    (gen_random_uuid(), v_topic_id, 'Charge and Electric Fields', 'charge-electric-fields', 'Electrostatic charge, electric fields and applications.', 6, ARRAY['Explain electrostatic charging', 'Describe electric field patterns', 'Describe practical applications of electrostatics']);

  -- Topic 3: Waves
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Waves', 'waves', 'Wave properties, sound, light, the electromagnetic spectrum and uses.', 3, 5)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Wave Properties', 'wave-properties', 'Amplitude, wavelength, frequency, period and wave speed.', 1, ARRAY['Define amplitude, wavelength, frequency and period', 'Apply the wave speed equation', 'Distinguish transverse and longitudinal waves']),
    (gen_random_uuid(), v_topic_id, 'Sound Waves', 'sound-waves', 'Production, transmission and properties of sound.', 2, ARRAY['Describe how sound is produced and transmitted', 'Explain the relationship between pitch, loudness and wave properties', 'Describe ultrasound applications']),
    (gen_random_uuid(), v_topic_id, 'Light and Reflection', 'light-and-reflection', 'Reflection, plane mirrors and the law of reflection.', 3, ARRAY['Apply the law of reflection', 'Construct ray diagrams for plane mirrors', 'Explain total internal reflection']),
    (gen_random_uuid(), v_topic_id, 'Refraction and Lenses', 'refraction-and-lenses', 'Refraction, Snell''s law, converging and diverging lenses.', 4, ARRAY['Explain refraction using Snell''s law', 'Draw ray diagrams for converging and diverging lenses', 'Describe real and virtual images']),
    (gen_random_uuid(), v_topic_id, 'Electromagnetic Spectrum', 'electromagnetic-spectrum', 'The EM spectrum, properties and uses of each region.', 5, ARRAY['List regions of the EM spectrum in order', 'Describe uses of each region', 'Explain dangers of ionising radiation']);

  -- Topic 4: Energy Resources and Transfer
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Energy Resources and Energy Transfer', 'energy-resources-and-transfer', 'Thermal energy transfer, renewable and non-renewable energy sources.', 4, 5)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Energy Stores and Transfers', 'energy-stores-transfers', 'Kinetic, gravitational potential, thermal and other energy stores; Sankey diagrams.', 1, ARRAY['List energy stores', 'Describe energy transfers using Sankey diagrams', 'Apply conservation of energy']),
    (gen_random_uuid(), v_topic_id, 'Thermal Energy Transfer', 'thermal-energy-transfer', 'Conduction, convection and radiation; insulators and conductors.', 2, ARRAY['Explain conduction, convection and radiation', 'Describe applications of thermal energy transfer', 'Evaluate insulation methods']),
    (gen_random_uuid(), v_topic_id, 'Non-Renewable Energy Sources', 'non-renewable-energy', 'Fossil fuels and nuclear power; advantages and disadvantages.', 3, ARRAY['Describe how fossil fuels generate electricity', 'Explain nuclear fission', 'Evaluate non-renewable energy sources']),
    (gen_random_uuid(), v_topic_id, 'Renewable Energy Sources', 'renewable-energy', 'Solar, wind, hydroelectric, tidal, geothermal and biofuel.', 4, ARRAY['Describe renewable energy sources', 'Evaluate advantages and disadvantages of renewables', 'Compare energy sources']),
    (gen_random_uuid(), v_topic_id, 'Efficiency and Specific Heat Capacity', 'efficiency-specific-heat', 'Calculating efficiency and specific heat capacity.', 5, ARRAY['Calculate efficiency of energy transfer', 'Apply the specific heat capacity equation', 'Calculate energy changes in heating and cooling']);

  -- Topic 5: Solids, Liquids and Gases
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Solids, Liquids and Gases', 'solids-liquids-and-gases', 'Density, pressure, gas laws and kinetic theory.', 5, 5)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Density and Pressure', 'density-and-pressure', 'Calculating density, pressure in liquids and solids.', 1, ARRAY['Calculate density', 'Calculate pressure', 'Explain pressure in fluids']),
    (gen_random_uuid(), v_topic_id, 'Kinetic Theory', 'kinetic-theory', 'Particle model for solids, liquids and gases; Brownian motion.', 2, ARRAY['Explain properties of states using kinetic theory', 'Describe Brownian motion', 'Explain evaporation and diffusion']),
    (gen_random_uuid(), v_topic_id, 'Gas Laws', 'gas-laws', 'Pressure, volume and temperature relationships for gases.', 3, ARRAY['Apply Boyle''s law', 'Apply Charles'' law', 'Apply the pressure law']),
    (gen_random_uuid(), v_topic_id, 'Changes of State', 'changes-of-state', 'Melting, boiling, condensing and sublimation; latent heat.', 4, ARRAY['Describe changes of state', 'Explain latent heat', 'Calculate energy changes during change of state']),
    (gen_random_uuid(), v_topic_id, 'Hydraulics and Upthrust', 'hydraulics-upthrust', 'Hydraulic systems, upthrust and Archimedes'' principle.', 5, ARRAY['Explain how hydraulic systems work', 'Calculate upthrust', 'Apply Archimedes'' principle']);

  -- Topic 6: Magnetism and Electromagnetism
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Magnetism and Electromagnetism', 'magnetism-and-electromagnetism', 'Magnetic fields, electromagnetism, motors, generators and transformers.', 6, 5)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Magnets and Magnetic Fields', 'magnets-magnetic-fields', 'Permanent magnets, poles, magnetic field patterns.', 1, ARRAY['Describe properties of magnets', 'Draw magnetic field patterns', 'Explain induced magnetism']),
    (gen_random_uuid(), v_topic_id, 'Electromagnetism', 'electromagnetism', 'Magnetic field around a wire, solenoids and electromagnets.', 2, ARRAY['Draw the magnetic field around a current-carrying wire', 'Describe a solenoid''s field', 'Explain uses of electromagnets']),
    (gen_random_uuid(), v_topic_id, 'Motor Effect and DC Motor', 'motor-effect', 'Force on a current-carrying conductor, motor effect and DC motors.', 3, ARRAY['Apply the left-hand rule', 'Explain the motor effect', 'Describe how a DC motor works']),
    (gen_random_uuid(), v_topic_id, 'Electromagnetic Induction and Generators', 'electromagnetic-induction', 'Faraday''s law, generators and the dynamo effect.', 4, ARRAY['Explain electromagnetic induction', 'Describe AC and DC generators', 'Apply Lenz''s law']),
    (gen_random_uuid(), v_topic_id, 'Transformers and the National Grid', 'transformers', 'How transformers work, step-up and step-down, and the National Grid.', 5, ARRAY['Explain how a transformer works', 'Apply the transformer equation', 'Explain why the National Grid uses high voltages']);

  -- Topic 7: Radioactivity and Particles
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Radioactivity and Particles', 'radioactivity-and-particles', 'Atomic model, nuclear radiation, half-life, fission, fusion and safety.', 7, 5)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'Atomic Model and Nuclear Structure', 'atomic-model-nuclear', 'Development of the atomic model; protons, neutrons, electrons.', 1, ARRAY['Describe the development of the atomic model', 'Explain nuclear notation', 'Define isotopes']),
    (gen_random_uuid(), v_topic_id, 'Types of Nuclear Radiation', 'types-of-radiation', 'Alpha, beta and gamma radiation: properties and penetrating power.', 2, ARRAY['Describe properties of alpha, beta and gamma radiation', 'Explain ionising power and penetrating power', 'Write nuclear equations']),
    (gen_random_uuid(), v_topic_id, 'Radioactive Decay and Half-Life', 'half-life', 'Decay equations, half-life and radioactive decay curves.', 3, ARRAY['Define half-life', 'Calculate half-life from decay data', 'Interpret radioactive decay graphs']),
    (gen_random_uuid(), v_topic_id, 'Nuclear Fission and Fusion', 'fission-fusion', 'Nuclear fission, chain reactions, nuclear power and fusion.', 4, ARRAY['Explain nuclear fission', 'Describe a chain reaction', 'Explain nuclear fusion and its conditions']),
    (gen_random_uuid(), v_topic_id, 'Radiation Safety and Uses', 'radiation-safety-uses', 'Background radiation, safety precautions and medical uses.', 5, ARRAY['Describe sources of background radiation', 'Explain safety precautions for radiation', 'Describe medical and industrial uses of radiation']);

  -- Topic 8: Astrophysics
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES (gen_random_uuid(), v_subject_id, 'Astrophysics', 'astrophysics', 'The solar system, stars, galaxies, the Big Bang and red-shift.', 8, 4)
  RETURNING id INTO v_topic_id;

  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    (gen_random_uuid(), v_topic_id, 'The Solar System and Orbits', 'solar-system-orbits', 'Planets, moons, comets and gravitational orbits.', 1, ARRAY['Describe the structure of the solar system', 'Explain why planets orbit the Sun', 'Describe circular orbital motion']),
    (gen_random_uuid(), v_topic_id, 'Stars and Stellar Evolution', 'stellar-evolution', 'Life cycle of stars from nebula to end state.', 2, ARRAY['Describe the life cycle of stars', 'Explain nuclear fusion in stars', 'Compare life cycles of small and massive stars']),
    (gen_random_uuid(), v_topic_id, 'Galaxies and the Universe', 'galaxies-universe', 'Structure of galaxies, the Milky Way and the scale of the Universe.', 3, ARRAY['Describe the structure of galaxies', 'Describe the Milky Way', 'Understand distances in space']),
    (gen_random_uuid(), v_topic_id, 'The Big Bang and Red-Shift', 'big-bang-red-shift', 'Evidence for the Big Bang: CMB radiation and red-shift.', 4, ARRAY['Explain the Big Bang theory', 'Describe red-shift as evidence for the expanding Universe', 'Explain cosmic microwave background radiation']);

  UPDATE subjects SET topic_count = 8 WHERE id = v_subject_id;
END $$;

-- ============================================================
-- Verification query
-- ============================================================
SELECT
  s.name AS subject,
  s.exam_board,
  COUNT(DISTINCT t.id) AS topic_count,
  COUNT(DISTINCT st.id) AS subtopic_count
FROM subjects s
LEFT JOIN topics t ON t.subject_id = s.id
LEFT JOIN subtopics st ON st.topic_id = t.id
WHERE s.exam_board = 'edexcel'
GROUP BY s.name, s.exam_board
ORDER BY s.name;
