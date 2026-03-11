-- ============================================================
-- Edexcel IGCSE Structure Migration — 6 topics × 6 subtopics per subject
-- Run this against your Supabase database
-- ============================================================

-- Step 1: Add exam_board column to subjects table
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS exam_board TEXT DEFAULT 'cambridge';

-- Step 2: Backfill existing Cambridge subjects
UPDATE subjects SET exam_board = 'cambridge' WHERE exam_board IS NULL OR exam_board = '';

-- Step 3: Remove any previously inserted Edexcel subjects (clean slate)
DELETE FROM subjects WHERE exam_board = 'edexcel';

-- ============================================================
-- Step 4: Insert Edexcel IGCSE Subjects
-- ============================================================

INSERT INTO subjects (id, name, slug, description, icon, color, topic_count, exam_board) VALUES
  ('ed000001-0000-0000-0000-000000000001', 'Mathematics A', 'mathematics', 'Number, algebra, geometry, statistics and probability — Edexcel IGCSE 4MA1.', '📐', 'from-blue-500 to-indigo-600', 6, 'edexcel'),
  ('ed000001-0000-0000-0000-000000000002', 'Biology', 'biology', 'Living organisms, cell biology, genetics, ecology and biological resources — Edexcel IGCSE 4BI1.', '🧬', 'from-green-500 to-emerald-600', 6, 'edexcel'),
  ('ed000001-0000-0000-0000-000000000003', 'Chemistry', 'chemistry', 'Principles of chemistry, elements, organic chemistry and industrial processes — Edexcel IGCSE 4CH1.', '⚗️', 'from-purple-500 to-violet-600', 6, 'edexcel'),
  ('ed000001-0000-0000-0000-000000000004', 'Physics', 'physics', 'Forces, electricity, waves, energy, atomic physics and space — Edexcel IGCSE 4PH1.', '⚛️', 'from-cyan-500 to-blue-600', 6, 'edexcel');

-- ============================================================
-- MATHEMATICS A — 6 topics × 6 subtopics
-- ============================================================

