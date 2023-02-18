class AppStorage {
  load(callback) {
    if ("topical_data" in window.localStorage) {
      this.data = JSON.parse(window.localStorage.getItem("topical_data"));
      this.upgrade();
      this.update();
      callback();
    } else {
      fetch("./default.json")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.data = data;
        this.loaded = true;
        this.upgrade();
        this.update();
        callback();
      });
    }
  }

  upgrade() {
    if (!("version" in this.data)) {
      this.data.version = 0.0;
    }

    if (!("subjects" in this.data)) {
      this.data.subjects = {
        name: "Matérias",
        nenhuma: {
          name: "Nenhuma",
        },
        artes: {
          name: "Artes",
        },
        biologia: {
          name: "Biologia",
        },
        filosofia: {
          name: "Filosofia",
        },
        fisica: {
          name: "Física",
          listas_victor: {
            name: "Listas Victor",
            ref: [ "data", "books", "listas_victor" ]
          }
        },
        geografia: {
          name: "Geografia",
        },
        historia: {
          name: "História",
        },
        ingles: {
          name: "Inglês",
        },
        linguagem: {
          name: "Linguagem",
        },
        literatura: {
          name: "Literatura",
        },
        matematica: {
          name: "Matemática",
        },
        quimica: {
          name: "Química",
        },
        redacao: {
          name: "Redação",
        },
        sociologia: {
          name: "Sociologia",
        },
      };
    }
  }

  update() {
    window.localStorage.setItem("topical_data", JSON.stringify(this.data));
  }

  exportFile() {
    document.getElementById("export-button").href = "data:application/octet-stream,"+encodeURIComponent(JSON.stringify(this.data, null, 4));
  }

  importFile() {
    var reader = new FileReader();
    reader.readAsText(document.getElementById("import").files[0]);
    reader.onload = (_) => {
      this.data = JSON.parse(reader.result);
    };
  }
}