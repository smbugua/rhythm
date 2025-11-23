"use client";

import { cn } from "@/lib/utils";

interface MoodEnergySelectorProps {
  mood: number | null;
  energy: number | null;
  onMoodChange: (value: number | null) => void;
  onEnergyChange: (value: number | null) => void;
}

const moodEmojis = ["😢", "😔", "😐", "😊", "😄"];
const energyEmojis = ["😴", "🥱", "😌", "💪", "⚡"];

export function MoodEnergySelector({
  mood,
  energy,
  onMoodChange,
  onEnergyChange,
}: MoodEnergySelectorProps) {
  return (
    <div className="space-y-4">
      {/* Mood selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Mood</label>
        <div className="flex gap-2">
          {moodEmojis.map((emoji, index) => {
            const value = index + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onMoodChange(mood === value ? null : value)}
                className={cn(
                  "flex-1 py-2 text-xl rounded-md border transition-all",
                  "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                  mood === value
                    ? "bg-primary/20 border-primary"
                    : "bg-background border-input"
                )}
              >
                {emoji}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Energy selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Energy</label>
        <div className="flex gap-2">
          {energyEmojis.map((emoji, index) => {
            const value = index + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onEnergyChange(energy === value ? null : value)}
                className={cn(
                  "flex-1 py-2 text-xl rounded-md border transition-all",
                  "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                  energy === value
                    ? "bg-primary/20 border-primary"
                    : "bg-background border-input"
                )}
              >
                {emoji}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

// Common symptoms for quick selection
export const commonSymptoms = [
  "Cramps",
  "Headache",
  "Bloating",
  "Fatigue",
  "Backache",
  "Breast tenderness",
  "Acne",
  "Cravings",
  "Insomnia",
  "Anxiety",
  "Irritability",
  "Nausea",
];

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
}

export function SymptomSelector({
  selectedSymptoms,
  onSymptomsChange,
}: SymptomSelectorProps) {
  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      onSymptomsChange(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      onSymptomsChange([...selectedSymptoms, symptom]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Symptoms</label>
      <div className="flex flex-wrap gap-2">
        {commonSymptoms.map((symptom) => (
          <button
            key={symptom}
            type="button"
            onClick={() => toggleSymptom(symptom)}
            className={cn(
              "px-3 py-1 text-xs rounded-full border transition-all",
              "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
              selectedSymptoms.includes(symptom)
                ? "bg-primary/20 border-primary text-primary"
                : "bg-background border-input"
            )}
          >
            {symptom}
          </button>
        ))}
      </div>
    </div>
  );
}
