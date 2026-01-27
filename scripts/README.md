# Revision City - Content Generation Scripts

Automated content generation for IGCSE subjects using Claude AI.

## Overview

These scripts automate the 7-step manual process of creating educational content:

**Manual Process (2-3 hours per subject):**
1. Check existing subtopics in database
2. Generate content manually
3. Create SQL import file
4. Copy/paste into Supabase SQL Editor
5. Run query
6. Update topic subtopic_count
7. Clear Next.js cache and restart

**Automated Process (hands-off):**
```bash
npm run generate chemistry
# Done! ✨
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Check Current Status
```bash
npm run db:status
```

### 3. Generate Content for One Subject
```bash
npm run generate chemistry
```

### 4. Import to Supabase

**Option A: Manual Import (Recommended)**
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/waqvyqpomedcejrkoikl/sql
2. Copy contents of generated SQL file from `generated-sql/` folder
3. Paste into SQL Editor
4. Click "Run"

**Option B: Direct Import (Experimental)**
```bash
node scripts/import-sql-to-supabase.js generated-sql/chemistry-*.sql
```

### 5. Validate Import
```bash
npm run validate chemistry
```

### 6. Clear Cache & Restart
```bash
rm -rf .next
npm run dev
```

## Scripts

### 📝 generate-subject-content.js

Generates complete IGCSE content for a subject.

**Usage:**
```bash
node scripts/generate-subject-content.js chemistry
node scripts/generate-subject-content.js computer-science

# Use npm alias:
npm run generate chemistry
```

**What it does:**
- Queries database for existing topics/subtopics
- Generates content using Claude AI:
  - 1 comprehensive note (800-1000 words) per subtopic
  - 8 flashcards (progressive difficulty)
  - 10 quiz questions with explanations
  - 5 practice questions with mark schemes
  - 4 active recall prompts
- Creates SQL file in `generated-sql/` directory

**Time:** ~1-2 hours per subject (depending on number of subtopics)

---

### 📦 import-to-supabase.js

Helps import generated SQL to Supabase.

**Usage:**
```bash
node scripts/import-to-supabase.js generated-sql/chemistry-import-*.sql
```

**What it does:**
- Provides instructions for manual import
- Shows SQL file path
- Updates subtopic counts after import
- Provides verification command

**Note:** Manual import via Supabase SQL Editor is recommended for reliability.

---

### ✅ validate-content.js

Quality assurance - checks all content is complete.

**Usage:**
```bash
npm run validate                    # All subjects
npm run validate chemistry          # One subject
npm run validate --detailed         # Show all issues
```

**What it does:**
- Checks all subtopics have complete content
- Verifies counts (8 flashcards, 10 quiz questions, etc.)
- Shows completion percentage per subject
- Generates missing content report

**Example output:**
```
📊 CONTENT VALIDATION REPORT
════════════════════════════════════════════════════════════════════════════════

✅ Chemistry
   Progress: 5/5 subtopics (100%)
   📖 Atomic Structure: ✅ 5/5 (100%)

⚠️  Computer Science
   Progress: 0/12 subtopics (0%)
   📖 Programming: ❌ 0/6 (0%)
