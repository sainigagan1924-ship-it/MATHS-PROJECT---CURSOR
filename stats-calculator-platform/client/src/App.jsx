import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './layout/MainLayout';
import { Home } from './pages/Home';
import { TestPage } from './pages/TestPage';
import { About } from './pages/About';
import { FormulaReference } from './pages/FormulaReference';
import { History } from './pages/History';
import { Compare } from './pages/Compare';
import { SharePage } from './pages/SharePage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/share/:token" element={<SharePage />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/test/:testId" element={<TestPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/formulas" element={<FormulaReference />} />
            <Route path="/history" element={<History />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
