import React from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, Shield, Layers, Star } from "lucide-react";
import Navbar from "../app/Navbar";
import Footer from "../app/Footer";
import AnimatedSection from "../components/AnimatedSection";

/* Waterproofing + Flooring demo data */
const products = [
  /* ── waterproofing ── */
  {
    id: "Premium Quality Waterproofing EU Standard", 
    name: "Premium Quality Waterproofing EU Standard",
    category: "waterproofing",
    categoryName: "Waterproofing Materials",
    image:
      "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/Acryrubber.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9BY3J5cnViYmVyLmpwZyIsImlhdCI6MTc1MDc4MzM0MiwiZXhwIjoxNzUzMzc1MzQyfQ.F_WqwHZPsHXWk99O6KlJjdZx1VxzfrTwL8ioIFz6GFc",
    price: "$45/sqm",
    short: "ACRYRUBBER SYSTEM is a coloured water-based liquid waterproofing membrane. Thanks to the composition of the resins used, this product is highly elastic and adapts to movements of the deck caused by settlement or thermal stress. \n\nACRYRUBBER may be used to waterproof existing decks that are not subject to ponding areas. The product has excellent",
    rating: 4.9,
    features: ["UV Resistant", "Crack Bridging", "Easy Application"],
  },
  {
    id: "High-Reflectance Roof Coating", 
    name: "High‑Reflectance Roof Coating for UV Protection & Energy Savings",
    category: "waterproofing",
    categoryName: "Waterproofing Materials",
    image:
      "https://images.pexels.com/photos/7031720/pexels-photo-7031720.jpeg?auto=compress&cs=tinysrgb&w=800",
    price: "$85/sqm",
    short:
      "Premium Roof Coating for UV Protection with a high-reflectance white roof coating that protects waterproofing membranes from UV damage. Formulated with glass microspheres, it lowers surface temperatures by up to 40°C, reduces roof wear, cuts energy use, and helps combat the urban heat island effect. With a top-tier Solar Reflection Index (SRI) of 103.5, it offers excellent UV reflection and minimal heat absorption.",
    rating: 4.8,
    features: ["Energy‑Efficient", "UV Shield", "Water‑Based"],
  },
   {
    id: "Multifixo 100", 
    name: "Multifixo 100",
    category: "waterproofing",
    categoryName: "Waterproofing Materials",
    image:
      "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/Multifixo%20100.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9NdWx0aWZpeG8gMTAwLnBuZyIsImlhdCI6MTc1MDk3MjM1NCwiZXhwIjoxNzgyNTA4MzU0fQ.e9vLIEtXpjKK-4Zd3dYI2zEaQ-JZgmxFaBagFl2bugU",
    price: "$85/sqm",
    short:
      "Multifixo 100 is a synthetic resin-based product in water emulsion containing selected sands that acts as primer for plaster, mortars and smoothing products, finishes, resins and liquid waterproofing applied on smooth and low absorbing decks such as RC treated with release agent, clinker, ceramics, wood, metal, plasterboard, plaster, insulating panels, brick, aerated concrete, polycarbonate, fiber glass, etc.",
    rating: 4.8,
    features: ["Energy‑Efficient", "UV Shield", "Water‑Based"],
  },
   {
    id: "Casafloor", 
    name: "Casafloor",
    category: "waterproofing",
    categoryName: "Waterproofing Materials",
    image:
      "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/Casafloor.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9DYXNhZmxvb3IucG5nIiwiaWF0IjoxNzUwOTcyNzQ3LCJleHAiOjE3ODI1MDg3NDd9.N9Goa83TPY-jMJJi9IRKFz92lk2hI5cpXCmPiXvM4XA",
    price: "$85/sqm",
    short:
      "CASAFLOOR is a polymeric flooring solution cement based self-flow mortar for leveling uneven surface and sealcoat with polymer coating designed especially for car parking floors and sport flooring. For both old parking areas that needs improvement and new parking areas, especially areas where the concrete surface is incompletely polished and not smooth. The product is suitable for sport flooring applications.",
    rating: 4.8,
    features: ["Energy‑Efficient", "UV Shield", "Water‑Based"],
  },
    {
    id: "Acryfibro Plus", 
    name: "Acryfibro Plus",
    category: "waterproofing",
    categoryName: "Waterproofing Materials",
    image:
      "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/Acryfibro%20Plus.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9BY3J5Zmlicm8gUGx1cy5wbmciLCJpYXQiOjE3NTA5NzI4ODQsImV4cCI6MTc4MjUwODg4NH0.wHAGDOESHZGRKjRoCN3nFuzrvHm41vfMCOnURrrnqFs",
    price: "$85/sqm",
    short:
      "Acryroof Plus Fibro System is an highly performing liquid coating system made by a combination of the special reinforcement Acryfelt mesh and Casaband. Acryroof Plus Fibro System is an ideal solution for waterproofing flat roof, balconies, terraces and any other surface that needs waterproofing.",
    rating: 4.8,
    features: ["Energy‑Efficient", "UV Shield", "Water‑Based"],
  },
     {
    id: "Casaband SA", 
    name: "Casaband SA",
    category: "waterproofing",
    categoryName: "Waterproofing Materials",
    image:
      "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/Casaband%20SA.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9DYXNhYmFuZCBTQS5wbmciLCJpYXQiOjE3NTEwMTcxMzksImV4cCI6MTc4MjU1MzEzOX0.Nx6WexxyOLBMHEKmixJEA7-XjuAS90Afpf43BJfmSJo",
    price: "$85/sqm",
    short:
      "CASABAND SA is a self-adhesive butyl rubber band with one side that ensures excellent adhesion on concrete, gypsum board and marble decks, while the other side provides a rough and absorbing surface on which the liquid waterproofing is applied.",
    rating: 4.8,
    features: ["Energy‑Efficient", "UV Shield", "Water‑Based"],
  },
    {
    id: "Acryfelt Mesh", 
    name: "Acryfelt Mesh",
    category: "waterproofing",
    categoryName: "Waterproofing Materials",
    image:
      "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/Acryfelt%20Mesh.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9BY3J5ZmVsdCBNZXNoLnBuZyIsImlhdCI6MTc1MDk3Mzc5NCwiZXhwIjoxNzgyNTA5Nzk0fQ.NSzyDrQPy1kbTcVq8__kMlDP37qOmmkkWXxa8HsxIZ4",
    price: "$85/sqm",
    short:
      "ACRYFELT MESH is an alkali-resistant reinforcement in polyester with a special honeycomb structure that ensures easy impregnation of the screen, high resistance to longitudinal and transverse loads and good elasticity to diagonal loads.",
    rating: 4.8,
    features: ["Energy‑Efficient", "UV Shield", "Water‑Based"],
  },
  {
    id: "Viscogum", 
    name: "Viscogum",
    category: "waterproofing",
    categoryName: "Waterproofing Materials",
    image:
      "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/Viscogum02.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9WaXNjb2d1bTAyLnBuZyIsImlhdCI6MTc1MDk3Mzg1NCwiZXhwIjoxNzgyNTA5ODU0fQ.aT3QGZbdYhJvP2l5L_YzwQJzptEESgEVPuE1b_Uie6I",
    price: "$85/sqm",
    short:
      "VISCOGUM is a versatile, high-performance APP-modified bitumen membrane designed for multilayer waterproofing systems on cement, metal, or wooden structures—with or without thermal insulation. Reinforced with stabilized polyester or fiberglass, and available in various finishes including torch-on film, sand, or mineral granules, it delivers excellent adhesion, durability, and UV stability. Proven for over 25 years in hot climates across Africa, the Middle East, Southeast Asia, and South America, Viscogum is ideal for flat or sloped roofs, foundations, terraces, and gutters—making it a reliable and cost-effective solution for a wide range of waterproofing needs.",
    rating: 4.8,
    features: ["Energy‑Efficient", "UV Shield", "Water‑Based"],
  },


  

  /* ── flooring (new) ── */
  {
    id: "Premium Homogeneous Flooring iQ Granit SD",
      name: "Premuim Homogeneous Flooring iQ Granit SD",
      category: "flooring",
      categoryName: "Flooring Materials",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/Floor01.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9GbG9vcjAxLmpwZyIsImlhdCI6MTc1MDc4NzY4NCwiZXhwIjoxNzUzMzc5Njg0fQ.OTBmOfxTEy5u6rfzbZEEuLMKnkT5HJKWHQUqfeZttkM",
      price: "$35/sqm",
    short: "iQ Granit SD is a permanently static-dissipative vinyl flooring for use in heavy-traffic laboratories, clean rooms and ESD-sensitive areas in hospitals. It delivers the perfect combination of stable and reliable conductivity alongside the proven durability of the iQ flooring range. It is specially designed to coordinate with the colors of the other products and accessories of the iQ Granit multi-solution family.",
    rating: 4.7,
    features: [
      "Permanently static-dissipative", "Best life-cycle cost on the market", "Unique dry-buffing surface restoration",
    ],
  },
  {
   id: "High-Performance Surfaces for Indoor and Outdoor Sports Courts",
      name: "High-Performance Surfaces for Indoor and Outdoor Sports Courts",
      category: "flooring",
      categoryName: "Flooring Materials",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/Supersoft%20WS%20System.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9TdXBlcnNvZnQgV1MgU3lzdGVtLnBuZyIsImlhdCI6MTc1MDc4OTExNSwiZXhwIjoxNzUzMzgxMTE1fQ.vyk5srg0tlkkt6I1BSXHWdI-EqGZQyFZSIodZ5nGv6o",
      price: "$120/sqm",
    short: "Premium SUPERSOFT WS with a high-performance synthetic sports surface for indoor and outdoor use, combining the firmness of a hard court with the comfort of a flexible system. Engineered with advanced resins, it delivers consistent ball bounce, grip, and shock absorption for a safe, enjoyable game. ITF Class 4 certified, it's ideal for tennis and various multi-sport courts, offering UV resistance, durability, and easy application on concrete or asphalt.",
    rating: 4.9,
    features: ["ITF Class 4 Certified Performance", "Flexible & Shock-Absorbing System", "All-Weather Durability & Versatility"],
  },
    {
    id: "SPC Flooring 5 mm",
      name: "SPC Flooring 5 mm",
      category: "flooring",
      categoryName: "Flooring Materials",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/SPC%20flooring%205%20mm.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9TUEMgZmxvb3JpbmcgNSBtbS5wbmciLCJpYXQiOjE3NTEwMTc1MzcsImV4cCI6MTc4MjU1MzUzN30.wOkD2J9_HhQaAgd_Ywxc2xP-MCR8dp20SY75HAK3U7c",
      price: "$35/sqm",
    short: "SPC flooring, or Stone Plastic Composite flooring, is a next-generation vinyl flooring option known for its exceptional durability, 100% waterproof structure, and realistic wood or stone appearance. Crafted from a blend of limestone powder, PVC, and stabilizers, it features a dense, rigid core that resists wear and deformation, making it a superior choice compared to traditional vinyl or laminate flooring.",
    rating: 4.7,
    features: [
      "Permanently static-dissipative", "Best life-cycle cost on the market", "Unique dry-buffing surface restoration",
    ],
  },
  {
    id: "WPC Decking for Decks and for Exterior",
      name: "WPC Decking for Decks and for Exterior",
      category: "flooring",
      categoryName: "Flooring Materials",
      image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/sign/image/Products/WPC%20decking%20for%20decks%20and%20for%20exterior.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jOTcwMTViNy1lNjhhLTRkOTYtOGEwYi1lMWJkOWNiYzcyNTMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9Qcm9kdWN0cy9XUEMgZGVja2luZyBmb3IgZGVja3MgYW5kIGZvciBleHRlcmlvci5wbmciLCJpYXQiOjE3NTEwMTg2NjAsImV4cCI6MTc4MjU1NDY2MH0.vijcVcJ6LzLkSX3wq_QoOdjGqDAx4syyffbov9SvRIY",
      price: "$35/sqm",
    short: "Wood-Plastic Composite (WPC) decking gives you the warm, familiar look of timber without the headaches that often come with real wood. Because it’s made from a blend of wood fibers and recycled plastic, the boards stay straight and smooth even after seasons of rain, sun, and humidity. That stability means no warping, splintering, or rotting, so your deck keeps its shape year after year.",
    rating: 4.7,
    features: [
      "Permanently static-dissipative", "Best life-cycle cost on the market", "Unique dry-buffing surface restoration",
    ],
  },
];
 

 

