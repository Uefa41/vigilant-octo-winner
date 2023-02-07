class AppStorage {
  constructor() {
    this.data = {
      name: "Menu",
      books: {
        name: "Livros/Listas",
        listas_ze : {
          name: "Listas Zé",
          lista_1_geometria_riemanniana: {
            name: "Lista 1: Geometria Riemanniana",
            date: {
              day: 31,
              month : 2,
              year: 2023
            },
            exercises: [
              {
                number: 1,
                done: false,
                date: null
              },
              {
                number: 2,
                done: false,
                date: null
              },
              {
                number: 3,
                done: false,
                date: null
              }
            ]
          }
        }
      }
    };
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