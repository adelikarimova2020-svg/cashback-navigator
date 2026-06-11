let stores = {};
let mcc = {};

let cards = JSON.parse(
  localStorage.getItem("cards")
);

if(!cards){

  cards = {
    "ОТП":{
      default:0,
      categories:{
        "АЗС":{percent:5,limit:1000},
        "Супермаркеты":{percent:2,limit:1000},
        "Рестораны":{percent:5,limit:1000},
        "ЖКХ":{percent:3,limit:500}
      }
    },

    "Т-Банк":{
      default:1,
      categories:{
        "Топливо":{percent:6,limit:1000},
        "Автоуслуги":{percent:5,limit:1000},
        "Животные":{percent:5,limit:1000}
      }
    },

    "ПСБ":{
      default:1,
      categories:{
        "Салоны красоты":{percent:5,limit:1000},
        "Детские товары":{percent:5,limit:1000},
        "Подарки":{percent:5,limit:1000}
      }
    },

    "Яндекс":{
      default:2,
      categories:{
        "Супермаркеты":{percent:3,limit:1000},
        "Одежда и обувь":{percent:5,limit:1000}
      }
    },

    "Озон":{
      default:1,
      categories:{
        "Дом и ремонт":{percent:5,limit:1000},
        "Рестораны":{percent:5,limit:1000},
        "Фастфуд":{percent:5,limit:1000},
        "Электроника":{percent:5,limit:1000}
      }
    }
  };

  saveCards();
}

async function loadData(){
  stores = await fetch("data/stores.json").then(r=>r.json());
  mcc = await fetch("data/mcc.json").then(r=>r.json());
}

function saveHistory(item){
  let history = JSON.parse(localStorage.getItem("history") || "[]");

  history.unshift(item);

  if(history.length > 30){
    history = history.slice(0,30);
  }

  localStorage.setItem("history", JSON.stringify(history));
}

function renderHistory(){
  let history = JSON.parse(localStorage.getItem("history") || "[]");

  let html = "";

  history.forEach(h=>{
    html += `
      <div class="card">
        ${h.date}<br>
        ${h.category}<br>
        ${h.card}<br>
        ${h.cashback.toFixed(2)} ₽
      </div>
    `;
  });

  document.getElementById("history").innerHTML = html;
}

function findBest(){

  let query =
    document.getElementById("query")
      .value
      .trim()
      .toLowerCase();

  let amount =
    Number(
      document.getElementById("amount").value || 0
    );

  let category =
    stores[query] ||
    mcc[query] ||
    query;

  let results = [];

  for(const [card,data] of Object.entries(cards)){

   let percent = data.default;

if(data.categories[category]){
  percent =
    data.categories[category].percent;
}

    let cashback =
      amount * percent / 100;

    results.push({
      card,
      percent,
      cashback
    });
  }

  results.sort((a,b)=>b.percent-a.percent);

  let html = `
    <div class="card best">
      🥇 ${results[0].card}<br>
      ${results[0].percent}%<br>
      ${results[0].cashback.toFixed(2)} ₽
    </div>
  `;

  results.forEach(r=>{
    html += `
      <div class="card">
        ${r.card}<br>
        ${r.percent}%<br>
        ${r.cashback.toFixed(2)} ₽
      </div>
    `;
  });

  document.getElementById("result").innerHTML = html;

  saveHistory({
    date:new Date().toLocaleString(),
    category,
    card:results[0].card,
    cashback:results[0].cashback
  });

  renderHistory();
}

loadData();
function saveCards(){
  localStorage.setItem(
    "cards",
    JSON.stringify(cards)
  );
}
renderHistory();
function showCards(){

  let html = "";

  for(const [name,data] of Object.entries(cards)){

    html += `
      <div class="card">

      <h3>${name}</h3>

      Базовый кэшбэк

      <input
        type="number"
        id="base-${name}"
        value="${data.default}"
      >

      <button
        onclick="saveBase('${name}')">
        💾
      </button>

      <button
        onclick="deleteCard('${name}')">
        🗑 Карта
      </button>

      <hr>
    `;

    for(const [cat,info]
      of Object.entries(data.categories)){

      html += `

      <div class="categoryRow">

        <b>${cat}</b><br>

        %

        <input
          type="number"
          id="percent-${name}-${cat}"
          value="${info.percent}"
        >

        Лимит

        <input
          type="number"
          id="limit-${name}-${cat}"
          value="${info.limit}"
        >

        <button
          onclick="saveCategory('${name}','${cat}')">
          💾
        </button>

        <button
          onclick="deleteCategory('${name}','${cat}')">
          🗑
        </button>

      </div>
      `;
    }

    html += `

      <hr>

      <button
      onclick="addCategory('${name}')">
      ➕ Категория
      </button>

      </div>
    `;
  }

  html += `
    <button onclick="addCard()">
      ➕ Новая карта
    </button>
  `;

  document.getElementById(
    "cardsPanel"
  ).innerHTML = html;
}

function addCard(){

  const name =
    prompt("Название карты");

  if(!name) return;

  const base =
    Number(
      prompt("Базовый кэшбэк")
    );

  cards[name] = {
    default:base,
    categories:{}
  };

  saveCards();
  showCards();
}

function deleteCard(name){

  if(
    !confirm(
      "Удалить карту?"
    )
  ) return;

  delete cards[name];

  saveCards();
  showCards();
}

function addCategory(card){

  const category =
    prompt("Категория");

  if(!category) return;

  const percent =
    Number(
      prompt("Процент")
    );

  const limit =
    Number(
      prompt(
        "Лимит кэшбэка ₽"
      )
    );

  cards[card]
    .categories[category] = {
      percent,
      limit
    };

  saveCards();
  showCards();
}
function saveBase(card){

  cards[card].default =
    Number(
      document.getElementById(
        `base-${card}`
      ).value
    );

  saveCards();
}
function saveCategory(
  card,
  category
){

  let percent =
    Number(
      document.getElementById(
        `percent-${card}-${category}`
      ).value
    );

  let limit =
    Number(
      document.getElementById(
        `limit-${card}-${category}`
      ).value
    );

  cards[card]
    .categories[category] = {
      percent,
      limit
    };

  saveCards();
}
function deleteCategory(card, category){

  if(
    !confirm(
      `Удалить категорию "${category}"?`
    )
  ){
    return;
  }

  delete cards[card].categories[category];

  saveCards();
  showCards();
}
function editCategory(card, category){

  let current =
    cards[card]
      .categories[category];

  let percent =
    Number(
      prompt(
        "Новый процент",
        current.percent
      )
    );

  let limit =
    Number(
      prompt(
        "Новый лимит",
        current.limit
      )
    );

  cards[card]
    .categories[category] = {
      percent,
      limit
    };

  saveCards();
  showCards();
}
