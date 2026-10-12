export type Language = 'en' | 'ar';

export type WorkspaceTab = 
  | 'home'
  | 'circuit-analyzer'
  | 'code-debugger'
  | 'calculators'
  | 'simulator'
  | 'tutor'
  | 'reports'
  | 'history'
  | 'settings';

export interface ComponentRecognized {
  name: string;
  type: string;
  valueOrLabel?: string;
  status: 'nominal' | 'warning' | 'fault';
  notes: string;
}

export interface WiringIssue {
  title: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  recommendation: string;
}

export interface ElectricalRisk {
  title: string;
  severity: 'high' | 'medium' | 'low';
  detail: string;
  prevention: string;
}

export interface RelevantFormula {
  formula: string;
  explanation: string;
  calculation?: string;
}

export interface CircuitAnalysisResult {
  id: string;
  timestamp: string;
  title?: string;
  imagePreviewUrl?: string;
  isDemo: boolean;
  summary: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  confidenceReason: string;
  componentsRecognized: ComponentRecognized[];
  suspectedWiringIssues: WiringIssue[];
  electricalRisks: ElectricalRisk[];
  diagnosticSteps: string[];
  suggestedCorrections: string[];
  relevantFormulas: RelevantFormula[];
  missingInformation: string[];
  userContext?: {
    description?: string;
    supplyVoltage?: string;
    expectedBehavior?: string;
    symptoms?: string;
    componentValues?: string;
  };
}

export interface CodeIssue {
  line?: number;
  severity: 'error' | 'warning' | 'info';
  title: string;
  explanation: string;
  ruleOrConcept: string;
}

export interface DiffExplanation {
  change: string;
  reason: string;
}

export interface CodeDebugResult {
  id: string;
  timestamp: string;
  isDemo: boolean;
  language: 'c' | 'cpp' | 'python';
  targetPlatform: string;
  originalCode: string;
  summary: string;
  issues: CodeIssue[];
  correctedCode: string;
  diffExplanation: DiffExplanation[];
  suggestededTests: string[];
  performanceAndSafetyNotes: string[];
}

export interface Principle {
  name: string;
  law: string;
  formula: string;
  explanation: string;
}

export interface TutorResponse {
  isDemo: boolean;
  explanation: string;
  technicalDeepDive: string;
  fundamentalPrinciples: Principle[];
  stepByStepDerivation: string[];
  workedNumericalExample: {
    problem: string;
    steps: string[];
    finalResult: string;
  };
  commonPitfalls: string[];
  verificationTechniques: string[];
  followUpQuestions: string[];
}

export interface SimulatorComponent {
  id: string;
  type: 'voltage_source' | 'resistor' | 'capacitor' | 'led' | 'ground';
  designator: string;
  value: number; // in base units: Volts for source, Ohms for resistor, Farads for capacitor
  unitLabel: string;
  maxPowerRating?: number; // Watts, e.g., 0.25W
  voltageDrop?: number; // Volts
  current?: number; // Amps
  power?: number; // Watts
  status?: 'normal' | 'overpower' | 'reverse_polarity';
  nodeFrom?: string;
  nodeTo?: string;
}

export interface SimulationResult {
  topology: 'series' | 'parallel' | 'series_parallel' | 'voltage_divider' | 'rc_transient';
  supplyVoltage: number;
  equivalentResistance: number;
  totalCurrent: number;
  totalPower: number;
  components: SimulatorComponent[];
  nodeVoltages: Record<string, number>;
  timeConstant?: number;
  cutoffFrequency?: number;
  warnings: string[];
}

export interface HistoryItem {
  id: string;
  title: string;
  type: 'circuit' | 'code' | 'calculation' | 'simulation' | 'report';
  timestamp: string;
  summary: string;
  data: any;
}

export interface EngineeringReport {
  id: string;
  title: string;
  author: string;
  date: string;
  type: string;
  circuitAnalysis?: CircuitAnalysisResult;
  codeDebug?: CodeDebugResult;
  simulation?: SimulationResult;
  notes: string;
  recommendations: string[];
}
