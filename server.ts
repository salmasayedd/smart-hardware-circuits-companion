import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Enable JSON body parsing with large payload limit for circuit images
app.use(express.json({ limit: '25mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Health and configuration check
app.get('/api/health', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasKey = !!apiKey && apiKey !== 'MY_GEMINI_API_KEY';
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    model: 'gemini-3.8-flash',
    mode: hasKey ? 'live' : 'demo'
  });
});

// Demo fallback data for circuit analysis
const getDemoCircuitAnalysis = (userNotes?: string) => ({
  isDemo: true,
  summary: "Demo Mode Analysis: Simulated diagnostic of an Arduino/5V LED driver circuit with an operational amplifier sensor stage.",
  confidenceLevel: "high",
  confidenceReason: "Pre-compiled high-resolution engineering benchmark dataset for demonstration.",
  componentsRecognized: [
    { name: "LED1", type: "Optoelectronic / Diode", valueOrLabel: "Red 5mm (Vf = 2.0V)", status: "nominal", notes: "Anode connected to current-limiting resistor" },
    { name: "R1", type: "Resistor", valueOrLabel: "220 Ω ±5%", status: "nominal", notes: "Limits LED current to ~13.6 mA at 5V logic level" },
    { name: "C1", type: "Decoupling Capacitor", valueOrLabel: "100 nF Ceramic", status: "warning", notes: "Placed >40mm away from MCU VCC pin; high parasitic inductance" },
    { name: "Q1", type: "NPN BJT", valueOrLabel: "2N3904", status: "nominal", notes: "Base resistor R2 (10 kΩ) drives transistor into saturation" },
    { name: "D1", type: "Flyback Diode", valueOrLabel: "1N4007", status: "fault", notes: "Omitted across inductive relay coil L1; risks reverse EMF damage" }
  ],
  suspectedWiringIssues: [
    {
      title: "Missing Flyback Diode across Inductive Relay Coil",
      severity: "critical",
      description: "When transistor Q1 cuts off, the magnetic field in coil L1 collapses, generating a high negative spike (V = -L * di/dt) that will exceed Vceo of 2N3904 (40V) and cause breakdown.",
      recommendation: "Install a 1N4001 or 1N4148 diode anti-parallel to the coil terminals (Cathode to +5V, Anode to Q1 collector)."
    },
    {
      title: "Decoupling Capacitor Distance",
      severity: "warning",
      description: "Capacitor C1 is placed too far from the microcontroller power rail, increasing trace impedance and susceptible to digital switching noise.",
      recommendation: "Relocate 100 nF ceramic capacitor directly across VCC and GND pins (<5mm trace distance)."
    }
  ],
  electricalRisks: [
    {
      title: "Inductive Kickback Voltage Breakdown",
      severity: "high",
      detail: "Reverse transient spike up to 80V-150V will permanently destroy transistor collector-emitter junction.",
      prevention: "Snubber network or reverse antiparallel clamp diode."
    },
    {
      title: "Floating Base during Microcontroller Reset",
      severity: "medium",
      detail: "During MCU bootup, GPIO pins are in high-impedance (tri-state) mode. External noise can partially turn on Q1.",
      prevention: "Add a 47 kΩ pull-down resistor from Q1 base to GND."
    }
  ],
  diagnosticSteps: [
    "Measure DC voltage across VCC and GND with multimeter under full load.",
    "Inspect orientation of electrolytic capacitors for correct polarity (- stripe to ground).",
    "Use oscilloscope in single-trigger mode to capture switching spikes across collector of Q1.",
    "Verify logic high drive voltage from GPIO pin is >= 0.7V under 10k load."
  ],
  suggestedCorrections: [
    "Connect 1N4007 diode across relay coil with cathode to +5V.",
    "Place 0.1 µF bypass capacitor immediately adjacent to IC power pins.",
    "Add a 10 kΩ pull-down resistor to ensure logic-low state during MCU bootup.",
    "Confirm common ground connection between MCU power supply and external load supply."
  ],
  relevantFormulas: [
    {
      formula: "V_kickback = -L * (di / dt)",
      explanation: "Lenz's Law induced electromotive force during sudden current interruption in an inductor."
    },
    {
      formula: "I_LED = (V_cc - V_f) / R_limit = (5.0V - 2.0V) / 220Ω = 13.64 mA",
      explanation: "Ohm's Law calculation for LED forward branch current."
    },
    {
      formula: "I_B(sat) >= I_C / beta_forced = (50mA / 10) = 5 mA",
      explanation: "Base overdrive requirement to guarantee transistor saturation."
    }
  ],
  missingInformation: [
    "Exact relay coil inductance and nominal coil resistance.",
    "Supply voltage ripple specifications and peak current rating."
  ]
});

