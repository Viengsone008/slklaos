"use client";
import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Shield,
  Layers,
  CheckCircle,
  Star,
  Award,
  Truck,
  DollarSign,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  Download,
  ChevronDown,
  Share2,
  Heart,
  Sparkles,
  Crown,
  Globe,
  Clock,
  PlayCircle,
  Eye,
  Plus,
} from "lucide-react";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AnimatedSection from "../../components/AnimatedSection";
import QuoteModal from "../../components/QuoteModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../../lib/supabase";

/* --------------------------------------------------------------
   Types
   --------------------------------------------------------------*/
interface ColourOption {
  name: string;
  hex?: string;
  image?: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  images?: string[];
  manufacturer?: string;
  category?: string;
  categoryName?: string;
  price?: string;
  warranty?: string;
  description?: string;
  longDescription?: string;
  features?: string[];
  applications?: string[];
  benefits?: string[];
  specifications?: { name: string; value: string }[];
  colours?: ColourOption[];
  installation?: string[];
  pdfUrl?: string;
  catalogueUrl?: string;
  relatedProducts?: string[];
  rating?: number;
}

/* --------------------------------------------------------------
   Helpers
   --------------------------------------------------------------*/
const mapDbRowToProduct = (row: any): Product => ({
  ...row,
  categoryName: row.categoryName ?? row.category_name,
  longDescription: row.longDescription ?? row.long_description,
  pdfUrl: row.pdfUrl ?? row.pdf_url,
  catalogueUrl: row.catalogueUrl ?? row.catalogue_url,
  relatedProducts: row.relatedProducts ?? row.related_products,
});

/* --------------------------------------------------------------
   Component
   --------------------------------------------------------------*/
