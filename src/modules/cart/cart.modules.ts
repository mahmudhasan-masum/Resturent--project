import api from "../../../bit/api";
import type { iProdact } from "../prodact/prodact.type";
import type { iCart, iCartStore } from "./type";

const cartSection = document.getElementById('cart-section');
const cartToggles = document.querySelectorAll('.cart-toggle');
const productGrid = document.getElementById('product-grid');
const cartContent = document.getElementById('cart-content');

// ================= Cart খোলা / বন্ধ =================
cartToggles.forEach((element) => {
  element.addEventListener('click', () => {
    cartSection?.classList.toggle('hidden');
    renderCartItem();
  });
});

// ================= Product এ "Add to cart" ক্লিক =================
if (productGrid) {
  productGrid.addEventListener('click', async (event) => {
    const btn = (event.target as HTMLElement).closest('.add-to-cart') as HTMLElement | null;
    if (!btn) return;

    const dataId = btn.dataset.id;
    const res = await api.get(`/prodact/${dataId}`);

    if (res.status == 200) {
      addToCart(res.data);
    }
  });
}

// ================= Cart এর + / − / Remove বাটন =================
if (cartContent) {
  cartContent.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest('button[data-action]') as HTMLButtonElement | null;
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;
    let items = getCart().data;

    const item = items.find((i: iCart) => String(i.id) === id);
    if (!item) return;

    if (action === 'inc') item.quantity += 1;
    if (action === 'dec') item.quantity -= 1;
    if (action === 'remove') item.quantity = 0;

    if (item.quantity < 1) {
      items = items.filter((i: iCart) => String(i.id) !== id);
    } else {
      item.totalPrice = Number(item.price) * item.quantity;
    }

    saveCart(items);
    renderCartItem();
  });
}

// ================= Helper functions =================
function getCart(): iCartStore {
  try {
    const stored = localStorage.getItem('cart');
    if (!stored) return { data: [], totalPrice: 0 };
    const parsed = JSON.parse(stored);
    return { data: parsed.data ?? [], totalPrice: parsed.totalPrice ?? 0 };
  } catch {
    return { data: [], totalPrice: 0 };
  }
}

function saveCart(items: iCart[]) {
  const totalPrice = items.reduce((total, current) => total + Number(current.totalPrice), 0);
  const cartData: iCartStore = { data: items, totalPrice };
  localStorage.setItem('cart', JSON.stringify(cartData));
}

function addToCart(product: iProdact) {
  const items = getCart().data;

  const exist = items.find((item: iCart) => String(item.id) === String(product.id));

  if (exist) {
    exist.quantity += 1;
    exist.totalPrice = Number(exist.price) * exist.quantity;
  } else {
    items.push({
      id: product.id as string,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      totalPrice: product.price,
    });
  }

  saveCart(items);
  renderCartItem();
}

function renderCartItem() {
  const subtotal = document.getElementById('subtotal');
  const cartContent = document.getElementById('cart-content');
  const cartTotalCount = document.getElementById('cart-total-count');
  if (!cartContent) return;

  const items = getCart().data;

  if (items.length === 0) {
    cartContent.innerHTML = `<p class="p-6 text-center text-gray-500">Your cart is empty</p>`;
    if (subtotal) subtotal.textContent = '$0.00';
    if (cartTotalCount) cartTotalCount.textContent = '0';
    return;
  }

  let cartHTML = '';
  let sum = 0;
  let count = 0;

  items.forEach((item: iCart) => {
    sum += Number(item.totalPrice);
    count += Number(item.quantity);

    cartHTML += `
    <div class="px-6 py-5 border-b border-gray-200">
      <div class="grid grid-cols-12 items-center gap-5">

        <div class="col-span-5 flex items-center gap-4">
          <div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            ${item.image
              ? `<img src="./src/assets/image/fode/${item.image}" alt="${item.name}" class="w-full h-full object-cover" />`
              : `<span class="text-xs text-black font-semibold">100 × 100</span>`}
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-800">${item.name}</h2>
            <p class="text-sm text-black font-semibold mt-1">$${Number(item.price).toFixed(2)} each</p>
            
          </div>
        </div>

        <div class="col-span-3 flex justify-center">
          <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button data-id="${item.id}" data-action="dec"
              class="px-4 py-2 text-black font-semibold hover:bg-gray-100">−</button>
            <span class="px-5 py-2 border-x border-gray-200">${item.quantity}</span>
            <button data-id="${item.id}" data-action="inc"
              class="px-4 py-2 text-black font-semibold hover:bg-gray-100">+</button>
          </div>
        </div>

        <div class="col-span-2 text-center">
          <p class="text-xs text-black font-semibold">Price</p>
          <p class="font-semibold text-gray-800 mt-1">$${Number(item.price).toFixed(2)}</p>
        </div>

        <div class="col-span-2 text-right">
          <p class="text-xs text-black font-semibold">Total</p>
          <p class="font-semibold text-gray-800 mt-1">$${Number(item.totalPrice).toFixed(2)}</p>
          <button data-id="${item.id}" data-action="remove"
              class="text-1xl font-semibold p-[4px] text-black rounded-[5px] border-[2px]  mt-1 hover:bg-[#31C950]">Delete</button>
        </div>

      </div>
    </div>`;
  });

  cartContent.innerHTML = cartHTML;
  if (subtotal) subtotal.textContent = `$${sum.toFixed(2)}`;
  if (cartTotalCount) cartTotalCount.textContent = String(count);
}

// পেজ লোডে cart count দেখানোর জন্য
renderCartItem();
document.getElementById('clear-cart')?.addEventListener('click', () => {
  localStorage.removeItem('cart');
  renderCartItem();
});