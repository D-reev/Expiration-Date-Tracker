import React, { useEffect, useState } from "react";
import "./Cashier.css";
import Sidebar from "./Sidebar";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import categories from "../assets/categories";
import axios from "axios";

function Cashier() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await axios.get("http://localhost:1337/fetchproductsmongo");
      setProducts(response.data);
    } catch (error) {
      setProducts([]);
    }
  }

  // Filter by category and search
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory
      ? prod.category === selectedCategory
      : true;
    const matchesSearch = prod.prodname
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add product to cart
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.prodid === product.prodid);
      if (found) {
        return prev.map((item) =>
          item.prodid === product.prodid
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Remove product from cart
  const removeFromCart = (prodid) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.prodid === prodid ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // Cart totals
  const subTotal = cart.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * item.qty,
    0
  );
  const tax = subTotal * 0.05;

  return (
    <>
      <Sidebar />
      <div
        className="cashier-main-wrapper"
        style={{
          marginLeft: "85px",
          marginTop: "2rem",
          maxWidth: "calc(100% - 85px)",
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
        }}
      >
        <main className="cashier-main" style={{ flex: 2 }}>
          {/* Category Filter */}
          <div className="cashier-category-bar">
            <button
              className={`category-btn${!selectedCategory ? " active" : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn${
                  selectedCategory === cat.label ? " active" : ""
                }`}
                onClick={() => setSelectedCategory(cat.label)}
              >
                {cat.label}
              </button>
            ))}
            <div className="search-box">
              <span className="search-icon" role="img" aria-label="search">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Product Grid */}
          <h2
            style={{
              color: "var(--primary-dark)",
              fontWeight: 700,
              margin: "24px 0 18px 0",
            }}
          >
            Choose Order
          </h2>
          <div className="cashier-product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.prodid} className="cashier-product-card">
                  <div style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        background: "#f3f6fa",
                        borderRadius: "50%",
                        margin: "0 auto 8px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 32,
                        color: "#bdbdbd",
                      }}
                    >
                      <span role="img" aria-label="product">
                        🛒
                      </span>
                    </div>
                  </div>
                  <div className="product-name">{product.prodname}</div>
                  <div style={{ color: "#6c7a89", fontSize: 14 }}>
                    {product.category}
                  </div>
                  <div style={{ color: "#6c7a89", fontSize: 14 }}>
                    {product.unit} | Qty: {product.quantity}
                  </div>
                  <div style={{ color: "#6c7a89", fontSize: 14 }}>
                    Exp: {product.expiry_date}
                  </div>
                  <div className="product-price">
                    ₱{product.price ? Number(product.price).toFixed(2) : "0.00"}
                  </div>
                  <button
                    className="add-btn"
                    onClick={() => addToCart(product)}
                    disabled={product.quantity <= 0}
                  >
                    {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              ))
            ) : (
              <div style={{ color: "#bdbdbd", marginTop: 32 }}>
                No products found
              </div>
            )}
          </div>
        </main>
        <aside className="cashier-cart" style={{ flex: 1 }}>
          <h2
            style={{
              color: "var(--primary-dark)",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            Order Menu
          </h2>
          <hr
            style={{
              marginBottom: 16,
              border: "none",
              borderTop: "1px solid #eee",
            }}
          />
          <div style={{ flex: 1, overflowY: "auto" }}>
            {cart.length === 0 ? (
              <div className="cart-empty">
                <span
                  className="empty-icon"
                  role="img"
                  aria-label="empty-cart"
                >
                  🛒
                </span>
                <div>No items yet</div>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.prodid}
                  className="cart-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#f3f6fa",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      color: "#bdbdbd",
                    }}
                  >
                    🛒
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--primary-dark)",
                      }}
                    >
                      {item.prodname}
                    </div>
                    <div style={{ color: "#6c7a89", fontSize: 14 }}>
                      ₱{item.price ? Number(item.price).toFixed(2) : "0.00"} x{" "}
                      {item.qty}
                    </div>
                  </div>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary-dark)",
                      cursor: "pointer",
                      fontSize: 18,
                      padding: 4,
                    }}
                    onClick={() => removeFromCart(item.prodid)}
                    aria-label="Remove"
                  >
                    <RemoveIcon fontSize="inherit" />
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary-dark)",
                      cursor: "pointer",
                      fontSize: 18,
                      padding: 4,
                    }}
                    onClick={() => addToCart(item)}
                    aria-label="Add"
                  >
                    <AddIcon fontSize="inherit" />
                  </button>
                </div>
              ))
            )}
          </div>
          <hr
            style={{
              margin: "16px 0",
              border: "none",
              borderTop: "1px solid #eee",
            }}
          />
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="summary-label">Sub Total</span>
              <span className="summary-value">₱{subTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="summary-label">Tax (5%)</span>
              <span className="summary-value">₱{tax.toFixed(2)}</span>
            </div>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span className="total-label">Total</span>
              <span className="total-value">
                ₱{(subTotal + tax).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            className="place-order-btn"
            disabled={cart.length === 0}
          >
            Order Now
          </button>
        </aside>
      </div>
    </>
  );
}

export default Cashier;