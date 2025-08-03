"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Phone,
  Droplet,
  Layers,
  Mountain,
  Building2,
  Dribbble,
  Home,
  ChevronDown,
  ChevronUp, 
  Search, 
} from "lucide-react";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AnimatedSection from "../../components/AnimatedSection";
import ProductCard from "../../components/ProductCard";
import QuoteModal from "../../components/QuoteModal";
import { supabase } from "../../lib/supabase";

/* ────────────────────
   ▸ TYPE & CONSTANTS
   ──────────────────── */
type BaseSub = "sport" | "commercial" | "interior-exterior";

type CommercialSub =
  | "Heterogeneous general use floors"
  | "SPC"
  | "Heterogeneous semi-objective floors"
  | "Vinyl floor tiles & planks"
  | "Sports floors – Heterogeneous"
  | "Sports parquet floor systems"
  | "Parquet floors"
  | "Homogeneous flooring"
  | "Heterogeneous hard floors"
  | "Heterogeneous show floors"
  | "General-use vinyl floors"
  | "Heterogeneous non-slip floors";

type Subcategory = BaseSub | CommercialSub;

interface Product {
  id: string;
  name: string;
  category: "waterproofing" | "flooring" | "rocksoil";
  subcategory?: Subcategory;
  categoryName: string;
  commercial_subcategory?: string;
  image: string;
  price: string;
  description: string;
  rating: number;
  features: string[];
  badge?: string;
  pdfUrl?: string; 
}

const categories = ["waterproofing", "flooring", "rocksoil"] as const;
const subcategories: BaseSub[] = [
  "sport",
  "commercial",
  "interior-exterior",
];
const commercialSubcats: CommercialSub[] = [
  "Heterogeneous general use floors",
  "SPC",
  "Heterogeneous semi-objective floors",
  "Vinyl floor tiles & planks",
  "Sports floors – Heterogeneous",
  "Sports parquet floor systems",
  "Parquet floors",
  "Homogeneous flooring",
  "Heterogeneous hard floors",
  "Heterogeneous show floors",
  "General-use vinyl floors",
  "Heterogeneous non-slip floors",
];

const commercialLabels: Record<CommercialSub, string> = {
  "Heterogeneous general use floors": "Heterogeneous general use floors",
  SPC: "SPC",
  "Heterogeneous semi-objective floors": "Heterogeneous semi-objective floors",
  "Vinyl floor tiles & planks": "Vinyl floor tiles & planks",
  "Sports floors – Heterogeneous": "Sports floors – Heterogeneous",
  "Sports parquet floor systems": "Sports parquet floor systems",
  "Parquet floors": "Parquet floors",
  "Homogeneous flooring": "Homogeneous flooring",
  "Heterogeneous hard floors": "Heterogeneous hard floors",
  "Heterogeneous show floors": "Heterogeneous show floors",
  "General-use vinyl floors": "General-use vinyl floors",
  "Heterogeneous non-slip floors": "Heterogeneous non-slip floors",
};

/* ────────────────────
   ▸  ICONS
   ──────────────────── */
const icons: Record<string, JSX.Element> = {
  waterproofing: <Droplet className="w-4 h-4 mr-2" />,
  flooring: <Layers className="w-4 h-4 mr-2" />,
  rocksoil: <Mountain className="w-4 h-4 mr-2" />,
};

const subIcons: Record<Subcategory, JSX.Element> = {
  sport: <Dribbble className="w-5 h-5 mr-2 text-blue-600" />,
  commercial: <Building2 className="w-5 h-5 mr-2 text-green-600" />,
  "interior-exterior": <Home className="w-5 h-5 mr-2 text-yellow-600" />,
  "Heterogeneous general use floors": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  SPC: <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  "Heterogeneous semi-objective floors": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  "Vinyl floor tiles & planks": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  "Sports floors – Heterogeneous": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  "Sports parquet floor systems": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  "Parquet floors": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  "Homogeneous flooring": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  "Heterogeneous hard floors": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  "Heterogeneous show floors": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  "General-use vinyl floors": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
  "Heterogeneous non-slip floors": <Building2 className="w-4 h-4 mr-2 text-green-500" />,
};

