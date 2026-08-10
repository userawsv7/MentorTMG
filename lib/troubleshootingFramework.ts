// Troubleshooting Framework - 9-Step Problem-Solving Approach
// Implements General Rules GR004, GR007, GR010
// Based on commit 5ae3c96 (diagram improvements) and 2d0086a (production troubleshooting)

export interface TroubleshootingStep {
  step: number;
  title: string;
  description: string;
  diagramComponent?: string;
  requirements: string[];
}

export const TROUBLESHOOTING_STEPS: TroubleshootingStep[] = [
  {
    step: 1,
    title: "Problem Definition Diagram",
    description: "Create a diagram showing what the problem is and what needs to be done. Diagram must be visible at a stretch with explanations embedded within it.",
    requirements: [
      "Diagram visible without excessive scrolling",
      "All explanations within the diagram",
      "Clear visualization of what's happening",
      "No overlapping or hidden text",
      "Proper arrow directions and connections",
      "Readable font sizes"
    ]
  },
  {
    step: 2,
    title: "Diagram Explanation",
    description: "Provide short or required explanation of the diagram to clarify understanding.",
    requirements: [
      "Concise explanation matching diagram complexity",
      "Clarifies any potential confusion points",
      "Reinforces visual understanding"
    ]
  },
  {
    step: 3,
    title: "Pre-checks",
    description: "Confirm and locate where the issue is through systematic verification.",
    requirements: [
      "Systematic verification steps",
      "Clear indicators of issue location",
      "Non-destructive checks first"
    ]
  },
  {
    step: 4,
    title: "Blast Radius Analysis",
    description: "Check potential impact of resolution. For beginners, intermediates, and experts: what they would do and common mistakes.",
    requirements: [
      "Assess potential side effects",
      "Level-specific approaches (beginner/intermediate/expert)",
      "Common mistakes to avoid",
      "Skip if no blast radius"
    ]
  },
  {
    step: 5,
    title: "Identification and Solution",
    description: "Pinpoint the exact problem and provide the solution.",
    requirements: [
      "Root cause identification",
      "Clear solution path",
      "Addresses the problem without judgment"
    ]
  },
  {
    step: 6,
    title: "Purpose and Code/Commands",
    description: "Explain purpose and provide resolution code/commands with #comments. Include official documentation links (one-line highlight + exact link to subpage).",
    requirements: [
      "Two versions: with comments and without",
      "Purpose explanation for each",
      "Source documentation collapsible",
      "Exact links to relevant documentation",
      "One-line description for each source"
    ]
  },
  {
    step: 7,
    title: "Post-checks and Rollback",
    description: "Verify expected output. Provide collapsible rollback plan if needed.",
    requirements: [
      "Verification steps for success",
      "Expected output definitions",
      "Collapsible rollback procedures",
      "Clear success criteria"
    ]
  },
  {
    step: 8,
    title: "Command Cheatsheet",
    description: "Provide cheatsheet of all commands used with explanations of what each does.",
    requirements: [
      "All commands from the process",
      "Clear explanation of each command's purpose",
      "Quick reference format"
    ]
  },
  {
    step: 9,
    title: "Accuracy Validation",
    description: "Ensure 100% accuracy with all diagrams containing explanations, being readable and expandable with zoom functionality.",
    requirements: [
      "Technical accuracy verification",
      "Diagram readability check",
      "Expandable diagram functionality",
      "Zoom capability implementation",
      "No collapsed or hidden text"
    ]
  }
];

// Improved Diagram Specifications (based on commit 5ae3c96)
export interface DiagramSpec {
  fontSize: {
    title: number;
    label: number;
    explanation: number;
    definition: number;
  };
  requirements: string[];
  features: {
    expandable: boolean;
    zoomable: boolean;
    embeddedExplanations: boolean;
    properArrows: boolean;
  };
}

export const IMPROVED_DIAGRAM_SPEC: DiagramSpec = {
  fontSize: {
    title: 14,
    label: 12,
    explanation: 10,
    definition: 9
  },
  requirements: [
    "Fonts neither too big nor too short",
    "All explanations and definitions visible within diagram",
    "Words not jumbled, hidden, or overlapped",
    "Proper arrow directions pointing to intended elements",
    "Readable at a glance",
    "Explanations embedded in diagram for better understanding"
  ],
  features: {
    expandable: true,
    zoomable: true,
    embeddedExplanations: true,
    properArrows: true
  }
};

// Production Troubleshooting Specifications (based on commit 2d0086a)
export interface ProductionTroubleshootingSpec {
  approach: string;
  diagramSource: string;
  noChanges: boolean;
  improvements: string[];
}

export const PRODUCTION_TROUBLESHOOTING_SPEC: ProductionTroubleshootingSpec = {
  approach: "troubleshooting alone",
  diagramSource: "commit 5ae3c96",
  noChanges: true,
  improvements: [
    "Use same concept of diagrams from commit 5ae3c96",
    "Improve overlapping/hidden explanations",
    "Fix arrow directions",
    "Ensure diagram itself provides short explanations",
    "Maintain clarity and readability"
  ]
};

// Helper function to validate diagram compliance
export function validateDiagramCompliance(diagram: any): {
  compliant: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check font sizes
  if (diagram.fontSize) {
    if (diagram.fontSize.title > 16 || diagram.fontSize.title < 12) {
      issues.push("Title font size not optimal for readability");
    }
    if (diagram.fontSize.label > 14 || diagram.fontSize.label < 10) {
      issues.push("Label font size not optimal");
    }
  }

  // Check required features
  if (!diagram.expandable) issues.push("Diagram must be expandable");
  if (!diagram.zoomable) issues.push("Diagram must have zoom functionality");
  if (!diagram.embeddedExplanations) issues.push("Explanations must be embedded in diagram");
  if (!diagram.properArrows) issues.push("Arrows must point correctly without confusion");

  return {
    compliant: issues.length === 0,
    issues
  };
}

// Generate troubleshooting template
export function generateTroubleshootingTemplate(problem: string): string {
  return `
# Troubleshooting: ${problem}

## Step 1: Problem Definition Diagram
[Insert diagram showing the problem with embedded explanations]

## Step 2: Diagram Explanation
[Short explanation of the diagram]

## Step 3: Pre-checks
1. [ ] Check 1: [description]
2. [ ] Check 2: [description]
...

## Step 4: Blast Radius Analysis
- Impact Assessment: [description]
- Beginner Approach: [description]
- Intermediate Approach: [description]
- Expert Approach: [description]
- Common Mistakes: [list]

## Step 5: Identification and Solution
Root Cause: [description]
Solution: [description]

## Step 6: Purpose and Resolution

### Purpose
[Explain why this solution works]

### Code/Commands (with explanations)
\`\`\`
# Explanation comment
[command or code]
\`\`\`

### Code/Commands (clean version)
\`\`\`
[command or code without comments]
\`\`\`

### Source Documentation
<details>
<summary>📚 Official Documentation</summary>

- [One-line description](exact-link-to-subpage)
  - Verify: [what to look for when you arrive]

</details>

## Step 7: Post-checks and Rollback

### Verification Steps
1. [ ] Expected output 1: [description]
2. [ ] Expected output 2: [description]

### Rollback Plan
<details>
<summary>🔙 Rollback Procedures</summary>

[Rollback steps if needed]

</details>

## Step 8: Command Cheatsheet
| Command | Purpose |
|---------|---------|
| [command] | [what it does] |

## Step 9: Accuracy Validation
- [ ] Technical accuracy: 100%
- [ ] Diagram readability: Verified
- [ ] Zoom functionality: Working
- [ ] All text visible and not overlapping
`;
}