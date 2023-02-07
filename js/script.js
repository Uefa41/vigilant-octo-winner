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
  let newChild;
  if (curr_section.length > 1) {
    newChild = document.createElement("p");
    newChild.innerHTML = "<b>Anterior</b>";
    newChild.onclick = () => {
      curr_section.pop();
      switchSection();
    };
    newChild.className = "tab";
    newChild.style = "background-color: #84828F";
    newBar.appendChild(newChild);
  }

  let section = storage;
  curr_section.forEach((e) => {
    if (section[e]) {
      section = section[e];
    }
  });

  newChild = document.createElement("p");
  newChild.innerHTML = "<b>" + section.name + "</b>";
  newChild.className = "tab";
  newBar.appendChild(newChild);
  setTitle(section.name);

  Object.keys(section).forEach((key) => {
    if (key != "name" && key != "exercises" && key != "date") {
      newChild = document.createElement("p");
      newChild.innerHTML = "<b>" + section[key].name + "</b>";
      newChild.onclick = () => {
        curr_section.push(key);
        switchSection();
      };
      newChild.className = "tab_ind";
      newBar.appendChild(newChild);
    }
  })
  document.getElementById("tabs").replaceWith(newBar);
}

function populateExercises() {
  let newContent = document.createElement("div");
  newContent.id = "exercises";
  let newChild;
  let section = storage;
  curr_section.forEach((e) => {
    if (section[e]) {
      section = section[e];
    }
  });

  if ("exercises" in section) {
    newChild = document.createElement("h2");
    newChild.innerHTML = "Exercícios:";
    newContent.appendChild(newChild);
    section.exercises.forEach((e) => {
      newChild = document.createElement("button");
      newChild.innerHTML = e.number.toString();
      newChild.className = (e.done ? "ex_checked" : "ex_unchecked");
      newChild.onclick = () => {
        e.done = !e.done;
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
  document.getElementById("exercises").replaceWith(newContent);
}

function populateMainContent() {
  populateExercises();
}

function switchSection() {
  populateSidebar();
  populateMainContent();
}

document.getElementById("import").addEventListener("change", (e) => {
  if (e.target.files[0]) {
    storage.importFile();
  }
})

switchSection();
