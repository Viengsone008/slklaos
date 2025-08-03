"use client";
import React from "react";
import { Star, CheckCircle, Download, Eye, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  image: string;
  description?: string;
  longDescription?: string;
  rating?: number;
  features?: string[];
  pdfUrl?: string;
  price?: string;
  is_featured?: boolean;
}

interface Props {
  product: Product; 
  onClick?: () => void;
}

const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    if (onClick) {
      onClick(); // This calls the handleProductClick from parent
    } else {
      // Fallback if no onClick prop is provided
      router.push(`/product-item-details?id=${product.id}`);
    }
  };

  const handleQuoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/product-item-details?id=${product.id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer">
      {/* Product image - clickable */}
      <div
        className="relative h-48 overflow-hidden"
        onClick={handleViewDetails}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover rounded-tl-2xl rounded-tr-2xl group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Featured badge */}
        {product.is_featured && (
          <span className="absolute top-4 left-4 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full">
            Featured
          </span>
        )}

        {/* Rating overlay */}
        {product.rating !== undefined && (
          <div className="absolute bottom-4 left-4 flex items-center bg-white/90 rounded-full px-2 py-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Product title - clickable */}
        <h3
          className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-[#3d9392] transition-colors"
          onClick={handleViewDetails}
        >
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {product.description}
          </p>
        )}
        {!product.description && product.longDescription && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {product.longDescription.substring(0, 120)}...
          </p>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-4">
            <ul className="text-sm">
              {product.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
            </ul>
            {product.features.length > 3 && (
              <p className="text-xs text-gray-500 mt-1">
                +{product.features.length - 3} more features
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-2xl font-bold text-[#3d9392]">
            {product.price || "Price on Request"}
          </div>
          <div className="flex items-center space-x-2">
            {/* PDF Download button */}
            {product.pdfUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(product.pdfUrl, '_blank');
                }}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            
            {/* View Details button */}
            <button
              onClick={handleViewDetails}
              className="p-2 text-gray-500 hover:text-[#3d9392] hover:bg-gray-100 rounded-full transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            {/* Get Quote button */}
            <button
              onClick={handleQuoteClick}
              className="bg-[#3d9392] hover:bg-[#6dbeb0] text-white p-2 rounded-full transition-colors"
              title="Get Quote"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
