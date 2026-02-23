import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
// --- STRIPE IMPORTS ---
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// --- INITIALIZE STRIPE WITH YOUR EXACT KEY ---
const stripePromise = loadStripe('pk_test_51T2UaP2fn16GFiupzTUIFKgMednFZi9jsUpTgZs7ih52q6VT1niOi1o9hGmjXvBLHEikJr9wNcjHua48PiMAC23v00aaZ1NgL0');

// --- 1. DATA QUERIES & MUTATIONS ---
// UPGRADED: Added imageUrl to allProducts!
const GET_DATA = gql`
  query GetData {
    allProducts { id name price stockQuantity imageUrl }
    allCourses { id title level dateTime price imageUrl seatsAvailable }
  }
`;

const CREATE_ORDER = gql`
  mutation CreateOrder($fullName: String!, $email: String!, $totalAmount: Decimal!, $itemsSummary: String!, $paymentMethodId: String!, $productIds: [ID], $courseIds: [ID]) {
    createOrder(fullName: $fullName, email: $email, totalAmount: $totalAmount, itemsSummary: $itemsSummary, paymentMethodId: $paymentMethodId, productIds: $productIds, courseIds: $courseIds) {
      ok
      errorMessage
      order { id }
    }
  }
`;

// --- 2. ASSETS & HELPERS ---
const HERO_SLIDES = [
  { id: 1, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1600&auto=format&fit=crop", title: "Custom Birthday Cakes" },
  { id: 2, image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1600&auto=format&fit=crop", title: "Dulce Academy" },
  { id: 3, image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=1600&auto=format&fit=crop", title: "Wedding Masterpieces" }
];

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1626803775151-61d756612f97?w=800";

const getCourseImage = (title, dbImageUrl) => {
  return dbImageUrl || PLACEHOLDER;
};

// --- STRIPE CARD STYLING ---
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#3e2723",
      fontFamily: '"Lato", sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": { color: "#aab7c4" },
    },
    invalid: { color: "#fa755a", iconColor: "#fa755a" },
  },
};