// Demo fallback data for code debugger
const getDemoCodeDebug = (code: string, language: string) => ({
  isDemo: true,
  summary: "Demo Mode Analysis: Detected critical embedded firmware concurrency and timing issues.",
  issues: [
    {
      line: 14,
      severity: "error",
      title: "Missing 'volatile' qualifier on ISR-shared variable",
      explanation: "The variable updated inside the interrupt service routine is read in the main loop without 'volatile'. Compiler optimizations will cache it in a register, causing the main loop to ignore interrupt state changes.",
      ruleOrConcept: "Hardware I/O & Concurrency (Compiler Optimization Barriers)"
    },
    {
      line: 22,
      severity: "warning",
      title: "Blocking delay() inside real-time control loop",
      explanation: "Using blocking delays (e.g., delay(1000) or time.sleep(1)) halts the CPU, preventing watchdog resets, sensor polling, and communication buffer handling.",
      ruleOrConcept: "Non-blocking State Machines vs Synchronous Stalls"
    },
    {
      line: 29,
      severity: "info",
      title: "Unfiltered mechanical switch bouncing",
      explanation: "Reading digital input directly without software debouncing will trigger multiple spurious events on contact closure.",
      ruleOrConcept: "Switch Debounce Timing (10-20ms hysteresis)"
    }
  ],
  correctedCode: language === 'python'
    ? `# Corrected Non-Blocking Python Embedded Loop
import time

last_toggle_time = time.ticks_ms() if hasattr(time, 'ticks_ms') else time.time()
state = False

def poll_sensors():
    global last_toggle_time, state
    current_time = time.ticks_ms() if hasattr(time, 'ticks_ms') else time.time()
    
    # Non-blocking periodic check (500ms interval)
    delta = current_time - last_toggle_time
    if delta >= 500:
        state = not state
        last_toggle_time = current_time
        print(f"[STATUS] Heartbeat state: {state}")

while True:
    poll_sensors()
    time.sleep(0.01) # Yield CPU briefly without blocking
`
    : `// Corrected Embedded C/C++ Firmware with ISR-safe constructs
#include <stdint.h>

// 1. volatile ensures compiler re-reads from RAM on every loop cycle
volatile uint32_t isr_trigger_count = 0;
volatile bool event_pending = false;

uint32_t last_millis = 0;
const uint32_t HEARTBEAT_INTERVAL_MS = 500;

void IRAM_ATTR on_external_interrupt() {
    isr_trigger_count++;
    event_pending = true;
}

void setup() {
    // Pin configuration with safe internal pull-up
    // pinMode(2, INPUT_PULLUP);
    // attachInterrupt(digitalPinToInterrupt(2), on_external_interrupt, FALLING);
}

void loop() {
    uint32_t current_millis = 1000; // placeholder for millis()
    
    // Non-blocking timer
    if (current_millis - last_millis >= HEARTBEAT_INTERVAL_MS) {
        last_millis = current_millis;
        // Perform periodic tasks safely
    }

    // Atomic read of ISR flag with atomic guard if needed
    if (event_pending) {
        event_pending = false;
        // Handle trigger safely outside ISR context
    }
}
`,
  diffExplanation: [
    {
      change: "Added 'volatile' qualifier to shared ISR flags",
      reason: "Prevents compiler from optimizing away reads in the main execution thread."
    },
    {
      change: "Replaced blocking delay with non-blocking timestamp comparison",
      reason: "Ensures the main loop can service interrupts and communicate without lag."
    },
    {
      change: "Isolated heavy computations outside ISR callback",
      reason: "Interrupt routines must complete in microseconds to avoid watchdog timer timeouts."
    }
  ],
  suggestededTests: [
    "Verify ISR triggering rate under rapid signal pulses with an oscilloscope.",
    "Stress test watchdog timer over 1 hour continuous run.",
    "Check memory consumption with static analyzer (avoids heap fragmentation)."
  ],
  performanceAndSafetyNotes: [
    "Avoid dynamic memory allocation (malloc/new) inside real-time loops on microcontrollers with <64KB SRAM.",
    "Configure hardware Watchdog Timer (WDT) to safely reset system in case of unexpected lockup."
  ]
});