/* ────────────────────
   ▸ HELPERS 
   ──────────────────── */
const formatPrice = (price: string) => {
  const num = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(num)
    ? price
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(num);
};

const ProductSkeleton = () => (
  <div className="animate-pulse bg-white shadow rounded-lg p-4">
    <div className="h-40 bg-gray-200 rounded mb-4" />
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-300 rounded w-1/2" />
  </div>
);

/* ────────────────────
   ▸ PAGE COMPONENT
   ──────────────────── */
const ProductCataloguePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Products from Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ UPDATED FUNCTION - Navigate to product-item-details page
  const handleProductClick = (productId: string) => {
    router.push(`/product-item-details?id=${productId}`);
  };

  /* ────────── Fetch products from Supabase on mount ────────── */
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories!fk_category(name),
          subcategory:subcategories!fk_subcategory(name),
          commercial_sub:commercial_subcategories!fk_commercial_subcategory(name)
        `);

      if (error) {
        console.error("Supabase fetch error:", error.message);
        setLoading(false);
        return;
      }

      // Resolve signed image URLs
      const withImages: Product[] = await Promise.all(
        (data as Product[]).map(async (prod) => {
          if (prod.image?.startsWith("http")) return prod;

          try {
            const { data: signed } = await supabase.storage
              .from("product-images")
              .createSignedUrl(prod.image, 60 * 60);
            if (signed?.signedUrl) return { ...prod, image: signed.signedUrl };
          } catch (_) {}
          return prod;
        })
      );

      setProducts(
        withImages.map((p) => ({
          ...p,
          category: (p as any)?.category?.name ?? (p as any).category,
          subcategory: (p as any)?.subcategory?.name ?? (p as any).subcategory,
          commercial_subcategory: (p as any)?.commercial_sub?.name ?? (p as any).commercial_sub,
          categoryName: p?.category?.name ?? p.category,
          price: formatPrice(String(p.price ?? "")),
        }))
      );

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Handle URL hash scrolling
  useEffect(() => {
    if (!loading) {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }
    }
  }, [loading]);

  /* scroll-spy */
  useEffect(() => {
    const handleScroll = () => {
      const sectionOffsets = categories
        .map((cat) => {
          const el = document.getElementById(cat);
          return el ? { id: cat, offset: el.offsetTop } : null;
        })
        .filter(Boolean) as { id: string; offset: number }[];

      const scrollY = window.scrollY + 200;
      const current = sectionOffsets.reverse().find((s) => scrollY >= s.offset);
      setActiveCategory(current?.id ?? null);

      // Show back to top button
      setShowBackToTop(window.scrollY > 300);
    };
     
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Back-to-Top helper */
  const BackToTop: React.FC = () => (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-[#417d80] hover:bg-[#356b6d] text-white px-4 py-3 rounded-full shadow-lg transition-all"
    >
      <ChevronUp className="w-4 h-4" /> 
    </button>
  );

  /* ─────────────────── render ─────────────────── */
  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full z-[999] h-2 bg-gradient-to-r from-[#bfa76a]/30 via-[#e5e2d6]/30 to-[#6dbeb0]/30">
        <div
          className="h-full bg-gradient-to-r from-[#bfa76a] via-[#e5e2d6] to-[#6dbeb0] rounded-r-full shadow-2xl transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e5e2d6] to-[#bfa76a]/30 scroll-smooth">
        {/* HERO */}
        <section className="relative py-36 bg-gradient-to-br from-[#bfa76a] via-[#e5e2d6] to-[#6dbeb0] text-[#1a2936] overflow-hidden shadow-2xl">
          <div className="absolute inset-0">
            <img 
              src="https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//Products_Hero.jpg" 
              alt="SLK Trading Products"
              className="w-full h-full object-cover opacity-30 scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#bfa76a]/80 via-[#e5e2d6]/80 to-[#6dbeb0]/90" style={{ zIndex: 2 }}></div>
          </div>

          <div className="relative z-10 container mx-auto px-4">
            <AnimatedSection className="text-center max-w-4xl mx-auto animate-fade-in pt-12">
              <h1 className="text-6xl lg:text-7xl font-extrabold mb-6 drop-shadow-2xl relative hero-shine" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(255,255,255,0.7)' }}>
                <span className="inline-block animate-fadeInUp">Products <span className="text-[#bfa76a]">Catalogue</span></span>
                <span className="hero-shine-bar" />
              </h1>
              <p className="text-2xl text-[#1a2936]/80 mb-8 leading-relaxed drop-shadow-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Premium construction materials for your next project
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="bg-gradient-to-r from-[#bfa76a] to-[#6dbeb0] text-[#1a2936] hover:from-[#6dbeb0] hover:to-[#bfa76a] px-10 py-4 rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg transform hover:scale-105 border-2 border-[#bfa76a]"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(255,255,255,0.7)' }}
                >
                  Get Product Quote
                </button>
                <button 
                  onClick={() => router.push('/contact')}
                  className="bg-gradient-to-r from-[#6dbeb0] to-[#bfa76a] text-white border-2 border-[#bfa76a] hover:from-[#bfa76a] hover:to-[#6dbeb0] px-10 py-4 rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg transform hover:scale-105"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                >
                  Contact Our Experts
                </button>
              </div>
            </AnimatedSection>
          </div>
          <style>{`
            .hero-shine {
              position: relative;
              overflow: hidden;
            }
            .hero-shine-bar {
              position: absolute;
              top: 0;
              left: -75%;
              width: 50%;
              height: 100%;
              background: linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
              transform: skewX(-20deg);
              pointer-events: none;
              animation: heroShineMove 2.2s cubic-bezier(.4,0,.2,1) 0.5s 1;
            }
            @keyframes heroShineMove {
              0% { left: -75%; }
              60% { left: 110%; }
              100% { left: 110%; }
            }
          `}</style>
        </section>

        {/* MAIN LAYOUT */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ───── Sidebar */}
            <aside className="lg:w-1/4">
              <div className="sticky top-24 bg-white/60 backdrop-blur-xl shadow-2xl rounded-2xl p-6 space-y-6 border border-[#bfa76a]/30">
                {/* search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-[#bfa76a] w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="pl-11 pr-3 py-3 w-full border-2 border-[#bfa76a]/30 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-[#bfa76a] text-base bg-white/80 placeholder-[#bfa76a]/60"
                    style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
                  />
                </div>

                {/* category quick-links */}
                {categories.map((cat) => (
                  <a
                    key={cat}
                    href={`#${cat}`}
                    className={`flex items-center justify-center gap-2 w-full text-center rounded-full px-6 py-4 text-base font-bold transition-all border-2 shadow-xl uppercase tracking-wide ${
                      activeCategory === cat
                        ? "bg-gradient-to-r from-[#bfa76a] to-[#6dbeb0] text-[#1a2936] border-[#bfa76a] scale-105"
                        : "bg-gradient-to-r from-[#e5e2d6] to-white text-[#1a2936] hover:from-[#bfa76a] hover:to-[#6dbeb0] border-[#e5e2d6]"
                    }`}
                    style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em' }}
                  >
                    {icons[cat]} {cat}
                  </a>
                ))}
              </div>
            </aside>

            {/* ───── Catalogue */}
            <main className="lg:w-3/4">
              {categories.map((mainCategory) => (
                <section
                  id={mainCategory}
                  key={mainCategory}
                  className="mb-12 scroll-mt-32"
                >
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2 uppercase">
                    {(products.find((p) => p.category === mainCategory)?.categoryName ??
                      mainCategory).toUpperCase()}
                  </h2>

                  {/* FLOORING */}
                  {mainCategory === "flooring" ? (
                    subcategories.map((sub) => {
                      const topProducts = filteredProducts.filter(
                        (p) => p.category === "flooring" && p.subcategory === sub
                      ); 

                      const isCommercial = sub === "commercial";

                      return (
                        <div key={sub} className="mb-8">
                          {/* accordion button */}
                          <button
                            onClick={() => toggleSection(sub)}
                            className="flex items-center w-full text-left font-bold text-gray-700 border-b pb-2 uppercase"
                          >
                            {subIcons[sub]} {sub.replace("-", " ")} Flooring
                            {openSections[sub] ? (
                              <ChevronUp className="ml-auto" />
                            ) : (
                              <ChevronDown className="ml-auto" />
                            )}
                          </button>

                          {/* content */}
                          {openSections[sub] && (
                            <>
                              {/* SPORT & INTERIOR/EXTERIOR – grid */}
                              {!isCommercial && (
                                <div className="mt-4">
                                  {loading ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                      {[...Array(3)].map((_, i) => (
                                        <ProductSkeleton key={i} />
                                      ))}
                                    </div>
                                  ) : topProducts.length ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                      {topProducts.map((p) => (
                                        <ProductCard
                                          key={p.id}
                                          product={p}
                                          onClick={() => handleProductClick(p.id)}
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 mt-4">
                                      No products yet.
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* COMMERCIAL – nested accordion */}
                              {isCommercial &&
                                commercialSubcats.map((cSub) => {
                                  const cProducts = filteredProducts.filter(
                                    (p) =>
                                      p.category === "flooring" && p.commercial_subcategory === cSub
                                  );
                                  return (
                                    <div key={cSub} className="mt-6">
                                      <button
                                        onClick={() => toggleSection(cSub)}
                                        className="flex items-center w-full text-left font-medium text-gray-600 border-b pb-1"
                                      >
                                        {subIcons[cSub]} {commercialLabels[cSub]}
                                        {openSections[cSub] ? (
                                          <ChevronUp className="ml-auto w-4 h-4" />
                                        ) : (
                                          <ChevronDown className="ml-auto w-4 h-4" />
                                        )}
                                      </button>
                                      {openSections[cSub] && (
                                        <div className="mt-3">
                                          {loading ? (
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                              {[...Array(3)].map((_, i) => (
                                                <ProductSkeleton key={i} />
                                              ))}
                                            </div>
                                          ) : cProducts.length ? (
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                              {cProducts.map((p) => (
                                                <ProductCard
                                                  key={p.id}
                                                  product={p}
                                                  onClick={() => handleProductClick(p.id)}
                                                />
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-sm text-gray-500">
                                              No products yet.
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    /* WATERPROOFING / ROCKSOIL */
                    loading ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                          <ProductSkeleton key={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts
                          .filter((p) => p.category === mainCategory)
                          .map((p) => (
                            <ProductCard
                              key={p.id}
                              product={p}
                              onClick={() => handleProductClick(p.id)}
                            />
                          ))}
                      </div>
                    )
                  )}
                </section>
              ))}
            </main>
          </div>
        </div>

        {/* Back-to-Top */}
        {showBackToTop && <BackToTop />}

        {/* CTA */}
        <section className="py-24 bg-gradient-to-r from-[#bfa76a] to-[#6dbeb0] text-[#1a2936]">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center">
              <h2 className="text-5xl font-extrabold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1a2936' }}>
                Need Help Choosing Products?
              </h2>
              <p className="text-2xl text-[#1a2936]/80 mb-8 max-w-2xl mx-auto font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                Our experts are here to help you select the perfect materials for your project
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="bg-gradient-to-r from-[#bfa76a] to-[#6dbeb0] text-[#1a2936] hover:from-[#6dbeb0] hover:to-[#bfa76a] px-10 py-4 rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg transform hover:scale-105 border-2 border-[#bfa76a]"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em' }}
                >
                  Get Product Quote
                </button>
                <a 
                  href="tel:+85621773737"
                  className="bg-gradient-to-r from-[#6dbeb0] to-[#bfa76a] text-white border-2 border-[#bfa76a] hover:from-[#bfa76a] hover:to-[#6dbeb0] px-10 py-4 rounded-xl font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                  style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.04em' }}
                >
                  <Phone className="w-5 h-5 mr-2" /> Call Expert: +856 21 773 737
                </a>
              </div>
            </AnimatedSection>
          </div> 
        </section>
      </div>

      <Footer />

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        source="products_get_product_quote"
      />
    </>
  );
};

export default ProductCataloguePage;