// --- MAIN APP COMPONENT ---
function DulceApp() {
  const { loading, error, data } = useQuery(GET_DATA);
  const [createOrder] = useMutation(CREATE_ORDER, { refetchQueries: [{ query: GET_DATA }] });
  
  const stripe = useStripe();
  const elements = useElements();
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('home'); 
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isProcessing, setIsProcessing] = useState(false); 
  
  const [lastOrderTotal, setLastOrderTotal] = useState(0); 
  const [lastOrderType, setLastOrderType] = useState('shop'); 
  const [selectedCourse, setSelectedCourse] = useState(null);

  const showToast = (message) => { setToast(message); setTimeout(() => setToast(null), 3000); };
  const addToCart = (product) => { setCart([...cart, product]); showToast(`🍰 "${product.name}" added to cart`); };
  const removeFromCart = (indexToRemove) => { setCart(cart.filter((_, index) => index !== indexToRemove)); };
  const bookCourse = (course) => { setSelectedCourse(course); setView('course-checkout'); window.scrollTo(0, 0); };
  const cartTotal = cart.reduce((total, item) => total + parseFloat(item.price), 0);

  const handleCartCheckout = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || cart.length === 0) return;
    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name: formData.name, email: formData.email },
    });

    if (stripeError) {
      alert("Payment Error: " + stripeError.message);
      setIsProcessing(false);
      return;
    }

    const summaryString = "SHOP ORDER: " + cart.map(item => item.name).join(", ");
    const productIds = cart.map(item => item.id);
    
    try {
        const response = await createOrder({ 
            variables: { 
                fullName: formData.name, 
                email: formData.email, 
                totalAmount: String(cartTotal), 
                itemsSummary: summaryString, 
                paymentMethodId: paymentMethod.id,
                productIds: productIds 
            }
        });
        if (!response.data.createOrder.ok) { alert(response.data.createOrder.errorMessage); setIsProcessing(false); return; }

        setLastOrderTotal(cartTotal);
        setLastOrderType('shop');
        setView('success');
        window.scrollTo(0, 0);
        setCart([]); 
        cardElement.clear(); 
    } catch (err) {
        alert("Oops! Connection error: " + err.message);
    }
    setIsProcessing(false);
  };

  const handleCourseBooking = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !selectedCourse) return;
    setIsProcessing(true);
    
    const cardElement = elements.getElement(CardElement);
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name: formData.name, email: formData.email },
    });

    if (stripeError) {
      alert("Payment Error: " + stripeError.message);
      setIsProcessing(false);
      return;
    }

    const summaryString = `ACADEMY BOOKING: ${selectedCourse.title}`;
    const courseIds = [selectedCourse.id];
    
    try {
        const response = await createOrder({ 
            variables: { 
                fullName: formData.name, 
                email: formData.email, 
                totalAmount: String(selectedCourse.price), 
                itemsSummary: summaryString, 
                paymentMethodId: paymentMethod.id, 
                courseIds: courseIds 
            }
        });

        if (!response.data.createOrder.ok) { alert(response.data.createOrder.errorMessage); setIsProcessing(false); return; }

        setLastOrderTotal(parseFloat(selectedCourse.price));
        setLastOrderType('course');
        setView('success');
        window.scrollTo(0, 0);
        setSelectedCourse(null);
        cardElement.clear(); 
    } catch (err) {
        alert("Oops! Connection error: " + err.message);
    }
    setIsProcessing(false);
  };

  useEffect(() => {
    const timer = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length); }, 5000); 
    return () => clearInterval(timer);
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);

  if (loading) return <div className="loading"><h1>🧁 Mixing...</h1></div>;
  if (error) return <div className="error"><h1>❌ Error: {error.message}</h1></div>;

  const bestSellers = data?.allProducts.slice(0, 3) || [];
  const featuredCourses = data?.allCourses.slice(0, 3) || [];

  return (
    <div className="app-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap');
        html { scroll-behavior: smooth; }
        :root { --p-dark: #2b1b17; --a-pink: #d84378; --a-gold: #c5a059; --bg-c: #fff9f0; --bg-l: #f3e5dc; }
        body { margin: 0; font-family: 'Lato', sans-serif; background-color: var(--bg-c); color: #3e2723; overflow-x: hidden; }
        .navbar { background: var(--p-dark); padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; border-bottom: 3px solid var(--a-gold); }
        .logo { font-family: 'Playfair Display', serif; font-size: 1.8rem; color: #fff; text-transform: uppercase; font-weight: bold; cursor: pointer; }
        .logo span { color: var(--a-pink); }
        .nav-links { display: flex; gap: 30px; align-items: center; }
        .nav-link { color: #fcece4; text-decoration: none; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 2px; font-weight: 700; transition: color 0.3s; cursor: pointer; }
        .nav-link:hover { color: var(--a-gold); }
        .cart-icon { font-size: 1.4rem; color: white; cursor: pointer; position: relative; transition: transform 0.2s; }
        .cart-icon:hover { transform: scale(1.1); color: var(--a-gold); }
        .cart-badge { position: absolute; top: -8px; right: -10px; background: var(--a-pink); color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 50%; font-weight: bold; }
        .cart-sidebar { position: fixed; top: 0; right: 0; width: 350px; height: 100vh; background: white; box-shadow: -5px 0 15px rgba(0,0,0,0.1); z-index: 200; padding: 30px; overflow-y: auto; transform: translateX(100%); transition: transform 0.3s ease-in-out; }
        .cart-sidebar.open { transform: translateX(0); }
        .cart-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--bg-l); padding-bottom: 15px; margin-bottom: 20px; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--p-dark); }
        .cart-item { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .cart-total { margin-top: 20px; font-size: 1.5rem; font-weight: bold; text-align: right; color: var(--a-pink); border-top: 2px solid var(--p-dark); padding-top: 15px; }
        .remove-btn { color: red; cursor: pointer; font-size: 0.8rem; margin-left: 10px; }
        .toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background-color: var(--p-dark); color: white; padding: 12px 25px; border-radius: 50px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 300; font-weight: bold; animation: slideUp 0.3s ease-out; border-bottom: 3px solid var(--a-gold); }
        @keyframes slideUp { from { bottom: -50px; opacity: 0; } to { bottom: 30px; opacity: 1; } }
        .hero { height: 600px; position: relative; overflow: hidden; background: var(--p-dark); }
        .slide { position: absolute; top: 0; width: 100%; height: 100%; background-size: cover; background-position: center; opacity: 0; transition: opacity 1.5s ease; }
        .slide.active { opacity: 0.6; }
        .hero-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; z-index: 10; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: 4.5rem; margin: 0; }
        .hero-btn { margin-top: 35px; padding: 15px 40px; background: var(--a-pink); border: none; color: #fff; border-radius: 50px; font-weight: bold; cursor: pointer; text-transform: uppercase; }
        .section-header { text-align: center; padding: 60px 0 30px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 40px; max-width: 1200px; margin: 0 auto; padding: 0 20px 80px; }
        .card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; transition: 0.4s; position: relative; }
        .card:hover { transform: translateY(-10px); }
        .card-img { width: 100%; height: 280px; object-fit: cover; }
        .card-body { padding: 25px; }
        .academy-section { background: var(--bg-l); padding-bottom: 50px; }
        .course-card { background: white; border-radius: 12px; overflow: hidden; border-left: 5px solid var(--a-gold); box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; position: relative; }
        .course-img { height: 220px; width: 100%; object-fit: cover; }
        .course-content { padding: 25px; flex-grow: 1; }
        .course-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 10px; font-weight: bold; }
        .course-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: var(--p-dark); margin-bottom: 15px; min-height: 4rem; }
        .enroll-btn { background: var(--a-gold); color: white; border: none; padding: 12px; border-radius: 4px; font-weight: bold; width: 100%; cursor: pointer; transition: 0.3s; }
        .enroll-btn:hover { background: var(--p-dark); color: var(--a-gold); }
        .disabled-btn { background: #ccc !important; color: #666 !important; cursor: not-allowed; }
        .stock-badge { position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
        .out-of-stock-badge { background: #d84378; }
        .checkout-container { max-width: 600px; margin: 50px auto; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .success-container { text-align: center; padding: 80px 20px; max-width: 600px; margin: 0 auto; }
        .success-icon { font-size: 5rem; margin-bottom: 20px; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-label { display: block; margin-bottom: 8px; font-weight: bold; color: var(--p-dark); }
        .form-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem; box-sizing: border-box; }
        .StripeElement { padding: 12px; border: 1px solid #ddd; border-radius: 5px; background: white; box-sizing: border-box; }
        .StripeElement--focus { border-color: var(--a-gold); box-shadow: 0 0 0 1px var(--a-gold); }
        .StripeElement--invalid { border-color: #fa755a; }
        .summary-box { background: var(--bg-l); padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .back-link { display: block; text-align: center; margin-top: 20px; color: #888; cursor: pointer; text-decoration: underline; }
        .order-receipt { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); margin-top: 30px; border-top: 5px solid var(--a-gold); }
        .view-all-btn { display: block; margin: 0 auto; padding: 12px 30px; border: 2px solid var(--a-gold); color: var(--p-dark); font-weight: bold; text-transform: uppercase; background: transparent; cursor: pointer; transition: 0.3s; border-radius: 4px; }
        .view-all-btn:hover { background: var(--a-gold); color: white; }
      `}</style>

      {toast && <div className="toast">{toast}</div>}

      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
            <h2 style={{fontFamily: 'Playfair Display', margin: 0}}>Shopping Cart</h2>
            <button className="close-btn" onClick={() => setIsCartOpen(false)}>×</button>
        </div>
        {cart.length === 0 ? (
            <div style={{textAlign: 'center', color: '#888', marginTop: '50px'}}>Your cart is empty.</div>
        ) : (
            <div>
                {cart.map((item, index) => (
                    <div key={index} className="cart-item">
                        <div><div style={{fontWeight: 'bold'}}>{item.name}</div></div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <span>R {parseFloat(item.price).toFixed(0)}</span>
                            <span className="remove-btn" onClick={() => removeFromCart(index)}>×</span>
                        </div>
                    </div>
                ))}
                <div className="cart-total">Total: R {cartTotal.toFixed(2)}</div>
                <button className="enroll-btn" style={{marginTop: '20px', background: '#d84378'}} onClick={() => { setIsCartOpen(false); setView('cart-checkout'); }}>Go to Checkout</button>
            </div>
        )}
      </div>

      <nav className="navbar">
        <div className="logo" onClick={() => { setView('home'); window.scrollTo(0,0); }}>DULCE <span>ZONE</span></div>
        <div className="nav-links">
          <span className="nav-link" onClick={() => { setView('shop'); window.scrollTo(0,0); }}>Shop</span>
          <span className="nav-link" onClick={() => { setView('academy'); window.scrollTo(0,0); }}>Academy</span>
          <div className="cart-icon" onClick={() => setIsCartOpen(true)}>🛒 <span className="cart-badge">{cart.length}</span></div>
        </div>
      </nav>

      {view === 'home' && (
        <>
          <header className="hero">
            {HERO_SLIDES.map((slide, index) => (
              <div key={slide.id} className={`slide ${index === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url(${slide.image})` }} />
            ))}
            <div className="hero-content">
              <h1 className="hero-title">{HERO_SLIDES[currentSlide].title}</h1>
              <button className="hero-btn" onClick={() => setView('shop')}>Shop Now</button>
            </div>
          </header>

          <section style={{paddingBottom: '80px'}}>
            <div className="section-header"><h2 style={{fontFamily: 'Playfair Display', fontSize: '3rem'}}>Best Sellers</h2></div>
            <div className="grid" style={{paddingBottom: '40px'}}>
              {bestSellers.map((cake) => (
                <div key={cake.id} className="card">
                  <div className={`stock-badge ${cake.stockQuantity <= 0 ? 'out-of-stock-badge' : ''}`}>
                    {cake.stockQuantity > 0 ? `${cake.stockQuantity} in stock` : 'SOLD OUT'}
                  </div>
                  {/* UPDATED: Pulling actual image from the backend */}
                  <img src={cake.imageUrl || PLACEHOLDER} className="card-img" alt={cake.name} />
                  <div className="card-body">
                    <h3 style={{fontFamily: 'Playfair Display', fontSize: '1.4rem'}}>{cake.name}</h3>
                    <div style={{fontSize: '1.4rem', color: '#d84378', fontWeight: 'bold', marginBottom: '10px'}}>R {parseFloat(cake.price).toFixed(2)}</div>
                    <button className={`enroll-btn ${cake.stockQuantity <= 0 ? 'disabled-btn' : ''}`} disabled={cake.stockQuantity <= 0} onClick={() => addToCart(cake)}>
                      {cake.stockQuantity > 0 ? 'Add to Cart 🛒' : 'Sold Out 🚫'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-btn" onClick={() => { setView('shop'); window.scrollTo(0,0); }}>View Full Menu</button>
          </section>

          <section className="academy-section">
            <div className="section-header"><h2 style={{fontFamily: 'Playfair Display', fontSize: '3rem'}}>Featured Masterclasses</h2></div>
            <div className="grid" style={{paddingBottom: '40px'}}>
              {featuredCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className={`stock-badge ${course.seatsAvailable <= 0 ? 'out-of-stock-badge' : ''}`}>
                    {course.seatsAvailable > 0 ? `${course.seatsAvailable} seats left` : 'FULL'}
                  </div>
                  <img src={getCourseImage(course.title, course.imageUrl)} alt={course.title} className="course-img" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                  <div className="course-content">
                    <div className="course-meta"><span>{course.level}</span><span>{formatDate(course.dateTime)}</span></div>
                    <h3 className="course-title">{course.title}</h3>
                    <div style={{fontSize: '1.4rem', color: '#d84378', fontWeight: 'bold', marginBottom: '15px'}}>R {parseFloat(course.price).toFixed(2)}</div>
                    <button className={`enroll-btn ${course.seatsAvailable <= 0 ? 'disabled-btn' : ''}`} style={course.seatsAvailable > 0 ? { backgroundColor: '#2b1b17', color: '#c5a059' } : {}} disabled={course.seatsAvailable <= 0} onClick={() => bookCourse(course)}>
                      {course.seatsAvailable > 0 ? 'Register Now 🎟️' : 'Fully Booked 🚫'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-btn" onClick={() => { setView('academy'); window.scrollTo(0,0); }}>View All Courses</button>
          </section>
        </>
      )}

      {view === 'shop' && (
        <section style={{paddingTop: '40px'}}>
            <div className="section-header"><h2 style={{fontFamily: 'Playfair Display', fontSize: '3.5rem'}}>The Confectionery Shop</h2></div>
            <div className="grid">
              {data?.allProducts.map((cake) => (
                <div key={cake.id} className="card">
                  <div className={`stock-badge ${cake.stockQuantity <= 0 ? 'out-of-stock-badge' : ''}`}>
                    {cake.stockQuantity > 0 ? `${cake.stockQuantity} in stock` : 'SOLD OUT'}
                  </div>
                  {/* UPDATED: Pulling actual image from the backend */}
                  <img src={cake.imageUrl || PLACEHOLDER} className="card-img" alt={cake.name} />
                  <div className="card-body">
                    <h3 style={{fontFamily: 'Playfair Display', fontSize: '1.4rem'}}>{cake.name}</h3>
                    <div style={{fontSize: '1.4rem', color: '#d84378', fontWeight: 'bold', marginBottom: '10px'}}>R {parseFloat(cake.price).toFixed(2)}</div>
                    <button className={`enroll-btn ${cake.stockQuantity <= 0 ? 'disabled-btn' : ''}`} disabled={cake.stockQuantity <= 0} onClick={() => addToCart(cake)}>
                      {cake.stockQuantity > 0 ? 'Add to Cart 🛒' : 'Sold Out 🚫'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
        </section>
      )}

      {view === 'academy' && (
        <section className="academy-section" style={{paddingTop: '40px'}}>
            <div className="section-header"><h2 style={{fontFamily: 'Playfair Display', fontSize: '3.5rem'}}>Dulce Academy</h2></div>
            <div className="grid">
              {data?.allCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className={`stock-badge ${course.seatsAvailable <= 0 ? 'out-of-stock-badge' : ''}`}>
                    {course.seatsAvailable > 0 ? `${course.seatsAvailable} seats left` : 'FULL'}
                  </div>
                  <img src={getCourseImage(course.title, course.imageUrl)} alt={course.title} className="course-img" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                  <div className="course-content">
                    <div className="course-meta"><span>{course.level}</span><span>{formatDate(course.dateTime)}</span></div>
                    <h3 className="course-title">{course.title}</h3>
                    <div style={{fontSize: '1.4rem', color: '#d84378', fontWeight: 'bold', marginBottom: '15px'}}>R {parseFloat(course.price).toFixed(2)}</div>
                    <button className={`enroll-btn ${course.seatsAvailable <= 0 ? 'disabled-btn' : ''}`} style={course.seatsAvailable > 0 ? { backgroundColor: '#2b1b17', color: '#c5a059' } : {}} disabled={course.seatsAvailable <= 0} onClick={() => bookCourse(course)}>
                      {course.seatsAvailable > 0 ? 'Register Now 🎟️' : 'Fully Booked 🚫'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
        </section>
      )}

      {/* --- CART CHECKOUT WITH STRIPE --- */}
      {view === 'cart-checkout' && (
        <div className="checkout-container">
            <h2 style={{fontFamily: 'Playfair Display', textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px'}}>Shop Checkout</h2>
            <div className="summary-box">
                <h3 style={{marginTop: 0}}>Order Summary</h3>
                {cart.map((item, index) => (
                    <div key={index} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                        <span>{item.name}</span><span>R {parseFloat(item.price).toFixed(0)}</span>
                    </div>
                ))}
                <div style={{borderTop: '1px solid #ccc', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between'}}>
                    <span>Total To Pay</span><span style={{color: '#d84378'}}>R {cartTotal.toFixed(2)}</span>
                </div>
            </div>
            <form onSubmit={handleCartCheckout}>
                <div className="form-group"><label className="form-label">Full Name</label><input type="text" required className="form-input" placeholder="e.g. John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input type="email" required className="form-input" placeholder="e.g. john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                
                <div className="form-group">
                  <label className="form-label">Credit Card Details</label>
                  <CardElement options={CARD_ELEMENT_OPTIONS} className="StripeElement" />
                </div>

                <button type="submit" className={`enroll-btn ${isProcessing || !stripe ? 'disabled-btn' : ''}`} disabled={isProcessing || !stripe} style={{background: '#d84378', fontSize: '1.1rem'}}>
                  {isProcessing ? 'Processing Payment...' : 'Confirm & Pay'}
                </button>
            </form>
            <span className="back-link" onClick={() => setView('shop')}>← Back to Shop</span>
        </div>
      )}

      {/* --- COURSE CHECKOUT WITH STRIPE --- */}
      {view === 'course-checkout' && selectedCourse && (
        <div className="checkout-container">
            <h2 style={{fontFamily: 'Playfair Display', textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px'}}>Course Registration</h2>
            <div className="summary-box" style={{background: '#f3e5dc', borderLeft: '4px solid #c5a059'}}>
                <h3 style={{marginTop: 0, color: '#2b1b17'}}>Booking Details</h3>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '1.2rem', fontWeight: 'bold'}}><span>{selectedCourse.title}</span><span>R {parseFloat(selectedCourse.price).toFixed(0)}</span></div>
                <div style={{color: '#555', fontSize: '0.9rem', marginTop: '10px'}}>Date: {formatDate(selectedCourse.dateTime)}<br/>Level: {selectedCourse.level}</div>
            </div>
            <form onSubmit={handleCourseBooking}>
                <div className="form-group"><label className="form-label">Student Name</label><input type="text" required className="form-input" placeholder="e.g. Jane Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input type="email" required className="form-input" placeholder="e.g. jane@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                
                <div className="form-group">
                  <label className="form-label">Credit Card Details</label>
                  <CardElement options={CARD_ELEMENT_OPTIONS} className="StripeElement" />
                </div>

                <button type="submit" className={`enroll-btn ${isProcessing || !stripe ? 'disabled-btn' : ''}`} disabled={isProcessing || !stripe} style={{background: '#2b1b17', color: '#c5a059', fontSize: '1.1rem'}}>
                   {isProcessing ? 'Processing Payment...' : 'Secure My Seat'}
                </button>
            </form>
            <span className="back-link" onClick={() => setView('academy')}>← Back to Academy</span>
        </div>
      )}

      {view === 'success' && (
        <div className="success-container">
            <div className="success-icon">{lastOrderType === 'course' ? '🎓' : '🎉'}</div>
            <h1 style={{fontFamily: 'Playfair Display', fontSize: '3rem', color: '#2b1b17'}}>{lastOrderType === 'course' ? 'Registration Successful!' : 'Order Confirmed!'}</h1>
            <p style={{fontSize: '1.2rem', color: '#555'}}>Thank you, <strong>{formData.name}</strong>. {lastOrderType === 'course' ? 'Your seat has been officially reserved for this masterclass.' : 'Your transaction was successful.'}</p>
            <div className="order-receipt">
                <p>{lastOrderType === 'course' ? 'Your syllabus and receipt have been sent to:' : 'A receipt and delivery details have been sent to:'}</p>
                <p style={{fontWeight: 'bold', color: '#d84378', fontSize: '1.2rem'}}>{formData.email}</p>
                <div style={{marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '15px'}}>
                    {lastOrderType === 'course' ? 'Course Fee: ' : 'Total Paid: '} <span style={{fontWeight: 'bold', fontSize: '1.5rem', marginLeft: '10px'}}>R {lastOrderTotal.toFixed(2)}</span>
                </div>
            </div>
            <button className="enroll-btn" style={{marginTop: '40px', maxWidth: '250px'}} onClick={() => { setFormData({name:'', email:''}); setView('home'); }}>Return to Dashboard</button>
        </div>
      )}
    </div>
  );
}

// --- WRAP THE APP IN STRIPE ELEMENTS ---
export default function App() {
  return (
    <Elements stripe={stripePromise}>
      <DulceApp />
    </Elements>
  );
}