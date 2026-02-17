export type StepStatus = "not_started" | "in_progress" | "complete";

export type DEStepContentBlock =
  | { type: "table"; label?: string; headers: string[]; rows: Record<string, string>[] }
  | { type: "profile"; label?: string; sections: { label: string; value: string }[] }
  | { type: "text"; label?: string; body: string }
  | { type: "metrics"; label?: string; items: { label: string; value: string; explanation?: string }[] };

export type DEStepContent =
  | DEStepContentBlock
  | { type: "multi"; blocks: DEStepContentBlock[] };

export interface DEStep {
  id: string;
  number: number;
  title: string;
  status: StepStatus;
  content: DEStepContent;
  headline?: string;
  headlineOptions?: string[];
}

export const DE_STEP_TITLES: string[] = [
  "Market Segmentation",
  "Beachhead Market",
  "End User Profile",
  "Beachhead TAM Size",
  "Persona",
  "Life Cycle Use Case",
  "High-Level Specs",
  "Quantify Value Proposition",
  "Next 10 Customers",
  "Define Core",
  "Chart Competitive Position",
  "Determine DMU",
  "Map Customer Acquisition Process",
  "Follow-on TAM",
  "Design Business Model",
  "Pricing Framework",
  "LTV (Life-Time Value)",
  "Map Sales Process",
  "COCA (Cost of Customer Acquisition)",
  "Identify Key Assumptions",
  "Test Key Assumptions",
  "Define MVBP",
  "Show Dogs Will Eat Dog Food",
  "Develop Product Plan",
];
