// ton-listener.js — minimal TON polling example using Toncenter
require('dotenv').config();
const fetch = require('node-fetch');

const merchant = process.env.TON_MERCHANT_ADDRESS;
if (!merchant) {
  console.error('Set TON_MERCHANT_ADDRESS in .env');
  process.exit(1);
}

let lastLt = null;

async function poll() {
  try {
    const apikey = process.env.TONCENTER_APIKEY;
    const url = `https://toncenter.com/api/v2/getTransactions?address=${merchant}&limit=50`;
    const resp = await fetch(url, { headers: apikey ? { 'X-API-Key': apikey } : {} });
    const json = await resp.json();
    if (!json.ok) {
      console.error('toncenter error', json);
      return;
    }
    const txs = json.result.transactions || json.result;
    if (!Array.isArray(txs)) return;
    txs.reverse();
    for (const tx of txs) {
      const lt = (tx.id && tx.id.lt) || tx.lt || null;
      if (!lt) continue;
      if (lastLt && lt <= lastLt) continue;
      const comment = (tx.description && tx.description.text) || tx.comment || (tx.in_msg && tx.in_msg.message) || '';
      if (comment) {
        const m = comment.match(/order:([a-f0-9\-]+)/i);
        if (m) {
          const orderId = m[1];
          console.log('Found TON payment for order', orderId, 'comment:', comment);
          // Mark order paid by calling local server endpoint (optional)
          try {
            await fetch(`${process.env.WEBAPP_URL || 'http://localhost:3000'}/internal/mark-paid`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, via: 'ton' })
            });
          } catch (e) {
            // if endpoint not present, it's fine for this minimal example
          }
        }
      }
      lastLt = lt;
    }
  } catch (e) {
    console.error('poll error', e);
  } finally {
    setTimeout(poll, 8000);
  }
}

poll();