import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuthPage from './pages/Auth';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AdminPage from './pages/Admin';
import { RequireAdmin } from './components/RouteGuards';
import CartPage from './pages/Cart';
import { CartProvider } from './components/CartContext';
import ProductPage from './pages/Product';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
          <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