DO $$
DECLARE v_topic_id UUID;
BEGIN

  -- Topic 1: Number
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00001-0000-0000-0000-000000000001', 'ed000001-0000-0000-0000-000000000001', 'Number', 'number', 'Integers, fractions, decimals, percentages, standard form and financial mathematics.', 1, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00001-0001-0000-0000-000000000001', v_topic_id, 'Integers, Powers and Roots', 'integers-powers-roots', 'Ordering integers, HCF, LCM, prime factorisation, index laws, square and cube roots.', 1, ARRAY['Use HCF and LCM', 'Apply index laws', 'Calculate square and cube roots']),
    ('eds00001-0002-0000-0000-000000000001', v_topic_id, 'Fractions, Decimals and Percentages', 'fractions-decimals-percentages', 'Converting between forms, operations with fractions, recurring decimals, percentage calculations.', 2, ARRAY['Convert between fractions, decimals and percentages', 'Add, subtract, multiply and divide fractions', 'Identify recurring decimals']),
    ('eds00001-0003-0000-0000-000000000001', v_topic_id, 'Standard Form and Indices', 'standard-form-indices', 'Writing and calculating with numbers in standard form; negative and fractional indices.', 3, ARRAY['Write and interpret standard form', 'Apply negative and fractional indices', 'Perform calculations in standard form']),
    ('eds00001-0004-0000-0000-000000000001', v_topic_id, 'Ratio, Proportion and Rates', 'ratio-proportion-rates', 'Simplifying ratios, dividing in a ratio, direct and inverse proportion, speed-distance-time.', 4, ARRAY['Simplify and use ratios', 'Solve direct and inverse proportion', 'Apply speed, distance and time formulae']),
    ('eds00001-0005-0000-0000-000000000001', v_topic_id, 'Bounds and Error Intervals', 'bounds-error-intervals', 'Upper and lower bounds, error intervals, significant figures and decimal places.', 5, ARRAY['Find upper and lower bounds', 'Use error intervals', 'Round to significant figures and decimal places']),
    ('eds00001-0006-0000-0000-000000000001', v_topic_id, 'Financial Mathematics', 'financial-mathematics', 'Simple and compound interest, percentage change, reverse percentages, profit and loss.', 6, ARRAY['Calculate simple and compound interest', 'Apply percentage change and reverse percentage', 'Solve profit and loss problems']);

  -- Topic 2: Algebra
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00001-0000-0000-0000-000000000002', 'ed000001-0000-0000-0000-000000000001', 'Algebra', 'algebra', 'Expressions, equations, inequalities, sequences and algebraic fractions.', 2, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00002-0001-0000-0000-000000000001', v_topic_id, 'Algebraic Expressions', 'algebraic-expressions', 'Simplifying, expanding brackets, factorising and index notation in algebra.', 1, ARRAY['Simplify expressions', 'Expand single and double brackets', 'Factorise by common factor and grouping']),
    ('eds00002-0002-0000-0000-000000000001', v_topic_id, 'Linear Equations and Inequalities', 'linear-equations-inequalities', 'Solving linear equations, forming equations, solving and representing inequalities.', 2, ARRAY['Solve linear equations', 'Form and solve equations from context', 'Solve and represent inequalities']),
    ('eds00002-0003-0000-0000-000000000001', v_topic_id, 'Quadratic Equations', 'quadratic-equations', 'Factorising, completing the square, quadratic formula and the discriminant.', 3, ARRAY['Factorise and solve quadratics', 'Complete the square', 'Use the quadratic formula']),
    ('eds00002-0004-0000-0000-000000000001', v_topic_id, 'Simultaneous Equations', 'simultaneous-equations', 'Solving pairs of linear equations algebraically and graphically; one linear one quadratic.', 4, ARRAY['Solve simultaneous linear equations by elimination and substitution', 'Solve simultaneous equations graphically', 'Solve one linear and one quadratic simultaneously']),
    ('eds00002-0005-0000-0000-000000000001', v_topic_id, 'Sequences', 'sequences', 'Arithmetic and geometric sequences, nth term, sum of arithmetic series.', 5, ARRAY['Find the nth term of arithmetic sequences', 'Recognise geometric sequences', 'Calculate the sum of an arithmetic series']),
    ('eds00002-0006-0000-0000-000000000001', v_topic_id, 'Algebraic Fractions and Proof', 'algebraic-fractions-proof', 'Simplifying, adding, subtracting algebraic fractions; constructing algebraic proofs.', 6, ARRAY['Simplify algebraic fractions', 'Add and subtract algebraic fractions', 'Construct algebraic proofs']);

  -- Topic 3: Geometry and Measures
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00001-0000-0000-0000-000000000003', 'ed000001-0000-0000-0000-000000000001', 'Geometry and Measures', 'geometry-and-measures', 'Angles, polygons, circles, Pythagoras, trigonometry, 3D shapes and constructions.', 3, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00003-0001-0000-0000-000000000001', v_topic_id, 'Angles and Polygons', 'angles-polygons', 'Angle facts, parallel lines, triangles, quadrilaterals, interior and exterior angles.', 1, ARRAY['Apply angle properties', 'Calculate interior and exterior angles of polygons', 'Use properties of parallel lines']),
    ('eds00003-0002-0000-0000-000000000001', v_topic_id, 'Circles and Arc Measures', 'circles-arc-measures', 'Circumference, area, arc length, sector area, circle theorems.', 2, ARRAY['Calculate circumference and area', 'Find arc length and sector area', 'Apply circle theorems']),
    ('eds00003-0003-0000-0000-000000000001', v_topic_id, 'Pythagoras and Trigonometry', 'pythagoras-trigonometry', 'Pythagoras in 2D and 3D; SOHCAHTOA; sine and cosine rules.', 3, ARRAY['Apply Pythagoras in 2D and 3D', 'Use SOHCAHTOA', 'Apply sine and cosine rules']),
    ('eds00003-0004-0000-0000-000000000001', v_topic_id, 'Area and Volume of 3D Shapes', 'area-volume-3d', 'Surface area and volume of prisms, pyramids, cylinders, cones and spheres.', 4, ARRAY['Calculate surface area of 3D shapes', 'Calculate volume of 3D shapes', 'Solve composite shape problems']),
    ('eds00003-0005-0000-0000-000000000001', v_topic_id, 'Similarity and Congruence', 'similarity-congruence', 'Congruence conditions, similar shapes, scale factors for length, area and volume.', 5, ARRAY['State congruence conditions', 'Use scale factors for similar shapes', 'Relate areas and volumes of similar shapes']),
    ('eds00003-0006-0000-0000-000000000001', v_topic_id, 'Constructions and Loci', 'constructions-loci', 'Geometric constructions, perpendicular and angle bisectors, loci.', 6, ARRAY['Construct triangles and perpendicular bisectors', 'Bisect angles accurately', 'Draw and describe loci']);

  -- Topic 4: Statistics and Probability
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00001-0000-0000-0000-000000000004', 'ed000001-0000-0000-0000-000000000001', 'Statistics and Probability', 'statistics-and-probability', 'Data representation, averages, spread, probability and statistical diagrams.', 4, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00004-0001-0000-0000-000000000001', v_topic_id, 'Data Collection and Sampling', 'data-collection-sampling', 'Types of data, sampling methods, questionnaire design, frequency tables.', 1, ARRAY['Distinguish types of data', 'Describe sampling methods', 'Design unbiased questionnaires']),
    ('eds00004-0002-0000-0000-000000000001', v_topic_id, 'Statistical Diagrams', 'statistical-diagrams', 'Bar charts, pie charts, histograms, frequency polygons and stem-and-leaf diagrams.', 2, ARRAY['Draw and interpret bar charts and pie charts', 'Construct histograms', 'Use stem-and-leaf diagrams']),
    ('eds00004-0003-0000-0000-000000000001', v_topic_id, 'Averages and Spread', 'averages-spread', 'Mean, median, mode, range, IQR; calculating averages from frequency tables.', 3, ARRAY['Calculate mean, median, mode and range', 'Find averages from grouped data', 'Interpret measures of spread']),
    ('eds00004-0004-0000-0000-000000000001', v_topic_id, 'Cumulative Frequency and Box Plots', 'cumulative-frequency-box-plots', 'Cumulative frequency curves, quartiles, interquartile range, box-and-whisker plots.', 4, ARRAY['Draw and interpret cumulative frequency graphs', 'Find quartiles and IQR', 'Draw and compare box plots']),
    ('eds00004-0005-0000-0000-000000000001', v_topic_id, 'Scatter Graphs and Correlation', 'scatter-graphs-correlation', 'Plotting scatter graphs, types of correlation, lines of best fit, interpolation.', 5, ARRAY['Plot scatter graphs', 'Describe correlation', 'Draw and use lines of best fit']),
    ('eds00004-0006-0000-0000-000000000001', v_topic_id, 'Probability', 'probability', 'Basic probability, mutually exclusive events, independent events, tree diagrams, Venn diagrams.', 6, ARRAY['Calculate theoretical probability', 'Use addition and multiplication rules', 'Draw and use tree diagrams and Venn diagrams']);

  -- Topic 5: Vectors and Transformations
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00001-0000-0000-0000-000000000005', 'ed000001-0000-0000-0000-000000000001', 'Vectors and Transformations', 'vectors-and-transformations', 'Column vectors, vector arithmetic, geometric transformations and matrices.', 5, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00005-0001-0000-0000-000000000001', v_topic_id, 'Introduction to Vectors', 'intro-vectors', 'Column vectors, magnitude, adding, subtracting and scaling vectors.', 1, ARRAY['Write and interpret column vectors', 'Add, subtract and scale vectors', 'Find the magnitude of a vector']),
    ('eds00005-0002-0000-0000-000000000001', v_topic_id, 'Vector Geometry', 'vector-geometry', 'Using vectors to describe paths and prove geometric results.', 2, ARRAY['Use vectors to describe positions', 'Prove geometric results using vectors', 'Identify parallel and collinear vectors']),
    ('eds00005-0003-0000-0000-000000000001', v_topic_id, 'Reflections and Rotations', 'reflections-rotations', 'Reflecting shapes in lines of the form y = a, x = a, y = x; rotating about a point.', 3, ARRAY['Reflect shapes in given lines', 'Rotate shapes about a given point', 'Describe reflections and rotations precisely']),
    ('eds00005-0004-0000-0000-000000000001', v_topic_id, 'Translations and Enlargements', 'translations-enlargements', 'Translating with vectors; enlargements with positive, negative and fractional scale factors.', 4, ARRAY['Translate shapes using column vectors', 'Enlarge with positive and fractional scale factors', 'Find the centre of enlargement']),
    ('eds00005-0005-0000-0000-000000000001', v_topic_id, 'Combined Transformations', 'combined-transformations', 'Performing and describing sequences of transformations.', 5, ARRAY['Perform combined transformations', 'Describe combined transformations fully', 'Identify inverse transformations']),
    ('eds00005-0006-0000-0000-000000000001', v_topic_id, 'Matrices', 'matrices', '2×2 matrices, matrix multiplication, transformation matrices, determinant and inverse.', 6, ARRAY['Multiply matrices', 'Identify transformation matrices', 'Find the determinant and inverse of a 2×2 matrix']);

  -- Topic 6: Functions and Graphs
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00001-0000-0000-0000-000000000006', 'ed000001-0000-0000-0000-000000000001', 'Functions and Graphs', 'functions-and-graphs', 'Coordinate geometry, curve sketching, calculus and graph transformations.', 6, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00006-0001-0000-0000-000000000001', v_topic_id, 'Linear Graphs and Coordinate Geometry', 'linear-graphs', 'Equation of a line, gradient, y-intercept, midpoint, distance between two points.', 1, ARRAY['Find gradient and equation of a line', 'Find midpoints and distances', 'Use parallel and perpendicular conditions']),
    ('eds00006-0002-0000-0000-000000000001', v_topic_id, 'Quadratic and Polynomial Graphs', 'quadratic-polynomial-graphs', 'Sketching parabolas and cubics, turning points, roots and axis of symmetry.', 2, ARRAY['Sketch quadratic and cubic graphs', 'Find turning points and roots', 'Interpret features of polynomial graphs']),
    ('eds00006-0003-0000-0000-000000000001', v_topic_id, 'Other Graphs', 'other-graphs', 'Reciprocal, exponential, trigonometric and circle graphs.', 3, ARRAY['Sketch reciprocal and exponential graphs', 'Sketch trigonometric graphs', 'Find equation of a circle']),
    ('eds00006-0004-0000-0000-000000000001', v_topic_id, 'Graph Transformations', 'graph-transformations', 'Translations, reflections and stretches of graphs using function notation.', 4, ARRAY['Apply f(x)+a, f(x+a), af(x), f(ax) transformations', 'Sketch transformed graphs', 'Describe graph transformations']),
    ('eds00006-0005-0000-0000-000000000001', v_topic_id, 'Gradient and Rate of Change', 'gradient-rate-of-change', 'Gradient as rate of change, area under a graph, instantaneous rate of change.', 5, ARRAY['Interpret gradient as rate of change', 'Estimate area under a velocity-time graph', 'Calculate average rate of change']),
    ('eds00006-0006-0000-0000-000000000001', v_topic_id, 'Differentiation', 'differentiation', 'Differentiating polynomials, finding tangents, normals and stationary points.', 6, ARRAY['Differentiate polynomial functions', 'Find equations of tangents and normals', 'Locate and classify stationary points']);

