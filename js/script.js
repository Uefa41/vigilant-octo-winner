const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
const RESERVED_NAMES = ["name", "exercises", "date", "version", "ref", "subject", "create"];
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

function getSection(path) {
  let section = storage;
  path.forEach((e) => {
    if (section[e]) {
      section = section[e];
    }
    if ("ref" in section) {
      section = getSection(section.ref);
    }
  });
  return section;
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

  let section = getSection(curr_section);
  newDiv = document.createElement("div");
  newChild = document.createElement("b");
  newChild.innerHTML = section.name;

  newDiv.className = "tab";
  newDiv.appendChild(newChild);

  if (curr_section.length > 1 && !(curr_section.length == 3 && curr_section[1] == "subjects")) {
    newButton = document.createElement("button");
    newButton.innerHTML = "<b>+</b>";
    newButton.className = "add_button";
    newButton.onclick = (curr_section.length == 2 && curr_section[1] == "subjects") ? addSubject : addSection;
    newDiv.appendChild(newButton);
  }

  newBar.appendChild(newDiv);
  setTitle(section.name);

  Object.keys(section).forEach((key) => {
    if (!(RESERVED_NAMES.includes(key))) {
      newDiv = document.createElement("div");
      newChild = document.createElement("b");
      newChild.innerHTML = section[key].name;
      newChild.onclick = () => {
        curr_section.push(key);
        switchSection();
      };
      newDiv.className = "tab_ind";
      newDiv.appendChild(newChild);

      if (curr_section.length > 1) {
        newButton = document.createElement("button");
        newButton.innerHTML = "<b>≡</b>";
        newButton.className = "ed_button";
        newButton.onclick = (curr_section[1] == "subjects" && curr_section.length == 2 ? () => editSubject(key, false) : () => editSection(key, false));
        newDiv.appendChild(newButton);

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
  let section = getSection(curr_section);

  if ((curr_section.length > 2 && curr_section[1] == "books") || (curr_section.length > 3 && curr_section[1] == "subjects")) {
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

function editSection(name, removeOnCancel) {
  let section = getSection(curr_section);
  if ("ref" in section[name]) section = getSection(section[name].ref.slice(0, -1));
  document.getElementById("section_name").value = section[name].name;

  const subjects = storage.data.subjects;
  let option;

  document.getElementById("subject_select").replaceChildren();
  Object.keys(subjects).forEach((key) => {
    if (RESERVED_NAMES.includes(key)) return;
    option = document.createElement("option");
    option.value = key;
    option.innerHTML = subjects[key].name;
    document.getElementById("subject_select").appendChild(option);
  });
  option = document.createElement("option");
  option.value = "create";
  option.innerHTML = "Criar nova";
  document.getElementById("subject_select").appendChild(option);
  document.getElementById("subject_select").onchange = () => {
    if (document.getElementById("subject_select").value == "create") {
      const subjects = storage.data.subjects
      let name = prompt("Nome da matéria");
      if (!name || convertName(name) in subjects || RESERVED_NAMES.includes(convertName(name))) {
        alert("Nome indisponível/inválido");
        document.getElementById("subject_select").selectedIndex = 0;
        return;
      }

      subjects[convertName(name)] = {
        name: name,
      };

      let option = document.createElement("option");
      option.value = convertName(name);
      option.innerHTML = name;
      const select = document.getElementById("subject_select").children;
      select[select.length - 1].replaceWith(option);
      option = document.createElement("option");
      option.value = "create";
      option.innerHTML = "Criar nova";
      document.getElementById("subject_select").appendChild(option);

      document.getElementById("subject_select").value = convertName(name);
      storage.update();
      populateSidebar();
    }
  };

  document.getElementById("subject_select").value = section[name].subject;

  document.getElementById("ed_cancel").onclick = () => {
    if (removeOnCancel) {
      delete section[name];
    }
    document.getElementById("pagemask").style = "display: none";
    document.getElementById("ed_menu").style = "display: none";
  };
  document.getElementById("ed_confirm").onclick = () => {
    let new_name = document.getElementById("section_name").value;
    let subject = document.getElementById("subject_select").value;
    let section = getSection(curr_section);
    if ("ref" in section[name]) section = getSection(section[name].ref.slice(0, -1));

    if (!new_name || ((convertName(new_name) in section) && convertName(new_name) != name) || RESERVED_NAMES.includes(convertName(new_name))) {
      alert("Nome indisponível/inválido");
      return;
    }

    if (("subject" in section[name]) && (name in storage.data.subjects[section[name].subject]))
      delete storage.data.subjects[section[name].subject][name];
    if (subject != section.subject)
      storage.data.subjects[subject][convertName(new_name)] = {
        name: new_name,
        ref: curr_section.concat([convertName(new_name)]),
      };

    section[name].subject = subject;

    if (convertName(new_name) != name) {
      section[name].name = new_name;
      section[convertName(new_name)] = section[name];

      delete section[name];
    }

    storage.update();
    populateSidebar();
    document.getElementById("pagemask").style = "display: none";
    document.getElementById("ed_menu").style = "display: none";
  }

  document.getElementById("pagemask").style = "";
  document.getElementById("ed_menu").style = "";
}

function addSection() {
  const section = getSection(curr_section);
  let time = new Date();
  let name = "new" + time.getTime().toString();
  section[name] = {
    name: "Nova seção",
    subject: section.subject,
  }
  editSection(name, true);
}

function editSubject(name, removeOnCancel) {
  const subjects = storage.data.subjects;
  
  document.getElementById("subject_name").value = subjects[name].name;

  document.getElementById("subject_cancel").onclick = () => {
    if (removeOnCancel) {
      delete subjects[name];
    }
    document.getElementById("pagemask").style = "display: none";
    document.getElementById("subject_menu").style = "display: none";
  };
  document.getElementById("subject_confirm").onclick = () => {
    let new_name = document.getElementById("subject_name").value;

    if (!new_name || ((convertName(new_name) in subjects) && convertName(new_name) != name) || RESERVED_NAMES.includes(convertName(new_name))) {
      alert("Nome indisponível/inválido");
      return;
    }

    if (convertName(new_name) != name) {
      let changeSubjectId = (section, oldID, newID) => {
        if (section.subject == oldID) section.subject = newID;
        Object.keys(section).forEach((key) => {
          if (! RESERVED_NAMES.includes(key)) {
            changeSubjectId(section[key], oldID, newID);
          }
        })
      }

      changeSubjectId(storage.data.books, name, convertName(new_name));

      subjects[name].name = new_name;
      subjects[convertName(new_name)] = subjects[name];

      delete subjects[name];
    }

    storage.update();
    populateSidebar();
    document.getElementById("pagemask").style = "display: none";
    document.getElementById("subject_menu").style = "display: none";
  }

  document.getElementById("pagemask").style = "";
  document.getElementById("subject_menu").style = "";
}

function addSubject() {
  const subjects = storage.data.subjects;
  let time = new Date();
  let name = "new" + time.getTime().toString();
  subjects[name] = {
    name: "Nova matéria",
  };
  editSubject(name, true);
}

function removeSection(name) {
  let section = getSection(curr_section);
  if (!confirm("Deseja remover \"" + section[name].name + "\"?")) {
    return;
  }
  if ("ref" in section[name]) {
    let ref = getSection(section[name].ref);
    delete ref;
  } else if (("subject" in section[name]) && (name in storage.data.subjects[section[name].subject])) {
    delete storage.data.subjects[section[name].subject][name];
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

  let section = getSection(curr_section);
  
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
    if (!(RESERVED_NAMES.includes(key))) {
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
