// Pre-built SVGs converted to data URLs for one-click testing of Circuit Analyzer
export const SAMPLE_CIRCUIT_IMAGES = [
  {
    id: 'sample-led-fault',
    title: 'Arduino 5V LED (Missing Resistor)',
    titleAr: 'أردوينو مع LED بدون مقاومة حماية',
    description: 'A 5V digital output directly driving a standard red LED to GND without a current limiting resistor.',
    descriptionAr: 'خرج رقمي 5 فولت متصل مباشرة بديود ضوئي أحمر (LED) إلى الأرضي بدون مقاومة لتحديد شدة التيار.',
    supplyVoltage: '5.0 V',
    expectedBehavior: 'LED illuminates reliably when digital pin is written HIGH.',
    expectedBehaviorAr: 'إضاءة الـ LED بشكل آمن وثابت عند كتابة HIGH على الطرف الرقمي.',
    symptoms: 'LED burns out or draws excessive current (>60mA), dragging down Arduino 5V rail and causing microcontroller brownout reset.',
    symptomsAr: 'احتراق الدايود أو سحب تيار مفرط (>60mA) مما يهبط بجهد خط 5V ويعيد إقلاع المتحكم (Brownout Reset).',
    componentValues: 'V_supply = 5V, Red LED Vf = 2.0V, R = 0 Ω (Direct wire)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#111827"/>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2937" stroke-width="0.8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <!-- Text / Labels -->
      <text x="200" y="30" fill="#60a5fa" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">CIRCUIT FAULT TESTBENCH: LED OVERCURRENT</text>
      <!-- Arduino Pin -->
      <rect x="40" y="70" width="80" height="60" fill="#1e293b" stroke="#3b82f6" stroke-width="2" rx="4"/>
      <text x="80" y="95" fill="#f8fafc" font-family="monospace" font-size="12" text-anchor="middle">ARDUINO</text>
      <text x="80" y="115" fill="#38bdf8" font-family="monospace" font-size="11" text-anchor="middle">PIN D13 (5V)</text>
      <!-- Wire to LED -->
      <line x1="120" y1="100" x2="220" y2="100" stroke="#f87171" stroke-width="3"/>
      <text x="170" y="90" fill="#ef4444" font-family="monospace" font-size="11" text-anchor="middle">DIRECT 5V (NO RESISTOR!)</text>
      <!-- LED Symbol -->
      <circle x="250" y="100" r="24" fill="#374151" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="240,88 260,100 240,112" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="260" y1="88" x2="260" y2="112" stroke="#ffffff" stroke-width="2"/>
      <!-- Photons -->
      <line x1="262" y1="85" x2="274" y2="73" stroke="#f59e0b" stroke-width="1.5"/>
      <polygon points="274,73 268,74 273,79" fill="#f59e0b"/>
      <line x1="268" y1="91" x2="280" y2="79" stroke="#f59e0b" stroke-width="1.5"/>
      <polygon points="280,79 274,80 279,85" fill="#f59e0b"/>
      <text x="250" y="145" fill="#e2e8f0" font-family="monospace" font-size="11" text-anchor="middle">RED LED (Vf=2.0V)</text>
      <!-- Wire to GND -->
      <line x1="260" y1="100" x2="340" y2="100" stroke="#38bdf8" stroke-width="3"/>
      <line x1="340" y1="100" x2="340" y2="160" stroke="#38bdf8" stroke-width="3"/>
      <!-- Ground Symbol -->
      <line x1="320" y1="160" x2="360" y2="160" stroke="#ffffff" stroke-width="3"/>
      <line x1="328" y1="168" x2="352" y2="168" stroke="#ffffff" stroke-width="2.5"/>
      <line x1="334" y1="176" x2="346" y2="176" stroke="#ffffff" stroke-width="2"/>
      <text x="340" y="198" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">GND (0V)</text>
      <!-- Warning tag -->
      <rect x="130" y="200" width="140" height="24" fill="#7f1d1d" stroke="#ef4444" rx="4"/>
      <text x="200" y="216" fill="#fecaca" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">⚠️ SEVERE OVERCURRENT</text>
    </svg>`
  },
  {
    id: 'sample-relay-flyback',
    title: 'Relay Driver (Missing Flyback Diode)',
    titleAr: 'مشغّل ريليه بدون دايود حماية عكسي (Flyback)',
    description: 'NPN transistor 2N3904 driving a 5V inductive electromechanical relay coil without antiparallel clamp diode.',
    descriptionAr: 'ترانزستور 2N3904 NPN يقود ملف ريليه حثي بجهد 5 فولت بدون دايود تفريغ عكسي مانع للجهد الراجع.',
    supplyVoltage: '5.0 V',
    expectedBehavior: 'Relay clicks and energizes when GPIO goes HIGH; de-energizes safely when GPIO goes LOW.',
    expectedBehaviorAr: 'توصيل الريليه بسلاسة عند إرسال HIGH وفصله بأمان تام عند إرسال LOW.',
    symptoms: 'Transistor breaks down after switching off several times due to inductive flyback spike (V = -L di/dt exceeding 80V).',
    symptomsAr: 'انهيار واحتراق الترانزستور بعد بضع عمليات تبديل بسبب قفزة الجهد الحثي العكسي العالية (V = -L di/dt).',
    componentValues: 'Supply = 5V, Coil Inductance = 100mH, Coil R = 70Ω, Transistor = 2N3904 NPN, Base R = 1kΩ',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#111827"/>
      <rect x="0" y="0" width="400" height="240" fill="none" stroke="#334155" stroke-width="2"/>
      <text x="200" y="25" fill="#f59e0b" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">INDUCTIVE LOAD: MISSING FLYBACK CLAMP</text>
      <!-- +5V Rail -->
      <line x1="50" y1="50" x2="350" y2="50" stroke="#ef4444" stroke-width="3"/>
      <text x="65" y="44" fill="#f87171" font-family="monospace" font-size="12">+5V DC RAIL</text>
      <!-- Relay Coil (Inductor) -->
      <path d="M 250,50 L 250,70 A 8,8 0 0,0 250,86 A 8,8 0 0,0 250,102 A 8,8 0 0,0 250,118 L 250,135" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <text x="310" y="98" fill="#e2e8f0" font-family="monospace" font-size="11">RELAY COIL (L=100mH)</text>
      <!-- Missing diode dashed box -->
      <rect x="180" y="65" width="50" height="60" fill="#450a0a" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4" rx="4"/>
      <text x="205" y="95" fill="#fca5a5" font-family="monospace" font-size="9" text-anchor="middle">MISSING</text>
      <text x="205" y="110" fill="#fca5a5" font-family="monospace" font-size="9" text-anchor="middle">DIODE!</text>
      <!-- Transistor NPN -->
      <circle x="250" y="160" r="18" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="250" y1="135" x2="250" y2="148" stroke="#38bdf8" stroke-width="2.5"/>
      <line x1="238" y1="150" x2="238" y2="170" stroke="#f8fafc" stroke-width="2.5"/>
      <line x1="238" y1="155" x2="250" y2="148" stroke="#f8fafc" stroke-width="2"/>
      <line x1="238" y1="165" x2="250" y2="174" stroke="#f8fafc" stroke-width="2"/>
      <line x1="250" y1="174" x2="250" y2="195" stroke="#38bdf8" stroke-width="2.5"/>
      <!-- Base resistor -->
      <line x1="140" y1="160" x2="180" y2="160" stroke="#38bdf8" stroke-width="2.5"/>
      <rect x="180" y="153" width="40" height="14" fill="#334155" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="200" y="164" fill="#f8fafc" font-family="monospace" font-size="9" text-anchor="middle">1kΩ</text>
      <line x1="220" y1="160" x2="238" y2="160" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="110" y="164" fill="#38bdf8" font-family="monospace" font-size="11">MCU GPIO</text>
      <!-- GND -->
      <line x1="235" y1="195" x2="265" y2="195" stroke="#ffffff" stroke-width="3"/>
      <line x1="242" y1="202" x2="258" y2="202" stroke="#ffffff" stroke-width="2"/>
      <line x1="247" y1="209" x2="253" y2="209" stroke="#ffffff" stroke-width="1.5"/>
      <text x="250" y="228" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="middle">GND</text>
    </svg>`
  },
  {
    id: 'sample-esp32-regulator',
    title: 'ESP32 Linear Regulator (Thermal Dissipation)',
    titleAr: 'منظم جهد خطي لـ ESP32 مع خطر السخونة الزائدة',
    description: 'AMS1117-3.3V linear regulator powered from 12V automotive bus to feed power-hungry ESP32 with active Wi-Fi.',
    descriptionAr: 'منظم جهد خطي AMS1117-3.3V يُغذى من 12V لتشغيل شريحة ESP32 التي تستهلك تياراً عالياً أثناء بث الواي فاي.',
    supplyVoltage: '12.0 V',
    expectedBehavior: 'Step down 12V to clean 3.3V to power ESP32 (~250mA peak current).',
    expectedBehaviorAr: 'تخفيض الجهد من 12V إلى 3.3V مستقر لتشغيل ESP32 (تيار قمة يصل إلى 250mA).',
    symptoms: 'Regulator gets blistering hot (>115°C) and enters thermal shutdown protection within 10 seconds of Wi-Fi transmit.',
    symptomsAr: 'ارتفاع حرارة المنظم لمستويات خطرة (>115°C) ودخوله في وضع الإغلاق الحراري بعد ثوانٍ من تشغيل الواي فاي.',
    componentValues: 'V_in = 12V, V_out = 3.3V, I_load = 250mA, P_dissipated = (12 - 3.3) * 0.25 = 2.175 Watts on SOT-223 package',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#111827"/>
      <text x="200" y="28" fill="#ef4444" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">THERMAL HAZARD: 12V TO 3.3V LINEAR STEP-DOWN</text>
      <!-- 12V In -->
      <line x1="40" y1="90" x2="130" y2="90" stroke="#ef4444" stroke-width="3"/>
      <text x="75" y="80" fill="#f87171" font-family="monospace" font-size="12">VIN = 12V DC</text>
      <!-- Regulator IC -->
      <rect x="130" y="60" width="120" height="70" fill="#1f2937" stroke="#f59e0b" stroke-width="2" rx="4"/>
      <text x="190" y="85" fill="#fef08a" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">AMS1117-3.3</text>
      <text x="190" y="105" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="middle">SOT-223 LDO</text>
      <text x="190" y="120" fill="#ef4444" font-family="monospace" font-size="10" text-anchor="middle">P_loss = 2.18 W ⚠️</text>
      <!-- Output 3.3V -->
      <line x1="250" y1="90" x2="330" y2="90" stroke="#38bdf8" stroke-width="3"/>
      <text x="290" y="80" fill="#38bdf8" font-family="monospace" font-size="12">3.3V OUT</text>
      <!-- ESP32 Load -->
      <rect x="330" y="70" width="60" height="80" fill="#0f172a" stroke="#3b82f6" stroke-width="1.5" rx="3"/>
      <text x="360" y="105" fill="#60a5fa" font-family="monospace" font-size="10" text-anchor="middle">ESP32</text>
      <text x="360" y="125" fill="#93c5fd" font-family="monospace" font-size="9" text-anchor="middle">250mA Wi-Fi</text>
      <!-- Ground -->
      <line x1="190" y1="130" x2="190" y2="170" stroke="#94a3b8" stroke-width="2.5"/>
      <line x1="175" y1="170" x2="205" y2="170" stroke="#ffffff" stroke-width="2.5"/>
      <line x1="182" y1="176" x2="198" y2="176" stroke="#ffffff" stroke-width="2"/>
      <line x1="187" y1="182" x2="193" y2="182" stroke="#ffffff" stroke-width="1.5"/>
      <text x="190" y="202" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="middle">GND</text>
      <!-- Heat waves -->
      <path d="M 175,55 Q 180,45 175,35" stroke="#ef4444" stroke-width="2" fill="none"/>
      <path d="M 190,55 Q 195,45 190,35" stroke="#ef4444" stroke-width="2" fill="none"/>
      <path d="M 205,55 Q 210,45 205,35" stroke="#ef4444" stroke-width="2" fill="none"/>
    </svg>`
  }
];

export const SAMPLE_CODES = [
  {
    id: 'sample-arduino-isr',
    title: 'Arduino ISR Concurrency & Delay Bug (C++)',
    titleAr: 'أردوينو: أخطاء تزامن المقاطعات ISR والتأخير المعطل delay (C++)',
    language: 'cpp' as const,
    platform: 'arduino',
    code: `// Arduino Firmware: RPM Tachometer Counter
#include <Arduino.h>

// BUG 1: Missing volatile qualifier! Compiler caches in register
int pulseCount = 0; 
bool flagTriggered = false;

void onHallSensorPulse() {
    pulseCount++;
    flagTriggered = true;
    // BUG 2: Heavy serial call inside ISR context
    Serial.println("Pulse received!");
}

void setup() {
    Serial.begin(9600);
    // BUG 3: Pin 2 configured as INPUT without pullup, causing floating noise
    pinMode(2, INPUT);
    attachInterrupt(digitalPinToInterrupt(2), onHallSensorPulse, RISING);
}

void loop() {
    // BUG 4: Blocking 2000ms delay freezes main loop execution
    delay(2000); 

    if (flagTriggered) {
        float rpm = (pulseCount / 2.0) * 30.0;
        Serial.print("Calculated Engine RPM: ");
        Serial.println(rpm);
        pulseCount = 0;
        flagTriggered = false;
    }
}
`,
    errorLogs: 'Output RPM displays random spikes or freezes completely; serial buffer overflows during high speeds.',
    errorLogsAr: 'قراءات سرعة المحرك RPM عشوائية وتتجمد؛ فيضان في بافر الاتصال التسلسلي عند السرعات العالية.',
    context: 'Tachometer hall effect sensor connected to digital pin 2 on Arduino Uno.',
    contextAr: 'حساس هول لقياس سرعة الدوران متصل بالطرف الرقمي 2 في لوحة أردوينو أونو.'
  },
  {
    id: 'sample-esp32-freertos',
    title: 'ESP32 Buffer Overflow & Mutex Leak (C)',
    titleAr: 'ESP32: فيضان الذاكرة المؤقتة وتسريب كائن المزامنة Mutex (C)',
    language: 'c' as const,
    platform: 'esp32',
    code: `// ESP32 FreeRTOS Sensor Data Collector
#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

SemaphoreHandle_t xSensorMutex;
char global_packet_buffer[16]; // Only 16 bytes allocated

void vSensorTask(void *pvParameters) {
    char local_payload[64];
    while (1) {
        snprintf(local_payload, sizeof(local_payload), "TEMP:24.5C;HUMID:68.2%%;PRESSURE:1013hPa");

        if (xSemaphoreTake(xSensorMutex, portMAX_DELAY) == pdTRUE) {
            // BUG: strcpy into 16-byte buffer causes stack/heap memory corruption!
            strcpy(global_packet_buffer, local_payload);

            if (strlen(local_payload) > 50) {
                // BUG: Returns early without releasing mutex! Deadlock will occur!
                continue; 
            }
            xSemaphoreGive(xSensorMutex);
        }
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}
`,
    errorLogs: 'Guru Meditation Error: Core 1 panic\'ed (StoreProhibited). Exception was unhandled.',
    errorLogsAr: 'خطأ معالج ESP32: Guru Meditation Error: Core 1 panic (StoreProhibited) انهيار وتوقف النواة 1.',
    context: 'ESP32 dual-core FreeRTOS firmware sending environmental telemetry.',
    contextAr: 'نظام تشغيل مهام FreeRTOS ثنائي النواة على ESP32 لجمع وقراءة حساسات البيئة.'
  },
  {
    id: 'sample-python-gpio',
    title: 'Python Raspberry Pi / MicroPython Bouncing & Resource Leak',
    titleAr: 'بايثون / رازبيري باي: ارتداد المفتاح الميكانيكي وتسريب المعالج',
    language: 'python' as const,
    platform: 'raspberry_pi',
    code: `# Raspberry Pi Industrial Switch Monitor
import RPi.GPIO as GPIO
import time

BUTTON_PIN = 17
counter = 0

def setup_gpio():
    GPIO.setmode(GPIO.BCM)
    # BUG 1: Pin set without pull-up or pull-down resistor
    GPIO.setup(BUTTON_PIN, GPIO.IN)

def main():
    global counter
    setup_gpio()
    print("Monitoring switch events...")
    
    # BUG 2: Busy polling tight loop with 0ms sleep consumes 100% CPU
    while True:
        state = GPIO.input(BUTTON_PIN)
        if state == 1:
            # BUG 3: No debounce hysteresis - contact mechanical bounce triggers 10-50 counts per press!
            counter += 1
            print(f"Triggered count: {counter}")
            # BUG 4: Missing GPIO.cleanup() in try/finally block

if __name__ == "__main__":
    main()
`,
    errorLogs: 'Single button press generates 30 rapid increments. CPU load spikes to 100% on Core 0.',
    errorLogsAr: 'الضغطة الواحدة على المفتاح تولد 30 نبضة خاطئة متتالية، وحمل المعالج يرتفع لـ 100%.',
    context: 'Raspberry Pi 4 monitoring an emergency stop mechanical microswitch.',
    contextAr: 'رازبيري باي 4 يراقب مفتاح طوارئ ميكانيكي بدون دائرة أو كود إزالة الارتداد Debounce.'
  }
];

export function svgToDataUri(svg: string): string {
  const cleanSvg = svg.trim();
  const encoded = encodeURIComponent(cleanSvg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