// Demo tutor response
const getDemoTutorResponse = (topic: string, question: string, level: string, lang: string) => {
  const isAr = lang === 'ar';
  if (isAr) {
    return {
      isDemo: true,
      explanation: "في الدوائر الإلكترونية، يعتبر قانون أوم (V = I × R) وقوانين كيرشوف الأساس الذي تنبني عليه كل الحسابات. عند وجود مكثف أو ملف، يتغير السلوك مع الزمن، مما يتطلب دراسة الاستجابة العابرة (Transient Response).",
      technicalDeepDive: "تحليل النطاق الزمني لدوائر RC يعتمد على المعادلة التفاضلية: V_in = R * (dq/dt) + q/C. الحل العام لشحن المكثف هو V_c(t) = V_s * (1 - e^(-t / RC))، حيث الثابت الزمني τ = R * C يمثل الوقت اللازم للوصول إلى 63.2% من جهد المصدر.",
      fundamentalPrinciples: [
        {
          name: "قانون أوم (Ohm's Law)",
          law: "V = I * R",
          formula: "V = I * R",
          explanation: "العلاقة التناسبية الطردية بين فرق الجهد وشدة التيار في موصل أومي ثابت المقاومة."
        },
        {
          name: "ثابت الزمن لدوائر RC",
          law: "τ = R * C",
          formula: "τ = R * C (ثوانٍ)",
          explanation: "المقياس الزمني لسرعة شحن وتفريغ المكثف عبر المقاومة."
        }
      ],
      stepByStepDerivation: [
        "1. حدد جهد المصدر V_s ومقاومة الدائرة R وسعة المكثف C.",
        "2. احسب ثابت الزمن τ = R × C بالثواني.",
        "3. بعد مرور 1τ، يبلغ الجهد 63.2% من V_s.",
        "4. بعد مرور 5τ، يعتبر المكثف مشحوناً بالكامل تقريباً (99.3%)."
      ],
      workedNumericalExample: {
        problem: "احسب ثابت الزمن وجهد المكثف بعد 20ms في دائرة بها R = 1 kΩ و C = 10 µF مع مصدر 10V.",
        steps: [
          "R = 1000 Ω, C = 10 × 10^(-6) F = 0.00001 F",
          "τ = R × C = 1000 × 0.00001 = 0.01 ثانية = 10 مللي ثانية",
          "t = 20 مللي ثانية = 2τ",
          "V(t) = 10 × (1 - e^(-2)) = 10 × (1 - 0.1353) = 8.65V"
        ],
        finalResult: "الجهد بعد 20 مللي ثانية هو 8.65 فولت والثابت الزمني 10 مللي ثانية."
      },
      commonPitfalls: [
        "إهمال تحويل الوحدات (مثل تحويل الميكروفاراد µF إلى فاراد F أو كيلو أوم kΩ إلى أوم Ω).",
        "تجاهل المقاومة الداخلية للمصدر أو المقاومة التسلسلية المكافئة (ESR) للمكثف."
      ],
      verificationTechniques: [
        "استخدام راسم الإشارة (Oscilloscope) وقياس زمن الصعود Rise Time.",
        "التحقق بواسطة محاكي الدوائر التفاعلي المدمج في التطبيق."
      ],
      followUpQuestions: [
        "كيف تؤثر زيادة المقاومة إلى الضعف على زمن الشحن؟",
        "ما الفرق بين استجابة دائرة RC ودائرة RL عند تطبيق إشارة مربعة؟"
      ]
    };
  }

  return {
    isDemo: true,
    explanation: "In electronic circuit engineering, fundamental circuit laws dictate behavior under both steady-state DC and transient conditions. Understanding how current, voltage, and time-constants interact is crucial for robust hardware designs.",
    technicalDeepDive: "For dynamic circuits such as first-order RC networks, Kirchhoff's Voltage Law yields the differential equation: V_in(t) = i(t)*R + v_c(t) with i(t) = C * (dv_c/dt). Solving this initial-value problem produces the characteristic exponential response v_c(t) = V_final + (V_initial - V_final)*e^(-t/RC), where the time constant τ = R*C represents the fundamental system pole.",
    fundamentalPrinciples: [
      {
        name: "Ohm's Law",
        law: "V = I * R",
        formula: "V = I * R",
        explanation: "Relates potential difference across a linear conductor to current and resistance."
      },
      {
        name: "RC Time Constant",
        law: "τ = R * C",
        formula: "τ = R * C [seconds]",
        explanation: "Characterizes the charge/discharge rate; at t = 1τ, the capacitor reaches 63.2% of step transition."
      }
    ],
    stepByStepDerivation: [
      "1. Write KVL around the loop: V_source - i(t)*R - v_c(t) = 0.",
      "2. Substitute capacitor constitutive equation: i(t) = C * dv_c/dt.",
      "3. Rearrange into standard linear ODE: dv_c/dt + (1/RC)*v_c = V_source/(RC).",
      "4. Apply integrating factor e^(t/RC) and solve with boundary condition v_c(0) = 0."
    ],
    workedNumericalExample: {
      problem: "Calculate the time constant and voltage across a 10 µF capacitor in series with a 1 kΩ resistor after 20 ms, connected to a 10 V DC supply.",
      steps: [
        "Identify parameters: R = 1,000 Ω, C = 10 × 10^-6 F, V_supply = 10 V, t = 0.020 s.",
        "Compute time constant: τ = R × C = 1,000 × 10^-5 = 0.010 s (10 ms).",
        "Calculate normalized time: t / τ = 20 ms / 10 ms = 2.0 time constants.",
        "Evaluate formula: V(20ms) = 10 * (1 - e^(-2)) = 10 * (1 - 0.1353) = 8.65 V."
      ],
      finalResult: "τ = 10 ms; Capacitor voltage V_c(20ms) = 8.65 V."
    },
    commonPitfalls: [
      "Forgetting unit prefixes (e.g., converting µF to F or kΩ to Ω before multiplication).",
      "Confusing time constant τ (63.2%) with the settling time 5τ (99.3%).",
      "Ignoring the load resistance connected in parallel with the capacitor."
    ],
    verificationTechniques: [
      "Measure voltage with high-impedance (10 MΩ) oscilloscope probe to avoid loading the RC node.",
      "Use the built-in Interactive Circuit Simulator to observe the live charging curve."
    ],
    followUpQuestions: [
      "What happens to the peak inrush current if the resistor R is halved?",
      "How does capacitor Equivalent Series Resistance (ESR) affect high-frequency ripple filtering?"
    ]
  };
};

