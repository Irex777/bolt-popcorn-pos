import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

function Sales() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      toast.error('Failed to load products');
      return;
    }

    setProducts(data);
    const uniqueCategories = Array.from(new Set(data.map(p => p.category)));
    setCategories(uniqueCategories);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  const checkout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { error } = await supabase.from('sales').insert({
      total,
      items: cart,
      user_id: user?.id,
    });

    if (error) {
      toast.error('Failed to process sale');
      return;
    }

    toast.success('Sale completed successfully');
    clearCart();
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Categories */}
      <div className="mb-4 -mx-4 px-4 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24 lg:pb-0">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-blue-600 font-bold">
                {new Intl.NumberFormat('cs-CZ', {
                  style: 'currency',
                  currency: 'CZK',
                }).format(product.price)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Cart Toggle */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg">
        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="w-full px-4 py-3 flex items-center justify-between bg-blue-600 text-white"
        >
          <div className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            <span>{itemCount} items</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">
              {new Intl.NumberFormat('cs-CZ', {
                style: 'currency',
                currency: 'CZK',
              }).format(total)}
            </span>
            {isCartOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </div>
        </button>

        {/* Mobile Cart Drawer */}
        <div className={`absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 transform transition-transform duration-300 ${
          isCartOpen ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <div className="max-h-[60vh] overflow-auto">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Intl.NumberFormat('cs-CZ', {
                      style: 'currency',
                      currency: 'CZK',
                    }).format(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.id);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4">
            <button
              onClick={checkout}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Cart */}
      <div className="hidden lg:block fixed top-0 right-0 w-96 h-screen bg-white shadow-lg">
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <ShoppingCart className="mr-2" />
              Cart
            </h2>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {cart.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b"
              >
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Intl.NumberFormat('cs-CZ', {
                      style: 'currency',
                      currency: 'CZK',
                    }).format(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-lg text-blue-600">
                {new Intl.NumberFormat('cs-CZ', {
                  style: 'currency',
                  currency: 'CZK',
                }).format(total)}
              </span>
            </div>
            <button
              onClick={checkout}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;