```

---

### 🚀 batch-generate-all.js

Process multiple subjects automatically.

**Usage:**
```bash
npm run generate:batch                          # All remaining subjects
npm run generate:batch -- --subjects=chemistry,physics
npm run generate:batch -- --resume             # Resume from failures
```

**What it does:**
- Checks which subjects need content
- Generates all subjects in sequence
- Shows progress and time estimates
- Updates subtopic counts after each subject
- Saves progress (can resume if interrupted)
- Clears Next.js cache at the end

**Time:** ~2-3 hours per subject × 7 subjects = 14-21 hours total

**Features:**
- ✅ Progress tracking
- ✅ Resume from failures
- ✅ Time estimates
- ✅ Automatic cache clearing

---

### 📊 check-db.js

Quick database status check.

**Usage:**
```bash
npm run db:status
```

**What it does:**
- Lists all subjects
- Shows topic and subtopic counts
- Indicates which subjects have content (✅) vs need content (❌)

---

## Content Standards

All generated content follows Cambridge IGCSE standards:

### Notes (1 per subtopic)
- 800-1000 words
- Markdown formatted with headings
- Key concepts with examples
- Common exam questions
- Common mistakes to avoid
- 5-8 key takeaway points

### Flashcards (8 per subtopic)
- Progressive difficulty: 3 easy, 3 medium, 2 hard
- Mix of types:
  - Definition cards
  - Explanation cards
  - Application cards
  - Comparison cards

### Quiz Questions (10 per subtopic)
- 7 multiple choice (4 options)
- 3 true/false
- All include detailed explanations
- Difficulty: 3 easy, 5 medium, 2 hard

### Practice Questions (5 per subtopic)
- 2 short answer (2-3 marks)
- 2 medium (4-6 marks)
- 1 extended (8-10 marks)
- Complete mark schemes
- Model answers

### Active Recall Prompts (4 per subtopic)
- Open-ended questions
- 3 hints per prompt
- Comprehensive model answers (100-150 words)
- Key points checklist

## Workflow

### For One Subject

```bash
# 1. Check current status
npm run db:status

# 2. Generate content
npm run generate chemistry

# 3. Import to Supabase (use SQL Editor)
# Open: https://supabase.com/dashboard/project/waqvyqpomedcejrkoikl/sql
# Copy/paste from: generated-sql/chemistry-import-*.sql

# 4. Validate
npm run validate chemistry

# 5. Clear cache and test
rm -rf .next && npm run dev
```

### For All Subjects

```bash
# 1. Check which subjects need content
npm run db:status

# 2. Run batch generation
npm run generate:batch

# 3. Import each SQL file to Supabase
# (manually import all files from generated-sql/)

# 4. Validate all content
npm run validate

# 5. Clear cache and launch
rm -rf .next && npm run dev
```

## Subjects

**Complete (4/11):**
- ✅ Biology
- ✅ Chemistry (partial - only Atomic Structure)
- ✅ Mathematics
- ✅ Physics

**Need Content (7/11):**
- ❌ Business Studies
- ❌ Computer Science
- ❌ Economics
- ❌ English Language
- ❌ English Literature
- ❌ Geography
- ❌ History (partial structure exists)

## File Structure

```
scripts/
├── generate-subject-content.js  # Main content generator
├── import-to-supabase.js        # Import helper
├── validate-content.js          # Quality assurance
├── batch-generate-all.js        # Batch processor
├── check-db.js                  # Status checker
└── README.md                    # This file

generated-sql/                   # Generated SQL files
├── chemistry-import-*.sql
├── physics-import-*.sql
└── ...
```

## Troubleshooting

### "Subject not found"
Make sure the subject exists in database and use the correct slug:
```bash
npm run db:status  # See available subjects
```

### "No topics found"
The subject needs topics/subtopics structure first. Check database.

### Generation fails partway through
Use resume mode:
```bash
npm run generate:batch -- --resume
```

### Import fails
- Use manual import via Supabase SQL Editor (most reliable)
- Check SQL file for syntax errors
- Ensure subtopics exist in database

### Content validation shows missing items
Re-run generation for that subject:
```bash
npm run generate <subject>
```

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://waqvyqpomedcejrkoikl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
ANTHROPIC_API_KEY=<your-api-key>
```

## Cost Estimates

Using Claude 3.5 Sonnet:
- ~$0.50-1.00 per subtopic
- ~$5-10 per subject (10-20 subtopics avg)
- ~$35-70 for all 7 remaining subjects

## Tips

1. **Start with one subject** to test the workflow
2. **Review generated SQL** before importing
3. **Use validation** to ensure complete content
4. **Import during low traffic** (SQL imports can be slow)
5. **Keep generated SQL files** as backups

## Support

Issues? Check:
1. Environment variables are set
2. Database connection works
3. Claude API key is valid
4. Supabase service role key has correct permissions

For questions, review the main project README or check the database schema in `supabase/schema.sql`.
