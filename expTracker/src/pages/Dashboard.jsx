import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import InventoryIcon from '@mui/icons-material/Inventory';
import AlarmOffIcon from '@mui/icons-material/AlarmOff';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { API_BASE } from "../apiConfig.js";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Home() {
    const navigate = useNavigate();
    const [recentProducts, setRecentProducts] = useState([]);
    const [totalStock, setTotalStock] = useState(0);
    const [expiredCount, setExpiredCount] = useState(0);
    const [categoryData, setCategoryData] = useState({
        labels: [],
        values: []
    });
    const [expiredCategoryData, setExpiredCategoryData] = useState({
        labels: [],
        values: []
    });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryDetails, setCategoryDetails] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Fetch category data
    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const response = await fetch(`${API_BASE}/fetchproductsmongo`);
                const data = await response.json();
                
                const now = new Date();
                const active = data.filter(product => new Date(product.expiry_date) >= now);
                
                // Group active products by category
                const categoryMap = active.reduce((acc, product) => {
                    const category = product.category || 'Uncategorized';
                    acc[category] = (acc[category] || 0) + Number(product.quantity);
                    return acc;
                }, {});

                setCategoryData({
                    labels: Object.keys(categoryMap),
                    values: Object.values(categoryMap)
                });
            } catch (error) {
                console.error('Error fetching category data:', error);
            }
        };
        fetchCategoryData();
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

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        // Fetch details for the selected category
        const fetchCategoryDetails = async () => {
            try {
                const response = await fetch(`${API_BASE}/fetchproductsmongo`);
                const data = await response.json();
                // Filter data for the selected category
                const filteredData = data.filter((item) => item.category === category);
                setCategoryDetails(filteredData);
            } catch (error) {
                console.error('Error fetching category details:', error);
            }
        };

        fetchCategoryDetails();
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setCategoryDetails([]);
    };

    // Add after your existing useEffects
    const handleBarClick = async (category) => {
        try {
            const response = await fetch(`${API_BASE}/fetchproductsmongo`);
            const data = await response.json();
            const categoryItems = data.filter(item => item.category === category);
            setCategoryDetails(categoryItems);
            setSelectedCategory(category);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching category details:', error);
        }
    };

    // Add after your existing useEffects
    useEffect(() => {
        const fetchExpiredData = async () => {
            try {
                const response = await fetch(`${API_BASE}/fetchproductsmongo`);
                const data = await response.json();
                
                // Split products into active and expired
                const now = new Date();
                const expired = data.filter(product => new Date(product.expiry_date) < now);
                
                // Group expired products by category
                const expiredMap = expired.reduce((acc, product) => {
                    const category = product.category || 'Uncategorized';
                    acc[category] = (acc[category] || 0) + Number(product.quantity);
                    return acc;
                }, {});

                setExpiredCategoryData({
                    labels: Object.keys(expiredMap),
                    values: Object.values(expiredMap)
                });
            } catch (error) {
                console.error('Error fetching expired data:', error);
            }
        };
        fetchExpiredData();
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

               <br/>


                {/* Inventory Chart Section - NEW */}
                <section className="inventory-chart-section">
    <h2>Inventory by Category</h2>
    <div className="chart-container">
        <Bar
            data={{
                labels: categoryData.labels,
                datasets: [{
                    label: 'Total Items',
                    data: categoryData.values,
                    backgroundColor: '#3a5a40',
                    borderColor: '#344e41',
                    borderWidth: 1,
                    borderRadius: 4,
                    hoverBackgroundColor: '#588157',
                    hoverBorderColor: '#344e41',
                    hoverBorderWidth: 2,
                }]
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        handleBarClick(categoryData.labels[index]);
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Stock Distribution by Category',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Total Items: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                }
            }}
        />
    </div>

    {/* Category Details Modal */}
    <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
    >
        <DialogTitle className="modal-title">
            {selectedCategory} - Category Details
        </DialogTitle>
        <DialogContent>
            <div className="category-summary">
                <div className="summary-item">
                    <span className="summary-label">Total Products:</span>
                    <span className="summary-value">{categoryDetails.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Total Stock:</span>
                    <span className="summary-value">
                        {categoryDetails.reduce((sum, item) => sum + Number(item.quantity), 0)}
                    </span>
                </div>
            </div>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product Name</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>Expiry Date</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categoryDetails.map((item) => (
                            <TableRow key={item._id} className="table-row">
                                <TableCell>{item.prodname}</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>
                                    {new Date(item.expiry_date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <span className={`status-chip ${
                                        new Date(item.expiry_date) < new Date() ? 'expired' : 'active'
                                    }`}>
                                        {new Date(item.expiry_date) < new Date() ? 'Expired' : 'Active'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setIsModalOpen(false)} color="primary">
                Close
            </Button>
        </DialogActions>
    </Dialog>
</section>

{/* Expired Products Chart Section - NEW */}
<section className="expired-chart-section">
    <h2>Expired Products by Category</h2>
    <div className="chart-container">
        <Bar
            data={{
                labels: expiredCategoryData.labels,
                datasets: [{
                    label: 'Expired Items',
                    data: expiredCategoryData.values,
                    backgroundColor: '#28704eff',
                    borderColor: '#286351ff',
                    borderWidth: 1,
                    borderRadius: 4,
                    hoverBackgroundColor: '#ea868f',
                    hoverBorderColor: '#bb2d3b',
                    hoverBorderWidth: 2,
                }]
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        handleBarClick(expiredCategoryData.labels[index]);
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: { size: 12 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { 
                            font: { size: 12 },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Expired Stock Distribution',
                        font: { size: 16 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(220, 53, 69, 0.9)',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Expired Items: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            }}
        />
    </div>
</section>

{/* Branch Status Section */}
                <div className="branch-status-section">
  <h2 className="status-title">Branch Status</h2>
  <div className="branch-status-grid">
    <div className="branch-card">
      <img src="/public/kahitsaan.jpg" alt="Kahit Saan" className="branch-logo" />
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
      <img src="/public/Blacktapes.png" alt="Blanktapes" className="branch-logo" />
      <div className="branch-info">
        <h3>Blanktapes</h3>
        <span className={`status-badge ${blanktapes ? "online" : "offline"}`}>
          {blanktapes ? "Online" : "Offline"}
        </span>
      </div>
    </div>

    <div className="branch-card">
      <img src="/public/BPI.jpg" alt="BPI" className="branch-logo" />
      <div className="branch-info">
        <h3>BPI</h3>
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
      <img src="/public/Dental.jpg" alt="Dental Clinic" className="branch-logo" />
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