END $$;

-- ============================================================
-- BIOLOGY — 6 topics × 6 subtopics
-- ============================================================

DO $$
DECLARE v_topic_id UUID;
BEGIN

  -- Topic 1: The Nature and Variety of Living Organisms
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00002-0000-0000-0000-000000000001', 'ed000001-0000-0000-0000-000000000002', 'The Nature and Variety of Living Organisms', 'nature-and-variety', 'Characteristics of life, classification, prokaryotes, viruses, adaptation and biodiversity.', 1, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00007-0001-0000-0000-000000000001', v_topic_id, 'Characteristics of Living Organisms', 'characteristics-of-life', 'MRS GREN: movement, respiration, sensitivity, growth, reproduction, excretion, nutrition.', 1, ARRAY['List and describe the seven characteristics of living organisms', 'Apply MRS GREN to examples']),
    ('eds00007-0002-0000-0000-000000000001', v_topic_id, 'Classification of Organisms', 'classification', 'The five kingdoms; binomial nomenclature; features of major animal and plant groups.', 2, ARRAY['Classify organisms into kingdoms', 'Use binomial nomenclature', 'Describe features of major groups']),
    ('eds00007-0003-0000-0000-000000000001', v_topic_id, 'Prokaryotes and Eukaryotes', 'prokaryotes-eukaryotes', 'Differences between prokaryotic and eukaryotic cells; structure of bacteria.', 3, ARRAY['Compare prokaryotic and eukaryotic cells', 'Describe bacterial cell structure', 'Explain the significance of DNA location']),
    ('eds00007-0004-0000-0000-000000000001', v_topic_id, 'Viruses', 'viruses', 'Structure of viruses; how viruses reproduce; examples of viral diseases.', 4, ARRAY['Describe the structure of a virus', 'Explain viral reproduction', 'Give examples of viral diseases']),
    ('eds00007-0005-0000-0000-000000000001', v_topic_id, 'Adaptation and Natural Selection', 'adaptation-natural-selection', 'How organisms adapt to their environment; natural selection and evolution.', 5, ARRAY['Describe structural and behavioural adaptations', 'Explain natural selection', 'Describe Darwin''s theory of evolution']),
    ('eds00007-0006-0000-0000-000000000001', v_topic_id, 'Biodiversity and Conservation', 'biodiversity-conservation', 'Importance of biodiversity; threats to species; conservation strategies.', 6, ARRAY['Define biodiversity', 'Describe threats to biodiversity', 'Evaluate conservation methods']);

  -- Topic 2: Structures and Functions in Living Organisms
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00002-0000-0000-0000-000000000002', 'ed000001-0000-0000-0000-000000000002', 'Structures and Functions in Living Organisms', 'structures-and-functions', 'Cell biology, molecules, enzymes, digestion, transport and respiration.', 2, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00008-0001-0000-0000-000000000001', v_topic_id, 'Cell Structure and Organisation', 'cell-structure-organisation', 'Plant and animal cell organelles; tissues, organs and organ systems.', 1, ARRAY['Identify and state functions of organelles', 'Compare plant and animal cells', 'Explain levels of organisation']),
    ('eds00008-0002-0000-0000-000000000001', v_topic_id, 'Biological Molecules and Enzymes', 'biological-molecules-enzymes', 'Carbohydrates, proteins, lipids; enzyme action, pH, temperature and denaturation.', 2, ARRAY['Describe functions of biological molecules', 'Explain enzyme action', 'Describe factors affecting enzyme activity']),
    ('eds00008-0003-0000-0000-000000000001', v_topic_id, 'Nutrition and Digestion', 'nutrition-digestion', 'Balanced diet; human digestive system; absorption; assimilation.', 3, ARRAY['Describe the human digestive system', 'Explain nutrient absorption', 'Describe consequences of nutritional deficiency']),
    ('eds00008-0004-0000-0000-000000000001', v_topic_id, 'Transport in Humans', 'transport-in-humans', 'Blood, heart, blood vessels; components of blood and their functions; double circulation.', 4, ARRAY['Describe the structure of the heart', 'Compare arteries, veins and capillaries', 'Describe components and functions of blood']),
    ('eds00008-0005-0000-0000-000000000001', v_topic_id, 'Respiration', 'respiration', 'Aerobic and anaerobic respiration; ATP; oxygen debt; fermentation.', 5, ARRAY['Write equations for aerobic and anaerobic respiration', 'Explain the role of ATP', 'Describe oxygen debt and fermentation']),
    ('eds00008-0006-0000-0000-000000000001', v_topic_id, 'Gas Exchange and Breathing', 'gas-exchange-breathing', 'Structure of lungs; alveoli adaptations; breathing mechanism; gas exchange in plants.', 6, ARRAY['Describe the structure of the lungs', 'Explain adaptations of alveoli', 'Describe the breathing mechanism']);

  -- Topic 3: Nervous System and Homeostasis
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00002-0000-0000-0000-000000000003', 'ed000001-0000-0000-0000-000000000002', 'Nervous System and Homeostasis', 'nervous-system-homeostasis', 'Nervous system, hormones, homeostasis, excretion and drugs.', 3, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00009-0001-0000-0000-000000000001', v_topic_id, 'The Nervous System', 'nervous-system', 'Neurones, synapses, reflex arcs; sensory, relay and motor neurones.', 1, ARRAY['Describe the structure of a motor neurone', 'Explain a reflex arc', 'Describe transmission at a synapse']),
    ('eds00009-0002-0000-0000-000000000001', v_topic_id, 'The Brain and Sense Organs', 'brain-sense-organs', 'Regions of the brain; structure of the eye and ear.', 2, ARRAY['Describe functions of brain regions', 'Describe the structure of the eye', 'Explain how the eye focuses']),
    ('eds00009-0003-0000-0000-000000000001', v_topic_id, 'Hormones and the Endocrine System', 'hormones-endocrine', 'Glands and hormones; comparison of nervous and hormonal communication; menstrual cycle.', 3, ARRAY['Name key endocrine glands and their hormones', 'Compare nervous and hormonal communication', 'Explain the menstrual cycle']),
    ('eds00009-0004-0000-0000-000000000001', v_topic_id, 'Homeostasis — Blood Glucose and Temperature', 'homeostasis', 'Negative feedback; blood glucose regulation by insulin and glucagon; thermoregulation.', 4, ARRAY['Explain negative feedback', 'Describe blood glucose regulation', 'Explain thermoregulation']),
    ('eds00009-0005-0000-0000-000000000001', v_topic_id, 'Excretion and the Kidney', 'excretion-kidney', 'Kidney structure; ultrafiltration; selective reabsorption; osmoregulation; ADH.', 5, ARRAY['Describe kidney structure', 'Explain ultrafiltration and selective reabsorption', 'Explain the role of ADH']),
    ('eds00009-0006-0000-0000-000000000001', v_topic_id, 'Drugs and Medicine', 'drugs-medicine', 'Effects of drugs on the nervous system; antibiotics; immunisation.', 6, ARRAY['Describe effects of drugs on the body', 'Explain how antibiotics work', 'Explain active and passive immunity']);

  -- Topic 4: Reproduction and Inheritance
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00002-0000-0000-0000-000000000004', 'ed000001-0000-0000-0000-000000000002', 'Reproduction and Inheritance', 'reproduction-inheritance', 'Cell division, reproduction, genetics, variation and genetic technology.', 4, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00010-0001-0000-0000-000000000001', v_topic_id, 'Cell Division — Mitosis and Meiosis', 'mitosis-meiosis', 'Stages and roles of mitosis; meiosis and genetic variation; comparison of the two.', 1, ARRAY['Describe stages of mitosis', 'Explain the role of meiosis', 'Compare mitosis and meiosis']),
    ('eds00010-0002-0000-0000-000000000001', v_topic_id, 'Sexual Reproduction in Humans', 'human-reproduction', 'Male and female reproductive systems; fertilisation; development; contraception.', 2, ARRAY['Describe human reproductive systems', 'Explain fertilisation and development', 'Describe methods of contraception']),
    ('eds00010-0003-0000-0000-000000000001', v_topic_id, 'Sexual Reproduction in Plants', 'plant-reproduction', 'Flower structure; pollination; fertilisation; seed and fruit formation; dispersal.', 3, ARRAY['Describe flower structure', 'Distinguish self- and cross-pollination', 'Describe fertilisation and seed dispersal']),
    ('eds00010-0004-0000-0000-000000000001', v_topic_id, 'Genetics and Inheritance', 'genetics-inheritance', 'DNA, genes, alleles; monohybrid crosses; dominant/recessive; sex-linked traits; pedigrees.', 4, ARRAY['Explain dominant and recessive alleles', 'Construct genetic cross diagrams', 'Interpret pedigree charts']),
    ('eds00010-0005-0000-0000-000000000001', v_topic_id, 'Variation and Evolution', 'variation-evolution', 'Continuous and discontinuous variation; mutation; natural selection; evidence for evolution.', 5, ARRAY['Distinguish types of variation', 'Explain mutation as a source of variation', 'Describe evidence for evolution']),
    ('eds00010-0006-0000-0000-000000000001', v_topic_id, 'Genetic Engineering and Ethics', 'genetic-engineering', 'Recombinant DNA technology; GM crops; cloning; ethical considerations.', 6, ARRAY['Describe genetic engineering techniques', 'Evaluate uses of GM crops', 'Discuss ethical implications of genetic technologies']);

  -- Topic 5: Ecology and the Environment
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00002-0000-0000-0000-000000000005', 'ed000001-0000-0000-0000-000000000002', 'Ecology and the Environment', 'ecology-environment', 'Ecosystems, energy flow, nutrient cycles, human impact and conservation.', 5, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00011-0001-0000-0000-000000000001', v_topic_id, 'Ecosystems and Food Webs', 'ecosystems-food-webs', 'Biotic and abiotic factors; food chains and webs; trophic levels; population dynamics.', 1, ARRAY['Define ecosystem, habitat and population', 'Construct and interpret food webs', 'Explain how populations change']),
    ('eds00011-0002-0000-0000-000000000001', v_topic_id, 'Energy Flow and Efficiency', 'energy-flow-efficiency', 'Energy transfer between trophic levels; pyramids of biomass and energy; efficiency calculations.', 2, ARRAY['Explain energy losses between trophic levels', 'Calculate energy transfer efficiency', 'Draw and interpret ecological pyramids']),
    ('eds00011-0003-0000-0000-000000000001', v_topic_id, 'The Carbon Cycle', 'carbon-cycle', 'Photosynthesis, respiration, combustion and decomposition in the carbon cycle.', 3, ARRAY['Describe the carbon cycle', 'Explain the role of each process', 'Link the carbon cycle to climate change']),
    ('eds00011-0004-0000-0000-000000000001', v_topic_id, 'The Nitrogen Cycle', 'nitrogen-cycle', 'Nitrogen fixation, nitrification, denitrification; role of bacteria in the nitrogen cycle.', 4, ARRAY['Describe the nitrogen cycle', 'Explain the roles of different bacteria', 'Link the nitrogen cycle to agriculture']),
    ('eds00011-0005-0000-0000-000000000001', v_topic_id, 'Human Impact and Climate Change', 'human-impact-climate', 'Deforestation, pollution, habitat destruction, climate change, ocean acidification.', 5, ARRAY['Describe human impacts on ecosystems', 'Explain causes and effects of climate change', 'Describe ocean acidification']),
    ('eds00011-0006-0000-0000-000000000001', v_topic_id, 'Conservation and Sustainability', 'conservation-sustainability', 'Conservation methods, sustainable use of resources, CITES, seed banks.', 6, ARRAY['Describe conservation methods', 'Evaluate the effectiveness of conservation', 'Explain sustainable resource use']);

  -- Topic 6: Use of Biological Resources
  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00002-0000-0000-0000-000000000006', 'ed000001-0000-0000-0000-000000000002', 'Use of Biological Resources', 'biological-resources', 'Food production, selective breeding, GM, microorganisms and biotechnology.', 6, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00012-0001-0000-0000-000000000001', v_topic_id, 'Crop Production and Fertilisers', 'crop-production', 'Fertilisers, pesticides, biological pest control, greenhouse growing, hydroponics.', 1, ARRAY['Explain the use of fertilisers', 'Describe biological pest control', 'Compare intensive and organic farming']),
    ('eds00012-0002-0000-0000-000000000001', v_topic_id, 'Livestock and Fish Farming', 'livestock-fish-farming', 'Factory farming, fish farming, efficiency of food production.', 2, ARRAY['Describe factory farming methods', 'Explain fish farming', 'Evaluate efficiency of food production']),
    ('eds00012-0003-0000-0000-000000000001', v_topic_id, 'Selective Breeding', 'selective-breeding', 'Process and examples of selective breeding in plants and animals.', 3, ARRAY['Explain the process of selective breeding', 'Give examples in agriculture', 'Evaluate benefits and risks']),
    ('eds00012-0004-0000-0000-000000000001', v_topic_id, 'Genetic Modification in Agriculture', 'gm-agriculture', 'Producing GM crops; insulin production; golden rice; ethical debate.', 4, ARRAY['Describe how GM crops are produced', 'Explain insulin production via GM bacteria', 'Evaluate GM technology']),
    ('eds00012-0005-0000-0000-000000000001', v_topic_id, 'Microorganisms in Food and Medicine', 'microorganisms-food-medicine', 'Yeast in fermentation; bacteria in yoghurt; penicillin; industrial fermenters.', 5, ARRAY['Explain yeast fermentation', 'Describe yoghurt production', 'Explain industrial production of penicillin']),
    ('eds00012-0006-0000-0000-000000000001', v_topic_id, 'Biotechnology and Future Applications', 'biotechnology-future', 'Stem cells, tissue culture, cloning, bioremediation and future technologies.', 6, ARRAY['Explain stem cell technology', 'Describe plant tissue culture', 'Evaluate future biotechnology applications']);

