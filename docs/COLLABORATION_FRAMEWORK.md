# 🤝 SYD CYBER - Collaboration Framework

**How Claudio (Clo) and Claude AI Work Together**

**Document Version**: 1.0
**Last Updated**: October 7, 2025

---

## 🎯 PURPOSE

This document defines **how we work together** on the SYD Cyber project. It establishes communication protocols, decision-making processes, and workflow patterns to maximize productivity and quality.

---

## 👥 TEAM STRUCTURE

### Current Team
- **Claudio (Clo)** - Project Owner, Developer, Decision Maker
- **Claude AI** - Development Partner, Technical Advisor, Implementation Assistant
- **BMAD Framework** - Optional structured workflow tool

### Roles & Responsibilities

#### Claudio's Role:
- ✅ **Final decision maker** on all technical and business choices
- ✅ **Product vision** and feature prioritization
- ✅ **Requirements definition** and user stories
- ✅ **Testing and validation** of features
- ✅ **Deployment approval**

#### Claude's Role:
- ✅ **Technical advisor** - Suggest best practices and solutions
- ✅ **Implementation partner** - Write code (frontend + backend)
- ✅ **Documentation creator** - Maintain comprehensive docs
- ✅ **Problem solver** - Debug issues and propose fixes
- ✅ **Knowledge base** - Answer technical questions

---

## 💬 COMMUNICATION PROTOCOLS

### 1. **How to Request Work**

#### ✅ GOOD Examples:
```
"Fix the ATECO integration - the backend module isn't connected to main.py"
"Add a loading spinner to the risk assessment page"
"Help me understand why the visura extraction isn't working"
```

#### ❌ AVOID:
```
"Fix the backend" (too vague)
"Make it better" (no clear goal)
"Do something with ATECO" (unclear what)
```

### 2. **Providing Context**

**Always include**:
- What you're trying to do
- What's not working (error messages, screenshots)
- What you've already tried
- Any relevant file paths

**Example**:
```
"I'm trying to upload a visura PDF but getting a 500 error.
Error: 'NoneType' object has no attribute 'extract_text'
File: /api/extract-visura endpoint
I tried uploading 3 different PDFs, all fail the same way."
```

---

## 🔄 WORKFLOW PATTERNS

### Pattern 1: Quick Fix (Simple Changes)

**When to use**: Bug fixes, small improvements, typos

**Process**:
```
1. You: Describe the issue
2. Claude: Analyzes and proposes fix
3. Claude: Implements the fix
4. You: Test and confirm
```

**Example**:
```
You: "The submit button is cut off on mobile"
Claude: *Analyzes CSS, fixes responsive styling*
You: "Looks good!"
```

**Time**: 5-15 minutes

---

### Pattern 2: Feature Development (Medium Complexity)

**When to use**: New features, significant changes

**Process**:
```
1. You: Describe desired feature
2. Claude: Asks clarifying questions
3. Claude: Proposes approach
4. You: Approve or adjust
5. Claude: Implements (frontend + backend if needed)
6. Claude: Updates documentation
7. You: Test and provide feedback
8. Claude: Iterates based on feedback
```

**Example**:
```
You: "Add ability to save assessments and reload them later"

Claude: "Should this save to database or localStorage?
        Do you want auto-save or manual save button?
        Should users see a history of saved assessments?"

You: "Database, manual save button, yes show history"

Claude: *Implements feature with all components*

You: "Works great, but can we add timestamps to the history?"

Claude: *Adds timestamps*
```

**Time**: 1-4 hours

---

### Pattern 3: Complex Project (High Complexity)

**When to use**: Major features, architectural changes, multiple related tasks

**Options**:

#### **Option A: Direct Work (Without BMAD)**
```
1. You: Describe the complex task
2. Claude: Creates todo list for tracking
3. Claude: Breaks down into sub-tasks
4. You: Approve the plan
5. Claude: Implements step-by-step
6. Claude: Updates progress in todo list
7. You: Review at milestones
8. Claude: Iterates until complete
```

#### **Option B: Structured Work (With BMAD)**
```
1. You: "Load the [appropriate agent]"
2. Agent: Guides through structured workflow
3. Agent: Produces documentation
4. You: Approve each phase
5. Agent: Implements systematically
6. Agent: Creates deliverables
```

