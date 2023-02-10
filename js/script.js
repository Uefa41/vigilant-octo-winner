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
    if (key != "name" && key != "exercises" && key != "date") {
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
      newDiv.appendChild(newButton);

      if (curr_section.length > 1) {
        newButton = document.createElement("button");
        newButton.innerHTML = "<b>-</b>";
        newButton.className = "rm_button";
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
            let date = new Date();
            e.date = {
              day: date.getDate(),
              month: date.getMonth() + 1,
              year: date.getFullYear(),
            };
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
  let name = prompt("Nome da seção:");
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

document.getElementById("import").addEventListener("change", (e) => {
  if (e.target.files[0]) {
    storage.importFile();
  }
})

storage.load(switchSection)