END $$;

-- ============================================================
-- CHEMISTRY — 6 topics × 6 subtopics
-- ============================================================

DO $$
DECLARE v_topic_id UUID;
BEGIN

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00003-0000-0000-0000-000000000001', 'ed000001-0000-0000-0000-000000000003', 'Principles of Chemistry', 'principles-of-chemistry', 'States of matter, atomic structure, periodic table, bonding, equations and moles.', 1, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00013-0001-0000-0000-000000000001', v_topic_id, 'States of Matter and Particle Model', 'states-of-matter', 'Solid, liquid, gas properties; changes of state; diffusion; Brownian motion.', 1, ARRAY['Describe properties of states using particle model', 'Explain changes of state', 'Describe diffusion and Brownian motion']),
    ('eds00013-0002-0000-0000-000000000001', v_topic_id, 'Atomic Structure', 'atomic-structure', 'Protons, neutrons, electrons; atomic number; mass number; isotopes; relative atomic mass.', 2, ARRAY['Describe atomic structure', 'Define atomic number and mass number', 'Explain isotopes and relative atomic mass']),
    ('eds00013-0003-0000-0000-000000000001', v_topic_id, 'The Periodic Table', 'periodic-table', 'Historical development; periods and groups; electron configuration; periodicity.', 3, ARRAY['Describe structure of the periodic table', 'Write electron configurations', 'Explain periodic trends']),
    ('eds00013-0004-0000-0000-000000000001', v_topic_id, 'Chemical Bonding', 'chemical-bonding', 'Ionic bonding; covalent bonding; metallic bonding; structures and properties.', 4, ARRAY['Draw dot-and-cross diagrams for ionic and covalent bonding', 'Explain metallic bonding', 'Link bonding to physical properties']),
    ('eds00013-0005-0000-0000-000000000001', v_topic_id, 'Formulae, Equations and Calculations', 'formulae-equations', 'Writing and balancing equations; state symbols; moles; molar mass; reacting masses.', 5, ARRAY['Write and balance chemical equations', 'Calculate moles from mass', 'Perform reacting mass calculations']),
    ('eds00013-0006-0000-0000-000000000001', v_topic_id, 'Titrations and Concentration', 'titrations-concentration', 'Molarity; titration procedure; neutralisation calculations; percentage yield; atom economy.', 6, ARRAY['Calculate concentration in mol/dm³', 'Describe a titration procedure', 'Calculate percentage yield and atom economy']);

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00003-0000-0000-0000-000000000002', 'ed000001-0000-0000-0000-000000000003', 'Chemistry of the Elements', 'chemistry-of-elements', 'Groups 1, 7 and 0, transition metals, reactivity series, acids, bases and redox.', 2, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00014-0001-0000-0000-000000000001', v_topic_id, 'Group 1 — Alkali Metals', 'group-1-alkali-metals', 'Properties and reactions of Li, Na, K; trends down the group.', 1, ARRAY['Describe physical properties of Group 1', 'Describe reactions with water and oxygen', 'Explain trends down Group 1']),
    ('eds00014-0002-0000-0000-000000000001', v_topic_id, 'Group 7 — Halogens', 'group-7-halogens', 'Properties, reactions and displacement reactions of F, Cl, Br, I; trends down Group 7.', 2, ARRAY['Describe properties of halogens', 'Explain halogen displacement reactions', 'Explain trends down Group 7']),
    ('eds00014-0003-0000-0000-000000000001', v_topic_id, 'Group 0 and Transition Metals', 'group-0-transition-metals', 'Noble gas properties and uses; transition metal properties, catalysts and coloured ions.', 3, ARRAY['Explain why noble gases are unreactive', 'Describe uses of noble gases', 'Describe properties of transition metals']),
    ('eds00014-0004-0000-0000-000000000001', v_topic_id, 'Reactivity Series and Metal Reactions', 'reactivity-series', 'Order of reactivity; reactions with water, acids and oxygen; displacement reactions.', 4, ARRAY['Order metals by reactivity', 'Predict products of metal reactions', 'Explain displacement reactions']),
    ('eds00014-0005-0000-0000-000000000001', v_topic_id, 'Acids, Bases and Salts', 'acids-bases-salts', 'pH; strong and weak acids; neutralisation; salt preparation methods; precipitation.', 5, ARRAY['Define acids and bases using pH', 'Describe methods of salt preparation', 'Explain precipitation reactions']),
    ('eds00014-0006-0000-0000-000000000001', v_topic_id, 'Redox Reactions', 'redox-reactions', 'Oxidation and reduction; oxidation states; half-equations; identifying oxidising/reducing agents.', 6, ARRAY['Define oxidation and reduction', 'Assign oxidation states', 'Write half-equations']);

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00003-0000-0000-0000-000000000003', 'ed000001-0000-0000-0000-000000000003', 'Organic Chemistry', 'organic-chemistry', 'Hydrocarbons, functional groups, reactions and polymers.', 3, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00015-0001-0000-0000-000000000001', v_topic_id, 'Introduction and Alkanes', 'intro-alkanes', 'Homologous series; naming alkanes; combustion; substitution reactions.', 1, ARRAY['Name and draw alkanes', 'Describe complete and incomplete combustion', 'Explain free radical substitution']),
    ('eds00015-0002-0000-0000-000000000001', v_topic_id, 'Alkenes and Addition Reactions', 'alkenes-addition', 'Structure of alkenes; addition reactions with H₂, Br₂, HBr, H₂O; test for alkenes.', 2, ARRAY['Describe the structure of alkenes', 'Explain addition reactions', 'Test for alkenes using bromine water']),
    ('eds00015-0003-0000-0000-000000000001', v_topic_id, 'Crude Oil and Fractional Distillation', 'crude-oil-distillation', 'Formation of crude oil; fractional distillation; fractions and their uses; cracking.', 3, ARRAY['Describe fractional distillation of crude oil', 'Explain the uses of fractions', 'Describe thermal cracking']),
    ('eds00015-0004-0000-0000-000000000001', v_topic_id, 'Alcohols and Carboxylic Acids', 'alcohols-carboxylic-acids', 'Structure and properties of alcohols; oxidation; fermentation; esters from esterification.', 4, ARRAY['Describe properties of alcohols', 'Explain fermentation', 'Describe esterification']),
    ('eds00015-0005-0000-0000-000000000001', v_topic_id, 'Polymers', 'polymers', 'Addition polymerisation; condensation polymerisation; nylon; polyester; environmental issues.', 5, ARRAY['Describe addition polymerisation', 'Explain condensation polymerisation', 'Evaluate environmental impacts of polymers']),
    ('eds00015-0006-0000-0000-000000000001', v_topic_id, 'Analysis of Organic Compounds', 'organic-analysis', 'Mass spectrometry; infrared spectroscopy; chromatography; functional group tests.', 6, ARRAY['Interpret mass spectra', 'Use infrared spectroscopy to identify functional groups', 'Describe tests for organic functional groups']);

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00003-0000-0000-0000-000000000004', 'ed000001-0000-0000-0000-000000000003', 'Physical Chemistry', 'physical-chemistry', 'Energetics, reaction rates, equilibrium and electrochemistry.', 4, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00016-0001-0000-0000-000000000001', v_topic_id, 'Energetics and Bond Enthalpies', 'energetics-bond-enthalpies', 'Exothermic and endothermic reactions; bond energies; energy profile diagrams; Hess''s law.', 1, ARRAY['Distinguish exo- and endothermic reactions', 'Calculate energy change from bond energies', 'Draw energy profile diagrams']),
    ('eds00016-0002-0000-0000-000000000001', v_topic_id, 'Rates of Reaction', 'rates-of-reaction', 'Collision theory; effect of concentration, temperature, surface area, catalysts.', 2, ARRAY['Explain collision theory', 'Describe how each factor affects rate', 'Calculate rate from experimental data']),
    ('eds00016-0003-0000-0000-000000000001', v_topic_id, 'Reversible Reactions and Equilibrium', 'reversible-equilibrium', 'Dynamic equilibrium; Le Chatelier''s principle; Kc; Haber and Contact processes.', 3, ARRAY['Define dynamic equilibrium', 'Apply Le Chatelier''s principle', 'Explain industrial compromise conditions']),
    ('eds00016-0004-0000-0000-000000000001', v_topic_id, 'Electrochemistry and Electrolysis', 'electrochemistry-electrolysis', 'Electrolytic cells; predicting electrode products; industrial electrolysis of brine.', 4, ARRAY['Explain electrolysis', 'Predict electrode products', 'Describe electrolysis of brine']),
    ('eds00016-0005-0000-0000-000000000001', v_topic_id, 'Electrochemical Cells and Fuel Cells', 'electrochemical-cells', 'Galvanic cells; hydrogen fuel cells; advantages and disadvantages.', 5, ARRAY['Describe how a galvanic cell works', 'Explain hydrogen fuel cells', 'Evaluate fuel cell technology']),
    ('eds00016-0006-0000-0000-000000000001', v_topic_id, 'Water Chemistry and Solutions', 'water-chemistry', 'Solubility; temporary and permanent hardness; water treatment; tests for ions in solution.', 6, ARRAY['Explain water hardness', 'Describe water treatment stages', 'Perform tests for common ions']);

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00003-0000-0000-0000-000000000005', 'ed000001-0000-0000-0000-000000000003', 'Chemistry in Society', 'chemistry-in-society', 'Metal extraction, industrial processes, pollution and sustainability.', 5, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00017-0001-0000-0000-000000000001', v_topic_id, 'Extraction of Metals', 'extraction-of-metals', 'Reduction by carbon; electrolytic extraction; recycling; choice of method and reactivity.', 1, ARRAY['Explain extraction by carbon reduction', 'Describe extraction of aluminium', 'Evaluate recycling of metals']),
    ('eds00017-0002-0000-0000-000000000001', v_topic_id, 'The Haber Process', 'haber-process', 'Industrial synthesis of ammonia; conditions; economic and environmental considerations.', 2, ARRAY['Describe the Haber process conditions', 'Explain the compromise conditions', 'Evaluate environmental impact of ammonia production']),
    ('eds00017-0003-0000-0000-000000000001', v_topic_id, 'The Contact Process and Fertilisers', 'contact-process-fertilisers', 'Production of sulfuric acid; NPK fertilisers; eutrophication.', 3, ARRAY['Describe the Contact process', 'Explain NPK fertiliser production', 'Describe eutrophication']),
    ('eds00017-0004-0000-0000-000000000001', v_topic_id, 'Air Pollution and the Atmosphere', 'air-pollution', 'Composition of air; pollutants from combustion; acid rain; ozone depletion; greenhouse effect.', 4, ARRAY['Describe sources of air pollutants', 'Explain acid rain formation', 'Explain the enhanced greenhouse effect']),
    ('eds00017-0005-0000-0000-000000000001', v_topic_id, 'Green Chemistry and Sustainability', 'green-chemistry', 'Atom economy; waste minimisation; renewable feedstocks; lifecycle assessment.', 5, ARRAY['Calculate atom economy', 'Explain principles of green chemistry', 'Evaluate sustainability of industrial processes']),
    ('eds00017-0006-0000-0000-000000000001', v_topic_id, 'Plastics and Materials', 'plastics-materials', 'Properties and uses of plastics; biodegradable polymers; composite materials; smart materials.', 6, ARRAY['Describe properties of plastics', 'Explain biodegradable polymers', 'Evaluate materials for given applications']);

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00003-0000-0000-0000-000000000006', 'ed000001-0000-0000-0000-000000000003', 'Quantitative Chemistry and Analysis', 'quantitative-chemistry-analysis', 'Mole calculations, empirical formulae, gas volumes and analytical techniques.', 6, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00018-0001-0000-0000-000000000001', v_topic_id, 'Empirical and Molecular Formulae', 'empirical-molecular-formulae', 'Calculating empirical formulae from masses and percentages; molecular formula from Mr.', 1, ARRAY['Calculate empirical formula', 'Determine molecular formula from empirical formula', 'Calculate percentage composition']),
    ('eds00018-0002-0000-0000-000000000001', v_topic_id, 'Mole Calculations', 'mole-calculations', 'Moles from mass, volume and concentration; limiting reagents; excess calculations.', 2, ARRAY['Calculate moles from mass and Mr', 'Identify limiting reagents', 'Calculate theoretical yield']),
    ('eds00018-0003-0000-0000-000000000001', v_topic_id, 'Gas Volume Calculations', 'gas-volume-calculations', 'Molar volume at RTP; calculating volumes of gases in reactions.', 3, ARRAY['Use molar volume at RTP', 'Calculate volumes of gases from equations', 'Apply the ideal gas equation']),
    ('eds00018-0004-0000-0000-000000000001', v_topic_id, 'Flame Tests and Precipitate Tests', 'flame-precipitate-tests', 'Identifying metal cations by flame tests; identifying anions by precipitation.', 4, ARRAY['Perform and interpret flame tests', 'Describe tests for common anions', 'Identify gases by chemical tests']),
    ('eds00018-0005-0000-0000-000000000001', v_topic_id, 'Chromatography', 'chromatography', 'Paper and thin-layer chromatography; Rf values; HPLC and GC overview.', 5, ARRAY['Explain paper chromatography', 'Calculate Rf values', 'Describe uses of chromatography']),
    ('eds00018-0006-0000-0000-000000000001', v_topic_id, 'Instrumental Analysis', 'instrumental-analysis', 'Mass spectrometry for isotopes and Mr; infrared spectroscopy for functional groups.', 6, ARRAY['Interpret mass spectra for relative atomic mass', 'Use infrared spectra to identify bonds', 'Explain advantages of instrumental analysis']);

