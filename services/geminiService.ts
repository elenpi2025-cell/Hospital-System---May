import { GoogleGenAI, FunctionDeclaration, Type, Tool, FunctionCall } from "@google/genai";
import { 
  patientInformationHandler, 
  appointmentScheduler, 
  medicalRecordsAssistant, 
  billingSupport 
} from "./hospitalLogic";
import { AgentType } from "../types";

// --- 1. Define Tools (Function Declarations) ---

const pihTool: FunctionDeclaration = {
  name: "patientInformationHandler",
  description: "Handles patient demographics: registration, updates, and retrieval.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "One of: 'register', 'update', 'get'" },
      details: { 
        type: Type.OBJECT, 
        description: "Patient details (name, dob, address) for registration/updates, or search criteria for retrieval.",
        properties: {
            name: { type: Type.STRING },
            dob: { type: Type.STRING },
            address: { type: Type.STRING }
        }
      }
    },
    required: ["action"]
  }
};

const asTool: FunctionDeclaration = {
  name: "appointmentScheduler",
  description: "Manages appointments: scheduling, rescheduling, cancelling, and availability.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "One of: 'schedule', 'reschedule', 'cancel', 'check_availability'" },
      details: {
        type: Type.OBJECT,
        description: "Appointment details (date, time, doctor, specialty).",
        properties: {
            date: { type: Type.STRING },
            time: { type: Type.STRING },
            doctor: { type: Type.STRING },
            specialty: { type: Type.STRING }
        }
      }
    },
    required: ["action"]
  }
};

const mraTool: FunctionDeclaration = {
  name: "medicalRecordsAssistant",
  description: "Accesses medical records, summaries, and generates formal reports.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "One of: 'get_summary', 'generate_document'" },
      patientName: { type: Type.STRING, description: "Name of the patient." }
    },
    required: ["action", "patientName"]
  }
};

const bisTool: FunctionDeclaration = {
  name: "billingAndInsuranceSupport",
  description: "Handles billing inquiries, insurance coverage, and payment options.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      queryType: { type: Type.STRING, description: "One of: 'check_bill', 'insurance', 'general_info'" },
      details: { type: Type.STRING, description: "Additional context like invoice ID or insurance provider name." }
    },
    required: ["queryType"]
  }
};

// Combine into Tool config
const toolsConfig: Tool[] = [
  {
    functionDeclarations: [pihTool, asTool, mraTool, bisTool],
  },
  {
    googleSearch: {} // Fallback tool as requested
  }
];

// --- 2. System Instruction (From Prompt) ---

const SYSTEM_INSTRUCTION = `
# SYSTEM INSTRUCTION: Hospital System Coordinator (HSC)

You are the Hospital System Coordinator (HSC). Your job is to route user requests to the appropriate sub-agent or use Google Search for general info.

## 1. Core Role
- Analyze user intent.
- Route to: PatientInformationHandler, AppointmentScheduler, MedicalRecordsAssistant, or BillingAndInsuranceSupport.
- IF the request is general (e.g., "health tips", "hospital hours" not in DB), use Google Search.

## 2. Response Process
1. Determine intent.
2. Call the specific function tool.
3. If no specific tool matches, or for general knowledge, use googleSearch.
4. Provide the final answer based on the tool's output. Maintain a professional, helpful, and "medical accounting" tone (precise, secure).
`;

// --- 3. Service Logic ---

export class GeminiService {
  private client: GoogleGenAI;
  private modelName = "gemini-2.5-flash"; // Using 2.5 Flash as recommended for tools + speed

  constructor() {
    // Vercel build checks might run this when env is not fully loaded yet, so fallback strictly
    const apiKey = process.env.API_KEY || "";
    this.client = new GoogleGenAI({ apiKey: apiKey });
  }

  async sendMessage(
    history: { role: string; parts: { text: string }[] }[],
    newMessage: string,
    onToolCall?: (agent: AgentType, action: string) => void
  ) {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please check your Vercel settings.");
    }

    // We use a fresh chat session for simplicity to ensure config is applied, 
    // but pass previous history context.
    const chat = this.client.chats.create({
      model: this.modelName,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: toolsConfig,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    try {
      let result = await chat.sendMessage({ message: newMessage });
      
      // Loop to handle function calls (multi-turn tool use)
      while (result.functionCalls && result.functionCalls.length > 0) {
        const functionCalls = result.functionCalls;
        
        // Prepare responses
        const functionResponses = [];

        for (const call of functionCalls) {
          const name = call.name;
          // Cast args to any to suppress TS errors, we trust the model/schema
          const args = call.args as any;
          const callId = call.id;

          // Notify UI about which agent is working
          if (onToolCall) {
            let mappedAgent = AgentType.HSC;
            if (name === 'patientInformationHandler') mappedAgent = AgentType.PIH;
            if (name === 'appointmentScheduler') mappedAgent = AgentType.AS;
            if (name === 'medicalRecordsAssistant') mappedAgent = AgentType.MRA;
            if (name === 'billingAndInsuranceSupport') mappedAgent = AgentType.BIS;
            onToolCall(mappedAgent, args.action || args.queryType || 'processing');
          }

          // Execute Logic
          let apiResponse = "";
          if (name === "patientInformationHandler") {
            apiResponse = patientInformationHandler(args.action, args.details);
          } else if (name === "appointmentScheduler") {
            apiResponse = appointmentScheduler(args.action, args.details);
          } else if (name === "medicalRecordsAssistant") {
            apiResponse = medicalRecordsAssistant(args.action, args.patientName);
          } else if (name === "billingAndInsuranceSupport") {
            apiResponse = billingSupport(args.queryType, args.details);
          } else {
             apiResponse = JSON.stringify({ error: "Function not found" });
          }

          functionResponses.push({
            name: name,
            response: { result: apiResponse },
            id: callId
          });
        }

        // Send tool results back to model
        // In the new SDK, message can be an array of Parts. 
        // We structure the functionResponse parts correctly.
        result = await chat.sendMessage({
          message: functionResponses.map(fr => ({
            functionResponse: fr
          }))
        });
      }

      // Final text response
      const text = result.text;
      
      // Extract grounding metadata if Google Search was used
      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const urls: string[] = [];
      if (groundingChunks) {
        groundingChunks.forEach((chunk: any) => {
           if (chunk.web?.uri) urls.push(chunk.web.uri);
        });
      }

      // Detect which agent likely answered based on previous context or grounding
      let finalAgent = AgentType.HSC;
      if (urls.length > 0) finalAgent = AgentType.SEARCH;

      return {
        text,
        agent: finalAgent,
        urls: urls.length > 0 ? urls : undefined
      };

    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }
}