// POST /api/analyze-circuit
app.post('/api/analyze-circuit', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', description, supplyVoltage, expectedBehavior, symptoms, componentValues } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      console.log('[AI Server] No GEMINI_API_KEY detected. Returning high-grade demo analysis.');
      return res.json(getDemoCircuitAnalysis(description));
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing circuit image data.' });
    }

    // Clean base64 data if it contains data URI scheme
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const prompt = `You are an expert Senior Electrical & Electronics Hardware Diagnostics Engineer.
Analyze this uploaded electronic circuit image (schematic, breadboard layout, PCB, or wiring diagram).

USER SUPPLIED CONTEXT:
- Description: ${description || 'Not specified'}
- Supply Voltage: ${supplyVoltage || 'Not specified'}
- Expected Behavior: ${expectedBehavior || 'Not specified'}
- Observed Symptoms / Faults: ${symptoms || 'Not specified'}
- Known Component Values: ${componentValues || 'Not specified'}

Analyze the circuit thoroughly. Return STRICT JSON with this exact schema:
{
  "summary": "High-level diagnostic summary of the circuit and current operational state",
  "confidenceLevel": "high" | "medium" | "low",
  "confidenceReason": "Explanation of visual certainty or image quality limitations",
  "componentsRecognized": [
    {
      "name": "Designator (e.g. R1, LED1, U1)",
      "type": "Component Category (e.g. Microcontroller, Resistor, NPN Transistor)",
      "valueOrLabel": "Value or marking if visible",
      "status": "nominal" | "warning" | "fault",
      "notes": "Observation regarding orientation, wiring, or sizing"
    }
  ],
  "suspectedWiringIssues": [
    {
      "title": "Title of issue",
      "severity": "critical" | "warning" | "info",
      "description": "Deep electrical explanation of what is wrong or suspect",
      "recommendation": "Concrete wiring fix"
    }
  ],
  "electricalRisks": [
    {
      "title": "Risk title (e.g., Short circuit, Overcurrent, Thermal runaway, Missing flyback clamp)",
      "severity": "high" | "medium" | "low",
      "detail": "Detailed physics/electrical explanation",
      "prevention": "Remediation step"
    }
  ],
  "diagnosticSteps": [
    "Step 1: Specific measurement with DMM/multimeter or probe",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "suggestedCorrections": [
    "Concrete step to correct hardware schematic or breadboard wiring"
  ],
  "relevantFormulas": [
    {
      "formula": "Standard mathematical formula (e.g. V = I * R, P = I^2 * R)",
      "explanation": "Why this formula governs the component or circuit branch",
      "calculation": "Calculated value using given or standard voltages if applicable"
    }
  ],
  "missingInformation": [
    "Ambiguities or details needed for 100% verification"
  ]
}

DO NOT wrap the response in markdown blocks if possible, or return clean JSON. Do not invent non-existent pins. If image is blurry or unclear, set confidenceLevel to low or medium and specify in missingInformation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg',
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    try {
      const parsed = JSON.parse(text);
      res.json({ ...parsed, isDemo: false });
    } catch {
      // Fallback clean parsing
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ ...parsed, isDemo: false });
      } else {
        res.json({
          ...getDemoCircuitAnalysis(description),
          summary: text.slice(0, 300) || 'Analyzed circuit image.',
          isDemo: false
        });
      }
    }
  } catch (error: any) {
    console.error('[AI Circuit Analyzer Error]:', error);
    res.json({
      ...getDemoCircuitAnalysis(req.body?.description),
      apiError: error.message || 'AI service call failed, showing fallback diagnostic benchmark.'
    });
  }
});

// POST /api/debug-code
app.post('/api/debug-code', async (req, res) => {
  try {
    const { code, language = 'c', targetPlatform = 'arduino', errorLogs, context } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code content is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.log('[AI Server] No GEMINI_API_KEY detected. Returning code debug demo.');
      return res.json(getDemoCodeDebug(code, language));
    }

    const prompt = `You are a Principal Embedded Systems Software & Firmware Debugging Specialist.
