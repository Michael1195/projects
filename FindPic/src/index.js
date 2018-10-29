import "./normalize.css";
import "./styles.css";
import { apiImages } from "./services/api";
import { LOCALSTORAGE } from "./services/storage";
import imgHbs from "./templates/img.hbs";
import imgFavHbs from "./templates/img-fav.hbs";
import logo from "./img/logo.png";

const header = document.querySelector(".header");
const form = document.querySelector(".form");
const input = form.querySelector(".input");
const favoritesBtn = document.querySelector(".btn-fav");
const gallery = document.querySelector(".gallery");
const cards = document.querySelector("#cards");
const slider = document.querySelector(".js-slider");
const btnMore = document.querySelector(".js-button-more");
const textFav = document.querySelector(".text-fav");
const spinners = document.querySelector(".spinners");

const link = document.createElement("a");
link.classList.add("link-logo");
link.setAttribute("href", "./index.html");
const img = document.createElement("img");
img.setAttribute("src", logo);
img.alt = "FindPic";
link.appendChild(img);
header.insertBefore(link, form);

let idx;
let markup;
let page = 1;
let arrPhotos = [];
let arrFav = LOCALSTORAGE.get("arr-fav");
if (!arrFav) arrFav = [];

let arrFavorites = LOCALSTORAGE.get("arr-fav-img");
if (!arrFavorites) arrFavorites = [];

form.addEventListener("submit", handleForm);

function handleForm(evt) {
  evt.preventDefault();
  if (arrFavorites !== arrFav) {
    arrFav = arrFavorites;
    LOCALSTORAGE.set("arr-fav", arrFav);
  }

  spinner();
  arrPhotos.length = 0;
  page = 1;
  header.classList.add("shift");
  gallery.classList.add("bias");
  input.value = input.value.substr(0).toLowerCase();
  textFav.hidden = true;
  reset(cards);
  handleRequest();
}

function handleRequest() {
  apiImages(input.value, page).then(photos => {
    btnMore.hidden = true;
    if (photos === undefined || photos.length === 0) {
      spinner();
      return;
    }

    if (photos.length === 12) btnMore.hidden = false;
    spinner();
    createListImage(photos);
  });
}

function createListImage(arr) {
  markup = arr.reduce((acc, obj) => {
    obj.idx = arrPhotos.length;
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

favoritesBtn.addEventListener("click", handleFavPhoto);

function handleFavPhoto() {
  header.classList.add("shift");
  textFav.hidden = false;
  reset(cards);
  arrPhotos.length = 0;
  page = 1;
  btnMore.hidden = true;

  arrFavorites = LOCALSTORAGE.get("arr-fav-img");
  arrFavorites ? createListFavorites() : (arrFavorites = []);
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
    removeFavImg(evt, evt.target.id);
  } else if (textFav.hidden) {
    someElm(arrPhotos, evt);
  } else {
    someElm(arrFavorites, evt);
  }
}

slider.addEventListener("click", handleSlideBtn);

function handleSlideBtn(evt) {
  if (evt.target.nodeName !== "BUTTON") return;

  if (
    evt.target.className !== "btn-favorites" &&
    evt.target.className !== "btn-favorites toggle"
  ) {
    slider.classList.remove("slider");
    favoritesBtn.classList.remove("z-index");
    reset(slider);
  }

  if (evt.target.className === "btn-close") return;

  if (
    evt.target.className === "btn-prev" ||
    evt.target.className === "btn-next"
  ) {
    if (textFav.hidden) {
      someElm(arrPhotos, evt);
    } else {
      someElm(arrFavorites, evt);
    }
  } else {
    evt.target.classList.toggle("toggle");
    let largeImg = document.querySelector(".img-web");

    if (findElm(arrFavorites, largeImg.id)) {
      evt.bool = true;
      removeFavImg(evt, largeImg.id);
    } else if (!textFav.hidden) {
      evt.bool = false;
      let elm = findElm(arrFav, largeImg.id);
      arrFavorites.push(elm);
      removeFavImg(evt);
    } else {
      let photo = findElm(arrPhotos, largeImg.id);
      handleArrPhoto(photo);
    }
  }
}

function findElm(arr, id) {
  return arr.find(obj => obj.id === Number(id));
}

function removeFavImg(evt, id) {
  if (evt.bool) {
    arrFavorites = arrFavorites.filter(obj => obj.id !== Number(id));
  }

  arrFavorites.forEach((obj, idx) => (obj.idx = idx));
  if (!evt.bool) {
    evt.target.id = arrFavorites.length - 1;
    evt.target.previousSibling.id = arrFavorites.length;
    evt.target.previousSibling.previousSibling.id = arrFavorites.length - 2;
  }

  LOCALSTORAGE.set("arr-fav-img", arrFavorites);

  if (!textFav.hidden) {
    handleFavPhoto();
  }
}

function handleArrPhoto(photo) {
  idx = photo.idx;
  photo.idx = arrFavorites.length;
  arrFavorites.push(photo);
  if (!arrFav.some(obj => obj.id === photo.id)) {
    arrFav.push(photo);
    LOCALSTORAGE.set("arr-fav", arrFav);
  }
  LOCALSTORAGE.set("arr-fav-img", arrFavorites);
  photo.idx = idx;
}

function reset(elm) {
  elm.innerHTML = "";
}

function spinner() {
  spinners.classList.toggle("visible");
}

function someElm(arr, evt) {
  arr.some(
    obj => (obj.idx === Number(evt.target.id) ? handleLargeImg(obj, evt) : null)
  );
}

function handleLargeImg(obj, evt) {
  let slide = document.createElement("div");
  slide.classList.add("slide");
  let slideBtn = document.createElement("div");
  slideBtn.classList.add("slide-btn");
  let btnPrev = document.createElement("button");
  btnPrev.classList.add("btn-prev");
  btnPrev.id = obj.idx - 1;
  let btnNext = document.createElement("button");
  btnNext.classList.add("btn-next");
  btnNext.id = obj.idx + 1;
  let btnFavorites = document.createElement("button");
  btnFavorites.classList.add("btn-favorites");
  btnFavorites.id = obj.idx;
  arrFavorites = LOCALSTORAGE.get("arr-fav-img");
  if (!arrFavorites) arrFavorites = [];
  if (arrFavorites.some(objFav => objFav.id === obj.id)) {
    btnFavorites.classList.add("toggle");
  }
  let btnClose = document.createElement("button");
  btnClose.classList.add("btn-close");
  slideBtn.append(btnPrev, btnNext, btnFavorites, btnClose);
  let div = document.createElement("div");
  div.classList.add("img-web-back");
  let imgWeb = document.createElement("img");
  imgWeb.classList.add("img-web");
  imgWeb.id = obj.id;
  imgWeb.setAttribute("alt", "Large Image");
  if (evt.clientX > 975) {
    if (obj.largeImageURL === "") {
      let imageW = obj.webformatWidth * 2;
      let imageH = obj.webformatHeight * 2;
      obj.largeImageURL = `https://placehold.it/${imageW}x${imageH}/231f20/ffffff/`;
    }
    imgWeb.setAttribute("src", obj.largeImageURL);
  } else {
    if (obj.webformatURL === "")
      obj.webformatURL = `https://placehold.it/${obj.webformatWidth}x${
        obj.webformatHeight
      }/231f20/ffffff/`;
    imgWeb.setAttribute("src", obj.webformatURL);
  }
  div.appendChild(imgWeb);
  slide.appendChild(div);
  slide.appendChild(slideBtn);
  slider.appendChild(slide);
  slider.classList.add("slider");
  favoritesBtn.classList.add("z-index");
}