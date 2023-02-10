class AppStorage {
  load(callback) {
    if ("topical_data" in window.localStorage) {
      this.data = JSON.parse(window.localStorage.getItem("topical_data"));
      callback();
    } else {
      fetch("./default.json")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.data = data;
        this.loaded = true;
        this.update();
        callback();
      });
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