import "./normalize.css";
import "./styles.css";
import imgHbs from "./templates/img.hbs";
import imgFavHbs from "./templates/img-fav.hbs";
import { apiImages } from "./services/api";
import { LOCALSTORAGE } from "./services/storage";
import logo from "./img/logo.png";

const header = document.querySelector(".header");
const form = document.querySelector(".form");
const input = form.querySelector(".input");
const favoritesBtn = document.querySelector(".btn-fav");
const gallery = document.querySelector(".gallery");
const cards = document.querySelector("#cards");
const slider = document.querySelector(".js-slider");
const btnMore = document.querySelector(".js-button");
const h1 = document.querySelector(".text-fav");
const spinners = document.querySelector(".spinners");

const link = document.createElement("a");
link.classList.add("link-logo");
link.setAttribute("href", "./index.html");
const img = document.createElement("img");
img.classList.add("logo");
img.alt = "FindPic";
img.setAttribute("src", logo);
link.appendChild(img);
header.insertBefore(link, form);

let id;
let markup;
let page = 1;
let arrPhotos = [];

let arrFav = LOCALSTORAGE.get("arr-fav");
if (arrFav === null) arrFav = [];

let arrFavorites = LOCALSTORAGE.get("arr-cards");
if (arrFavorites === null) arrFavorites = [];

form.addEventListener("submit", handleForm);

function handleForm(evt) {
  evt.preventDefault();
  if (arrFavorites !== arrFav) {
    arrFav = arrFavorites;
    LOCALSTORAGE.set("arr-fav", arrFav);
  }

  spinner();
  header.classList.add("shift");
  gallery.classList.add("bias");
  input.value = input.value.substr(0).toLowerCase();
  h1.hidden = true;
  resetImage(cards);
  handleRequest();
}

function handleRequest() {
  apiImages(input.value, page).then(photos => {
    btnMore.hidden = true;
    if (photos === undefined || photos.length === 0) {
      page = 1;
      spinner();
      return;
    }

    if (page === 1) arrPhotos.length = 0;
    if (photos.length >= 12) {
      btnMore.hidden = false;
    } else {
      page = 1;
    }
    spinner();
    createListImage(photos);
  });
}

function createListImage(arr) {
  markup = arr.reduce((acc, obj) => {
    obj.id = arrPhotos.length;
    arrPhotos.push(obj);
    return acc + imgHbs({ obj });
  }, "");
  updateImage(markup);
}

function updateImage(markup) {
  cards.insertAdjacentHTML("beforeend", markup);
}

btnMore.addEventListener("click", handleMoreImages);

function handleMoreImages() {
  spinner();
  page += 1;
  handleRequest();
}

favoritesBtn.addEventListener("click", handleFavorites);

function handleFavorites() {
  header.classList.add("shift");
  h1.hidden = false;
  resetImage(cards);
  arrPhotos.length = 0;
  page = 1;
  btnMore.hidden = true;

  arrFavorites = LOCALSTORAGE.get("arr-cards");
  arrFavorites !== null ? createListFavorites() : (arrFavorites = []);
}

function createListFavorites() {
  markup = arrFavorites.reduce((acc, obj) => acc + imgFavHbs({ obj }), "");
  updateImage(markup);
}

cards.addEventListener("click", handleCards);

function handleCards(evt) {
  if (
    evt.target.nodeName !== "IMG" &&
    evt.target.nodeName !== "LI" &&
    evt.target.nodeName !== "BUTTON"
  )
    return;
  if (evt.target.nodeName === "BUTTON") {
    evt.bool = true;
    removeFavImg(evt);
    return;
  }

  if (h1.hidden) {
    someElm(evt, arrPhotos);
  } else {
    someElm(evt, arrFavorites);
  }
}

slider.addEventListener("click", handleSlideBtn);

