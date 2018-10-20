import axios from "axios";
const API_KEY = "10322241-9acdecaf66598a52f4905bab5";

export const apiImages = (name, page) => {
  return axios
    .get(`https://pixabay.com/api/?key=${API_KEY}&q=${name}&image_type=photo&per_page=12&page=${page}`)
    .then(res => res.data.hits)
    .catch(err => alert(`axios err : ${err}`));
}