const ProductDetailPage: React.FC = () => {
  /* route now delivers “category” thanks to App.tsx change */
  const { category } = useParams<{ category?: string }>();

  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;

  const iconFor = (cat: string) =>
    cat === "waterproofing" ? Shield : Layers;

  /* ——————————————————————— UI ——————————————————————— */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Navbar />

      {/* Hero */}
      <div
        className="relative w-full h-72 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/7031720/pexels-photo-7031720.jpeg?auto=compress&cs=tinysrgb&w=1600')",
        }}
      >
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            {category
              ? `${category.charAt(0).toUpperCase() + category.slice(1)} Materials`
              : "All Products"}
          </h1>
        </div>
      </div>

      {/* Product grid */}
      <div className="container mx-auto px-4 py-12">
      
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p) => {
              const Icon = iconFor(p.category);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
                >
                  <Link to={`/products/item/${p.id}`}>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-56 w-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </Link>

                  <div className="p-6 flex-1 flex flex-col">
                    <Link
                      to={`/products/item/${p.id}`}
                      className="flex items-center mb-3 group"
                    >
                      <span className="bg-orange-100 p-2 rounded-lg mr-3">
                        <Icon className="w-5 h-5 text-orange-600" />
                      </span>
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {p.name}
                      </h2>
                    </Link>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {p.short}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      {p.rating}
                    </div>

                    <ul className="space-y-1 text-sm mb-6">
                      {p.features.slice(0, 3).map((f) => (
                        <li key={f} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={`/products/item/${p.id}`}
                      className="mt-auto bg-orange-500 hover:bg-orange-600 text-white text-center py-2 rounded-lg font-semibold transition-colors block"
                    >
                      View Product Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
     
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;