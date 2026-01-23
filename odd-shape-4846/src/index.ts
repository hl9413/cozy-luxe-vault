declare global {
  interface Env {
    // ASSETS: Workers Sites binding (optional for dev with --assets)
    ASSETS?: {
      fetch(request: RequestInfo): Promise<Response>;
    };

    // Cloudflare D1 binding (optional)
    DB?: D1Database;

    // Telegram bot token (optional)
    BOT_TOKEN?: string;
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // --- CORS preflight handling for browser clients ---
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        }
      });
    }

    // Helper to build JSON responses with CORS header
    function createJsonResponse(obj: any, status = 200) {
      return new Response(JSON.stringify(obj), {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // === TON Connect manifest route (must be HTTPS-accessible) ===
    if (url.pathname === '/tonconnect-manifest.json' && request.method === 'GET') {
      const manifest = {
        url: `https://${url.hostname}`,
        name: "Cozy Luxe Shop",
        short_name: "CozyLuxe",
        description: "Cozy Luxe Shop - TON Connect manifest",
        // Use a public HTTPS icon or your own hosted icon path
        iconUrl: `https://${url.hostname}/icon.png`
      };
      return new Response(JSON.stringify(manifest), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // === Root HTML (simple storefront page) ===
    if (url.pathname === '/' && request.method === 'GET') {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cozy Luxe Collection</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #fff0f5; font-family: 'Helvetica Neue', sans-serif; }   
    .product-card { border-radius: 1rem; background-color: #ffffff; box-shadow: 0 4px 10px rgba(255,192,203,0.2); transition: transform 0.3s; }
    .product-card:hover { transform: translateY(-5px); }
    .carousel-container { position: relative; overflow: hidden; border-radius: 1rem; }
    .carousel-track { display: flex; transition: transform 0.3s ease; }
    .carousel-slide { min-width: 100%; }
    .carousel-buttons { position: absolute; top: 50%; width: 100%; display: flex; justify-content: space-between; transform: translateY(-50%); }
    .carousel-buttons button { background-color: rgba(255,192,203,0.7); border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
  </style>
</head>
<body class="p-4">
  <header class="mb-6 text-center">
    <h1 class="text-3xl font-bold text-pink-600">Cozy Luxe Collection</h1>
    <p class="text-pink-400 mt-1">Trendy accessories & apparel for modern style</p>  
  </header>

  <main class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="product-list"></main>

  <script>
    async function loadProducts() {
      const res = await fetch('/api/public/products');
      const products = await res.json();
      const container = document.getElementById('product-list');

      products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card p-4 flex flex-col';

        let currentIndex = 0;

        const carousel = document.createElement('div');
        carousel.className = 'carousel-container mb-4';

        const track = document.createElement('div');
        track.className = 'carousel-track';

        product.images.forEach(imgUrl => {
          const slide = document.createElement('div');
          slide.className = 'carousel-slide';
          const img = document.createElement('img');
          img.src = imgUrl;
          img.alt = product.title_en;
          img.className = 'w-full h-64 object-cover rounded-lg';
          slide.appendChild(img);
          track.appendChild(slide);
        });

        const btnPrev = document.createElement('button');
        btnPrev.textContent = '<';
        const btnNext = document.createElement('button');
        btnNext.textContent = '>';
        const buttons = document.createElement('div');
        buttons.className = 'carousel-buttons';
        buttons.append(btnPrev, btnNext);

        carousel.append(track, buttons);
        card.appendChild(carousel);

        btnPrev.onclick = () => {
          currentIndex = (currentIndex - 1 + product.images.length) % product.images.length;
          track.style.transform = 'translateX(' + (-currentIndex * 100) + '%)';      
        };
        btnNext.onclick = () => {
          currentIndex = (currentIndex + 1) % product.images.length;
          track.style.transform = 'translateX(' + (-currentIndex * 100) + '%)';      
        };

        const title = document.createElement('h2');
        title.className = 'text-xl font-semibold text-pink-600 mb-1';
        title.textContent = product.title_en;
        card.appendChild(title);

        const desc = document.createElement('p');
        desc.className = 'text-pink-400 text-sm mb-2';
        desc.textContent = product.description_en;
        card.appendChild(desc);

        const price = document.createElement('p');
        price.className = 'text-lg font-bold text-pink-700 mb-3';
        price.textContent = '$' + product.price_usd.toFixed(2);
        card.appendChild(price);

        const btnCart = document.createElement('button');
        btnCart.className = 'bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-500 transition';
        btnCart.textContent = 'Add to Cart';
        card.appendChild(btnCart);

        container.appendChild(card);
      });
    }

    loadProducts();
  </script>
</body>
</html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // === Telegram Web App verify endpoint ===
    if (url.pathname === '/api/verify-telegram' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const initData: string | undefined = (typeof body?.initData === 'string') ? body.initData : undefined;
        if (!initData) {
          return createJsonResponse({ error: 'Missing initData' }, 400);
        }

        const botToken: string = (typeof env.BOT_TOKEN === 'string') ? env.BOT_TOKEN : '';
        const valid = await verifyTelegramInitData(initData, botToken);

        return createJsonResponse({ valid });
      } catch (err: any) {
        return createJsonResponse({ error: err?.message || String(err) }, 500);
      }
    }

    // === Public products endpoint (used by front-end) ===
    if (url.pathname === '/api/public/products' && request.method === 'GET') {
      try {
        const DB = env.DB;
        if (!DB) {
          return createJsonResponse({ error: 'Database binding not configured (env.DB missing)' }, 500);
        }

        const productsRes = await DB.prepare(`
          SELECT id, title_en, description_en, price_usd
          FROM products
          ORDER BY id DESC
        `).all();

        const products = productsRes.results || [];

        const productsWithImages = await Promise.all(
          products.map(async (p: any) => {
            const imagesRes = await DB.prepare(`
              SELECT image_url, is_primary, sort_order
              FROM product_images
              WHERE product_id = ?
              ORDER BY sort_order ASC
            `).bind(p.id).all();

            let imgs = (imagesRes && imagesRes.results) ? imagesRes.results.map((img: any) => img.image_url) : [];
            // Normalize: ensure array, at least 1 image, max 4
            const fallback = `https://${url.hostname}/icon.png`;
            if (!Array.isArray(imgs)) imgs = [];
            if (imgs.length === 0) imgs = [fallback];
            if (imgs.length > 4) imgs = imgs.slice(0, 4);

            return {
              id: p.id,
              title_en: p.title_en || '',
              description_en: p.description_en || '',
              price_usd: Number(p.price_usd || 0),
              images: imgs
            };
          })
        );

        return createJsonResponse(productsWithImages);
      } catch (err: any) {
        return createJsonResponse({ error: err.message }, 500);
      }
    }

    // === Assets / Workers Sites fallback (if binding present) ===
    try {
      if (env.ASSETS && typeof (env.ASSETS as any).fetch === 'function') {
        // delegate static asset serving to the binding (wrangler dev --assets or wrangler publish with assets)
        return (env.ASSETS as any).fetch(request);
      } else {
        // helpful error for local dev when assets/site binding isn't configured
        return new Response(
          'Static assets binding not configured (env.ASSETS is missing). Start dev with assets enabled (e.g. `wrangler dev --assets ./public` or `npx miniflare --site ./public`).',
          { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' } }
        );
      }
    } catch (e: any) {
      return createJsonResponse({ error: String(e && e.message ? e.message : e) }, 500);
    }
  }
};

// === Telegram initData verification helper ===
async function verifyTelegramInitData(initData: string, botToken: string): Promise<boolean> {
  try {
    if (!botToken) return false;
    const paramsArray = initData.split('&').map(p => {
      const [k, ...rest] = p.split('=');
      return [k, decodeURIComponent(rest.join('='))];
    });
    const params = Object.fromEntries(paramsArray);
    const hashFromClient = params['hash'];
    if (!hashFromClient) return false;
    delete params['hash'];

    const dataCheckString = Object.keys(params)
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('\n');

    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(botToken);

    // key = sha256(botToken)
    const keyHash = await crypto.subtle.digest('SHA-256', keyMaterial);

    // import as HMAC key
    const cryptoKey = await crypto.subtle.importKey('raw', keyHash, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

    // sign dataCheckString
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(dataCheckString));

    // convert signature to hex
    const sigHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

    return sigHex === hashFromClient;
  } catch (e) {
    // any error => verification failed
    return false;
  }
}
