import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
