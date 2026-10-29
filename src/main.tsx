import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './context/FirebaseContext';
import { ForexProvider } from './context/ForexContext';

createRoot(document.getElementById('root')!).render(
  <FirebaseProvider>
    <ForexProvider>
      <App />
    </ForexProvider>
  </FirebaseProvider>
);