**Example (Direct)**:
```
You: "Integrate the ATECO lookup module from ateco_lookup.py into main.py"

Claude: *Creates todo list:*
  1. Analyze ateco_lookup.py structure
  2. Plan integration approach
  3. Refactor as importable module
  4. Integrate into main.py
  5. Add endpoints
  6. Test with frontend
  7. Deploy

Claude: *Works through each item, marking complete as done*
```

**Example (BMAD)**:
```
You: "Load the Architect agent"

Architect: "Let's design the ATECO integration.
           I'll create a technical specification document
           following best practices..."

*Architect guides through design process*
*Creates detailed technical spec*
*Transitions to Developer for implementation*
```

**Time**: 1-3 days

---

## 🎯 DECISION-MAKING PROCESS

### Quick Decisions (No Documentation Needed)
- Variable names
- Component structure
- Styling details
- Minor refactoring

**Process**: Claude suggests, Clo approves or adjusts inline

---

### Important Decisions (Document with ADR)

**Examples**:
- Which database to use (PostgreSQL vs MongoDB)
- Authentication strategy
- API design changes
- Major architectural shifts

**Process**:
```
1. Claude: Identifies decision point
2. Claude: Presents options with pros/cons
3. Clo: Makes decision
4. Claude: Creates ADR (Architecture Decision Record)
5. Claude: Implements based on decision
```

**ADR Template**: See `docs/decisions/ADR-TEMPLATE.md`

**Example ADR**:
```markdown
# ADR-001: Use PostgreSQL for Data Persistence

## Status
Accepted

## Context
Need database for assessments, user data, risk events

## Decision
Use PostgreSQL (not MongoDB)

## Rationale
- Better for relational data (assessments have complex relationships)
- Railway offers easy PostgreSQL addon
- SQL is more familiar
- Better transaction support

## Consequences
- Need to learn SQLAlchemy ORM
- Migration scripts needed
- But: Better data integrity and querying
```

---

## 📝 DOCUMENTATION STANDARDS

### When to Update Docs

**Always document**:
- New features
- API changes
- Configuration changes
- Important decisions (ADRs)
- Deployment procedures

**Claude will**:
- Update relevant docs after significant changes
- Create new docs for new features
- Keep ROADMAP.md current

**Clo should**:
- Review documentation for accuracy
- Request clarifications if needed
- Approve major doc changes

---

## 🐛 DEBUGGING WORKFLOW

### When Something Breaks

**Process**:
```
1. Clo: Reports issue with details:
   - What you were doing
   - What happened vs what should happen
   - Error messages or screenshots
   - Steps to reproduce

2. Claude: Analyzes the issue
   - Reads relevant code
   - Identifies root cause
   - Proposes fix

3. Claude: Implements fix
   - Makes changes
   - Tests locally if possible
   - Explains what was fixed

4. Clo: Verifies fix works

5. Claude: Documents if needed
```

**Example**:
```
Clo: "Risk matrix isn't calculating correctly.
     When I rate a risk as High/High,
     it shows as 'Low Risk' in the matrix.

     Steps:
     1. Select Execution category
     2. Rate event 401 as:
        - Economic Impact: High
        - Non-economic Impact: High
        - Control: ++
     3. Matrix shows 'Low' (should be 'High')

     Screenshot attached."

Claude: *Reads risk calculation logic*
        *Finds bug in matrix positioning algorithm*
        *Fixes the calculation*
        *Tests with provided scenario*
        "Fixed! The issue was in line 234 of useRiskFlow.ts
         - the control factor was inverted."

Clo: *Tests* "Perfect, works now!"
```

---

## 🚀 DEPLOYMENT WORKFLOW

### Deployment Checklist

**Before Deploying**:
1. [ ] Feature tested locally
2. [ ] No console errors
3. [ ] Documentation updated
4. [ ] Environment variables checked
5. [ ] Breaking changes documented

**Deployment Process**:
```
1. Clo: "Ready to deploy [feature]"

2. Claude: Reviews checklist
   - Confirms everything ready
   - Highlights any risks

3. Clo: Confirms deployment

4. Claude: Provides deployment command or commits changes

5. Vercel/Railway: Auto-deploys

6. Clo: Verifies in production

7. Claude: Updates ROADMAP if needed
```

