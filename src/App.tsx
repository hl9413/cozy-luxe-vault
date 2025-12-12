import React, { useState } from 'react';

function App() {
  const COLORS = {
    primary: "#c54b8c",
    secondary: "#e91e63",
    textDark: "#555",
  };

  const [isLoading, setIsLoading] = useState(false);

  const payWithUSDT = async (amount: number, productName: string) => {
    alert(`准备支付 ${amount} USDT 购买 ${productName}`);
  };

  const handleBuy = async (amount: number, productName: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await payWithUSDT(amount, productName);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9f0ff 0%, #e6f7ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: COLORS.primary,
        marginBottom: '40px'
      }}>
        Welcome to My Store
      </h1>

      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 6px 30px rgba(197,75,140,0.12)",
        maxWidth: "400px",
        width: "100%"
      }}>
        <h3 style={{ color: COLORS.primary, marginBottom: "8px" }}>
          Marimekko Women's & Children's Cotton Socks
        </h3>
        <p style={{ color: COLORS.textDark, fontSize: "15px", lineHeight: "1.5", margin: "10px 0" }}>
          Sizes 36-42  Soft & breathable cotton<br />
          10 pairs or more = FREE worldwide shipping ♡
        </p>

        <img
          src="/image_editor_1760666290001.jpg"
          alt="Marimekko Cotton Socks"
          style={{ width: "100%", borderRadius: "12px" }}
          loading="lazy"
        />

        <p style={{ color: COLORS.primary, fontWeight: "bold", fontSize: "24px", margin: "15px 0 8px" }}>
          $8 per pair
        </p>

        <button
          onClick={() => handleBuy(8, "Marimekko Cotton Socks (1 pair)")}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "15px",
            background: COLORS.primary,
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "17px",
            fontWeight: "bold",
            marginBottom: "8px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Processing..." : "Buy 1 pair  8 USDT"}
        </button>

        <button
          onClick={() => handleBuy(80, "Marimekko Cotton Socks 10 (Free Shipping)")}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "15px",
            background: COLORS.secondary,
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "17px",
            fontWeight: "bold",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Processing..." : "Buy 10 pairs  80 USDT (Free Shipping Worldwide)"}
        </button>
      </div>
    </div>
  );
}

export default App;
