// server.js — minimal example (not production hardened)
// Replace placeholders in .env and install deps: npm install
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const stripe = require('stripe')(process.env.STRIPE_SECRET || '');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

// Serve static files from project root so webapp.html is reachable
app.use(express.static(__dirname));

// In-memory orders store (use DB in production)
const orders = new Map();

/*
 Order schema (example):
 {
  id,
  items,
  amount,
  currency,
  buyer: { name, phone, address },
  status: 'created'|'paid',
  payment_method,
  created_at,
  paid_at,
  metadata
 }
*/

// Create order (client provides buyer shipping address)
app.post('/api/orders', (req, res) => {
  const { items, amount, currency = 'USD', buyer } = req.body;
  if (!amount || !buyer || !buyer.address) {
    return res.status(400).json({ error: 'amount and buyer.address required' });
  }
  const id = uuidv4();
  const order = {
    id,
    items: items || [],
    amount: Number(amount),
    currency,
    buyer,
    status: 'created',
    payment_method: null,
    created_at: new Date().toISOString()
  };
  orders.set(id, order);
  res.json(order);
});

// Create Stripe Checkout Session
app.post('/api/pay/stripe', async (req, res) => {
  const { orderId } = req.body;
  const order = orders.get(orderId);
  if (!order) return res.status(404).json({ error: 'order not found' });
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: order.currency,
            product_data: { name: `Order ${order.id}` },
            unit_amount: Math.round(order.amount * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      metadata: { orderId: order.id },
      success_url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/success.html?order=${order.id}`,
      cancel_url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/cancel.html?order=${order.id}`
    });
    order.payment_method = 'stripe';
    orders.set(orderId, order);
    res.json({ url: session.url });
  } catch (err) {
    console.error('stripe create session err', err);
    res.status(500).json({ error: 'stripe error' });
  }
});

// Create PayPal order (simple)
app.post('/api/pay/paypal', async (req, res) => {
  const { orderId } = req.body;
  const order = orders.get(orderId);
  if (!order) return res.status(404).json({ error: 'order not found' });

  try {
    // Get access token
    const tokenResp = await fetch(`https://api${process.env.PAYPAL_ENV === 'sandbox' ? '.sandbox' : ''}.paypal.com/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from((process.env.PAYPAL_CLIENT || '') + ':' + (process.env.PAYPAL_SECRET || '')).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    const tokenJson = await tokenResp.json();
    const token = tokenJson.access_token;

    // Create order
    const createResp = await fetch(`https://api${process.env.PAYPAL_ENV === 'sandbox' ? '.sandbox' : ''}.paypal.com/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: order.currency, value: order.amount.toFixed(2) },
          reference_id: order.id
        }],
        application_context: {
          return_url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/paypal-success.html?order=${order.id}`,
          cancel_url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}/cancel.html?order=${order.id}`
        }
      })
    });
    const createJson = await createResp.json();
    const approveUrl = createJson.links && createJson.links.find(l => l.rel === 'approve') && createJson.links.find(l => l.rel === 'approve').href;
    order.payment_method = 'paypal';
    orders.set(orderId, order);
    res.json({ url: approveUrl, paypalOrderId: createJson.id });
  } catch (err) {
    console.error('paypal create order err', err);
    res.status(500).json({ error: 'paypal error' });
  }
});

// Generate TON deep link (the front-end will open this)
app.post('/api/pay/ton', (req, res) => {
  const { orderId, merchantAddress, amountTon } = req.body;
  const order = orders.get(orderId);
  if (!order) return res.status(404).json({ error: 'order not found' });

  // Build deep link with order id in text (URI encoded)
  const text = encodeURIComponent(`order:${order.id}`);
  const merchant = merchantAddress || process.env.TON_MERCHANT_ADDRESS;
  if (!merchant) return res.status(400).json({ error: 'merchant TON address required' });

  const deepLink = `ton://transfer/${merchant}?amount=${amountTon}&text=${text}`;
  order.payment_method = 'ton';
  order.ton_amount = amountTon;
  orders.set(orderId, order);
  res.json({ deepLink, qrText: deepLink });
});

// Stripe webhook (needs raw body to verify signature in production)
const rawBodyParser = bodyParser.raw({ type: 'application/json' });
app.post('/webhook/stripe', rawBodyParser, (req, res) => {
  // In production: verify signature with stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET)
  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata && session.metadata.orderId;
    if (orderId) {
      const order = orders.get(orderId);
      if (order) {
        order.status = 'paid';
        order.paid_at = new Date().toISOString();
        orders.set(orderId, order);
        console.log('Order paid (stripe):', orderId);
      }
    }
  }
  res.json({ received: true });
});

// PayPal webhook endpoint (simple; production must verify)
app.post('/webhook/paypal', bodyParser.json(), (req, res) => {
  const event = req.body;
  if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const resource = event.resource || {};
    const referenceId = resource.purchase_units && resource.purchase_units[0] && resource.purchase_units[0].reference_id;
    const orderId = referenceId || resource.invoice_id || (resource.supplementary_data && resource.supplementary_data.related_ids && resource.supplementary_data.related_ids.order_id);
    if (orderId) {
      const order = orders.get(orderId);
      if (order) {
        order.status = 'paid';
        order.paid_at = new Date().toISOString();
        orders.set(orderId, order);
        console.log('Order paid (paypal):', orderId);
      }
    }
  }
  res.sendStatus(200);
});

// Internal endpoint used by ton-listener to mark paid (optional)
app.post('/internal/mark-paid', bodyParser.json(), (req, res) => {
  const { orderId, via } = req.body || {};
  if (!orderId) return res.status(400).json({ error: 'orderId required' });
  const order = orders.get(orderId);
  if (!order) return res.status(404).json({ error: 'order not found' });
  order.status = 'paid';
  order.paid_at = new Date().toISOString();
  order.payment_method = via || 'ton';
  orders.set(orderId, order);
  console.log('Order marked paid via', via, orderId);
  res.json({ ok: true });
});

// Get order status
app.get('/api/orders/:id', (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) return res.status(404).json({ error: 'order not found' });
  res.json(order);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server listening ${PORT} on 0.0.0.0`));