const tg = window.Telegram.WebApp
tg.ready()
tg.expand()

const userDiv = document.getElementById('user')

if (tg.initDataUnsafe?.user) {
  const u = tg.initDataUnsafe.user
  userDiv.innerText = `Hello ${u.first_name} (id: ${u.id})`
} else {
  userDiv.innerText = 'Not in Telegram'
}

document.getElementById('load').onclick = async () => {
  const res = await fetch('https://odd-shape-4846.1914653652.workers.devhttps://odd-shape-4846.1914653652.workers.dev/api/public/products')
  const data = await res.json()
  const output = document.getElementById('output')
  output.innerHTML = ''

  const grid = document.createElement('div')
  grid.style.display = 'grid'
  grid.style.gridTemplateColumns = 'repeat(auto-fill,minmax(160px,1fr))'
  grid.style.gap = '12px'

  data.forEach(p => {
    const card = document.createElement('div')
    card.style.border = '1px solid #eee'
    card.style.padding = '8px'
    card.style.borderRadius = '8px'
    card.style.background = '#fff'

    const img = document.createElement('img')
    const imgPath = (p.images && p.images.length) ? p.images[0] : ''
    img.src = imgPath.startsWith('http') ? imgPath : (window.location.origin + imgPath)
    img.alt = p.title_en || p.title || ''
    img.style.width = '100%'
    img.style.height = '120px'
    img.style.objectFit = 'cover'
    img.style.borderRadius = '6px'
    card.appendChild(img)

    const title = document.createElement('div')
    title.textContent = p.title_en || p.title || ''
    title.style.fontWeight = '600'
    title.style.marginTop = '8px'
    card.appendChild(title)

    const price = document.createElement('div')
    price.textContent = '$' + ((p.price_usd !== undefined) ? Number(p.price_usd).toFixed(2) : (p.price || '0'))
    price.style.color = '#e91e63'
    price.style.marginTop = '6px'
    card.appendChild(price)

    grid.appendChild(card)
  })

  output.appendChild(grid)
}


