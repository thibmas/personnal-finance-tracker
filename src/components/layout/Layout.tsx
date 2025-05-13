import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import { useTheme } from '../../context/ThemeContext';

const Layout: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className={theme}>
      <main className="min-h-screen pb-16">
        <Outlet />
      </main>
      <NavBar />
    </div>
  );
};

export default Layout;