END $$;

-- ============================================================
-- PHYSICS — 6 topics × 6 subtopics
-- ============================================================

DO $$
DECLARE v_topic_id UUID;
BEGIN

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00004-0000-0000-0000-000000000001', 'ed000001-0000-0000-0000-000000000004', 'Forces and Motion', 'forces-and-motion', 'Kinematics, Newton''s laws, momentum, work, power and energy.', 1, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00019-0001-0000-0000-000000000001', v_topic_id, 'Speed, Velocity and Acceleration', 'speed-velocity-acceleration', 'Scalar vs vector; distance-time and velocity-time graphs; equations of motion.', 1, ARRAY['Distinguish speed and velocity', 'Interpret motion graphs', 'Apply equations of motion']),
    ('eds00019-0002-0000-0000-000000000001', v_topic_id, 'Newton''s Laws of Motion', 'newtons-laws', 'Newton''s three laws; resultant force; inertia; F = ma; free body diagrams.', 2, ARRAY['State Newton''s three laws', 'Apply F = ma', 'Draw and interpret free body diagrams']),
    ('eds00019-0003-0000-0000-000000000001', v_topic_id, 'Momentum and Impulse', 'momentum-impulse', 'Momentum; conservation of momentum; impulse; Newton''s second law in terms of momentum.', 3, ARRAY['Calculate momentum', 'Apply conservation of momentum to collisions', 'Explain impulse and relate to F = Δp/Δt']),
    ('eds00019-0004-0000-0000-000000000001', v_topic_id, 'Work, Energy and Power', 'work-energy-power', 'Work done; kinetic and potential energy; conservation of energy; power; efficiency.', 4, ARRAY['Calculate work done', 'Apply kinetic and gravitational potential energy equations', 'Calculate power and efficiency']),
    ('eds00019-0005-0000-0000-000000000001', v_topic_id, 'Friction, Drag and Terminal Velocity', 'friction-drag-terminal', 'Friction forces; air resistance; resultant forces during falling; terminal velocity.', 5, ARRAY['Describe friction and drag forces', 'Explain terminal velocity', 'Interpret velocity-time graphs with drag']),
    ('eds00019-0006-0000-0000-000000000001', v_topic_id, 'Forces in Balance and Turning Effects', 'forces-balance-turning', 'Resultant forces; equilibrium; moments; centre of gravity; pressure.', 6, ARRAY['Calculate resultant forces', 'Apply the principle of moments', 'Calculate pressure in solids, liquids and gases']);

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00004-0000-0000-0000-000000000002', 'ed000001-0000-0000-0000-000000000004', 'Electricity and Magnetism', 'electricity-magnetism', 'Circuits, electrical quantities, electrostatics, magnetism and electromagnetism.', 2, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00020-0001-0000-0000-000000000001', v_topic_id, 'Current, Voltage and Resistance', 'current-voltage-resistance', 'Ohm''s law; I-V characteristics; resistance in series and parallel.', 1, ARRAY['Apply Ohm''s law', 'Describe I-V characteristics of components', 'Calculate resistance in series and parallel']),
    ('eds00020-0002-0000-0000-000000000001', v_topic_id, 'Electrical Power and Energy', 'electrical-power-energy', 'Power; energy; cost of electricity; kilowatt-hours; fuses and circuit breakers.', 2, ARRAY['Calculate electrical power', 'Calculate electrical energy in joules and kWh', 'Calculate electricity cost']),
    ('eds00020-0003-0000-0000-000000000001', v_topic_id, 'Mains Electricity and Safety', 'mains-safety', 'AC vs DC; UK mains supply; three-pin plug; earthing; RCDs; double insulation.', 3, ARRAY['Distinguish AC and DC', 'Describe wiring of a three-pin plug', 'Explain safety devices in mains circuits']),
    ('eds00020-0004-0000-0000-000000000001', v_topic_id, 'Electrostatics', 'electrostatics', 'Charging by friction; electric fields; applications and dangers of static electricity.', 4, ARRAY['Explain charging by friction', 'Describe electric field patterns', 'Describe applications and dangers of static']),
    ('eds00020-0005-0000-0000-000000000001', v_topic_id, 'Magnetism and Electromagnetism', 'magnetism-electromagnetism', 'Magnetic fields; electromagnets; motor effect; left-hand rule; DC motor.', 5, ARRAY['Draw magnetic field patterns', 'Explain the motor effect', 'Describe how a DC motor works']),
    ('eds00020-0006-0000-0000-000000000001', v_topic_id, 'Induction and Transformers', 'induction-transformers', 'Electromagnetic induction; generators; transformers; National Grid.', 6, ARRAY['Explain electromagnetic induction', 'Describe AC generators', 'Apply the transformer equation']);

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00004-0000-0000-0000-000000000003', 'ed000001-0000-0000-0000-000000000004', 'Waves and the EM Spectrum', 'waves-em-spectrum', 'Wave properties, sound, light, optics and the electromagnetic spectrum.', 3, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00021-0001-0000-0000-000000000001', v_topic_id, 'Wave Properties', 'wave-properties', 'Amplitude, wavelength, frequency, period, wave speed; transverse vs longitudinal.', 1, ARRAY['Define wave properties', 'Apply the wave speed equation', 'Distinguish transverse and longitudinal waves']),
    ('eds00021-0002-0000-0000-000000000001', v_topic_id, 'Sound Waves', 'sound-waves', 'Compression waves; pitch and loudness; speed of sound; echoes; ultrasound uses.', 2, ARRAY['Describe how sound travels', 'Relate pitch and loudness to wave properties', 'Describe uses of ultrasound']),
    ('eds00021-0003-0000-0000-000000000001', v_topic_id, 'Reflection and Refraction of Light', 'reflection-refraction', 'Law of reflection; refraction and Snell''s law; total internal reflection; critical angle.', 3, ARRAY['Apply the law of reflection', 'Apply Snell''s law', 'Explain total internal reflection']),
    ('eds00021-0004-0000-0000-000000000001', v_topic_id, 'Lenses and Optical Devices', 'lenses-optics', 'Converging and diverging lenses; ray diagrams; real and virtual images; optical fibres.', 4, ARRAY['Draw ray diagrams for lenses', 'Describe real and virtual images', 'Explain optical fibre communication']),
    ('eds00021-0005-0000-0000-000000000001', v_topic_id, 'The Electromagnetic Spectrum', 'em-spectrum', 'Regions of the EM spectrum; properties; uses and dangers of each region.', 5, ARRAY['List EM spectrum regions in order', 'Describe uses of each region', 'Explain dangers of high-frequency radiation']),
    ('eds00021-0006-0000-0000-000000000001', v_topic_id, 'Wave Behaviour and Applications', 'wave-behaviour', 'Diffraction; interference; resonance; seismic waves; medical imaging.', 6, ARRAY['Explain diffraction', 'Describe constructive and destructive interference', 'Explain uses of seismic waves']);

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00004-0000-0000-0000-000000000004', 'ed000001-0000-0000-0000-000000000004', 'Energy and Thermal Physics', 'energy-thermal-physics', 'Energy stores, thermal energy transfer, heat capacity, and energy resources.', 4, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00022-0001-0000-0000-000000000001', v_topic_id, 'Energy Stores and Transfers', 'energy-stores-transfers', 'Types of energy stores; energy transfers; Sankey diagrams; conservation of energy.', 1, ARRAY['List energy stores', 'Draw Sankey diagrams', 'Apply conservation of energy']),
    ('eds00022-0002-0000-0000-000000000001', v_topic_id, 'Conduction, Convection and Radiation', 'conduction-convection-radiation', 'Mechanisms of thermal energy transfer; conductors and insulators; applications.', 2, ARRAY['Explain conduction, convection and radiation', 'Describe practical applications', 'Evaluate insulation materials']),
    ('eds00022-0003-0000-0000-000000000001', v_topic_id, 'Specific Heat Capacity and Latent Heat', 'specific-heat-latent', 'Specific heat capacity equation; latent heat; heating and cooling curves.', 3, ARRAY['Apply the specific heat capacity equation', 'Explain latent heat', 'Interpret heating and cooling curves']),
    ('eds00022-0004-0000-0000-000000000001', v_topic_id, 'Non-Renewable Energy', 'non-renewable-energy', 'Fossil fuels; nuclear fission; how power stations work; environmental impacts.', 4, ARRAY['Describe how fossil fuel power stations work', 'Explain nuclear fission', 'Evaluate environmental impacts of non-renewables']),
    ('eds00022-0005-0000-0000-000000000001', v_topic_id, 'Renewable Energy', 'renewable-energy', 'Solar, wind, hydroelectric, tidal, wave, geothermal; comparing energy sources.', 5, ARRAY['Describe how renewable sources generate electricity', 'Evaluate advantages and disadvantages', 'Compare energy sources']),
    ('eds00022-0006-0000-0000-000000000001', v_topic_id, 'Efficiency and the National Grid', 'efficiency-national-grid', 'Calculating efficiency; reducing energy waste; role of the National Grid.', 6, ARRAY['Calculate efficiency', 'Explain how to reduce energy waste', 'Describe the National Grid']);

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00004-0000-0000-0000-000000000005', 'ed000001-0000-0000-0000-000000000004', 'Matter and Pressure', 'matter-and-pressure', 'Density, kinetic theory, gas laws, changes of state and hydraulics.', 5, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00023-0001-0000-0000-000000000001', v_topic_id, 'Density and Pressure', 'density-pressure', 'Calculating density; pressure in solids and fluids; atmospheric pressure.', 1, ARRAY['Calculate density', 'Calculate pressure in fluids', 'Explain atmospheric pressure']),
    ('eds00023-0002-0000-0000-000000000001', v_topic_id, 'Kinetic Theory', 'kinetic-theory', 'Particle model for all three states; Brownian motion; diffusion; evaporation.', 2, ARRAY['Explain states of matter using particle model', 'Describe Brownian motion', 'Explain diffusion and evaporation']),
    ('eds00023-0003-0000-0000-000000000001', v_topic_id, 'Gas Laws', 'gas-laws', 'Boyle''s law; Charles'' law; pressure law; combined gas law; absolute zero.', 3, ARRAY['Apply Boyle''s, Charles'' and pressure laws', 'Use the combined gas law', 'Explain absolute zero']),
    ('eds00023-0004-0000-0000-000000000001', v_topic_id, 'Changes of State and Latent Heat', 'changes-of-state', 'Melting, boiling, condensation, sublimation; specific latent heat calculations.', 4, ARRAY['Describe changes of state', 'Calculate energy for changes of state', 'Interpret heating curves']),
    ('eds00023-0005-0000-0000-000000000001', v_topic_id, 'Hydraulics and Upthrust', 'hydraulics-upthrust', 'Pascal''s principle; hydraulic systems; upthrust; Archimedes'' principle; floating.', 5, ARRAY['Explain Pascal''s principle', 'Describe hydraulic systems', 'Apply Archimedes'' principle']),
    ('eds00023-0006-0000-0000-000000000001', v_topic_id, 'Properties of Materials', 'properties-of-materials', 'Elastic and plastic deformation; Hooke''s law; stress, strain; spring constant.', 6, ARRAY['Apply Hooke''s law', 'Distinguish elastic and plastic deformation', 'Calculate spring constants']);

  INSERT INTO topics (id, subject_id, name, slug, description, order_index, subtopic_count)
  VALUES ('edt00004-0000-0000-0000-000000000006', 'ed000001-0000-0000-0000-000000000004', 'Atomic Physics and Space', 'atomic-physics-space', 'Nuclear model, radiation, half-life, fission, fusion and astrophysics.', 6, 6)
  RETURNING id INTO v_topic_id;
  INSERT INTO subtopics (id, topic_id, name, slug, description, order_index, learning_objectives) VALUES
    ('eds00024-0001-0000-0000-000000000001', v_topic_id, 'Atomic Structure and the Nuclear Model', 'atomic-nuclear-model', 'Development of the atomic model from Thomson to Rutherford; nuclear notation.', 1, ARRAY['Describe the development of the atomic model', 'Explain the nuclear model', 'Use nuclear notation']),
    ('eds00024-0002-0000-0000-000000000001', v_topic_id, 'Types of Radiation', 'types-of-radiation', 'Alpha, beta and gamma: properties, penetration, ionisation; detection.', 2, ARRAY['Describe properties of alpha, beta and gamma', 'Compare penetrating and ionising power', 'Write nuclear decay equations']),
    ('eds00024-0003-0000-0000-000000000001', v_topic_id, 'Radioactive Decay and Half-Life', 'radioactive-decay-half-life', 'Random nature of decay; half-life; decay curves; uses of radioactive isotopes.', 3, ARRAY['Define half-life', 'Calculate remaining activity from half-life', 'Describe uses of radioactive isotopes']),
    ('eds00024-0004-0000-0000-000000000001', v_topic_id, 'Nuclear Fission, Fusion and Safety', 'fission-fusion-safety', 'Fission chain reactions; nuclear reactors; fusion; radiation safety and background.', 4, ARRAY['Explain nuclear fission and chain reactions', 'Describe nuclear fusion', 'Explain radiation safety measures']),
    ('eds00024-0005-0000-0000-000000000001', v_topic_id, 'The Solar System and Orbits', 'solar-system-orbits', 'Planets, moons, comets; gravitational force; circular orbital motion.', 5, ARRAY['Describe the solar system', 'Explain gravitational orbits', 'Calculate orbital speed']),
    ('eds00024-0006-0000-0000-000000000001', v_topic_id, 'Stars, Galaxies and the Big Bang', 'stars-galaxies-big-bang', 'Life cycle of stars; galaxies; red-shift; CMB radiation; evidence for the Big Bang.', 6, ARRAY['Describe the life cycle of stars', 'Explain red-shift as evidence for expansion', 'Describe evidence for the Big Bang']);

END $$;

-- ============================================================
-- Update topic counts in subjects table
-- ============================================================
UPDATE subjects SET topic_count = 6 WHERE exam_board = 'edexcel';

-- ============================================================
-- Verification
-- ============================================================
SELECT s.name, s.exam_board,
  COUNT(DISTINCT t.id) AS topics,
  COUNT(DISTINCT st.id) AS subtopics
FROM subjects s
LEFT JOIN topics t ON t.subject_id = s.id
LEFT JOIN subtopics st ON st.topic_id = t.id
WHERE s.exam_board = 'edexcel'
GROUP BY s.name, s.exam_board
ORDER BY s.name;
