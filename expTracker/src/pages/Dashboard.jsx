import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { Button } from "@mui/material";
import InventoryIcon from '@mui/icons-material/Inventory';
import AlarmOffIcon from '@mui/icons-material/AlarmOff';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { API_BASE } from "../apiConfig.js";

function Home() {
    const navigate = useNavigate();
    const [recentProducts, setRecentProducts] = useState([]);
    const [totalStock, setTotalStock] = useState(0);
    const [expiredCount, setExpiredCount] = useState(0);

    const scrollToAbout = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Fetch products added today
    useEffect(() => {
        const fetchRecentProducts = async () => {
            const today = new Date().toISOString().slice(0, 10);
            try {
                const response = await fetch(`${API_BASE}/fetchproductsmongo`);
                const data = await response.json();
                // Filter products where added_date is today
                const filtered = data.filter(
                    (prod) => prod.added_date && prod.added_date.slice(0, 10) === today
                );
                setRecentProducts(filtered);
            } catch (error) {
                setRecentProducts([]);
            }
        };
        fetchRecentProducts();
    }, []);

    // Fetch total stock and expired count
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_BASE}/fetchproductsmongo`);
                const data = await response.json();
                // Calculate total stock
                const total = data.reduce((acc, prod) => acc + (prod.quantity || 0), 0);
                setTotalStock(total);

                // Calculate expired count
                const expired = data.filter((prod) => {
                    const expiryDate = new Date(prod.expiry_date);
                    return expiryDate < new Date();
                });
                setExpiredCount(expired.length);
            } catch (error) {
                setTotalStock(0);
                setExpiredCount(0);
            }
        };
        fetchStats();
    }, []);

    // 7/11 branch status states
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [kahitSaanOnline, setKahitSaanOnline] = useState(null);
    const [nbsOnline, setNbsOnline] = useState(null);
    const [blanktapes, setBlanktapes] = useState(null);
    const [pnb, setPnb] = useState(null);
    const [jollibee, setJollibee] = useState(null);
    const [dental, setDental] = useState(null);

    useEffect(() => {
        const checkStatus = async (url, setter) => {
            try {
                await fetch(url, { mode: 'no-cors' });
                setter(true);
            } catch {
                setter(false);
            }
        };
        checkStatus('http://192.168.9.69:5173/', setKahitSaanOnline);
        checkStatus('http://192.168.9.9:5173/', setNbsOnline);
        checkStatus('http://192.168.9.36:5173/', setBlanktapes);
        checkStatus('http://192.168.9.37:5173/', setPnb);
        checkStatus('http://192.168.9.38:5173/', setJollibee);
        checkStatus('http://192.168.9.35:5173/', setDental);
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="home-container">
                <div className="dashboard-header">
                    <h1 className='welcome'>Hello, Welcome to the Dashboard</h1>    
                </div>

                <div className="cards">
                    <Button className="card student" onClick={() => navigate("/inventory")}>
                        <p className="tip">INVENTORY</p>
                        <InventoryIcon className="second-text"/>
                        <p className="stats">{totalStock}</p>
                    </Button>

                    <Button className="card user" onClick={() => navigate("/expiredproducts")}>
                        <p className="tip">EXPIRED PRODUCTS</p>
                        <AlarmOffIcon className="second-text"/>
                        <p className="stats">{expiredCount}</p>
                    </Button>

                    <Button className="card about" onClick={() => scrollToAbout("about-section")}>
                        <p className="tip">ABOUT</p>
                        <p className="second-text"><InfoRoundedIcon/></p>
                    </Button>
                </div>

                {/* Recently Added Products Section */}
                <section className="recently-added">
                    <h2>Recently Added Products</h2>
                    <div style={{overflowX: "auto"}}>
                        <table className="recent-products-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Unit</th>
                                    <th>Expiry Date</th>
                                    <th>Added Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{textAlign: "center"}}>No products added today.</td>
                                    </tr>
                                ) : (
                                    recentProducts.map((prod) => (
                                        <tr key={prod._id || prod.prodid}>
                                            <td>{prod.prodname}</td>
                                            <td>{prod.category}</td>
                                            <td>{prod.quantity}</td>
                                            <td>{prod.unit}</td>
                                            <td>{prod.expiry_date ? prod.expiry_date.slice(0,10) : ''}</td>
                                            <td>{prod.added_date ? prod.added_date.slice(0,10) : ''}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section><br/>

                {/* Branch Status Section */}
                <div className="branch-status-section">
  <h2 className="status-title">Branch Status</h2>
  <div className="branch-status-grid">
    <div className="branch-card">
      <img src="/img/logos/kahit-saan-logo.png" alt="Kahit Saan" className="branch-logo" />
      <div className="branch-info">
        <h3>Kahit Saan</h3>
        <span className={`status-badge ${kahitSaanOnline ? "online" : "offline"}`}>
          {kahitSaanOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>

    <div className="branch-card">
      <img src="/img/logos/nbs-logo.png" alt="NBS" className="branch-logo" />
      <div className="branch-info">
        <h3>NBS</h3>
        <span className={`status-badge ${nbsOnline ? "online" : "offline"}`}>
          {nbsOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>

    <div className="branch-card">
      <img src="/img/logos/blanktapes-logo.png" alt="Blanktapes" className="branch-logo" />
      <div className="branch-info">
        <h3>Blanktapes</h3>
        <span className={`status-badge ${blanktapes ? "online" : "offline"}`}>
          {blanktapes ? "Online" : "Offline"}
        </span>
      </div>
    </div>

    <div className="branch-card">
      <img src="/img/logos/pnb-logo.png" alt="PNB" className="branch-logo" />
      <div className="branch-info">
        <h3>PNB</h3>
        <span className={`status-badge ${pnb ? "online" : "offline"}`}>
          {pnb ? "Online" : "Offline"}
        </span>
      </div>
    </div>

    <div className="branch-card">
      <img src="/img/logos/jollibee-logo.png" alt="Jollibee" className="branch-logo" />
      <div className="branch-info">
        <h3>Jollibee</h3>
        <span className={`status-badge ${jollibee ? "online" : "offline"}`}>
          {jollibee ? "Online" : "Offline"}
        </span>
      </div>
    </div>

    <div className="branch-card">
      <img src="/img/logos/dental-logo.png" alt="Dental Clinic" className="branch-logo" />
      <div className="branch-info">
        <h3>Dental Clinic</h3>
        <span className={`status-badge ${dental ? "online" : "offline"}`}>
          {dental ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  </div>
</div>

                {/* About Section - Moved below branch status */}
                <section id="about-section" className="about-section">
  <div className="about-7eleven-row">
    <div className="about-7eleven-cols">
      <div className="about-7eleven-col">
        <h3 style={{ fontWeight: "bold" }}>Get To Know Us</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>About 7-Eleven Tracker</li>
          <li>Blog</li>
          <li>Careers</li>
          <li>Newsroom</li>
        </ul>
      </div>
      <div className="about-7eleven-col">
        <h3 style={{ fontWeight: "bold" }}>System Info</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>Inventory Monitoring</li>
          <li>Expiry Date Alerts</li>
          <li>Branch Status Dashboard</li>
          <li>Real-time Notifications</li>
        </ul>
      </div>
      <div className="about-7eleven-col">
        <h3 style={{ fontWeight: "bold" }}>How Can We Help?</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>Contact Us</li>
          <li>Feedback</li>
          <li>Vendor Guidelines</li>
          <li>Support</li>
        </ul>
      </div>
      <div className="about-7eleven-col">
        <h3 style={{ fontWeight: "bold" }}>Download</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>7-Eleven App</li>
          <li>Inventory Mobile App</li>
          <li>Branch Status App</li>
        </ul>
      </div>
    </div>
    <div className="about-7eleven-logo">
      <img
        src="/img/7eleven-logo.png"
        alt="7-Eleven Logo"
        className="about-7eleven-logo"
      />
    </div>
  </div>
  <div className="about-footer-bar"></div>
  <div className="about-footer-links">
    <span>Terms & Conditions</span>|
    <span>Privacy Notice</span>|
    <span>FAQs</span>|
    <span>Your Privacy Choices</span>|
    <span>Site Accessibility Statement</span>|
    <span>Do Not Sell or Share My Information</span>
  </div>
</section>
            </div>
        </div>
    );
}

export default Home;