function handleSlideBtn(evt) {
  if (evt.target.nodeName !== "BUTTON") return;

  if (
    evt.target.className === "btn-prev" ||
    evt.target.className === "btn-next" ||
    evt.target.className === "btn-close"
  ) {
    slider.classList.remove("slider");
    favoritesBtn.classList.remove("z-index");
    resetImage(slider);
  }

  if (evt.target.className === "btn-close") return;

  if (
    evt.target.className === "btn-prev" ||
    evt.target.className === "btn-next"
  ) {
    if (h1.hidden) {
      someElm(evt, arrPhotos);
    } else {
      someElm(evt, arrFavorites);
    }
    return;
  }

  if (
    evt.target.className === "btn-favorites" ||
    evt.target.className === "btn-favorites toggle"
  ) {
    evt.target.classList.toggle("toggle");

    let favFoto = findElmFav(arrFavorites);
    if (favFoto) {
      id = evt.target.id;
      evt.target.id = favFoto.id;
      evt.bool = true;
      removeFavImg(evt);
      evt.target.id = id;
    } else if (!h1.hidden) {
      evt.bool = false;
      let elm = findElmFav(arrFav);
      arrFavorites.push(elm);
      removeFavImg(evt);
    } else {
      let photo = findElmFav(arrPhotos);
      handleArrPhoto(photo);
    }
  }
}

function findElmFav(arr) {
  let largeImg = document.querySelector(".img-web");
  return arr.find(
    obj => obj.webformatURL === largeImg.src || obj.largeImageURL === largeImg.src
  );
}

function removeFavImg(evt) {
  if (evt.bool) {
    arrFavorites = arrFavorites.filter(obj => obj.id !== Number(evt.target.id));
  }

  arrFavorites.forEach((obj, idx) => (obj.id = idx));
  if (!evt.bool) {
    evt.target.id = arrFavorites.length - 1;
    evt.target.previousSibling.id = arrFavorites.length;
    evt.target.previousSibling.previousSibling.id = arrFavorites.length - 2;
  }

  LOCALSTORAGE.set("arr-cards", arrFavorites);

  if (h1.hidden) return;
  handleFavorites();
}

function handleArrPhoto(photo) {
  id = photo.id;
  photo.id = arrFavorites.length;
  arrFavorites.push(photo);
  if (!arrFav.some(obj => obj.previewURL === photo.previewURL)) {
    arrFav.push(photo);
    LOCALSTORAGE.set("arr-fav", arrFav);
  }
  LOCALSTORAGE.set("arr-cards", arrFavorites);
  photo.id = id;
}

function resetImage(elm) {
  elm.innerHTML = "";
}

function spinner() {
  spinners.classList.toggle("visible");
}

function someElm(evt, arr) {
  arr.some(
    obj => (obj.id === Number(evt.target.id) ? handleLargeImg(obj, evt) : null)
  );
}

function handleLargeImg(obj, evt) {
  let slide = document.createElement("div");
  slide.classList.add("slide");
  let slideBtn = document.createElement("div");
  slideBtn.classList.add("slide-btn");
  let btnPrev = document.createElement("button");
  btnPrev.classList.add("btn-prev");
  btnPrev.id = obj.id - 1;
  let btnNext = document.createElement("button");
  btnNext.classList.add("btn-next");
  btnNext.id = obj.id + 1;
  let btnFavorites = document.createElement("button");
  btnFavorites.classList.add("btn-favorites");
  arrFavorites = LOCALSTORAGE.get("arr-cards");
  if (arrFavorites === null) arrFavorites = [];
  if (arrFavorites.some(objFav => objFav.previewURL === obj.previewURL)) {
    btnFavorites.classList.add("toggle");
  }
  btnFavorites.id = obj.id;
  let btnClose = document.createElement("button");
  btnClose.classList.add("btn-close");
  slideBtn.append(btnPrev, btnNext, btnFavorites, btnClose);
  let imgWeb = document.createElement("img");
  imgWeb.classList.add("img-web");
  imgWeb.setAttribute("alt", "Large Img");
  if (evt.clientX > 1000) {
    imgWeb.setAttribute("src", obj.largeImageURL);
  } else {
    imgWeb.setAttribute("src", obj.webformatURL);
  }
  slide.appendChild(imgWeb);
  slide.appendChild(slideBtn);
  slider.appendChild(slide);
  slider.classList.add("slider");
  favoritesBtn.classList.add("z-index");
}
