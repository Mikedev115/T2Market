import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { DataProvider } from './data.jsx';
import { DemoProvider } from './components/ui.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <DemoProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </DemoProvider>
    </HashRouter>
  </StrictMode>,
);
