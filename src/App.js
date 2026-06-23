import { useState, useEffect, useRef } from "react";
import axios from "axios";

const CATEGORIES = [
  "All","Electronics","Clothing","Books","Sports",
  "Home","Beauty","Toys","Automotive","Food","Garden",
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const cursorRef = useRef(null);

  const fetchProducts = async (reset = false, cat = category) => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (cat) params.category = cat;
      if (!reset && cursorRef.current) params.cursor = cursorRef.current;

      const res = await axios.get("https://product-browser-fibj.onrender.com/api/products", { params });

      if (reset) {
        setProducts(res.data.products);
      } else {
        setProducts((prev) => [...prev, ...res.data.products]);
      }

      cursorRef.current = res.data.nextCursor;
      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    cursorRef.current = null;
    setCursor(null);
    setProducts([]);
    setHasMore(true);
    fetchProducts(true, category);
  }, [category]);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h1>Product Browser</h1>
      <p>200,000 products — newest first</p>

      {/* Category Filter */}
      <div style={{ marginBottom: "20px" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat === "All" ? "" : cat)}
            style={{
              marginRight: "8px", marginBottom: "8px",
              padding: "8px 16px",
              backgroundColor:
                (category === "" && cat === "All") || category === cat
                  ? "#007bff" : "#f0f0f0",
              color:
                (category === "" && cat === "All") || category === cat
                  ? "white" : "black",
              border: "none", borderRadius: "4px", cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
      }}>
        {products.map((product) => (
          <div key={product._id} style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
          }}>
            <h3 style={{ fontSize: "14px", marginBottom: "8px" }}>
              {product.name}
            </h3>
            <span style={{
              background: "#e8f4fd", padding: "2px 8px",
              borderRadius: "12px", fontSize: "12px", color: "#007bff",
            }}>
              {product.category}
            </span>
            <p style={{ fontWeight: "bold", marginTop: "8px", color: "#28a745" }}>
              ₹{product.price}
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
              {product.description}
            </p>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => fetchProducts(false)}
            disabled={loading}
            style={{
              padding: "12px 40px", backgroundColor: "#007bff",
              color: "white", border: "none", borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer", fontSize: "16px",
            }}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {!hasMore && (
        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          All products loaded
        </p>
      )}
    </div>
  );
}