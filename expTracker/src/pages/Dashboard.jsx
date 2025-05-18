import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { Button } from "@mui/material";
import InventoryIcon from '@mui/icons-material/Inventory';
import AlarmOffIcon from '@mui/icons-material/AlarmOff';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

function Home() {
    const navigate = useNavigate();
    const [recentProducts, setRecentProducts] = useState([]);

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
                const response = await fetch('http://localhost:1337/fetchproductsmongo');
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
                        <p className="second-text"><InventoryIcon/></p>
                    </Button>

                    <Button className="card user" onClick={() => navigate("/expiredproducts")}>
                        <p className="tip">EXPIRED PRODUCTS</p>
                        <p className="second-text"><AlarmOffIcon/></p>
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
                </section>

                <section id='about-section' className='about-section'>
                    <div className="about-container">
                        <h1>About</h1>
                        <div className="about-content">
                            <h2>Expiration Date Tracker</h2>
                            <p>
                                Expiration Date Tracker is a full-stack web application designed to help users efficiently manage and monitor product expiration dates. 
                                The system allows you to add, view, and track inventory items, receive notifications for expired products, and keep your stock up-to-date.
                            </p>
                            <h3>Features:</h3>
                            <ul>
                                <li>Track inventory and product expiration dates in real time.</li>
                                <li>Receive notifications for expired products as soon as you log in.</li>
                                <li>View recently added products and expired items in dedicated sections.</li>
                                <li>Modern, responsive dashboard for easy management.</li>
                                <li>Secure authentication and user management.</li>
                            </ul>
                            <h3>Built With:</h3>
                            <ul>
                                <li><strong>Backend:</strong> Node.js, Express.js (REST API development)</li>
                                <li><strong>Database:</strong> MongoDB (NoSQL for flexible data storage)</li>
                                <li><strong>Frontend:</strong> React.js with <strong>Material-UI (MUI)</strong> for a modern UI</li>
                                <li><strong>Real-time:</strong> Socket.io for instant notifications</li>
                                <li><strong>HTTP Requests:</strong> Axios for efficient API communication</li>
                                <li><strong>Tools:</strong> Nodemon (auto-reload), Git/GitHub (version control)</li>
                            </ul>
                            <p>
                                Future enhancements include analytics, customizable notifications, and advanced reporting for better inventory control.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='footer-section'>
                    All Rights Reserverd @2025
                </section>
            </div>
        </div>
    );
}

export default Home;