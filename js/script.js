const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
const storage = new AppStorage();

var curr_section = ["data"];

function setTitle(title) {
  [].forEach.call(document.getElementsByClassName("title"), (curr) => {
    curr.innerHTML = title;
  });
}

function convertName(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "_").replace(/:/g, "").toLowerCase();
}

function populateSidebar() {
  let newBar = document.createElement("div");
  newBar.id = "tabs";
  let newChild, newButton, newDiv;
  if (curr_section.length > 1) {
    newDiv = document.createElement("div");
    newChild = document.createElement("b");
    newChild.innerHTML = "Anterior";
    newChild.onclick = () => {
      curr_section.pop();
      switchSection();
    };
    newDiv.className = "tab";
    newDiv.style = "background-color: #84828F";
    newDiv.appendChild(newChild);
    newBar.appendChild(newDiv);
  }

  let section = storage;
  curr_section.forEach((e) => {
    if (section[e]) {
      section = section[e];
    }
  });

  newDiv = document.createElement("div");
  newChild = document.createElement("b");
  newChild.innerHTML = section.name;

  newDiv.className = "tab";
  newDiv.appendChild(newChild);

  if (curr_section.length > 1) {
    newButton = document.createElement("button");
    newButton.innerHTML = "<b>+</b>";
    newButton.className = "add_button";
    newButton.onclick = addSection;
    newDiv.appendChild(newButton);
  }

  newBar.appendChild(newDiv);
  setTitle(section.name);

  Object.keys(section).forEach((key) => {
    if (key != "name" && key != "exercises" && key != "date" && key != "version") {
      newDiv = document.createElement("div");
      newChild = document.createElement("b");
      newChild.innerHTML = section[key].name;
      newChild.onclick = () => {
        curr_section.push(key);
        switchSection();
      };
      newDiv.className = "tab_ind";
      newDiv.appendChild(newChild);

      newButton = document.createElement("button");
      newButton.innerHTML = "<b>≡</b>";
      newButton.className = "ed_button";
      newButton.onclick = () => editSection(key);
      newDiv.appendChild(newButton);

      if (curr_section.length > 1) {
        newButton = document.createElement("button");
        newButton.innerHTML = "<b>-</b>";
        newButton.className = "rm_button";
        newButton.onclick = () => removeSection(key);
        newDiv.appendChild(newButton);
      }

      newBar.appendChild(newDiv);
    }
  })
  document.getElementById("tabs").replaceWith(newBar);
}

function populateExercises() {
  let newContent = document.createElement("div");
  newContent.id = "exercises";
  let newChild, newButton;
  let section = storage;
  curr_section.forEach((e) => {
    if (section[e]) {
      section = section[e];
    }
  });

  if (curr_section.length > 2 && curr_section[1] == "books") {
    newChild = document.createElement("h2");
    newChild.innerHTML = "Exercícios:";

    newButton = document.createElement("button");
    newButton.innerHTML = "<b>+</b>";
    newButton.className = "add_button";
    newButton.onclick = addExercises;
    newChild.appendChild(newButton);
    newContent.appendChild(newChild);
    if ("exercises" in section) {
      section.exercises.forEach((e) => {
        newChild = document.createElement("button");
        newChild.innerHTML = e.number.toString();
        newChild.className = (e.done ? "ex_checked" : "ex_unchecked");
        newChild.onclick = () => {
          e.done = !e.done;
          storage.update();
          if (e.done) {
            e.date = new Date();
          } else {
            e.date = null;
          }
          populateExercises();
        };
        newContent.appendChild(newChild);
      });
    }
  }
  document.getElementById("exercises").replaceWith(newContent);
}

function populateMainContent() {
  populateExercises();
}

function switchSection() {
  populateSidebar();
  populateMainContent();
}

function addSection() {
  let name = prompt("Nome da seção");
  let section = storage;
  curr_section.forEach((e) => {
    if (section[e]) {
      section = section[e];
    }
  });
  if (convertName(name) in section) {
    alert("Nome indisponível/inválido");
    return;
  }

  section[convertName(name)] = {
    name: name,
  };

  storage.update();
  populateSidebar();
}

function editSection(name) {
  let newName = prompt("Nome novo");
  let section = storage;
  curr_section.forEach((e) => {
    if (section[e]) {
      section = section[e];
    }
  });
  if (convertName(newName) in section) {
    alert("Nome indisponível/inválido");
    return;
  }

  section[convertName(newName)] = section[name];
  delete section[name];
  section[convertName(newName)].name = newName;
  
  storage.update();
  populateSidebar();
}

function removeSection(name) {
  let section = storage;
  curr_section.forEach((e) => {
    if (section[e]) {
      section = section[e];
    }
  });
  if (!confirm("Deseja remover seção \"" + section[name].name + "\"?")) {
    return;
  }
  delete section[name];

  storage.update();
  populateSidebar();
}

function addExercises() {
  let ex1 = parseInt(prompt("Primeiro exercício"));
  let ex2 = parseInt(prompt("Último exercício"));
  if (ex1 > ex2) {
    alert("Intervalo inválido");
    return;
  }

  let res = [];

  for (let i = ex1; i <= ex2; i++) {
    res.push({
      number: i,
      date: null,
      done: false,
    });
  }

  let section = storage;
  curr_section.forEach((e) => {
    if (section[e]) {
      section = section[e];
    }
  });

  if ("exercises" in section) {
    section.exercises = section.exercises.concat(res);
  } else {
    section.exercises = res;
  }

  storage.update();
  populateExercises();
}

function dateDiff(d1, d2) {
  return Math.floor(Math.abs(d1.getTime() - d2.getTime()) / MILLIS_PER_DAY);
}

function mergeStats(s1, s2) {
  let res = s1;
  Object.keys(s2).forEach((key) => {
    if (key in res) {
      res[key].total += s2[key].total;
      res[key].week += s2[key].week;
    } else {
      res[key] = s2[key];
    }
  });

  return res;
}

function getStats(section) {
  let res = {
    general: {
      total: 0,
      week: 0,
    }
  }
  Object.keys(section).forEach((key) => {
    if (key != "exercises" && key != "name" && key != "date" && key != "version") {
      res = mergeStats(res, getStats(section[key]));
    }
  });

  if ("exercises" in section) {
    section.exercises.forEach((e) => {
      if (e.done) {
        res.general.total++;
        if (e.date && "day" in e.date) {
          e.date = new Date(e.date.year, e.date.month, e.date.day);
        }
        if (e.date && dateDiff(new Date(), e.date) <= 7) {
          res.general.week++;
        }
      }
    });
  }
  return res;
}

document.getElementById("import").addEventListener("change", (e) => {
  if (e.target.files[0]) {
    storage.importFile();
  }
})

storage.load(switchSection)
