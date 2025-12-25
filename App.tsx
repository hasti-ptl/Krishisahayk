import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import VoiceCommand from './pages/VoiceCommand';
import ActivityHistory from './pages/ActivityHistory';
import Finance from './pages/Finance';
import SchemesWeather from './pages/SchemesWeather';
import { APP_ROUTES } from './constants';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path={APP_ROUTES.HOME} element={<Home />} />
            <Route path={APP_ROUTES.VOICE} element={<VoiceCommand />} />
            <Route path={APP_ROUTES.ACTIVITY} element={<ActivityHistory />} />
            <Route path={APP_ROUTES.FINANCE} element={<Finance />} />
            <Route path={APP_ROUTES.SCHEMES} element={<SchemesWeather />} />
          </Routes>
        </Layout>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
