export enum Sender {
  USER = 'USER',
  BOT = 'BOT',
  SYSTEM = 'SYSTEM'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  activeAgent?: AgentType; // To show which agent handled this
  groundingUrls?: string[]; // For Google Search results
}

export enum AgentType {
  HSC = 'Hospital System Coordinator',
  PIH = 'Patient Information Handler',
  AS = 'Appointment Scheduler',
  MRA = 'Medical Records Assistant',
  BIS = 'Billing & Insurance Support',
  SEARCH = 'External Search'
}

export interface ToolCallLog {
  agent: AgentType;
  action: string;
  status: 'pending' | 'success' | 'error';
  timestamp: Date;
}
