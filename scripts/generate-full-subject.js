#!/usr/bin/env node

/**
 * GENERATE FULL SUBJECT - Complete Content Generation System
 *
 * Generates complete subject structure with topics, subtopics, and ALL educational content
 *
 * Usage: node scripts/generate-full-subject.js <subject-name>
 * Example: node scripts/generate-full-subject.js chemistry
 *
 * Outputs: Complete SQL file ready for import
 */

require('dotenv').config({ path: '.env.local' });
const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const { jsonrepair } = require('jsonrepair');
const fs = require('fs');
const path = require('path');

// Verify API key is loaded
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ERROR: ANTHROPIC_API_KEY not found in environment');
  console.error('   Make sure .env.local file exists with ANTHROPIC_API_KEY');
  process.exit(1);
}

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Cambridge IGCSE subject curriculum structure
const SUBJECT_CURRICULA = {
  mathematics: {
    topics: [
      { name: 'Number', description: 'Number systems, operations, and properties' },
      { name: 'Algebra and Graphs', description: 'Algebraic expressions, equations, and graphical representations' },
      { name: 'Coordinate Geometry', description: 'Points, lines, and shapes on coordinate planes' },
      { name: 'Geometry', description: 'Properties of shapes, angles, and transformations' },
      { name: 'Mensuration', description: 'Area, volume, and measurements' },
      { name: 'Trigonometry', description: 'Ratios, identities, and applications' },
      { name: 'Vectors and Transformations', description: 'Vector operations and geometric transformations' },
      { name: 'Probability', description: 'Chance, outcomes, and statistical probability' },
      { name: 'Statistics', description: 'Data collection, representation, and analysis' }
    ]
  },
  biology: {
    topics: [
      { name: 'Characteristics and Classification of Living Organisms', description: 'Features and organization of life' },
      { name: 'Organisation and Maintenance of Organisms', description: 'Cell structure, nutrition, and transport' },
      { name: 'Movement In and Out of Cells', description: 'Diffusion, osmosis, and active transport' },
      { name: 'Biological Molecules', description: 'Carbohydrates, proteins, lipids, and enzymes' },
      { name: 'Enzymes', description: 'Biological catalysts and their applications' },
      { name: 'Plant Nutrition', description: 'Photosynthesis and mineral requirements' },
      { name: 'Human Nutrition', description: 'Diet, digestion, and absorption' },
      { name: 'Transport in Plants', description: 'Xylem, phloem, and transpiration' },
      { name: 'Transport in Animals', description: 'Circulatory system and blood' },
      { name: 'Diseases and Immunity', description: 'Pathogens, defense mechanisms, and immunity' },
      { name: 'Gas Exchange', description: 'Breathing and respiration systems' },
      { name: 'Respiration', description: 'Aerobic and anaerobic cellular respiration' },
      { name: 'Excretion', description: 'Removal of metabolic waste' },
      { name: 'Coordination and Response', description: 'Nervous and hormonal systems' },
      { name: 'Reproduction', description: 'Sexual and asexual reproduction' },
      { name: 'Inheritance', description: 'Genes, chromosomes, and genetic variation' },
      { name: 'Variation and Selection', description: 'Natural selection and evolution' },
      { name: 'Organisms and Environment', description: 'Ecosystems, food chains, and nutrient cycles' },
      { name: 'Biotechnology and Genetic Engineering', description: 'Applications of biological science' },
      { name: 'Human Influences on Ecosystems', description: 'Conservation and environmental impact' }
    ]
  },
  chemistry: {
    topics: [
      { name: 'The Particulate Nature of Matter', description: 'States of matter and kinetic particle theory' },
      { name: 'Experimental Techniques', description: 'Separation methods and laboratory skills' },
      { name: 'Atoms, Elements and Compounds', description: 'Atomic structure and chemical bonding' },
      { name: 'Stoichiometry', description: 'Chemical formulae, equations, and calculations' },
      { name: 'Electricity and Chemistry', description: 'Electrolysis and electrochemical cells' },
      { name: 'Chemical Energetics', description: 'Energy changes in reactions' },
      { name: 'Chemical Reactions', description: 'Types of reactions and their applications' },
      { name: 'Acids, Bases and Salts', description: 'Properties, reactions, and pH' },
      { name: 'The Periodic Table', description: 'Element organization and periodic trends' },
      { name: 'Metals', description: 'Properties, extraction, and reactivity' },
      { name: 'Air and Water', description: 'Composition, pollution, and treatment' },
      { name: 'Sulfur', description: 'Properties and industrial importance' },
      { name: 'Carbonates', description: 'Properties and thermal decomposition' },
      { name: 'Organic Chemistry', description: 'Hydrocarbons, alcohols, and carboxylic acids' }
    ]
  },
  physics: {
    topics: [
      { name: 'General Physics', description: 'Measurements, motion, and forces' },
      { name: 'Thermal Physics', description: 'Temperature, heat transfer, and thermal properties' },
      { name: 'Properties of Waves', description: 'Wave characteristics and behaviors' },
      { name: 'Light', description: 'Reflection, refraction, and optical instruments' },
      { name: 'Sound', description: 'Sound waves and acoustic phenomena' },
      { name: 'Electromagnetic Spectrum', description: 'Types of electromagnetic radiation' },
      { name: 'Electricity and Magnetism', description: 'Circuits, electric fields, and magnetic effects' },
      { name: 'Atomic Physics', description: 'Radioactivity and nuclear energy' }
    ]
  },
  'computer-science': {
    topics: [
      { name: 'Data Representation', description: 'Binary, hexadecimal, and data storage' },
      { name: 'Data Transmission', description: 'Networks, protocols, and communication methods' },
      { name: 'Hardware and Software', description: 'Computer components and system software' },
      { name: 'The Internet and its Uses', description: 'Web technologies and online services' },
      { name: 'Automated and Emerging Technologies', description: 'AI, robotics, and new developments' },
      { name: 'Algorithm Design and Problem-solving', description: 'Computational thinking and algorithms' },
      { name: 'Programming', description: 'Code structure, variables, and control flow' },
      { name: 'Databases', description: 'Data modeling, SQL, and database management' },
      { name: 'Boolean Logic', description: 'Logic gates and truth tables' }
    ]
  },
  economics: {
    topics: [
      { name: 'The Basic Economic Problem', description: 'Scarcity, choice, and opportunity cost' },
      { name: 'The Allocation of Resources', description: 'Market and planned economies' },
      { name: 'Microeconomic Decision Makers', description: 'Consumers, workers, and firms' },
      { name: 'Government and the Macroeconomy', description: 'Economic objectives and policies' },
      { name: 'Economic Development', description: 'Standards of living and development indicators' },
      { name: 'International Trade and Globalisation', description: 'Trade patterns and global economics' }
    ]
  },
  english: {
    topics: [
      { name: 'Reading Comprehension', description: 'Understanding and analyzing texts' },
      { name: 'Summary Writing', description: 'Identifying and condensing key information' },
      { name: 'Directed Writing', description: 'Purpose, audience, and format-specific writing' },
      { name: 'Composition Writing', description: 'Narrative and descriptive essays' },
      { name: 'Grammar and Vocabulary', description: 'Sentence structure and word choice' },
      { name: 'Punctuation and Spelling', description: 'Correct usage and conventions' }
    ]
  },
  geography: {
    topics: [
      { name: 'Population and Settlement', description: 'Demographics and urbanization' },
      { name: 'The Natural Environment', description: 'Climate, ecosystems, and landforms' },
      { name: 'Earthquakes and Volcanoes', description: 'Tectonic hazards and their impacts' },
      { name: 'Rivers', description: 'River processes and landforms' },
      { name: 'Coasts', description: 'Coastal processes and management' },
      { name: 'Weather', description: 'Atmospheric conditions and patterns' },
      { name: 'Economic Development', description: 'Development indicators and strategies' },
      { name: 'Food Production', description: 'Agriculture and food security' },
      { name: 'Industry', description: 'Manufacturing and service sectors' },
      { name: 'Tourism', description: 'Tourism impacts and management' },
      { name: 'Energy', description: 'Energy resources and sustainability' },
      { name: 'Water', description: 'Water supply and management' },
      { name: 'Environmental Risks', description: 'Pollution and conservation' }
    ]
  },
  history: {
    topics: [
      { name: 'The First World War', description: 'Causes, events, and consequences 1914-1918' },
      { name: 'The Treaty of Versailles', description: 'Peace settlement and its impact' },
      { name: 'The League of Nations', description: 'International cooperation and failures' },
      { name: 'The Russian Revolution', description: 'Fall of Tsarism and rise of communism' },
      { name: 'Germany 1918-1945', description: 'Weimar Republic and Nazi Germany' },
      { name: 'The USA 1919-1941', description: 'Boom, Depression, and New Deal' },
      { name: 'The Second World War', description: 'Causes, events, and impact 1939-1945' },
      { name: 'The Cold War', description: 'Superpower tensions and conflicts' }
    ]
  },
  'business-studies': {
    topics: [
      { name: 'Understanding Business Activity', description: 'Purpose and types of businesses' },
      { name: 'People in Business', description: 'Recruitment, training, and motivation' },
      { name: 'Marketing', description: 'Market research and the marketing mix' },
      { name: 'Operations Management', description: 'Production methods and quality control' },
      { name: 'Financial Information and Decisions', description: 'Costs, revenue, and financial statements' },
      { name: 'External Influences on Business', description: 'Economic, legal, and environmental factors' }
    ]
  },
  ict: {
    topics: [
      { name: 'Types and Components of Computer Systems', description: 'Hardware, software, and systems' },
      { name: 'Input and Output Devices', description: 'Peripherals and their uses' },
      { name: 'Storage Devices and Media', description: 'Primary, secondary, and tertiary storage' },
      { name: 'Networks and the Effects of Using Them', description: 'Network types and internet technologies' },
      { name: 'The Effects of Using IT', description: 'Social, economic, and ethical implications' },
      { name: 'ICT Applications', description: 'Specialized systems and software' },
      { name: 'The Systems Life Cycle', description: 'Analysis, design, and implementation' },
      { name: 'Safety and Security', description: 'Data protection and cybersecurity' },
      { name: 'Audience', description: 'User needs and interface design' },
      { name: 'Communication', description: 'Email, video conferencing, and collaboration tools' }
    ]
  }
};