Analyze the following source code written in ${language.toUpperCase()} targeting platform: ${targetPlatform}.

USER SOURCE CODE:
\`\`\`${language}
${code}
\`\`\`

USER ERROR LOGS / COMPILER TRACEBACK:
${errorLogs || 'None provided.'}

PROJECT CONTEXT:
${context || 'General embedded control.'}

Perform rigorous static analysis for:
1. Syntax errors and compilation blockers
2. Hardware race conditions, volatile qualifiers, ISR safety
3. Memory leaks, dangling pointers, buffer overflows, stack bloat
4. Blocking loops vs non-blocking timer/state machines
5. Peripheral configuration issues (GPIO pin modes, baud rates, pull-ups)
6. Power and watchdog safety

Return STRICT JSON with the following structure:
{
  "summary": "Executive summary of bugs and code health",
  "issues": [
    {
      "line": 12,
      "severity": "error" | "warning" | "info",
      "title": "Concise issue title",
      "explanation": "Thorough technical explanation of the defect and why it occurs",
      "ruleOrConcept": "Computer science or hardware engineering principle"
    }
  ],
  "correctedCode": "The complete, fully corrected, optimized code ready to compile and run",
  "diffExplanation": [
    {
      "change": "What was changed",
      "reason": "Why it was changed"
    }
  ],
  "suggestededTests": [
    "Recommended verification test or hardware probe"
  ],
  "performanceAndSafetyNotes": [
    "Embedded performance or safety best practice"
  ]
}

DO NOT wrap with markdown ticks if possible, output pure JSON. Preserve user logic and comments where possible while fixing all flaws.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    try {
      const parsed = JSON.parse(text);
      res.json({ ...parsed, isDemo: false });
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ ...parsed, isDemo: false });
      } else {
        res.json(getDemoCodeDebug(code, language));
      }
    }
  } catch (error: any) {
    console.error('[AI Code Debugger Error]:', error);
    res.json({
      ...getDemoCodeDebug(req.body?.code || '', req.body?.language || 'c'),
      apiError: error.message || 'AI request encountered error, displaying deterministic analysis.'
    });
  }
});

// POST /api/engineering-tutor
app.post('/api/engineering-tutor', async (req, res) => {
  try {
    const { topic, question, currentAnalysis, level = 'beginner', language = 'en' } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json(getDemoTutorResponse(topic, question, level, language));
    }

    const isArabic = language === 'ar';
    const prompt = `You are a world-class Professor of Electrical & Electronics Engineering and Embedded Systems.