---

## 💡 BEST PRACTICES

### For Effective Collaboration

#### **Be Specific**
❌ "The app is slow"
✅ "The risk assessment page takes 5+ seconds to load after uploading visura"

#### **Ask Questions**
❌ Assume Claude knows what you want
✅ "I want to add export feature - should it be Excel, PDF, or both?"

#### **Provide Feedback**
❌ Silent if something doesn't work
✅ "That works, but can we make the button bigger?"

#### **Use Examples**
❌ "Make it look professional"
✅ "Make it look like [URL or screenshot]"

#### **Iterate**
❌ Expect perfection first try
✅ "Good start, now let's adjust X and Y"

---

## 🎓 LEARNING TOGETHER

### When Clo Learns Something New

**Share it!**
```
Clo: "I learned about React Server Components.
     Should we consider them for SYD?"

Claude: *Analyzes fit for project*
        *Explains pros/cons in our context*
        *Recommends yes/no with reasoning*
```

### When Claude Suggests New Approaches

**Claude will**:
- Explain why suggesting it
- Show examples
- Let Clo decide

**Clo can**:
- Ask for more details
- Try it on a small feature first
- Decline if not comfortable

---

## 🔧 USING BMAD (Optional)

### When to Use BMAD Agents

**Consider BMAD when**:
- Starting a new major feature
- Need structured planning
- Want documented process
- Complex multi-step task
- Learning new domain

**Skip BMAD when**:
- Quick fix needed
- Simple change
- Time is critical
- You know exactly what you want

### How to Activate BMAD

```
Clo: "Load the [Agent Name]"

Example:
"Load the Architect agent"
"I want to work with the Product Owner"
"Activate the Developer agent"
```

**See**: `docs/BMAD_COMPLETE_GUIDE.md` for full BMAD documentation

---

## 📊 PROGRESS TRACKING

### Todo Lists

For complex tasks, Claude will create todo lists:

```
✅ Completed task
🔄 In progress task
⏳ Pending task
```

This helps both of us track progress!

---

## 🎯 SUCCESS METRICS

### Good Collaboration Looks Like:

✅ Clear communication
✅ Quick iterations
✅ Learning together
✅ High-quality code
✅ Comprehensive documentation
✅ Shared understanding
✅ Mutual respect

### Red Flags:

❌ Confusion about goals
❌ Repeated mistakes
❌ Undocumented changes
❌ Broken features
❌ Communication breakdown

**If red flags appear**: Pause, clarify, and re-align!

---

## 🔄 FRAMEWORK UPDATES

This framework will evolve as we learn what works best.

**Update triggers**:
- Something repeatedly causes confusion
- New pattern emerges
- Better approach discovered
- Project phase changes

**Who updates**: Claude updates, Clo approves

---

## 📞 QUICK REFERENCE

### Starting a Work Session

```
1. Clo states what to work on
2. Claude confirms understanding
3. Work begins!
```

### Ending a Work Session

```
1. Claude summarizes what was done
2. Claude notes any follow-ups
3. Clo confirms or adds notes
```

### When Stuck

```
Clo: "I'm not sure how to proceed with [X]"
Claude: *Asks clarifying questions*
        *Proposes options*
        *Recommends approach*
Clo: Chooses path forward
```

---

## ✨ REMEMBER

**This is a partnership!**

- Clo brings: Vision, requirements, testing, decisions
- Claude brings: Technical expertise, implementation, documentation
- Together we build: SYD Cyber! 🚀

**Communication is key!**
- Ask questions
- Provide feedback
- Celebrate wins
- Learn from issues

**Stay flexible!**
- Adapt as needed
- Try new approaches
- Document what works
- Improve continuously

---

## 📚 RELATED DOCUMENTS

- [BMAD_COMPLETE_GUIDE.md](./BMAD_COMPLETE_GUIDE.md) - How to use BMAD agents
- [ROADMAP.md](./ROADMAP.md) - What we're building when
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Technical setup and procedures
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and structure

---

*This collaboration framework ensures Clo and Claude work together effectively to build amazing software!*

**Last Updated**: October 7, 2025
**Version**: 1.0
**Status**: Active
