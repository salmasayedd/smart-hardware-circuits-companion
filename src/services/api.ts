import { CircuitAnalysisResult, CodeDebugResult, TutorResponse } from '../types';

export interface HealthStatus {
  status: string;
  hasGeminiKey: boolean;
  model: string;
  mode: 'live' | 'demo';
}

export async function checkServerHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return {
      status: 'offline',
      hasGeminiKey: false,
      model: 'demo-fallback',
      mode: 'demo'
    };
  }
}

export async function analyzeCircuitApi(payload: {
  imageBase64: string;
  mimeType?: string;
  description?: string;
  supplyVoltage?: string;
  expectedBehavior?: string;
  symptoms?: string;
  componentValues?: string;
}): Promise<CircuitAnalysisResult> {
  const res = await fetch('/api/analyze-circuit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Circuit analysis request failed: ${errorText || res.statusText}`);
  }

  const data = await res.json();
  return {
    ...data,
    id: `circuit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userContext: {
      description: payload.description,
      supplyVoltage: payload.supplyVoltage,
      expectedBehavior: payload.expectedBehavior,
      symptoms: payload.symptoms,
      componentValues: payload.componentValues
    }
  };
}

export async function debugCodeApi(payload: {
  code: string;
  language: 'c' | 'cpp' | 'python';
  targetPlatform: string;
  errorLogs?: string;
  context?: string;
}): Promise<CodeDebugResult> {
  const res = await fetch('/api/debug-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Code debugging request failed: ${errorText || res.statusText}`);
  }

  const data = await res.json();
  return {
    ...data,
    id: `code_${Date.now()}`,
    timestamp: new Date().toISOString(),
    language: payload.language,
    targetPlatform: payload.targetPlatform,
    originalCode: payload.code
  };
}

export async function queryTutorApi(payload: {
  topic: string;
  question: string;
  currentAnalysis?: any;
  level: 'beginner' | 'advanced';
  language: 'en' | 'ar';
}): Promise<TutorResponse> {
  const res = await fetch('/api/engineering-tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Engineering tutor query failed: ${errorText || res.statusText}`);
  }

  return await res.json();
}
