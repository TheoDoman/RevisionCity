# Physics Complete Content Generation

This script generates comprehensive IGCSE Physics content for ALL subtopics in your database.

## What it generates

For each Physics subtopic (approximately 76 total):
- **1 Note**: 200-300 words of comprehensive IGCSE content
- **1 Flashcard Set**: 5-7 flashcards with questions and answers
- **1 Quiz**: 5 multiple-choice questions with explanations
- **10-15 Practice Questions**: Mix of easy, medium, and hard questions with detailed answers

## How to run

### Option 1: Using Python (Recommended)

```bash
cd "/Users/theodordoman/Downloads/revision-city 3"
python3 scripts/generate-physics-complete.py
```

The script will:
1. Fetch all Physics subtopics from Supabase
2. Generate content using Claude Haiku (cost-effective)
3. Output SQL to: `generated-sql/physics-complete-2026-01-25.sql`
4. Show progress for each subtopic

**Time estimate**: ~2-3 minutes for all subtopics (with 1 second delay between requests)

### Option 2: Using Node.js/TypeScript

```bash
cd "/Users/theodordoman/Downloads/revision-city 3"
npx tsx scripts/generate-physics-complete.ts
```

## After generation

1. The script creates: `/Users/theodordoman/Downloads/revision-city 3/generated-sql/physics-complete-2026-01-25.sql`

2. Open your Supabase dashboard:
   - Go to: https://waqvyqpomedcejrkoikl.supabase.co
   - Navigate to SQL Editor
   - Create a new query
   - Copy the entire contents of `physics-complete-2026-01-25.sql`
   - Paste and run

3. The SQL uses `ON CONFLICT` clauses to update existing content if it already exists

## SQL Structure

The generated SQL:
- Uses actual UUID values (not SELECT statements)
- Uses `ON CONFLICT (subtopic_id) DO UPDATE` for notes, flashcard_sets, and quizzes
- Uses `SELECT ... FROM ... WHERE subtopic_id = '...'` pattern for foreign key relationships
- Is ready to paste directly into Supabase SQL Editor

## Physics Topics Covered

Based on your database structure (from seed-data.ts):

1. **Motion** (6 subtopics)
   - Distance and Displacement
   - Speed and Velocity
   - Acceleration
   - Distance-Time Graphs
   - Velocity-Time Graphs
   - Equations of Motion

2. **Forces** (6 subtopics)
   - Types of Forces
   - Newton's Laws
   - Friction
   - Moments
   - Pressure
   - Pressure in Fluids

3. **Energy** (6 subtopics)
   - Forms of Energy
   - Energy Transfers
   - Work Done
   - Power
   - Efficiency
   - Energy Resources

4. **Thermal Physics** (5 subtopics)
   - Temperature
   - Thermal Expansion
   - Specific Heat Capacity
   - Latent Heat
   - Heat Transfer

5. **Waves** (6 subtopics)
   - Wave Properties
   - Reflection
   - Refraction
   - Total Internal Reflection
   - Sound Waves
   - Electromagnetic Spectrum

6. **Electricity** (6 subtopics)
   - Current and Charge
   - Voltage
   - Resistance
   - Series and Parallel Circuits
   - Electrical Power
   - Domestic Electricity

7. **Magnetism** (6 subtopics)
   - Magnets and Fields
   - Electromagnets
   - The Motor Effect
   - Electric Motors
   - Electromagnetic Induction
   - Transformers

8. **Radioactivity** (6 subtopics)
   - Atomic Structure
   - Radioactive Decay
   - Alpha, Beta, Gamma
   - Half-Life
   - Uses of Radiation
   - Nuclear Fission

**Total**: ~47 subtopics (may vary based on actual database)

## Troubleshooting

### If you get API errors:
- Check that your Anthropic API key is valid
- Ensure you have sufficient API credits
- The script uses Claude Haiku to minimize costs

### If subtopics are missing:
- Verify the Physics subject exists in your database
- Check that topics are properly linked to the Physics subject
- Run the seed script first if needed

### If SQL fails to execute:
- Check for any special characters that might need escaping
- Verify table names match your schema
- Ensure UUIDs are valid format

## Cost Estimate

Using Claude 3 Haiku:
- ~50 subtopics × 4 API calls each = 200 API calls
- Average ~1000 tokens per call
- Cost: ~$0.50 - $1.00 total

## Notes

- The script includes 1-second delays between API calls to avoid rate limits
- Content is generated fresh each time (not cached)
- Existing content is updated if subtopic_id matches
- All content is IGCSE-level appropriate
- Flashcards and questions use varied difficulty levels
