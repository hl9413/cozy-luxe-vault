import React from "react";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import "./App.css";

export default function App() {
  const [tonConnectUI] = useTonConnectUI();

  // 你的 @wallet USDT 地址（粘你的 UQ 开头完整地址）
  const MY_ADDRESS = "UQBj5kp7AXpFIZkf35h-e88T4x62Jhv6NwJ7EFH9GRvzMmmB"; // ← 改成你的真实地址

  const pay = async (amount: number, item: string) => {
    if (!tonConnectUI.connected) {
      alert("Please connect wallet first ♡");
      return;
    }
    try {
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: MY_ADDRESS,
            amount: (amount * 1_000_000_000).toString(),
            payload: btoa(`Buy ${item}`),
          },
        ],
      };
      await tonConnectUI.sendTransaction(tx);
      alert(`$${amount} USDT received! Thank you ♡`);
    } catch (e) {
      alert("Payment cancelled");
    }
  };

  return (
    <div style={{ padding: "20px", background: "#fdf6f8", minHeight: "100vh", fontFamily: "Georgia, serif" }}>
      <h1 style={{ textAlign: "center", color: "#c54b8c", fontSize: "32px" }}>
        ♡ Cozy Luxe Vault ♡
      </h1>
      <p style={{ textAlign: "center", color: "#888", marginBottom: "25px" }}>
        Cashmere Scarves · Merino Socks · Beanies · Fine Jewelry
      </p>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <TonConnectButton />  {/* 支持 @wallet 一键连接 */}
      </div>

      {/* Cashmere Scarf */}
      <div style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "25px", boxShadow: "0 6px 30px rgba(197,75,140,0.12)" }}>
        <h3 style={{ color: "#c54b8c", margin: "0 0 12px" }}>100% Cashmere Scarf</h3>
        <img src="https://i.imgur.com/8Qz9k8E.jpg" alt="scarf" style={{ width: "100%", borderRadius: "12px" }} />
        <p style={{ color: "#c54b8c", fontWeight: "bold", fontSize: "22px", margin: "15px 0 10px" }}>$28</p>
        <button
          onClick={() => pay(28, "Cashmere Scarf")}
          style={{
            width: "100%",
            padding: "15px",
            background: "#c54b8c",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "17px",
            fontWeight: "bold",
          }}
        >
          Buy Now – 28 USDT
        </button>
      </div>

      {/* Merino Socks */}
      <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 6px 30px rgba(197,75,140,0.12)" }}>
        <h3 style={{ color: "#c54b8c", margin: "0 0 12px" }}>Merino Wool Socks – 3 Pairs</h3>
        <img src="https://i.imgur.com/r2D5nPk.jpg" alt="socks" style={{ width: "100%", borderRadius: "12px" }} />
        <p style={{ color: "#c54b8c", fontWeight: "bold", fontSize: "22px", margin: "15px 0 10px" }}>$18</p>
        <button
          onClick={() => pay(18, "Merino Socks")}
          style={{
            width: "100%",
            padding: "15px",
            background: "#c54b8c",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "17px",
            fontWeight: "bold",
          }}
        >
          Buy Now – 18 USDT
        </button>
      </div>
    </div>
  );
}