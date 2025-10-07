# 🧙 BMAD Complete User Guide
## Breakthrough Method of Agile AI-driven Development

**Author**: Claudio (Clo)
**Date**: October 7, 2025
**Version**: 1.0 - Beginner to Advanced Guide

---

## 📋 TABLE OF CONTENTS

1. [What is BMAD?](#what-is-bmad)
2. [Why Use BMAD?](#why-use-bmad)
3. [BMAD Core Concepts](#bmad-core-concepts)
4. [Getting Started](#getting-started)
5. [Working with Agents](#working-with-agents)
6. [Available Modules](#available-modules)
7. [Practical Examples](#practical-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Usage](#advanced-usage)

---

## 🎯 WHAT IS BMAD?

**BMAD (Breakthrough Method of Agile AI-driven Development)** is a framework that enables **human-AI collaboration** through specialized AI agents and structured workflows.

### Think of BMAD as:
- 🏢 **A virtual company** with expert consultants
- 🎭 **Role-playing agents** each specialized in different domains
- 📋 **Structured workflows** that guide you through complex tasks
- 🧠 **Collaborative intelligence** that amplifies YOUR thinking

### What BMAD is NOT:
- ❌ NOT a replacement for human thinking
- ❌ NOT an automated code generator
- ❌ NOT a "magic button" solution
- ✅ It's a **COLLABORATION TOOL** to make you more effective

---

## 💡 WHY USE BMAD?

### Without BMAD:
```
You → Claude → Write code
       ↓
   One perspective
   Generic responses
   No structure
```

### With BMAD:
```
You → Specialized Agent → Guided workflow → Better results
       ↓                      ↓
   Expert perspective    Structured process
   Context-aware         Complete deliverables
```

### Benefits:
✅ **Structured approach** - Follow proven workflows
✅ **Expert perspectives** - Each agent has specialized knowledge
✅ **Consistent quality** - Standardized outputs
✅ **Learning tool** - Understand best practices
✅ **Time saving** - Don't reinvent the wheel
✅ **Documentation** - Everything is documented as you go

---

## 🏗️ BMAD CORE CONCEPTS

### 1. **Modules**
Modules are collections of agents and workflows for specific domains.

**Example Modules:**
- **BMad Core** - Foundation (always installed)
- **BMad Method (BMM)** - Software development
- **BMad Builder (BMB)** - Create custom agents/workflows
- **Creative Intelligence Suite (CIS)** - Innovation & brainstorming

### 2. **Agents**
Agents are AI personas with specific expertise and personalities.

**Agent Types:**
- **Simple Agents** - Single-purpose, quick tasks
- **Expert Agents** - Specialized knowledge in a domain
- **Module Agents** - Full workflows with multiple capabilities

### 3. **Workflows**
Workflows are step-by-step processes that guide you through complex tasks.

**Workflow Components:**
- **Instructions** - Step-by-step guidance
- **Templates** - Output document templates
- **Checklists** - Validation and quality checks
- **Data files** - Reference materials

### 4. **BMAD Files Structure**
```
your-project/
├── bmad/                    # Main BMAD folder
│   ├── core/               # Core functionality
│   ├── bmm/                # BMad Method module
│   ├── bmb/                # BMad Builder module
│   ├── cis/                # Creative Intelligence Suite
│   └── _cfg/               # Configuration
│       ├── agents/         # Agent customizations
│       └── manifest.yaml   # Installation manifest
```

---

## 🚀 GETTING STARTED

### Step 1: Check Your Installation

Your BMAD is installed at:
```
/Varie/syd_cyber/ui/BMAD-METHOD/
```

Check installed modules:
```bash
cd /Varie/syd_cyber/ui/BMAD-METHOD
npm run bmad:status
```

### Step 2: Understand Your Setup

When BMAD was installed, it asked you:
- ✅ Your name (for document authorship)
- ✅ Communication language (English/Italian)
- ✅ Which modules to install
- ✅ Output folder location

This is stored in:
```
/bmad/[module]/config.yaml
```

### Step 3: Choose Your Working Style

**Option A: Work with Claude Code Directly** (Simple)
- Just ask Claude to help you
- No need to activate agents
- Good for quick tasks

**Option B: Activate BMAD Agents** (Structured)
- Use specialized agents for specific tasks
- Follow guided workflows
- Better for complex projects

---

## 🎭 WORKING WITH AGENTS

### How to Activate an Agent

In your chat with Claude Code, simply say:
```
"Load the [Agent Name] agent"
or
"I want to work with the [Agent Name]"
or
"Activate [Agent Name]"
```

### Example:
```
You: "Load the Architect agent"

Claude: *Activates Architect agent*

Architect: "Hello Clo! I'm the System Architect.
           I specialize in designing robust software architectures.

           How can I help you today?
           1. Design system architecture
           2. Create technical specification
           3. Review architectural decisions
           4. Document architecture
           5. Exit"
```

### Agent Menu Navigation

Most agents show a numbered menu:
```
1. Option one
2. Option two
3. Option three
```

You can respond with:
- **A number**: `1` or `2`
- **The trigger text**: `*design` or `*review`
- **Natural language**: "I want to design an architecture"

### Exiting an Agent

To exit an agent and return to normal Claude:
- Type: `*exit`
- Or say: "Exit" or "Stop agent"

---

## 📦 AVAILABLE MODULES

### 1. **BMad Core** (Always Installed)

**Purpose**: Foundation for all modules

**Key Components:**
- Master orchestrator
- Core workflows
- Base configuration

**When to use**: Automatically used by other modules

---

### 2. **BMad Method (BMM)** - Software Development

**Purpose**: Complete software development lifecycle

**Available Agents:**
- 👔 **Product Owner (PO)** - Product vision & requirements
- 🏃 **Scrum Master (SM)** - Agile facilitation
- 📊 **Analyst** - Requirements analysis
- 🏗️ **Architect** - System design
- 💻 **Developer (Dev)** - Code implementation
- 🎨 **UX Expert** - User experience design
- 🎮 **Game Designer** - Game development
- 🏗️ **Game Architect** - Game systems design
- 🎮 **Game Dev** - Game implementation
- 🧪 **Test Architect (TEA)** - Testing strategy

**Key Workflows:**

#### **Phase 1: Analysis**
- `brainstorm-project` - Generate project ideas
- `brainstorm-game` - Game concept brainstorming
- `product-brief` - Create product brief
- `game-brief` - Create game design brief
- `research` - Market & technical research

#### **Phase 2: Planning**
- `prd` - Product Requirements Document
- `gdd` - Game Design Document
- `narrative` - Story/narrative design
- `ux` - UX specifications
- `tech-spec` - Technical specifications

#### **Phase 3: Solutioning**
- `solutioning` - Architecture & technical decisions
- `tech-spec` - Detailed technical design

#### **Phase 4: Implementation**
- `create-story` - Create user stories
- `dev-story` - Develop a story
- `review-story` - Code review
- `story-context` - Build story context
- `correct-course` - Fix issues & refactor
- `retrospective` - Sprint retrospective

**Example Usage:**
```
You: "Load the Product Owner agent"

PO: "Hello Clo! I'm your Product Owner.
     I can help you:
     1. Create a product brief
     2. Brainstorm project ideas
     3. Do market research
     4. Create a PRD (Product Requirements Document)

     What would you like to do?"

You: "1"  (Create product brief)

PO: *Guides you through creating a comprehensive product brief*
```

---

### 3. **BMad Builder (BMB)** - Create Custom Agents

**Purpose**: Build your own agents, workflows, and modules

**Available Workflows:**
- `create-agent` - Create a new BMAD agent
- `create-workflow` - Create a new workflow
- `create-module` - Create a complete module
- `edit-workflow` - Edit existing workflows
- `convert-legacy` - Convert old agents to v6
- `redoc` - Update documentation

**Main Agent:**
- 🧙 **BMad Builder** - Your agent/workflow creator

**Example Usage:**
```
You: "Load the BMad Builder agent"

BMad Builder: "⚡ GREETINGS, Clo! ⚡
               The BMad Builder has arrived!

               1. Create a new BMAD agent
               2. Create a new workflow
               3. Create a complete module
               4. Edit existing workflow

               What's your mission?"

You: "1"  (Create agent)

Builder: *Guides you through agent creation*
         - What's the agent's purpose?
         - What personality should it have?
         - What commands will it support?
```

**When to use BMB:**
- Creating specialized agents for your domain
- Building custom workflows for repetitive tasks
- Packaging everything as a reusable module

---

### 4. **Creative Intelligence Suite (CIS)** - Innovation

**Purpose**: Unlock creativity and solve complex problems

**Available Agents:**
- 💡 **Innovation Strategist** - Business innovation
- 🎨 **Design Thinking Coach** - Design thinking facilitation
- 🧩 **Creative Problem Solver** - Complex problem solving
- 🌟 **Brainstorming Coach** - Ideation sessions
- 📖 **Storyteller** - Narrative creation

**Key Workflows:**
- `brainstorming` - Structured brainstorming (used by other modules)
- `design-thinking` - Design thinking workshops
- `innovation-strategy` - Business innovation planning
- `problem-solving` - Creative problem solving
- `storytelling` - Story creation

**Example Usage:**
```
You: "Load the Innovation Strategist"

Strategist: "Hello Clo! Let's unlock innovation!

             I can help you:
             1. Run an innovation workshop
             2. Analyze market opportunities
             3. Design new business models
             4. Create innovation roadmap

             What shall we explore?"
```

---

## 💼 PRACTICAL EXAMPLES

### Example 1: Starting a New Project

**Scenario**: You want to build a new web application

**Step-by-step with BMAD:**

```
Step 1: Brainstorm Ideas
━━━━━━━━━━━━━━━━━━━━━━
You: "Load the Brainstorming Coach from CIS"
Coach: *Guides you through ideation*
Output: Brainstorming document with 10+ ideas

Step 2: Create Product Brief
━━━━━━━━━━━━━━━━━━━━━━
You: "Load the Product Owner from BMM"
PO: "Let's create a product brief"
Output: Complete product brief document

Step 3: Analyze Requirements
━━━━━━━━━━━━━━━━━━━━━━
You: "Load the Analyst"
Analyst: *Analyzes your brief*
Output: Detailed requirements analysis

Step 4: Design Architecture
━━━━━━━━━━━━━━━━━━━━━━
You: "Load the Architect"
Architect: *Designs system*
Output: Technical specification document

Step 5: Implement Features
━━━━━━━━━━━━━━━━━━━━━━
You: "Load the Developer"
Dev: *Creates user stories and implements*
Output: Working code + documentation
```

---

### Example 2: Fixing an Existing Problem

**Scenario**: Your SYD Cyber project has the ATECO integration issue

**Without BMAD:**
```
You: "Help me fix the ATECO integration"
Claude: *Helps you fix it*
```

**With BMAD:**
```
Step 1: Analysis
You: "Load the Analyst"
Analyst: *Analyzes the problem*
- Why does the issue exist?
- What are the impacts?
- What are the options?
Output: Problem analysis document

Step 2: Design Solution
You: "Load the Architect"
Architect: *Designs the solution*
- How should we integrate it?
- What's the architecture?
- What are the risks?
Output: Technical design document

Step 3: Implement
You: "Load the Developer"
Dev: *Implements the fix*
- Integrates ateco_lookup.py
- Updates frontend
- Tests integration
Output: Working code

Step 4: Review
You: "Load the Developer" → "*review"
Dev: *Reviews the implementation*
- Code quality check
- Test coverage
- Documentation review
Output: Review report
```

---

### Example 3: Creating a Custom Agent

**Scenario**: Create a "Cyber Risk Consultant" agent for SYD Cyber

```
You: "Load the BMad Builder"

Builder: "What do you want to create?"

You: "1" (Create agent)

Builder: "What's the agent's purpose?"

You: "A cyber risk consultant specialized in Italian SMEs,
      who helps analyze risks, suggests controls, and
      generates compliance reports"

Builder: *Guides you through*
- Agent name: "Cyber Risk Consultant"
- Agent code: "risk-consultant"
- Personality: Professional, empathetic, detail-oriented
- Commands:
  - *analyze-risk - Analyze a risk scenario
  - *suggest-controls - Suggest risk controls
  - *compliance-check - Check compliance status
  - *report - Generate risk report

Output: New agent created at bmad/agents/risk-consultant.agent.yaml

Usage:
You: "Load the Cyber Risk Consultant"
Consultant: "Ciao Clo! I'm your cyber risk consultant.
             Let me help you analyze risks for Italian SMEs."
```

---

## ✅ BEST PRACTICES

### 1. **Start Simple**
- ❌ Don't try to use all agents at once
- ✅ Start with 1-2 agents for specific tasks
- ✅ Get comfortable, then expand

### 2. **Follow the Workflows**
- ❌ Don't skip steps in workflows
- ✅ Trust the process - it's based on best practices
- ✅ Each step builds on the previous one

### 3. **Customize Agents**
Your agents can be customized in:
```
/bmad/_cfg/agents/[agent-name].customize.yaml
```

You can change:
- Agent name
- Communication style
- Language (English/Italian)
- Personality traits
- What they call you

### 4. **Save Your Outputs**
Workflows save documents to your configured output folder:
```
/docs/ or /your-configured-output-folder/
```

Keep these organized:
```
docs/
├── analysis/
├── planning/
├── design/
└── implementation/
```

### 5. **Use #yolo Mode Sparingly**
Some workflows support `#yolo` mode (skip prompts).

```
Regular mode: Agent asks approval at each step
#yolo mode: Agent completes workflow without stopping
```

- ✅ Use #yolo for familiar workflows
- ❌ Don't use #yolo when learning
- ❌ Don't use #yolo for critical decisions

### 6. **Mix and Match**
You can:
- Use BMAD for planning, Claude Code for implementation
- Use BMAD for complex tasks, Claude Code for quick fixes
- Switch between agents as needed

### 7. **Document Decisions**
When making important decisions with agents, save the context:
```
docs/decisions/
├── ADR-001-why-we-chose-this-architecture.md
├── ADR-002-database-selection.md
└── ADR-003-authentication-strategy.md
```

---

## 🔧 TROUBLESHOOTING

### Problem: Agent doesn't respond correctly

**Solution:**
1. Make sure you used the correct agent name
2. Check if the agent loaded (it should introduce itself)
3. Try saying "*help" to see the menu
4. Exit and reload the agent

### Problem: Workflow gets stuck

**Solution:**
1. Check if it's waiting for your input
2. Say "continue" or "c" to proceed
3. If really stuck, say "*exit" and start over

### Problem: Can't find a specific agent

**Solution:**
1. Check which modules you installed:
   ```bash
   npm run bmad:status
   ```
2. The agent might be in an uninstalled module
3. Run the installer to add missing modules

### Problem: Outputs not saving

**Solution:**
1. Check your output folder configuration:
   ```
   /bmad/[module]/config.yaml
   ```
2. Make sure the folder exists
3. Check file permissions

### Problem: Agent speaks wrong language

**Solution:**
1. Edit the agent customization file:
   ```
   /bmad/_cfg/agents/[agent-name].customize.yaml
   ```
2. Change `communication_language: Italian` or `English`

---

## 🎓 ADVANCED USAGE

### 1. **Creating Modules**

A module is a complete package with:
- Multiple agents
- Multiple workflows
- Shared data/templates
- Installation infrastructure

**Steps:**
1. Load BMad Builder
2. Choose "Create module"
3. Follow the guided workflow
4. Your module is created in `/bmad/[your-module]/`

**Example modules you could create:**
- **Cyber Security Module** - Specialized for security consulting
- **Italian SME Module** - Tailored for Italian business context
- **Compliance Module** - Focused on regulatory compliance
- **Report Generation Module** - Document automation

### 2. **Teams of Agents**

Some modules support "teams" - multiple agents working together:

```
bmad/bmm/teams/team-planning.yaml
```

**Example team session:**
```
You: "I want to run a planning session with the team"

System: *Activates Product Owner, Architect, and Analyst*

Team: *Collaborates to create a comprehensive plan*
```

### 3. **Workflow Chaining**

Workflows can invoke other workflows:

```yaml
# workflow.yaml
- step: "Create architecture"
  action: invoke-workflow
  workflow: "bmad/bmm/workflows/solutioning/workflow.yaml"
```

This creates powerful compound workflows.

### 4. **Custom Task Files**

You can create custom task files (XML format) that define reusable operations:

```xml
<!-- my-custom-task.xml -->
<task id="custom/my-task" name="My Task">
  <objective>Do something specific</objective>
  <flow>
    <step n="1">First action</step>
    <step n="2">Second action</step>
  </flow>
</task>
```

### 5. **Integration with Claude Code**

BMAD works seamlessly with Claude Code because you're using it right now!

**Claude Code** gives you:
- File operations (Read, Write, Edit)
- Command execution (Bash)
- Web search and fetch
- Todo list management

**BMAD** gives you:
- Structured workflows
- Specialized agents
- Best practice templates
- Domain expertise

**Together** = 🚀 Powerful combination!

---

## 🎯 WHEN TO USE BMAD

### ✅ **Use BMAD when:**
- Starting a new complex project
- Need structured approach
- Want to follow best practices
- Creating reusable processes
- Need expert perspective
- Documenting as you go
- Learning a new domain

### ⚠️ **Skip BMAD when:**
- Quick bug fix
- Simple one-line change
- Exploring ideas informally
- Prototyping rapidly
- You're in a hurry

---

## 📚 LEARNING PATH

### **Beginner** (Week 1)
1. ✅ Read this guide
2. ✅ Load one simple agent (try Product Owner)
3. ✅ Complete one workflow start to finish
4. ✅ See what document it creates

### **Intermediate** (Week 2-3)
1. ✅ Try 3-4 different agents
2. ✅ Complete a full project phase (Analysis → Planning)
3. ✅ Customize an agent
4. ✅ Create your first simple agent with BMad Builder

### **Advanced** (Month 2+)
1. ✅ Create a custom workflow
2. ✅ Build a complete custom module
3. ✅ Use team collaboration features
4. ✅ Chain workflows together
5. ✅ Integrate BMAD into your regular workflow

---

## 🔗 USEFUL RESOURCES

### Within Your Installation:

**Main Documentation:**
```
/BMAD-METHOD/README.md
/BMAD-METHOD/src/modules/bmm/README.md
/BMAD-METHOD/src/modules/bmm/workflows/README.md
/BMAD-METHOD/src/modules/bmb/README.md
```

**Example Agents:**
```
/BMAD-METHOD/src/modules/bmm/agents/
```

**Example Workflows:**
```
/BMAD-METHOD/src/modules/bmm/workflows/
```

### Online:
- GitHub: https://github.com/bmad-code-org/BMAD-METHOD
- Discord: https://discord.gg/gk8jAdXWmj
- YouTube: https://www.youtube.com/@BMadCode

---

## 🎯 QUICK REFERENCE CARD

### Common Commands:
```
Load agent:           "Load the [Agent Name]"
Exit agent:           "*exit"
Show menu:            "*help"
Continue workflow:    "c" or "continue"
Edit content:         "e" or "edit"
Skip step:            "skip" (if optional)
```

### Agent Name Quick List:

**BMM Agents:**
- Product Owner (PO)
- Scrum Master (SM)
- Analyst
- Architect
- Developer (Dev)
- UX Expert
- Game Designer
- Game Architect
- Game Dev
- Test Architect (TEA)

**BMB Agents:**
- BMad Builder

**CIS Agents:**
- Innovation Strategist
- Design Thinking Coach
- Creative Problem Solver
- Brainstorming Coach
- Storyteller

### File Locations:
```
Agents:     /bmad/[module]/agents/
Workflows:  /bmad/[module]/workflows/
Config:     /bmad/[module]/config.yaml
Custom:     /bmad/_cfg/agents/
Outputs:    /docs/ (or your configured folder)
```

---

## 🚀 YOUR NEXT STEPS

Now that you understand BMAD:

1. **Try it out!**
   - Pick one simple agent
   - Complete one workflow
   - See what happens

2. **Decide your style:**
   - Use BMAD for structured work
   - Use Claude Code directly for quick tasks
   - Mix both as needed

3. **Build something custom:**
   - When you're comfortable, create a custom agent
   - Make it specific to YOUR needs
   - Share it if you want!

---

## 💪 FINAL THOUGHTS

Remember:
- **BMAD is a TOOL** - Use it when it helps, skip it when it doesn't
- **YOU are in control** - Agents guide, but you decide
- **Learning takes time** - Start simple, grow gradually
- **Experiment freely** - You can't break anything!

**BMAD amplifies your capabilities, it doesn't replace them.**

---

**Now you're ready to harness the power of BMAD! 🚀**

**Questions? Just ask!**
**Ready to try? Pick an agent and let's go!**
**Want to build? The BMad Builder awaits!**

---

*This guide was created specifically for Claudio (Clo) to use as a reference for current and future projects with BMAD. Feel free to update it as you learn more!*

---

**Document Version**: 1.0
**Last Updated**: October 7, 2025
**Next Review**: As needed based on BMAD updates
