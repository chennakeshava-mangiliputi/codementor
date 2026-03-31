import { GraduationCap, MonitorSmartphone } from "lucide-react";

export function InterviewSimulationIcon({ size = 28 }: { size?: number }) {
  return <MonitorSmartphone size={size} strokeWidth={2.2} />;
}

export function LearningModeIcon({ size = 28 }: { size?: number }) {
  return <GraduationCap size={size} strokeWidth={2.2} />;
}