// Utility functions
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

function escapeSQLString(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

function toSQLArray(arr) {
  if (!arr || arr.length === 0) return 'ARRAY[]::text[]';
  const escaped = arr.map(item => `'${escapeSQLString(String(item))}'`);
  return `ARRAY[${escaped.join(', ')}]`;
}

function toSQLJSON(obj) {
  return `'${escapeSQLString(JSON.stringify(obj))}'::jsonb`;
}

function extractJSON(text) {
  // Try to find JSON in code blocks first
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Try to find raw JSON - look for complete JSON objects
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');

  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error('No JSON found in response');
  }

  const start = (firstBrace !== -1 && firstBracket !== -1)
    ? Math.min(firstBrace, firstBracket)
    : Math.max(firstBrace, firstBracket);

  // Extract from first brace/bracket to end
  let extracted = text.substring(start).trim();

  // Try to find the end of the JSON by balancing braces
  const startChar = extracted[0];
  const endChar = startChar === '{' ? '}' : ']';
  let depth = 0;
  let endIndex = -1;

  for (let i = 0; i < extracted.length; i++) {
    if (extracted[i] === startChar) depth++;
    if (extracted[i] === endChar) {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex > 0) {
    extracted = extracted.substring(0, endIndex + 1);
  }

  return extracted;
}

// ATTACK MODE: Retry wrapper with exponential backoff
async function retryWithBackoff(fn, maxRetries = 5, initialDelay = 2000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;

      // Check if it's a retryable error
      const isOverloaded = error.message && (error.message.includes('529') || error.message.includes('overloaded'));
      const isRateLimit = error.message && error.message.includes('429');
      const isRetryable = isOverloaded || isRateLimit;

      if (isLastAttempt || !isRetryable) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`⚠️  Attempt ${attempt + 1} failed (${error.message.substring(0, 100)}). Retrying in ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Helper to call Claude with retry logic
async function callClaude(prompt, maxTokens = 4000) {
  return retryWithBackoff(async () => {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });

    if (!response || !response.content || !response.content[0]) {
      throw new Error('Invalid API response');
    }

    // Add small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    return response.content[0].text;
  }, 5, 3000);
}

function repairJSON(jsonString) {
  // AGGRESSIVE JSON REPAIR - Claude Haiku keeps generating malformed JSON

  // Step 1: Remove ALL control characters (even if they break formatting)
  // This is aggressive but necessary for Haiku's output
  let repaired = jsonString.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');

  // Step 2: Fix multiple spaces
  repaired = repaired.replace(/\s+/g, ' ');

  // Step 3: Fix invalid escape sequences
  repaired = repaired.replace(/\\(?!["\\/bfnrtu])/g, '');

  // Step 4: Fix trailing commas
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  // Step 5: Ensure strings don't have unescaped quotes
  // This is a heuristic - replace \" that appear inside values
  // (Complex, but helps with malformed strings)

  return repaired;
}

function safeJSONParse(jsonString) {
  // ATTACK MODE: Use industrial-strength JSON repair library
  try {
    // Strategy 1: Parse as-is
    return JSON.parse(jsonString);
  } catch (e1) {
    try {
      // Strategy 2: Use jsonrepair library (fixes most issues)
      const repaired = jsonrepair(jsonString);
      return JSON.parse(repaired);
    } catch (e2) {
      try {
        // Strategy 3: Manual repair + jsonrepair
        let cleaned = repairJSON(jsonString);
        const repaired = jsonrepair(cleaned);
        return JSON.parse(repaired);
      } catch (e3) {
        // FAILED - log and throw
        console.error(`❌ JSON parsing failed after 3 attempts`);
        console.error('Error:', e3.message);
        console.error('First 300 chars:', jsonString.substring(0, 300));
        throw new Error(`JSON parsing failed: ${e3.message}`);
      }
    }
  }
}

// AI generation functions
async function generateTopicStructure(subjectName, existingTopics = []) {
  const curriculum = SUBJECT_CURRICULA[subjectName.toLowerCase().replace(/\s+/g, '-')];

  if (!curriculum) {
    throw new Error(`No curriculum defined for subject: ${subjectName}`);
  }

  // MVP MODE: Limit to first 3 topics only
  const MAX_TOPICS = 3;
  const limitedTopics = curriculum.topics.slice(0, MAX_TOPICS);

  console.log(`📚 Using predefined curriculum for ${subjectName}`);
  console.log(`   Topics to generate: ${limitedTopics.length} (MVP mode: limited to 3)`);

  // Filter out existing topics
  const existingTopicSlugs = new Set(existingTopics.map(t => t.slug));
  const topicsToGenerate = limitedTopics.filter(t => !existingTopicSlugs.has(slugify(t.name)));

  if (topicsToGenerate.length === 0) {
    console.log('✅ All topics already exist in database');
    return limitedTopics.map(t => ({
      name: t.name,
      slug: slugify(t.name),
      description: t.description,
      existing: existingTopicSlugs.has(slugify(t.name))
    }));
  }

  console.log(`   New topics to create: ${topicsToGenerate.length}`);

  return limitedTopics.map(t => ({
    name: t.name,
    slug: slugify(t.name),
    description: t.description,
    existing: existingTopicSlugs.has(slugify(t.name))
  }));
}

async function generateSubtopicsForTopic(subjectName, topicName, topicDescription) {
  console.log(`   🔍 Generating subtopics for: ${topicName}`);

  const prompt = `You are an expert Cambridge IGCSE ${subjectName} curriculum designer.

Generate EXACTLY 3 key subtopics for the topic "${topicName}" - ${topicDescription}.

Each subtopic should:
- Cover a specific, focused aspect of the topic
- Be appropriate for IGCSE level students
- Follow the Cambridge IGCSE syllabus standards
- Include 3-4 clear learning objectives

IMPORTANT: Generate exactly 3 subtopics, no more, no less.

Return ONLY valid JSON (no markdown, no code fences, no explanation):
{
  "subtopics": [
    {
      "name": "Subtopic name",
      "description": "Brief description of what this subtopic covers",
      "learning_objectives": [
        "First learning objective",
        "Second learning objective",
        "Third learning objective"
      ]
    }
  ]
}`;

  try {
    const responseText = await callClaude(prompt, 2000);
    const jsonText = extractJSON(responseText);
    const data = safeJSONParse(jsonText);

    // Add slugs
    const subtopics = data.subtopics.map(st => ({
      ...st,
      slug: slugify(st.name)
    }));

    console.log(`   ✅ Generated ${subtopics.length} subtopics`);
    return subtopics;

  } catch (error) {
    console.error(`   ❌ Error generating subtopics for ${topicName}:`, error.message);
    throw error;
  }
}

async function generateNotes(subjectName, topicName, subtopicName, learningObjectives) {
  const prompt = `You are an expert Cambridge IGCSE ${subjectName} teacher. Create comprehensive revision notes for the subtopic "${subtopicName}" within the topic "${topicName}".

Learning objectives:
${learningObjectives.map(obj => `- ${obj}`).join('\n')}

The notes should be:
- 800-1000 words of detailed content
- Written in clear, engaging markdown format
- Include all key concepts with clear explanations
- Provide real-world examples and applications
- Highlight common exam questions and approaches
- Include tips for remembering information
- Note common mistakes students make
- Use proper markdown formatting (headings, bold, lists, etc.)

Return ONLY valid JSON (no markdown code fences, no explanation):
{
  "title": "${subtopicName}",
  "content": "Full markdown content here...",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ]
}`;

  const responseText = await callClaude(prompt, 4000);
  const jsonText = extractJSON(responseText);
  return safeJSONParse(jsonText);
}

async function generateFlashcards(subjectName, topicName, subtopicName) {
  const prompt = `You are an expert Cambridge IGCSE ${subjectName} teacher. Create 8 flashcards for "${subtopicName}" in the topic "${topicName}".

Difficulty distribution:
- 3 easy flashcards (basic definitions and simple concepts)
- 3 medium flashcards (application and understanding)
- 2 hard flashcards (analysis and complex scenarios)

Each flashcard should:
- Have a clear, concise front (question/prompt)
- Have a detailed back (answer with explanation)
- Be exam-relevant
- Test different aspects of the subtopic

Return ONLY valid JSON (no markdown, no explanation):
{
  "flashcards": [
    {
      "front": "Question or prompt",
      "back": "Answer with explanation",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

  const responseText = await callClaude(prompt, 3000);
  const jsonText = extractJSON(responseText);
  return safeJSONParse(jsonText);
}

async function generateQuizQuestions(subjectName, topicName, subtopicName) {
  const prompt = `You are an expert Cambridge IGCSE ${subjectName} teacher. Create 10 quiz questions for "${subtopicName}" in the topic "${topicName}".

Question distribution:
- 7 multiple choice questions (4 options each)
- 3 true/false questions

Requirements:
- Questions should test understanding, not just memory
- Include detailed explanations for correct answers
- Vary difficulty: 3 easy, 5 medium, 2 hard
- Make distractors (wrong answers) plausible
- Base questions on common exam topics

Return ONLY valid JSON (no markdown, no explanation):
{
  "questions": [
    {
      "question": "The question text",
      "question_type": "multiple_choice|true_false",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The correct option text",
      "explanation": "Detailed explanation of why this is correct",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

  const responseText = await callClaude(prompt, 4000);
  const jsonText = extractJSON(responseText);
  return safeJSONParse(jsonText);
}

async function generatePracticeQuestions(subjectName, topicName, subtopicName) {
  const prompt = `You are an expert Cambridge IGCSE ${subjectName} examiner. Create 5 exam-style practice questions for "${subtopicName}" in the topic "${topicName}".

Requirements:
- Questions should mirror actual IGCSE exam format
- Include mark allocations (2-10 marks per question)
- Provide detailed mark schemes with point-by-point marking
- Include example answers showing what examiners look for
- Vary difficulty: 2 foundation, 2 higher, 1 extended
- Cover different command words (describe, explain, calculate, evaluate, etc.)

Return ONLY valid JSON (no markdown, no explanation):
{
  "questions": [
    {
      "question": "The exam question text",
      "marks": 6,
      "mark_scheme": [
        "First marking point (1 mark)",
        "Second marking point (1 mark)",
        "Third marking point (2 marks)",
        "Fourth marking point (2 marks)"
      ],
      "example_answer": "A full example answer that would achieve full marks",
      "difficulty": "foundation|higher|extended"
    }
  ]
}`;

  const responseText = await callClaude(prompt, 4000);
  const jsonText = extractJSON(responseText);
  return safeJSONParse(jsonText);
}

async function generateRecallPrompts(subjectName, topicName, subtopicName) {
  const prompt = `You are an expert Cambridge IGCSE ${subjectName} teacher specializing in active recall techniques. Create 4 active recall prompts for "${subtopicName}" in the topic "${topicName}".

Each prompt should:
- Encourage students to retrieve information from memory
- Include 2-3 helpful hints if students get stuck
- Provide a model answer showing the depth expected
- List 3-4 key points that must be included in a good answer
- Be open-ended enough to test real understanding

CRITICAL: Return ONLY valid, properly formatted JSON. No markdown, no explanation, no code blocks.
- Ensure all strings are properly quoted
- Escape any quotes inside strings with backslash
- No trailing commas
- All arrays and objects must be properly closed

{
  "prompts": [
    {
      "prompt": "The recall question or prompt",
      "hints": [
        "Hint 1 to guide thinking",
        "Hint 2 to guide thinking"
      ],
      "model_answer": "A comprehensive model answer",
      "key_points_to_include": [
        "Essential point 1",
        "Essential point 2",
        "Essential point 3"
      ]
    }
  ]
}`;

  const responseText = await callClaude(prompt, 3000);
  const jsonText = extractJSON(responseText);
  return safeJSONParse(jsonText);
}

async function generateAllContentForSubtopic(subjectName, topicName, subtopicName, learningObjectives) {
  console.log(`      📝 Generating content for: ${subtopicName}`);

  try {
    // Generate all content types with delays to respect rate limits
    console.log(`         - Notes...`);
    const notes = await generateNotes(subjectName, topicName, subtopicName, learningObjectives);
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`         - Flashcards...`);
    const flashcards = await generateFlashcards(subjectName, topicName, subtopicName);
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`         - Quiz questions...`);
    const quizQuestions = await generateQuizQuestions(subjectName, topicName, subtopicName);
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`         - Practice questions...`);
    const practiceQuestions = await generatePracticeQuestions(subjectName, topicName, subtopicName);
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`         - Recall prompts...`);
    const recallPrompts = await generateRecallPrompts(subjectName, topicName, subtopicName);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`      ✅ Content generation complete`);

    return {
      notes,
      flashcards: flashcards.flashcards,
      quizQuestions: quizQuestions.questions,
      practiceQuestions: practiceQuestions.questions,
      recallPrompts: recallPrompts.prompts
    };
  } catch (error) {
    console.error(`      ❌ Error generating content:`, error.message);
    throw error;
  }
}

// SQL generation
function generateSQL(subjectData, topicsData, allContent) {
  let sql = `-- Generated SQL for ${subjectData.name}\n`;
  sql += `-- Generated at: ${new Date().toISOString()}\n`;
  sql += `-- Total topics: ${topicsData.length}\n`;
  sql += `-- Total subtopics: ${allContent.length}\n\n`;

  sql += `-- ============================================\n`;
  sql += `-- SUBJECT: ${subjectData.name}\n`;
  sql += `-- ============================================\n\n`;

  // Generate for each topic
  topicsData.forEach((topic, topicIndex) => {
    const topicContent = allContent.filter(c => c.topicSlug === topic.slug);

    sql += `\n-- --------------------------------------------\n`;
    sql += `-- TOPIC ${topicIndex + 1}: ${topic.name}\n`;
    sql += `-- Subtopics: ${topicContent.length}\n`;
    sql += `-- --------------------------------------------\n\n`;

    // Insert topic if new
    if (!topic.existing) {
      sql += `-- Insert topic: ${topic.name}\n`;
      sql += `INSERT INTO topics (subject_id, name, slug, description, order_index, subtopic_count)\n`;
      sql += `SELECT id, '${escapeSQLString(topic.name)}', '${topic.slug}', '${escapeSQLString(topic.description)}', ${topicIndex}, ${topicContent.length}\n`;
      sql += `FROM subjects WHERE slug = '${subjectData.slug}'\n`;
      sql += `ON CONFLICT (subject_id, slug) DO UPDATE SET\n`;
      sql += `  name = EXCLUDED.name,\n`;
      sql += `  description = EXCLUDED.description,\n`;
      sql += `  order_index = EXCLUDED.order_index;\n\n`;
    }

    // Insert subtopics and content
    topicContent.forEach((content, subtopicIndex) => {
      const { subtopic, notes, flashcards, quizQuestions, practiceQuestions, recallPrompts } = content;

      sql += `-- Subtopic ${subtopicIndex + 1}: ${subtopic.name}\n`;
      sql += `INSERT INTO subtopics (topic_id, name, slug, description, order_index, learning_objectives)\n`;
      sql += `SELECT t.id, '${escapeSQLString(subtopic.name)}', '${subtopic.slug}', '${escapeSQLString(subtopic.description)}', ${subtopicIndex}, ${toSQLArray(subtopic.learning_objectives)}\n`;
      sql += `FROM topics t\n`;
      sql += `JOIN subjects s ON s.id = t.subject_id\n`;
      sql += `WHERE s.slug = '${subjectData.slug}' AND t.slug = '${topic.slug}'\n`;
      sql += `ON CONFLICT (topic_id, slug) DO UPDATE SET\n`;
      sql += `  name = EXCLUDED.name,\n`;
      sql += `  description = EXCLUDED.description,\n`;
      sql += `  order_index = EXCLUDED.order_index,\n`;
      sql += `  learning_objectives = EXCLUDED.learning_objectives;\n\n`;

      // Notes
      sql += `-- Notes for: ${subtopic.name}\n`;
      sql += `INSERT INTO notes (subtopic_id, title, content, key_points)\n`;
      sql += `SELECT st.id, '${escapeSQLString(notes.title)}', '${escapeSQLString(notes.content)}', ${toSQLArray(notes.key_points)}\n`;
      sql += `FROM subtopics st\n`;
      sql += `JOIN topics t ON t.id = st.topic_id\n`;
      sql += `JOIN subjects s ON s.id = t.subject_id\n`;
      sql += `WHERE s.slug = '${subjectData.slug}' AND t.slug = '${topic.slug}' AND st.slug = '${subtopic.slug}'\n`;
      sql += `ON CONFLICT (subtopic_id) DO UPDATE SET\n`;
      sql += `  title = EXCLUDED.title,\n`;
      sql += `  content = EXCLUDED.content,\n`;
      sql += `  key_points = EXCLUDED.key_points;\n\n`;

      // Flashcard set
      sql += `-- Flashcard set for: ${subtopic.name}\n`;
      sql += `INSERT INTO flashcard_sets (subtopic_id, name)\n`;
      sql += `SELECT st.id, '${escapeSQLString(subtopic.name)} - Flashcards'\n`;
      sql += `FROM subtopics st\n`;
      sql += `JOIN topics t ON t.id = st.topic_id\n`;
      sql += `JOIN subjects s ON s.id = t.subject_id\n`;
      sql += `WHERE s.slug = '${subjectData.slug}' AND t.slug = '${topic.slug}' AND st.slug = '${subtopic.slug}'\n`;
      sql += `ON CONFLICT (subtopic_id) DO NOTHING;\n\n`;

      // Flashcards
      flashcards.forEach((card, cardIndex) => {
        sql += `-- Flashcard ${cardIndex + 1}\n`;
        sql += `INSERT INTO flashcards (flashcard_set_id, subtopic_id, front, back, difficulty)\n`;
        sql += `SELECT fs.id, st.id, '${escapeSQLString(card.front)}', '${escapeSQLString(card.back)}', '${card.difficulty}'\n`;
        sql += `FROM flashcard_sets fs\n`;
        sql += `JOIN subtopics st ON st.id = fs.subtopic_id\n`;
        sql += `JOIN topics t ON t.id = st.topic_id\n`;
        sql += `JOIN subjects s ON s.id = t.subject_id\n`;
        sql += `WHERE s.slug = '${subjectData.slug}' AND t.slug = '${topic.slug}' AND st.slug = '${subtopic.slug}';\n\n`;
      });

      // Quiz
      sql += `-- Quiz for: ${subtopic.name}\n`;
      sql += `INSERT INTO quizzes (subtopic_id, name)\n`;
      sql += `SELECT st.id, '${escapeSQLString(subtopic.name)} - Quiz'\n`;
      sql += `FROM subtopics st\n`;
      sql += `JOIN topics t ON t.id = st.topic_id\n`;
      sql += `JOIN subjects s ON s.id = t.subject_id\n`;
      sql += `WHERE s.slug = '${subjectData.slug}' AND t.slug = '${topic.slug}' AND st.slug = '${subtopic.slug}'\n`;
      sql += `ON CONFLICT (subtopic_id) DO NOTHING;\n\n`;

      // Quiz questions
      quizQuestions.forEach((question, qIndex) => {
        const options = question.question_type === 'true_false'
          ? ['True', 'False']
          : question.options;

        sql += `-- Quiz question ${qIndex + 1}\n`;
        sql += `INSERT INTO quiz_questions (quiz_id, subtopic_id, question, question_type, options, correct_answer, explanation, difficulty)\n`;
        sql += `SELECT q.id, st.id, '${escapeSQLString(question.question)}', '${question.question_type}', ${toSQLJSON(options)}, '${escapeSQLString(question.correct_answer)}', '${escapeSQLString(question.explanation)}', '${question.difficulty}'\n`;
        sql += `FROM quizzes q\n`;
        sql += `JOIN subtopics st ON st.id = q.subtopic_id\n`;
        sql += `JOIN topics t ON t.id = st.topic_id\n`;
        sql += `JOIN subjects s ON s.id = t.subject_id\n`;
        sql += `WHERE s.slug = '${subjectData.slug}' AND t.slug = '${topic.slug}' AND st.slug = '${subtopic.slug}';\n\n`;
      });

      // Practice questions
      practiceQuestions.forEach((question, qIndex) => {
        sql += `-- Practice question ${qIndex + 1}\n`;
        sql += `INSERT INTO practice_questions (subtopic_id, question, marks, mark_scheme, example_answer, difficulty)\n`;
        sql += `SELECT st.id, '${escapeSQLString(question.question)}', ${question.marks}, ${toSQLArray(question.mark_scheme)}, '${escapeSQLString(question.example_answer)}', '${question.difficulty}'\n`;
        sql += `FROM subtopics st\n`;
        sql += `JOIN topics t ON t.id = st.topic_id\n`;
        sql += `JOIN subjects s ON s.id = t.subject_id\n`;
        sql += `WHERE s.slug = '${subjectData.slug}' AND t.slug = '${topic.slug}' AND st.slug = '${subtopic.slug}';\n\n`;
      });

      // Recall prompts
      recallPrompts.forEach((prompt, pIndex) => {
        sql += `-- Recall prompt ${pIndex + 1}\n`;
        sql += `INSERT INTO recall_prompts (subtopic_id, prompt, hints, model_answer, key_points_to_include)\n`;
        sql += `SELECT st.id, '${escapeSQLString(prompt.prompt)}', ${toSQLArray(prompt.hints)}, '${escapeSQLString(prompt.model_answer)}', ${toSQLArray(prompt.key_points_to_include)}\n`;
        sql += `FROM subtopics st\n`;
        sql += `JOIN topics t ON t.id = st.topic_id\n`;
        sql += `JOIN subjects s ON s.id = t.subject_id\n`;
        sql += `WHERE s.slug = '${subjectData.slug}' AND t.slug = '${topic.slug}' AND st.slug = '${subtopic.slug}';\n\n`;
      });
    });
  });

  // Update subtopic counts
  sql += `\n-- Update subtopic counts for all topics\n`;
  topicsData.forEach(topic => {
    const count = allContent.filter(c => c.topicSlug === topic.slug).length;
    sql += `UPDATE topics SET subtopic_count = ${count}\n`;
    sql += `WHERE id IN (\n`;
    sql += `  SELECT t.id FROM topics t\n`;
    sql += `  JOIN subjects s ON s.id = t.subject_id\n`;
    sql += `  WHERE s.slug = '${subjectData.slug}' AND t.slug = '${topic.slug}'\n`;
    sql += `);\n\n`;
  });

  return sql;
}

// Main execution
async function main() {
  const subjectName = process.argv[2];

  if (!subjectName) {
    console.error('❌ Error: Please provide a subject name');
    console.error('Usage: node generate-full-subject.js <subject-name>');
    console.error('Example: node generate-full-subject.js chemistry');
    process.exit(1);
  }

  const subjectSlug = slugify(subjectName);

  console.log('\n🚀 GENERATE FULL SUBJECT - Content Generation System');
  console.log('====================================================\n');
  console.log(`Subject: ${subjectName}`);
  console.log(`Slug: ${subjectSlug}\n`);

  try {
    // 1. Query database for subject info
    console.log('📊 Step 1: Querying database...');
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('*')
      .eq('slug', subjectSlug)
      .single();

    if (subjectError || !subject) {
      throw new Error(`Subject "${subjectName}" not found in database`);
    }

    console.log(`✅ Found subject: ${subject.name} (ID: ${subject.id})`);

    // Get existing topics
    const { data: existingTopics } = await supabase
      .from('topics')
      .select('name, slug, description')
      .eq('subject_id', subject.id);

    console.log(`   Existing topics: ${existingTopics?.length || 0}\n`);

    // 2. Generate topic structure
    console.log('📚 Step 2: Generating topic structure...');
    const topics = await generateTopicStructure(subjectName, existingTopics || []);
    console.log(`✅ Topics prepared: ${topics.length}\n`);

    // 3. Generate subtopics for each topic
    console.log('🔍 Step 3: Generating subtopics...');
    const allTopicsWithSubtopics = [];

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      console.log(`\n   Topic ${i + 1}/${topics.length}: ${topic.name}`);

      const subtopics = await generateSubtopicsForTopic(subjectName, topic.name, topic.description);
      allTopicsWithSubtopics.push({
        ...topic,
        subtopics
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const totalSubtopics = allTopicsWithSubtopics.reduce((sum, t) => sum + t.subtopics.length, 0);
    console.log(`\n✅ Total subtopics generated: ${totalSubtopics}\n`);

    // 4. Generate all content for each subtopic
    console.log('📝 Step 4: Generating educational content...');
    console.log(`   This will take approximately ${Math.ceil(totalSubtopics * 0.5)} minutes\n`);

    const allContent = [];
    let completed = 0;

    for (const topic of allTopicsWithSubtopics) {
      console.log(`\n   📖 Topic: ${topic.name} (${topic.subtopics.length} subtopics)`);

      for (const subtopic of topic.subtopics) {
        const content = await generateAllContentForSubtopic(
          subjectName,
          topic.name,
          subtopic.name,
          subtopic.learning_objectives
        );

        allContent.push({
          topicSlug: topic.slug,
          subtopic,
          ...content
        });

        completed++;
        const percent = Math.round((completed / totalSubtopics) * 100);
        console.log(`      Progress: ${completed}/${totalSubtopics} (${percent}%)\n`);
      }
    }

    console.log(`✅ All content generated!\n`);

    // 5. Generate SQL file
    console.log('💾 Step 5: Generating SQL file...');
    const sql = generateSQL(subject, allTopicsWithSubtopics, allContent);

    // Save to file
    const outputDir = path.join(process.cwd(), 'generated-sql');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `${subjectSlug}-full-${timestamp}.sql`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, sql, 'utf8');

    console.log(`✅ SQL file generated: ${filename}\n`);

    // 6. Summary
    console.log('📊 GENERATION SUMMARY');
    console.log('====================');
    console.log(`Subject: ${subject.name}`);
    console.log(`Topics: ${allTopicsWithSubtopics.length}`);
    console.log(`Subtopics: ${totalSubtopics}`);
    console.log(`Notes: ${allContent.length}`);
    console.log(`Flashcards: ${allContent.reduce((sum, c) => sum + c.flashcards.length, 0)}`);
    console.log(`Quiz Questions: ${allContent.reduce((sum, c) => sum + c.quizQuestions.length, 0)}`);
    console.log(`Practice Questions: ${allContent.reduce((sum, c) => sum + c.practiceQuestions.length, 0)}`);
    console.log(`Recall Prompts: ${allContent.reduce((sum, c) => sum + c.recallPrompts.length, 0)}`);
    console.log(`\nOutput file: generated-sql/${filename}`);
    console.log('\n✅ GENERATION COMPLETE!\n');
    console.log('Next steps:');
    console.log(`1. Review the SQL file: generated-sql/${filename}`);
    console.log(`2. Import to database: node scripts/import-to-database.js ${subjectSlug}`);
    console.log(`3. Validate completeness: node scripts/validate-completeness.js ${subjectSlug}\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
