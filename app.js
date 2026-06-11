let stores = {};
let mcc = {};

const cards = {
  "ОТП":{
    default:0,
    categories:{
      "АЗС":5,
      "Супермаркеты":2,
      "Рестораны":5,
      "ЖКХ":3
    }
  },

  "Т-Банк":{
    default:1,
    categories:{
      "Топливо":6,
      "Автоуслуги":5,
      "Животные":5
    }
  },

  "ПСБ":{
    default:1,
    categories:{
      "Салоны красоты":5,
      "Детские товары":5,
      "Подарки":5
    }
  },

  "Яндекс":{
    default:2,
    categories:{
      "Супермаркеты":3,
      "Одежда и обувь":5
    }
  },

  "Озон":{
    default:1,
    categories:{
      "Дом и ремонт":5,
      "Рестораны":5,
      "Фастфуд":5,
      "Электроника":5
    }
  }
};

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

    let percent =
      data.categories[category] ??
      data.default;

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
renderHistory();