const ProductItemDetailPage: React.FC = () => {
  // Scroll Progress Indicator
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [selectedColor, setSelectedColor] = useState<ColourOption | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  /* Thumbnail scrolling */
  const thumbRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* Fetch single product */
  useEffect(() => {
    if (!productId) return;

    (async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        setProduct(null);
      } else {
        const prod = mapDbRowToProduct(data);
        setProduct(prod);
        setCurrentImage(
          prod.images?.length ? prod.images[0] : prod.image ?? null
        );
        setSelectedColor(prod.colours?.length ? prod.colours[0] : null);
      }
      setIsLoading(false);
    })();
  }, [productId]);

  /* Fetch related products */
  useEffect(() => {
    if (!product?.relatedProducts?.length) return;

    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", product.relatedProducts);

      if (!error && data) setRelatedProducts(data.map(mapDbRowToProduct));
    })();
  }, [product]);

  /* Thumbnail scroll button logic */
  useEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [product]);

  /* Handlers */
  const handleBack = () => router.push("/product-catalogue");

  const scrollThumbs = (dir: "left" | "right") => {
    const el = thumbRef.current;
    if (el) {
      const offset = el.clientWidth * 0.8;
      el.scrollBy({ left: dir === "left" ? -offset : offset, behavior: "smooth" });
    }
  };

  const handleShare = (platform: "facebook" | "instagram" | "linkedin") => {
    if (!product) return;
    const url = `${window.location.origin}/product-item-details?id=${product.id}`;
    const enc = encodeURIComponent;
    const map = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      instagram: "",
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    } as const;

    if (platform === "instagram") {
      toast.info("Instagram sharing would open the app.", {
        style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }
      });
    } else {
      window.open(map[platform], "_blank");
    }
  };

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!Number.isNaN(v) && v > 0) setQuantity(v);
  };

  const handleAddToQuote = () => {
    if (!product) return;
    setIsQuoteModalOpen(true);
    toast.success(`Added ${quantity} × ${product.name} to your quote`, {
      style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }
    });
  };

  const handleRelatedProductClick = (relatedProductId: string) => {
    router.push(`/product-item-details?id=${relatedProductId}`);
  };

  /* Loading state with luxury animation */
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="w-full min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="text-center">
            <div className="relative">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-transparent bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 mx-auto mb-8"></div>
              <div className="absolute inset-2 h-16 w-16 animate-pulse rounded-full bg-slate-900 mx-auto"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-amber-400" />
            </div>
            <p className="text-slate-300 font-light text-xl tracking-wide">Loading luxury experience...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="w-full min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-6 py-32 text-center">
            <h1 className="mb-6 text-5xl font-extralight text-slate-100 tracking-tight">Product Not Found</h1>
            <p className="mb-10 text-slate-400 max-w-md mx-auto leading-relaxed text-lg">
              The luxury product you're seeking appears to be unavailable.
            </p>
            <button
              onClick={handleBack}
              className="mx-auto flex items-center rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 px-10 py-5 font-medium text-slate-900 transition-all duration-300 shadow-2xl hover:shadow-amber-500/25"
            >
              <ArrowLeft className="mr-3 h-5 w-5" /> Return to Collection
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const ProductIcon = product.category === "waterproofing" ? Shield : Layers;

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-[999] h-2 bg-gradient-to-r from-[#3d9392]/30 to-[#6dbeb0]/30">
        <div
          className="h-full bg-gradient-to-r from-[#3d9392] to-[#6dbeb0] rounded-r-full shadow-lg transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <Navbar />
      
      {/* Luxury Background */}
      <div className="w-full min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.3),transparent_50%)]"></div>
        
        <div className="relative z-10 container mx-auto mt-24 px-2 sm:px-4 md:px-6 py-8 md:py-16">
          {/* Luxury Breadcrumbs */}
          <AnimatedSection animation="fade-right" className="mb-12">
            <div className="flex items-center text-sm text-slate-400 mb-8">
              <button
                onClick={() => router.push("/")}
                className="hover:text-amber-400 transition-colors duration-300 flex items-center"
              >
                <Crown className="w-4 h-4 mr-1" />
                Home 
              </button>
              <span className="mx-3 text-slate-600">•</span>
              <button
                onClick={() => router.push("/product-catalogue")}
                className="hover:text-amber-400 transition-colors duration-300"
              >
                Luxury Collection
              </button>
              <span className="mx-3 text-slate-600">•</span>
              <button
                onClick={() => router.push(`/product-catalogue?category=${product.category}`)}
                className="hover:text-amber-400 transition-colors duration-300 capitalize"
              >
                {product.categoryName || product.category}
              </button>
              <span className="mx-3 text-slate-600">•</span>
              <span className="text-amber-400 font-medium truncate max-w-[200px]">
                {product.name}
              </span>
            </div>
          </AnimatedSection>

          {/* Hero Product Section */}
          <AnimatedSection animation="fade-up" className="mb-12 md:mb-20">
            <div className="bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image Gallery */}
                <div className="relative flex flex-col bg-gradient-to-br from-slate-50 to-white">
                  <div className="relative w-full h-64 xs:h-80 sm:h-96 md:h-[420px] xl:h-[600px] overflow-hidden group">
                    <img
                      src={currentImage || product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-all duration-700 cursor-zoom-in ${
                        isImageZoomed ? 'scale-150' : 'group-hover:scale-105'
                      }`}
                      onClick={() => setIsImageZoomed(!isImageZoomed)}
                    />
                    
                    {/* Premium overlay effects */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    
                    {/* Zoom indicator */}
                    <div className="absolute top-6 right-6 bg-black/20 backdrop-blur-md text-white px-3 py-2 rounded-full text-xs font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Eye className="w-3 h-3 mr-1" />
                      Click to zoom
                    </div>
                  </div>

                  {/* Luxury Thumbnails */}
                  {product.images && product.images.length > 1 && (
                    <div className="relative mt-4 sm:mt-8 px-2 sm:px-8">
                      {canScrollLeft && (
                        <button
                          onClick={() => scrollThumbs("left")}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 border border-slate-200/50"
                        >
                          <ChevronLeft size={18} className="text-slate-700" />
                        </button>
                      )}
                      {canScrollRight && (
                        <button
                          onClick={() => scrollThumbs("right")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 border border-slate-200/50"
                        >
                          <ChevronRight size={18} className="text-slate-700" />
                        </button>
                      )}

                      <div
                        ref={thumbRef}
                        className="flex space-x-2 sm:space-x-4 overflow-x-auto px-2 sm:px-10 pb-4 scroll-smooth no-scrollbar"
                      >
                        {product.images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImage(img)}
                            className={`w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
                              currentImage === img 
                                ? "border-amber-400 shadow-lg shadow-amber-400/25 scale-110" 
                                : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                            }`}
                          >
                            <img 
                              src={img} 
                              alt={`${product.name} view ${i + 1}`} 
                              className="w-full h-full object-cover" 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Luxury Badges */}
                  <div className="absolute top-8 left-8">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-4 py-2 rounded-full text-sm font-semibold capitalize shadow-lg flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {product.categoryName || product.category}
                    </div>
                  </div>
                  
                  {product.rating && (
                    <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-2" />
                        <span className="text-sm font-semibold text-slate-800">{product.rating}</span>
                        <span className="text-xs text-slate-500 ml-1">/5</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="p-4 xs:p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50/50">
                  <div className="flex items-start mb-8">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-2xl mr-6 shadow-inner">
                      <ProductIcon className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h1 className="text-4xl md:text-5xl font-extralight text-slate-800 tracking-tight leading-tight mb-3">
                        {product.name}
                      </h1>
                      {product.manufacturer && (
                        <p className="text-slate-600 font-medium text-lg flex items-center">
                          <Globe className="w-4 h-4 mr-2" />
                          {product.manufacturer}
                        </p>
                      )}
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-slate-700 text-xl leading-relaxed mb-8 font-light">{product.description}</p>
                  )}

                  {/* Premium Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="mb-8 sm:mb-10 bg-gradient-to-r from-slate-50 to-white p-4 sm:p-8 rounded-3xl shadow-inner border border-slate-100">
                      <h3 className="font-semibold text-slate-800 mb-6 text-xl flex items-center">
                        <Award className="w-5 h-5 mr-2 text-amber-500" />
                        Premium Features
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {product.features.slice(0, 4).map((f, i) => (
                          <div key={i} className="flex items-center group">
                            <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mr-4 group-hover:scale-125 transition-transform duration-300"></div>
                            <span className="text-slate-700 font-medium">{f}</span>
                          </div>
                        ))}
                        {product.features.length > 4 && (
                          <div className="flex items-center text-amber-600 font-medium">
                            <Plus className="w-4 h-4 mr-2" />
                            <span>+{product.features.length - 4} more premium features</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price & Warranty */}
                  <div className="mb-8 sm:mb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {product.price && (
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl shadow-inner">
                          <span className="text-amber-700 text-sm block mb-2 font-medium">Investment</span>
                          <span className="text-3xl font-light text-amber-800">{product.price}</span>
                        </div>
                      )}
                      {product.warranty && (
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl shadow-inner">
                          <span className="text-emerald-700 text-sm block mb-2 font-medium flex items-center">
                            <Shield className="w-4 h-4 mr-1" />
                            Warranty
                          </span>
                          <span className="text-xl font-medium text-emerald-800">{product.warranty}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Color Selection */}
                  {product.colours && product.colours.length > 0 && (
                    <div className="mb-8 sm:mb-10">
                      <h4 className="text-lg font-semibold text-slate-800 mb-4">Available Finishes</h4>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {product.colours.slice(0, 6).map((color, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedColor(color)}
                            className={`w-12 h-12 rounded-xl border-2 transition-all duration-300 ${
                              selectedColor?.name === color.name 
                                ? 'border-amber-400 scale-110 shadow-lg' 
                                : 'border-slate-300 hover:border-slate-400'
                            }`}
                            style={{ backgroundColor: color.hex || "#fff" }}
                            title={color.name}
                          >
                            {color.image && (
                              <img src={color.image} alt={color.name} className="w-full h-full object-cover rounded-lg" />
                            )}
                          </button>
                        ))}
                      </div>
                      {selectedColor && (
                        <p className="text-sm text-slate-600 mt-2">Selected: {selectedColor.name}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Quantity & Quote */}
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-8 sm:mb-10">
                    <div className="w-full md:w-1/3">
                      <label className="block text-sm font-semibold text-slate-600 mb-3">Quantity (sqm)</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-full px-6 py-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 bg-white shadow-inner"
                      />
                    </div>
                    <div className="w-full md:w-2/3">
                      <button
                        onClick={handleAddToQuote}
                        className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-slate-900 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 flex items-center justify-center text-base sm:text-lg"
                      >
                        <DollarSign className="w-5 h-5 mr-2" /> Request Luxury Quote
                      </button>
                    </div>
                  </div>

                  {/* Share & Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-200 gap-6 sm:gap-0">
                    <div className="w-full sm:w-auto">
                      <p className="text-slate-600 mb-4 font-medium">Share this luxury product</p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleShare("facebook")}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <Facebook className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShare("linkedin")}
                          className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <Linkedin className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShare("instagram")}
                          className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <Instagram className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <button className="flex items-center bg-slate-100 hover:bg-slate-200 px-6 py-3 rounded-xl text-slate-700 transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto justify-center mt-4 sm:mt-0">
                      <Heart className="w-5 h-5 mr-2 stroke-slate-500" />
                      <span className="font-medium">Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
            {/* Left Content */}
            <div className="lg:col-span-2">
              <AnimatedSection animation="fade-up" delay={200}>
                {/* Luxury Tabbed Navigation */}
                <div className="mb-8 sm:mb-10 bg-white/90 backdrop-blur-xl rounded-3xl p-1 sm:p-2 shadow-xl border border-white/20">
                  <div className="flex overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`px-8 py-4 font-semibold text-lg transition-all duration-300 whitespace-nowrap rounded-2xl ${
                        activeTab === "description"
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-lg"
                          : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      Description
                    </button>
                    {product.specifications && product.specifications.length > 0 && (
                      <button
                        onClick={() => setActiveTab("specs")}
                        className={`px-8 py-4 font-semibold text-lg transition-all duration-300 whitespace-nowrap rounded-2xl ${
                          activeTab === "specs"
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-lg"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        Specifications
                      </button>
                    )}
                    {product.applications && product.applications.length > 0 && (
                      <button
                        onClick={() => setActiveTab("applications")}
                        className={`px-8 py-4 font-semibold text-lg transition-all duration-300 whitespace-nowrap rounded-2xl ${
                          activeTab === "applications"
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-lg"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        Applications
                      </button>
                    )}
                    {product.installation && product.installation.length > 0 && (
                      <button
                        onClick={() => setActiveTab("installation")}
                        className={`px-8 py-4 font-semibold text-lg transition-all duration-300 whitespace-nowrap rounded-2xl ${
                          activeTab === "installation"
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-lg"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        Installation
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="mb-8 sm:mb-12">
                  {/* Description Tab */}
                  {activeTab === "description" && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-4 xs:p-6 sm:p-10 md:p-12 border border-white/20">
                      {product.longDescription && product.longDescription.trim().length > 0 ? (
                        <div className="prose prose-lg max-w-none">
                          {product.longDescription.split('\n\n').map((para, idx) => (
                            <p key={idx} className="mb-8 text-slate-700 leading-relaxed text-lg font-light">
                              {para}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-slate-500 text-lg">Detailed description coming soon for this luxury product.</p>
                        </div>
                      )}

                      {/* Benefits */}
                      {product.benefits && product.benefits.length > 0 && (
                        <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-slate-200">
                          <h3 className="text-3xl font-light text-slate-800 mb-8 flex items-center">
                            <Crown className="w-7 h-7 mr-3 text-amber-500" />
                            Luxury Benefits
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {product.benefits.map((bnf, i) => (
                              <div key={i} className="flex items-start gap-6 bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg border border-slate-100">
                                <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 rounded-xl">
                                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                                <span className="text-slate-700 leading-relaxed font-medium">{bnf}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Colors */}
                      {product.colours && product.colours.length > 0 && (
                        <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-slate-200">
                          <h3 className="text-3xl font-light text-slate-800 mb-8">Exquisite Finishes</h3>
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-8">
                            {product.colours.map((c, i) => (
                              <div key={i} className="flex flex-col items-center text-center group cursor-pointer">
                                {c.image ? (
                                  <div className="w-24 h-24 border border-slate-300 rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-110 group-hover:shadow-xl">
                                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div
                                    className="w-24 h-24 border border-slate-300 rounded-2xl shadow-lg transition-transform hover:scale-110 group-hover:shadow-xl"
                                    style={{ backgroundColor: c.hex || "#fff" }}
                                  />
                                )}
                                <span className="mt-4 text-slate-700 font-semibold">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Specifications Tab */}
                  {activeTab === "specs" && product.specifications && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-4 xs:p-6 sm:p-10 md:p-12 border border-white/20">
                      <h2 className="text-3xl font-light text-slate-800 mb-10 flex items-center">
                        <Award className="w-7 h-7 mr-3 text-amber-500" />
                        Technical Excellence
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-20 gap-y-6 md:gap-y-8">
                        {product.specifications.map((s, i) => (
                          <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-200">
                            <span className="text-slate-600 font-medium">{s.name}</span>
                            <span className="font-semibold text-slate-800">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Applications Tab */}
                  {activeTab === "applications" && product.applications && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-4 xs:p-6 sm:p-10 md:p-12 border border-white/20">
                      <h2 className="text-3xl font-light text-slate-800 mb-10">Premium Applications</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {product.applications.map((app, i) => (
                          <div key={i} className="flex items-center bg-gradient-to-r from-slate-50 to-white p-6 rounded-2xl shadow-md border border-slate-100">
                            <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mr-4" />
                            <span className="text-slate-700 font-medium">{app}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Installation Tab */}
                  {activeTab === "installation" && product.installation && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-4 xs:p-6 sm:p-10 md:p-12 border border-white/20">
                      <h2 className="text-3xl font-light text-slate-800 mb-10">Professional Installation</h2>
                      <div className="space-y-6 md:space-y-8">
                        {product.installation.map((step, i) => (
                          <div key={i} className="flex bg-gradient-to-r from-slate-50 to-white p-8 rounded-2xl shadow-md border border-slate-100">
                            <div className="bg-gradient-to-r from-amber-400 to-amber-500 w-12 h-12 rounded-full flex items-center justify-center text-slate-900 font-bold mr-8 flex-shrink-0 shadow-lg">
                              {i + 1}
                            </div>
                            <p className="text-slate-700 flex-1 leading-relaxed font-medium">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Luxury Downloads */}
                {(product.pdfUrl || product.catalogueUrl) && (
                  <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-3xl shadow-2xl p-4 xs:p-6 sm:p-10 md:p-12 mb-8 sm:mb-10 text-white">
                    <h2 className="text-3xl font-light mb-8 flex items-center">
                      <Download className="w-8 h-8 mr-4 text-amber-400" /> 
                      Premium Resources
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {product.pdfUrl && (
                        <a
                          href={product.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-2xl px-8 py-6 shadow-xl border border-white/10"
                        >
                          <div className="flex items-center">
                            <div className="bg-amber-400/20 p-4 rounded-xl mr-6">
                              <Download className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-xl text-white">Technical Sheet</h3>
                              <p className="text-slate-300 text-sm">Premium PDF Document</p>
                            </div>
                          </div>
                          <div className="text-amber-400 group-hover:translate-x-1 transition-transform">→</div>
                        </a>
                      )}
                      {product.catalogueUrl && (
                        <a
                          href={product.catalogueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-2xl px-8 py-6 shadow-xl border border-white/10"
                        >
                          <div className="flex items-center">
                            <div className="bg-amber-400/20 p-4 rounded-xl mr-6">
                              <Download className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-xl text-white">Luxury Catalogue</h3>
                              <p className="text-slate-300 text-sm">Complete Collection</p>
                            </div>
                          </div>
                          <div className="text-amber-400 group-hover:translate-x-1 transition-transform">→</div>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </AnimatedSection>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <AnimatedSection animation="fade-left" delay={300}>
                {/* Luxury Quote Request */}
                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl shadow-2xl p-4 xs:p-6 sm:p-8 text-white mb-8 sm:mb-10 border border-slate-700">
                  <h3 className="text-2xl font-light mb-4 flex items-center">
                    <Crown className="w-6 h-6 mr-2 text-amber-400" />
                    Exclusive Quote
                  </h3>
                  <p className="text-slate-300 mb-8 leading-relaxed">
                    Experience luxury with personalized pricing for this premium product. Our specialists await your inquiry.
                  </p>
                  <button
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center"
                  >
                    <DollarSign className="w-5 h-5 mr-2" /> Request Luxury Quote
                  </button>
                </div>

                {/* Why Choose This Product */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-4 xs:p-6 sm:p-8 mb-8 sm:mb-10 border border-white/20">
                  <h3 className="text-2xl font-light text-slate-800 mb-8 flex items-center">
                    <Sparkles className="w-6 h-6 mr-2 text-amber-500" />
                    Luxury Excellence
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-xl mr-4 flex-shrink-0">
                        <Crown className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Unmatched Quality</h4>
                        <p className="text-slate-600 leading-relaxed text-sm">
                          Crafted by {product.manufacturer || 'world-renowned artisans'} using the finest materials
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 rounded-xl mr-4 flex-shrink-0">
                        <Shield className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Lifetime Assurance</h4>
                        <p className="text-slate-600 leading-relaxed text-sm">{product.warranty || 'Comprehensive lifetime warranty with premium support'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl mr-4 flex-shrink-0">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Master Installation</h4>
                        <p className="text-slate-600 leading-relaxed text-sm">White-glove installation by certified luxury specialists</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl mr-4 flex-shrink-0">
                        <Truck className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">Concierge Delivery</h4>
                        <p className="text-slate-600 leading-relaxed text-sm">Premium handling and delivery throughout Laos</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-4 xs:p-6 sm:p-8 mb-8 sm:mb-10 border border-white/20">
                    <h3 className="text-2xl font-light text-slate-800 mb-8">Curated Collection</h3>
                    <div className="space-y-4 sm:space-y-6">
                      {relatedProducts.slice(0, 3).map((rp) => (
                        <div
                          key={rp.id}
                          className="group flex items-start cursor-pointer hover:bg-slate-50 p-4 rounded-2xl transition-all duration-300"
                          onClick={() => handleRelatedProductClick(rp.id)}
                        >
                          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg mr-4 group-hover:shadow-xl transition-shadow">
                            <img
                              src={rp.image}
                              alt={rp.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 mb-1 group-hover:text-amber-600 transition-colors">{rp.name}</h4>
                            <p className="text-sm text-slate-500 mb-2 capitalize">{rp.categoryName || rp.category}</p>
                            {rp.price && (
                              <p className="text-sm font-bold text-amber-600">{rp.price}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Luxury Contact */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-4 xs:p-6 sm:p-8 border border-white/20">
                  <h3 className="text-2xl font-light text-slate-800 mb-4">Luxury Concierge</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Our luxury specialists are standing by to assist with your selection and provide expert consultation.
                  </p>
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div className="flex items-center bg-gradient-to-r from-slate-50 to-white p-4 rounded-2xl shadow-inner border border-slate-100">
                      <Phone className="w-5 h-5 text-amber-600 mr-4" />
                      <span className="text-slate-700 font-semibold">+856 21 773 737</span>
                    </div>
                    <div className="flex items-center bg-gradient-to-r from-slate-50 to-white p-4 rounded-2xl shadow-inner border border-slate-100">
                      <Mail className="w-5 h-5 text-amber-600 mr-4" />
                      <span className="text-slate-700 font-semibold">mark@slklaos.la</span>
                    </div>
                  </div>
                  <div className="pt-4 sm:pt-6 border-t border-slate-200">
                    <button
                      onClick={() => router.push("/contact")}
                      className="w-full bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-800 py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <Clock className="w-5 h-5 mr-2" />
                      Schedule Consultation
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Luxury Quote modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        source="luxury_product_detail_page"
      />

      <ToastContainer 
        position="bottom-right" 
        toastStyle={{
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          color: 'white',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      />
    </>
  );
};

export default ProductItemDetailPage;
