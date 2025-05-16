import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import './i18n'; // Importez la configuration i18n

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </DataProvider>
    </BrowserRouter>
  </StrictMode>
);