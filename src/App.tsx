import { DemoProvider } from './contexts/DemoStore';
import { DemoCanvas } from './pages/DemoCanvas';

export function App() {
  return (
    <DemoProvider>
      <DemoCanvas />
    </DemoProvider>);

}