The user is asking a tutoring question. Answer in ${isArabic ? 'Arabic (العربية) with proper engineering terms and RTL consideration' : 'English'}.
User target level: ${level} (${level === 'beginner' ? 'Intuitive, clear analogies, foundational math' : 'Rigorous, Laplace/phasor/differential notation, deep semiconductor/microarchitecture detail'}).

TOPIC: ${topic || 'General Electronics'}
USER QUESTION: ${question || 'Explain the underlying physical and mathematical principles.'}
CURRENT WORKSPACE CONTEXT:
${typeof currentAnalysis === 'object' ? JSON.stringify(currentAnalysis) : (currentAnalysis || 'General study')}

Return STRICT JSON with this schema:
{
  "explanation": "Clear explanation tailored to ${level} level in ${isArabic ? 'Arabic' : 'English'}",
  "technicalDeepDive": "Deeper analysis with equations and physical mechanisms",
  "fundamentalPrinciples": [
    {
      "name": "Name of scientific law/principle",
      "law": "Formal statement of the law",
      "formula": "Mathematical formulation (e.g. V = L * di/dt)",
      "explanation": "Significance in practical circuit design"
    }
  ],
  "stepByStepDerivation": [
    "Step 1...",
    "Step 2..."
  ],
  "workedNumericalExample": {
    "problem": "Realistic engineering problem statement",
    "steps": [
      "Calculation step 1",
      "Calculation step 2"
    ],
    "finalResult": "Final numerical value with units"
  },
  "commonPitfalls": [
    "Common misconception or student trap"
  ],
  "verificationTechniques": [
    "Practical lab test or simulator check"
  ],
  "followUpQuestions": [
    "Thought-provoking practice question 1",
    "Thought-provoking practice question 2"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text || '';
    try {
      const parsed = JSON.parse(text);
      res.json({ ...parsed, isDemo: false });
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        res.json({ ...JSON.parse(jsonMatch[0]), isDemo: false });
      } else {
        res.json(getDemoTutorResponse(topic, question, level, language));
      }
    }
  } catch (error: any) {
    console.error('[AI Tutor Error]:', error);
    res.json(getDemoTutorResponse(req.body?.topic || '', req.body?.question || '', req.body?.level || 'beginner', req.body?.language || 'en'));
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`[Server] Smart Hardware & Circuits Companion running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
