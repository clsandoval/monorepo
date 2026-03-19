import { useEffect } from 'react';
import { useGameStore } from './store/game-store';
import { PlanScreen } from './screens/PlanScreen';
import { SealedWatch } from './screens/SealedWatch';
import { Inspector } from './screens/Inspector';

export function App() {
  const { phase, initMission1, units } = useGameStore();

  useEffect(() => {
    if (units.length === 0) initMission1();
  }, []);

  switch (phase) {
    case 'plan':
      return <PlanScreen />;
    case 'watch':
      return <SealedWatch />;
    case 'inspect':
      return <Inspector />;
  }
}
