'use strict';
const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsResteurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantHeading = document.querySelector('.restaurant-heading');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');
let login = localStorage.getItem('gloDelivary');
const cart = [];
const getData = async function(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, статус ошибка ${response.status} !`);
  }
  return await response.json();
};

function toggleModal() {
  modal.classList.toggle("is-open");
};

function toggleModalAuth() {
  loginInput.style.borderColor = "";
  modalAuth.classList.toggle("is-open");
};


function authorized() {
  function logOut() {
    login = null;
    localStorage.removeItem('gloDelivary');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
  }
  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
};

function notAuthorized() {
  function logIn(event) {
    event.preventDefault();
    login = loginInput.value;
    if (!login) {
      loginInput.style.borderColor = "red";
      alert("Заполните поле логин");
      return;
    }
    localStorage.setItem('gloDelivary', login);
    toggleModalAuth();
    buttonAuth.removeEventListener('click', toggleModalAuth);
    closeAuth.removeEventListener('click', toggleModalAuth);
    logInForm.removeEventListener('submit', logIn);
    logInForm.reset();
    checkAuth();
  }
  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn)
};

function checkAuth() {
  if (login) {
    authorized();
  }
  else {
    notAuthorized();
  }
};

function createCardRestaurant(restaurant) {
  const { image, 
          kitchen, 
          name, 
          price, 
          stars, 
          products, 
          time_of_delivery: timeOfDelivery
        } = restaurant;
  const card = `
    <a class="card card-restaurant" data-products="${products}" data-name="${name}" 
     data-stars="${stars}" data-price="${price}" data-kitchen="${kitchen}">
		  <img src="${image}" alt="image" class="card-image"/>
				<div class="card-text">
					<div class="card-heading">
							<h3 class="card-title">${name}</h3>
							<span class="card-tag tag">${timeOfDelivery}</span>
					</div>
					<div class="card-info">
						<div class="rating">
							${stars}
						</div>
					  <div class="price">От ${price} ₽</div>
						<div class="category">${kitchen}</div>
					</div>
				</div>
    </a>`;
  cardsResteurants.insertAdjacentHTML('beforeend', card);
};

function createCardGood(goods) {
  const { description,
          id,
          image,
          name,
          price
        } = goods;
  const card = document.createElement('div');
  card.className = 'card';
  card.insertAdjacentHTML('beforeend', `
    <div class="card">
			<img src="${image}" alt="image" class="card-image"/>
				<div class="card-text">
					<div class="card-heading">
						<h3 class="card-title card-title-reg">${name}</h3>
					</div>
					<div class="card-info">
            <div class="ingredients">
              ${description}
						</div>
					</div>
					<div class="card-buttons">
						<button class="button button-primary button-add-cart" id="${id}">
							<span class="button-card-text">В корзину</span>
							<span class="button-cart-svg"></span>
						</button>
						<strong class="card-price card-price-bold">${price} ₽</strong>
					</div>
				</div>
		</div>
  `);
  cardsMenu.insertAdjacentElement('beforeend', card);
};

function openGoods(event) {
    const target = event.target;
    if(login) {
      const restaurant = target.closest('.card-restaurant');
      if (restaurant) {
        cardsMenu.textContent = '';
        restaurantHeading.textContent = '';
        containerPromo.classList.add('hide');
        restaurants.classList.add('hide');
        menu.classList.remove('hide');
        const heading = `
          <h2 class="section-title restaurant-title">${restaurant.dataset.name}</h2>
					  <div class="card-info">
						  <div class="rating">
                ${restaurant.dataset.stars}
						  </div>
						  <div class="price">От ${restaurant.dataset.price} ₽</div>
						  <div class="category">${restaurant.dataset.kitchen}</div>
					  </div>
        `;
        restaurantHeading.insertAdjacentHTML('beforeend', heading);
        getData(`./db/${restaurant.dataset.products}`).then(function(data) {
          data.forEach(createCardGood);
        });
      }
    }
    else {
      toggleModalAuth();
    }
};

function addToCart(event) { //добавление товаров в корзину
  const target = event.target;
  const buttonAddToCart = target.closest('.button-add-cart');
  if (buttonAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id =  buttonAddToCart.id;
    const food = cart.find(function(item) {
      return item.id === id;
    })
    if (food) { //если товар уже есть в корзине, то просто увеличиваем его количество
      food.count += 1;
    }
    else { //если такого товара еще нет, то добавляем объект(товар) в массив cart
      cart.push({
        id,
        title,
        cost,
        count: 1
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart)); //сохраняем корзину в localStorage
  }
};

function renderCart() { //отображение товаров в корзине из массива cart
  modalBody.textContent = "";
  const tmpCart = JSON.parse(localStorage.getItem('cart') || "[]");
  if (tmpCart) {
    cart.length = 0;
    for (let i = 0; i < tmpCart.length; i++) {
      cart.push(tmpCart[i]);
    }
  }
  cart.forEach(function({ id, title, cost, count }) {
    const itemCart = `
      <div class="food-row">
				<span class="food-name">${title}</span>
				<strong class="food-price">${cost}</strong>
				<div class="food-counter">
					<button class="counter-button counter-minus" data-id="${id}">-</button>
					<span class="counter">${count}</span>
					<button class="counter-button counter-plus" data-id="${id}">+</button>
				</div>
			</div> 
    `;
    modalBody.insertAdjacentHTML('beforeend', itemCart);
  });
  const totalPrice = cart.reduce(function(result, item) { //расчет общей суммы
    return result + (parseFloat(item.cost) * item.count);
  }, 0);
  modalPrice.textContent = totalPrice + ' ₽';
};

function changeCount(event) { //изменение количества товаров в корзине
  const target = event.target;
  if (target.classList.contains('counter-button')) {
    const food = cart.find(function(item) {
      return item.id === target.dataset.id;
    });
    if (target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) { //если количество=0, то удаляем товар из массива cart
        cart.splice(cart.indexOf(food) , 1);
      }
    }
    if (target.classList.contains('counter-plus')) food.count++;
    localStorage.removeItem('cart');
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }
};

function init() {
  getData('./db/partners.json').then(function(data) {
    data.forEach(createCardRestaurant);
  });
  cartButton.addEventListener("click", function() {
    renderCart();
    toggleModal();
  });
  buttonClearCart.addEventListener('click', function() {
    cart.length = 0;
    localStorage.removeItem('cart');
    renderCart();
  });
  modalBody.addEventListener('click', changeCount);
  cardsMenu.addEventListener('click', addToCart)
  close.addEventListener("click", toggleModal);
  cardsResteurants.addEventListener('click', openGoods);
  logo.addEventListener('click', function() {
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
  });
  checkAuth();
  new Swiper('.swiper-container', {
    loop: true,
    autoplay: true
  });
};

init();