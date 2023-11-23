import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://realtime-database-7a379-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const shoppingListInDB = ref(database, "shoppingList");

const inputFieldEl = document.getElementById("input-field");
const addButtonEl = document.getElementById("add-button");
const shoppingListEl = document.getElementById("shopping-list");

addButtonEl.addEventListener("click", function () {
  let inputValue = inputFieldEl.value;

  push(shoppingListInDB, inputValue);

  clearInputFieldEl();
});

//Esta funcion es de Firebase, y se encarga de avisar cada vez que se ha agregado algo nuevo a la bs
onValue(shoppingListInDB, function (snapshot) {
  //aqui se verifica que aun exista algun elemento en la bd
  if (snapshot.exists()) {
    let itemsArray = Object.entries(snapshot.val());

    //primero borramos lo que haya pintado con anterioridad en el HTML porque si no borramos entonces se van a ir duplicando los items
    clearShoppingListEl();

    for (let i = 0; i < itemsArray.length; i++) {
      //aqui estamos sacando de un arreglo que adentro tiene elementos con otro arreglo
      //currentItem[[currentItemId,CurrentItem]]
      let currentItem = itemsArray[i];
      let currentItemID = currentItem[0];
      let currentItemValue = currentItem[1];

      //esta funcion es la que pinta el elemento que trajimos de la bd,por cada iteración le pasamos el id y el nombre de el elemento de la lista
      appendItemToShoppingListEl(currentItem);
    }
  } else {
    shoppingListEl.innerHTML = "No items here... yet";
  }
});

function clearShoppingListEl() {
  shoppingListEl.innerHTML = "";
}

function clearInputFieldEl() {
  inputFieldEl.value = "";
}

function appendItemToShoppingListEl(item) {
  //item es un arreglo de 2 elementos, el id y el nombre del articulo
  let itemID = item[0];
  let itemValue = item[1];

  //aqui creamos un elemento li
  let newEl = document.createElement("li");
  //aqui signamos el valor del item a el nuevo elemento li que creamos
  newEl.textContent = itemValue;

  // en caso de que le demos click a alguno de los elementos li borraremos ese elemnto de la bd y de la lista
  newEl.addEventListener("click", function () {
    //aqui obtenemos la ubicacion exacta que necesita firebase para sacar el elemnto de la bd
    let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);
    //aqui quitamos ese elemento con la funcion remove() de firebase
    //OJO, HAY UNA FUNCION ON VALUE QUE DETECTA CAMBIOS EN LA BD Y AL NOSOTROS REMOVER UN ITEM
    //ESTA FUNCION ON VALUE SE EJECUTA Y ES ESTA FUNCION LA QUE MANDA A LLAMAR
    //A LA FUNCION appendItemToShoppingListEl QUE ES LA ENCARGADA DE PINTAR LOS LI EN EL UL
    remove(exactLocationOfItemInDB);
  });
  //aqui pintamos el nuevo elemento li en el ul shoppingListEl que viene del ul shopping-list
  shoppingListEl.append(newEl);
}
