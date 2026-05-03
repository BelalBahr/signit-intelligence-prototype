import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { personas, type Persona, type PersonaId } from '../data/contracts';

interface PersonaContextValue {
  persona: Persona;
  setPersona: (id: PersonaId) => void;
  // Demo runner - sequential walkthrough of one of the three flows
  demoStep: number;       // -1 = idle, 0..n = step index
  demoFlow: DemoFlow | null;
  startDemo: (flow: DemoFlow) => void;
  nextDemo: () => void;
  endDemo: () => void;
}

export type DemoFlow = 'renegotiation' | 'pdpl-sweep' | 'weekly-brief';

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [personaId, setPersonaId] = useState<PersonaId>('cfo');
  const [demoFlow, setDemoFlow] = useState<DemoFlow | null>(null);
  const [demoStep, setDemoStep] = useState<number>(-1);

  const persona = personas.find(p => p.id === personaId)!;

  const setPersona = useCallback((id: PersonaId) => setPersonaId(id), []);

  const startDemo = useCallback((flow: DemoFlow) => {
    setDemoFlow(flow);
    setDemoStep(0);
    // Auto-pick the relevant persona for the flow
    if (flow === 'renegotiation') setPersonaId('procurement');
    else if (flow === 'pdpl-sweep') setPersonaId('legal');
    else if (flow === 'weekly-brief') setPersonaId('cfo');
  }, []);

  const nextDemo = useCallback(() => setDemoStep(s => s + 1), []);
  const endDemo = useCallback(() => {
    setDemoFlow(null);
    setDemoStep(-1);
  }, []);

  return (
    <PersonaContext.Provider value={{ persona, setPersona, demoStep, demoFlow, startDemo, nextDemo, endDemo }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within PersonaProvider');
  return ctx;
}
