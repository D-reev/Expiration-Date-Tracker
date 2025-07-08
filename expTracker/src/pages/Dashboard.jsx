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
    const [stockCount, setStockCount] = useState(0);
    const [expiredCount, setExpiredCount] = useState(0);

    const scrollToAbout = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await fetch('http://localhost:1337/fetchproductsmongo');
                const data = await res.json();

                setStockCount(data.length);

                const today = new Date().toISOString().slice(0, 10);
                const recent = data.filter(p => p.added_date?.slice(0, 10) === today);
                setRecentProducts(recent);
            } catch {
                setStockCount(0);
                setRecentProducts([]);
            }
        };

        const fetchExpired = async () => {
            try {
                const res = await fetch('http://localhost:1337/expiredproducts');
                const data = await res.json();
                setExpiredCount(data.length);
            } catch {
                setExpiredCount(0);
            }
        };

        fetchInventory();
        fetchExpired();
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="home-container">
                <div className="dashboard-header">
                    <h1 className="welcome">Welcome to the Dashboard</h1>
                </div>

                <div className="cards">
                    <Button className="card stock" onClick={() => navigate("/inventory")}> 
                        <div className="icon-label">STOCK PRODUCTS <InventoryIcon /></div>
                        <div className="count">{stockCount}</div>
                    </Button>

                    <Button className="card expired" onClick={() => navigate("/expiredproducts")}> 
                        <div className="icon-label">EXPIRED PRODUCTS <AlarmOffIcon /></div>
                        <div className="count">{expiredCount}</div>
                    </Button>

                    <Button className="card about" onClick={() => scrollToAbout("about-section")}> 
                        <div className="icon-label">ABOUT <InfoRoundedIcon /></div>
                    </Button>
                </div>

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
                                            <td>{prod.expiry_date?.slice(0,10)}</td>
                                            <td>{prod.added_date?.slice(0,10)}</td>
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
                        <p>
                            EXPTracker is a full-stack inventory system built to help you track stock quantity and expired items.
                            View your product metrics, see recent additions, and maintain accurate, up-to-date inventory.
                        </p>
                        <ul>
                            <li>Track inventory and product expiration dates in real time.</li>
                            <li>Receive notifications for expired products.</li>
                            <li>Modern, responsive dashboard for easy management.</li>
                        </ul>
                    </div>
                </section>

                <section className='footer-section'>
                    All Rights Reserved © 2025
                </section>
            </div>
        </div>
    );
}

export default Home;
