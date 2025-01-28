import React from 'react';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes/index';

const App = () => {
  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
};

export default App;
