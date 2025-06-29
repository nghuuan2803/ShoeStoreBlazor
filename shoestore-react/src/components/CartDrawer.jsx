import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, loading, error, updateQuantity, removeFromCart, clearError } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (inventoryId, newQuantity) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    await updateQuantity(inventoryId, newQuantity);
    setIsUpdating(false);
  };

  const handleRemoveItem = async (inventoryId) => {
    setIsUpdating(true);
    await removeFromCart(inventoryId);
    setIsUpdating(false);
  };

  // Calculate subtotal from cart items
  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce(
    (total, item) => {
      // Use promotion price if available, then sale price, then regular price
      const effectivePrice = item.promotionPrice || item.salePrice || item.price || 0;
      return total + effectivePrice * item.quantity;
    },
    0
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Giỏ hàng</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{error}</span>
                  <button
                    onClick={clearError}
                    className="text-red-700 hover:text-red-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}

            {cartItems.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-16 w-16 mb-4"
                >
                  <circle cx="8" cy="21" r="1"/>
                  <circle cx="19" cy="21" r="1"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                <p>Giỏ hàng trống</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.inventoryId} className="flex gap-4">
                    <img
                      src={item.mainImage || '/images/defaults/product-default.jpg'}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.productName}</h3>
                        <button
                          onClick={() => handleRemoveItem(item.inventoryId)}
                          disabled={isUpdating}
                          className="text-gray-500 hover:text-red-500 disabled:opacity-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M18 6 6 18"/>
                            <path d="m6 6 12 12"/>
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                      
                      {/* Promotion Information */}
                      {item.hasActivePromotion && item.promotionName && (
                        <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mt-1">
                          🎉 {item.promotionName}
                        </div>
                      )}
                      
                      {/* Price Information */}
                      <div className="flex items-center gap-2 mt-1">
                        {item.hasActivePromotion && item.promotionPrice ? (
                          <>
                            <span className="text-sm font-medium text-purple-600">{formatPrice(item.promotionPrice)}</span>
                            <span className="text-xs text-gray-500 line-through">{formatPrice(item.price)}</span>
                          </>
                        ) : item.salePrice ? (
                          <>
                            <span className="text-sm font-medium text-red-500">{formatPrice(item.salePrice)}</span>
                            <span className="text-xs text-gray-500 line-through">{formatPrice(item.price)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-medium">{formatPrice(item.price)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => handleQuantityChange(item.inventoryId, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="px-2 py-1">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.inventoryId, item.quantity + 1)}
                            disabled={isUpdating}
                            className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-medium">
                          {formatPrice((item.promotionPrice || item.salePrice || item.price || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Tổng cộng:</span>
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>
            <Link
              to="/checkout"
              className={`block w-full text-center py-3 rounded-md font-medium ${
                cartItems.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
              }`}
              onClick={cartItems.length === 0 ? (e) => e.preventDefault() : onClose}
            >
              Thanh toán
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer; 