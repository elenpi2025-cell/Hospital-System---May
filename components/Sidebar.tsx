import React from 'react';
import { AgentType, ToolCallLog } from '../types';
import { 
  Network, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Search,
  Activity
} from 'lucide-react';

interface SidebarProps {
  logs: ToolCallLog[];
  activeAgent: AgentType | null;
}

const AgentCard = ({ 
  type, 
  icon: Icon, 
  label, 
  isActive,
  description
}: { 
  type: AgentType; 
  icon: any; 
  label: string; 
  isActive: boolean;
  description: string;
}) => (
  <div className={`p-3 rounded-lg border transition-all duration-300 mb-3 ${
    isActive 
      ? 'bg-blue-50 border-blue-400 shadow-md transform scale-[1.02]' 
      : 'bg-white border-slate-200 text-slate-500 opacity-80'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100'}`}>
        <Icon size={18} />
      </div>
      <div>
        <h4 className={`text-sm font-semibold ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>{label}</h4>
        <p className="text-[10px] text-slate-500 leading-tight mt-1">{description}</p>
      </div>
    </div>
    {isActive && (
       <div className="mt-2 flex items-center gap-2">
         <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-medium text-green-600 uppercase tracking-wider">Processing</span>
       </div>
    )}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ logs, activeAgent }) => {
  return (
    <div className="w-80 bg-slate-50 border-r border-slate-200 h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="flex items-center gap-2 font-bold text-slate-800 text-lg">
          <Network className="text-blue-600" />
          System Agents
        </h2>
        <p className="text-xs text-slate-500 mt-1">Hospital System Coordinator (HSC)</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Active Modules</h3>
            
            <AgentCard 
                type={AgentType.PIH} 
                icon={Users} 
                label="Patient Info" 
                isActive={activeAgent === AgentType.PIH} 
                description="Registration, Updates, Demographics"
            />
            <AgentCard 
                type={AgentType.AS} 
                icon={Calendar} 
                label="Scheduler" 
                isActive={activeAgent === AgentType.AS}
                description="Bookings, Cancellations, Availability"
            />
            <AgentCard 
                type={AgentType.MRA} 
                icon={FileText} 
                label="Medical Records" 
                isActive={activeAgent === AgentType.MRA}
                description="History, Results, Report Generation"
            />
            <AgentCard 
                type={AgentType.BIS} 
                icon={CreditCard} 
                label="Billing & Insurance" 
                isActive={activeAgent === AgentType.BIS}
                description="Invoices, Coverage, Payments"
            />
            <AgentCard 
                type={AgentType.SEARCH} 
                icon={Search} 
                label="External Knowledge" 
                isActive={activeAgent === AgentType.SEARCH}
                description="Google Search Grounding"
            />
        </div>

        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity size={12} /> System Logs
            </h3>
            <div className="space-y-2">
                {logs.length === 0 && <p className="text-xs text-slate-400 italic">System ready. Waiting for requests...</p>}
                {logs.slice().reverse().map((log, idx) => (
                    <div key={idx} className="text-xs p-2 bg-white border border-slate-100 rounded shadow-sm">
                        <span className="font-mono text-blue-600">[{log.timestamp.toLocaleTimeString()}]</span>
                        <span className="font-semibold text-slate-700 ml-1">{log.agent}:</span>
                        <span className="text-slate-500 block pl-4">{log.action}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
