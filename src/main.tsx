import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// SF Pro is used where the OS provides it (Apple devices); Inter is the
// closest freely-licensed fallback elsewhere, and the segmented buttons use
// Inter explicitly. Only the weights the design uses.
import '@fontsource/inter/latin-100.css';
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/monsieur-la-doulaise/latin-400.css';
import './styles/global.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
