var finalDuration = 0;

function Activity(configs) {
  configs = configs || {};
  this.id = configs.id;

  //czas trwania
  this.duration = configs.duration;

  //wczesny start (early end time)
  this.est = configs.est;

  //pozny start (late end time)
  this.lst = configs.lst;

  //wczesny koniec (early end time)
  this.eet = configs.eet;

  //pozny koniec (late end time)
  this.let = configs.let;
  //luz
  this.clearance = configs.clearance;

  //nastepnicy
  this.successors = [];

  //poprzednicy
  this.predecessors = configs.predecessors || [];

  return this;
}

//klasa zawierajaca liste elementow oraz metody
function ActivityList() {
  let list = {};
  let start, end;
  let processed = false;

  //dodawanie czynnosci
  this.addActivity = function (activity) {
    list[activity.id] = activity;
  };

  //sprawdzanie, czy lista zawiera czynnosc
  this.doesListContain = function (key) {
    if (key in list) return true;
    else return false;
  };

  //procesowanie listy
  function processList() {
    if (processed) {
      return;
    }
    processed = true;

    //dodawanie startowej czynnosci pozornej
    start = new Activity({ id: "start", duration: 0 });

    //Replaces id for pointers to actvities
    for (var i in list) {
      var current = list[i];
      var predecessorsIds = current.predecessors;
      var predecessors = [];

      if (predecessorsIds.length == 0) {
        predecessors.push(start);
        start.successors.push(current);
      } else {
        for (var j in predecessorsIds) {
          var previous = list[predecessorsIds[j]];
          if (!previous) {
            throw new Error("Node " + j + " dont exists");
          }
          predecessors.push(previous);
          previous.successors.push(current);
        }
      }
      current.predecessors = predecessors;
    }
  }

  //ustawienie wczesnych czasow rozpoczecia i zakonczenia
  function setEarlyTimes(root) {
    //metoda przechodzi po wszystkich nastepnikach
    for (var i in root.successors) {
      var node = root.successors[i];

      var predesessors = node.predecessors;
      //metoda przechodzi po wszystkich poprzednikach
      for (var j in predesessors) {
        var activity = predesessors[j];
        //i ustawia odpowiednie czasy zakonczenia i rozpoczecia
        if (node.est == null || node.est < activity.eet)
          node.est = activity.eet;
      }
      node.eet = node.est + node.duration;
      //rekurencyjnie ustawia nastepnym odpowiednie czasy
      setEarlyTimes(node);
    }
  }

  //ustawienie poznych czasow rozpoczecia i zakonczenia
  function setLateTimes(root) {
    //jesli nie ma nastepnikow, to od razu obliczamy czasy i roznice
    if (root.successors.length == 0) {
      root.let = root.eet;
      root.lst = root.let - root.duration;
      root.clearance = root.eet - root.let;
    } else {
      //metoda przechodzi po wszystkich nastepnikach
      for (var i in root.successors) {
        var node = root.successors[i];
        //rekurencyjnie ustawia nastepnym odpowiednie czasy
        setLateTimes(node);
        if (root.let == null || root.let > node.lst) {
          root.let = node.lst;
        }
      }

      root.lst = root.let - root.duration;
      root.clearance = root.let - root.eet;
    }
  }

  //zbudowanie sciezki krytycznej
  function buildCriticalPath(root, path) {
    //metoda przechodzi po wszystkich node'ach, ktore maja luz rowny 0 i kopiuje taka sciezke do nowej listy
    if (root.clearance == 0) {
      var predecessors = root.predecessors;
      for (var i in predecessors) {
        var node = predecessors[i];
        if (node.clearance == 0) {
          var clone = new Activity({
            id: node.id,
            duration: node.duration,
            est: node.est,
            lst: node.lst,
            eet: node.eet,
            let: node.let,
            clearance: node.clearance,
          });
          if (node !== start) {
            path.predecessors.push(clone);
            buildCriticalPath(node, clone);
          }
        }
      }
    }
  }

  //glowna metoda laczaca poprzednie, wywolywana na ostatnim elemencie
  this.getCriticalPath = function (endid) {
    if (!endid) {
      throw new Error("End activity id is required!");
    }
    end = list[endid];
    if (!end) {
      throw new Error("Node end dont not match");
    }
    processList();

    //ustawienie wczesnych czasow
    start.est = 0;
    start.eet = 0;
    setEarlyTimes(start);

    //ustawienie poznych czasow
    end.let = end.eet;
    end.lst = end.let - end.duration;
    end.clearance = end.eet - end.let;
    setLateTimes(start);

    //zbudowanie sciezki rekurencyjnie
    var path = null;
    if (end.clearance == 0) {
      var path = new Activity({
        id: end.id,
        duration: end.duration,
        est: end.est,
        lst: end.lst,
        eet: end.eet,
        let: end.let,
        clearance: end.clearance,
      });
      buildCriticalPath(end, path);
    }
    return path;
  };

  //zwracanie listy
  this.getList = function () {
    processList();
    return list;
  };

  //zwracanie listy jako tablica
  this.getListAsArray = () => {
    processList();
    return Object.values(list);
  };
  return this;
}

$(document).ready(function () {
  $(".dropdown-toggle").dropdown();

  var options = [];

  $(".dropdown-menu a").on("click", function (event) {
    var $target = $(event.currentTarget),
      val = $target.attr("data-value"),
      $inp = $target.find("input"),
      idx;

    if ((idx = options.indexOf(val)) > -1) {
      options.splice(idx, 1);
      setTimeout(function () {
        $inp.prop("checked", false);
      }, 0);
    } else {
      options.push(val);
      setTimeout(function () {
        $inp.prop("checked", true);
      }, 0);
    }

    $(event.target).blur();

    console.log(options);
    return false;
  });
});

//docelowe miejsce na zapisywanie kolejnych krokow
var activityList = new ActivityList();
var addActivityBtn = document.getElementById("addActivityBtn");
var removeActivityBtn = document.getElementById("removeActivityBtn");
var calculateBtn = document.getElementById("calculateBtn");
var resultDiv = document.getElementById("resultDiv");
var resultText1 = document.getElementById("resultText1");
var resultText2 = document.getElementById("resultText2");
var actList = document.getElementById("actList");
var graph = document.getElementsByClassName("graph");
var tablesResult = document.getElementsByClassName("tables-result");
var table = document.getElementById("tableBody");

var addTransportationBtn=document.getElementById("addTransportationBtn");
var resetTransportationButton=document.getElementById("resetTransportation");
var calculateTransportationButton=document.getElementById("calculateTransportationButton");

var counter = 1;
let criticalPath = [];

//metoda do wybierania odpowiednich rzeczy z listy
function parseArray(cpmList) {
  console.log("TABLE 3", cpmList);
  var returnArray = [];
  //przechodzenie po calej liscie i tworzenie tablicy node'ow i krawdzi do diagramu
  for (var listElement = 0; listElement < cpmList.length; listElement++) {
    var nodeObject = new Object();
    var data = new Object();
    nodeObject.data = data;
    var currentObject = cpmList[listElement];
    var id = currentObject.id;
    var duration = currentObject.duration;
    var successors = currentObject.successors;

    nodeObject.data.id = id;
    nodeObject.data.duration = duration;
    nodeObject.data.backgroundColor = "#6c757d";
    returnArray.push(nodeObject);

    for (var iter = 0; iter < successors.length; iter++) {
      if (activityList.doesListContain(successors[iter].id)) {
        var edgeObject = new Object();
        var data = new Object();
        edgeObject.data = data;
        edgeObject.data.id = id + successors[iter].id;
        edgeObject.data.source = id;
        edgeObject.data.target = successors[iter].id;
        edgeObject.data.color = "#0d6efd";
        returnArray.push(edgeObject);
      }
    }
  }
  return returnArray;
}

//pobieranie danych do algorytmu bezposrednio z tabelki widocznej dla usera
function getData() {
  var activityTable = document.getElementById("tableBody");
  for (var i = 0; i < activityTable.rows.length; i++) {
    var predecessors = activityTable.rows[i].getAttribute("data-pred");
    if (predecessors !== null && predecessors !== undefined)
      predecessors = activityTable.rows[i].getAttribute("data-pred").split("|");
    else predecessors = [];

    predecessors = arrayRemove(predecessors, "");
    activityList.addActivity(
      new Activity({
        id: activityTable.rows[i].getAttribute("data-actname"),
        duration: parseInt(activityTable.rows[i].getAttribute("data-acttime")),
        predecessors,
      })
    );
  }
  return activityList;
}

//zaznaczanie krawedzi i node'ow na odpowiednie kolory (po wykonaniu algorytmu)
function markEdges(graphArray, path) {
  if (path === null) return null;
  var currentObject = path;
  var edgeArray = [];
  while (
    currentObject.predecessors !== null &&
    currentObject.predecessors !== undefined &&
    currentObject.predecessors !== typeof undefined
  ) {
    var predecessors = currentObject.predecessors;
    if (
      predecessors.length != 0 &&
      predecessors != undefined &&
      predecessors != typeof undefined
    ) {
      var edgeObject = new Object();
      edgeObject.source = predecessors[0].id;
      edgeObject.target = currentObject.id;
      edgeArray.push(edgeObject);
      currentObject = predecessors[0];
      finalDuration += currentObject.duration;
    } else break;
  }
  for (var currentEdge = 0; currentEdge < graphArray.length; currentEdge++) {
    if (
      graphArray[currentEdge].data.source != undefined &&
      graphArray[currentEdge].data.source != typeof undefined &&
      graphArray[currentEdge].data.target != undefined &&
      graphArray[currentEdge].data.target != typeof undefined
    ) {
      for (var redEdge = 0; redEdge < edgeArray.length; redEdge++) {
        if (
          edgeArray[redEdge].source == graphArray[currentEdge].data.source &&
          edgeArray[redEdge].target == graphArray[currentEdge].data.target
        ) {
          graphArray[currentEdge].data.color = "red";
        }
      }
    }
  }

  return graphArray;
}

//wybranie ze zwroconej sciezki krytycznej odpowiednich rzeczy
function parsePath(path) {
  if (path === null) return null;
  var returnArray = [];
  var currentObject = path;
  while (currentObject !== undefined) {
    returnArray.unshift(currentObject.id);
    if (
      currentObject.predecessors === undefined ||
      currentObject.predecessors === null ||
      currentObject.predecessors === typeof undefined
    )
      break;
    else currentObject = currentObject.predecessors[0];
  }
  return returnArray;
}

//konfiguracja grafu
function displayGraph(data) {
  var cy = cytoscape({
    container: document.getElementById("cyGraph"),
    elements: data,
    style: [
      // the stylesheet for the graph
      {
        selector: "node",
        style: {
          "background-color": "data(backgroundColor)",
          label: function (element) {
            return `${element.data("id")} ${element.data("duration")}`;
          },
        },
      },

      {
        selector: "edge",
        style: {
          width: 3,
          "target-arrow-color": "data(color)",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          lineColor: "data(color)",
        },
      },
    ],

    layout: {
      name: "breadthfirst",
      rows: 1,
    },
  });
  cy.ready(function () {
    cy.fit();
  });
}

function algorithm() {
  //pobieranie danych
  var data = getData();
  //pobranie danych do tablicy node'ow i krawedzi
  var graphArray = parseArray(data.getListAsArray());
  //obliczenie sciezki
  var path = data.getCriticalPath(graphArray[graphArray.length - 1].data.id);
  //zazmaczenie krawedzi
  graphArray = markEdges(graphArray, path);
  criticalPath = parsePath(path);
  console.log(path);
  //wyswietlenie grafu
  displayGraph(graphArray);
  //wypelnienie tabelki z wynikami
  fillTable(data.getListAsArray());
  //wyczyszczenie listy po obliczeniu wszystkiego
  activityList = new ActivityList();
}

//wypelnienie tabelki z wynikami
function fillTable(nodes) {
  var table = document.getElementById("resultBody");
  removeTableRows(table);
  for (var i = 0; i < nodes.length; i++) {
    var tr = document.createElement("tr");
    var id = document.createElement("td");
    id.innerText = nodes[i].id;
    var duration = document.createElement("td");
    duration.innerText = nodes[i].duration;
    var est = document.createElement("td");
    est.innerText = nodes[i].est;
    var eet = document.createElement("td");
    eet.innerText = nodes[i].eet;
    var lst = document.createElement("td");
    lst.innerText = nodes[i].lst;
    var LeT = document.createElement("td");
    LeT.innerText = nodes[i].let;

    tr.appendChild(id);
    tr.appendChild(duration);
    tr.appendChild(est);
    tr.appendChild(eet);
    tr.appendChild(lst);
    tr.appendChild(LeT);

    table.appendChild(tr);
  }
}

function removeTableRows(parent) {
  while (parent.childNodes.length) {
    parent.removeChild(parent.childNodes[0]);
  }
}

function arrayRemove(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}

function fillTransportationTable(rows, cols){
  console.log(rows,cols)
  var transportTable=document.getElementById("transportTable")
  for(var i=0;i<rows+1;i++){
    var row=document.createElement("tr");
    if(i==0)
      row.classList.add("headFields")
    for(j=0;j<cols+1;j++){
      var col=document.createElement("td");
      if(i==0||j==0)
        col.classList.add("headFields")
      if(i==0&&j!=0)
        col.textContent="R"+j;
      if(i!=0&&j==0)
        col.textContent="S"+i;
      if(i==0&&j==0){
        col.textContent="/"
        col.contentEditable=false
      }
      col.id="R"+j+";"+"S"+i;
      col.setAttribute("data-r",j)
      col.setAttribute("data-s",i)
      row.appendChild(col);
    }
    transportTable.appendChild(row)
  }
}

function cleanTransportationTable(){
  var transportTable=document.getElementById("transportTable")
  while (transportTable.hasChildNodes()) {  
    transportTable.removeChild(transportTable.firstChild);
  }
}

addActivityBtn.addEventListener("click", function () {
  var row = document.createElement("tr");
  row.setAttribute("id", counter);

  var cell = new Array(4);

  for (var i = 0; i < 4; i++) {
    cell[i] = document.createElement("td");
    row.appendChild(cell[i]);
  }

  var actInput = document.getElementById("inputActivity");
  var timeInput = document.getElementById("inputTime");

  cell[0].classList.add("actNum");
  row.setAttribute("data-num", counter);
  cell[0].textContent = counter;

  cell[1].classList.add("actName");
  row.setAttribute("data-actName", actInput.value);
  cell[1].textContent = actInput.value;

  //new activity id
  var nai = actInput.value;

  cell[2].classList.add("actTime");
  row.setAttribute("data-actTime", timeInput.value);
  cell[2].textContent = timeInput.value;

  //new activity duration
  var nad = parseInt(timeInput.value);

  //new activity predecessors
  var nap = [];

  cell[3].classList.add("actPreceding");

  if (counter == 1) {
    cell[3].textContent = "";
  } else {
    var checkboxes = document.querySelectorAll(
      'input[name="actSelected"]:checked'
    );
    if (checkboxes.length > 0) {
      var cbValues = [];
      checkboxes.forEach((checkbox) => {
        cbValues.push(checkbox.value.toString());
      });

      var data_predecessors = "";

      for (var i = 0; i <= cbValues.length - 1; i++) {
        cell[3].textContent += cbValues[i] + ", ";
        data_predecessors += cbValues[i] + "|";
        nap.push(cbValues[i]);
      }

      row.setAttribute("data-pred", data_predecessors);
      //cell[3].textContent += cbValues[cbValues.length - 1];
      //nap.push(cbValues[cbValues.length - 1]);
    } else {
      cell[3].textContent = "";
      row.setAttribute("data-pred", "");
    }
  }

  var li = document.createElement("li");
  var label = document.createElement("label");
  var t = document.createTextNode("\u00A0");
  var input = document.createElement("input");
  input.value = actInput.value;
  input.type = "checkbox";
  input.name = "actSelected";
  input.id = counter;
  label.appendChild(t);
  label.appendChild(input);
  t = document.createTextNode(` \u00A0${actInput.value}`);
  label.appendChild(t);
  //label.textContent += actInput.value;
  li.appendChild(label);
  actList.appendChild(li);

  table.appendChild(row);

  //dodanie utworzonego tutaj obiektu Activity do globalnej ActivityList

  counter++;
});

removeActivityBtn.addEventListener("click", function () {
  var rowsLength = table.rows.length;
  if (rowsLength > 0) {
    table.deleteRow(rowsLength - 1);
    actList.removeChild(actList.lastChild);
    activityList = new ActivityList();
    counter--;
  }
});

calculateBtn.addEventListener("click", function () {
  if (table.rows.length > 0) {
    resultDiv.style.height = "100px";
    resultDiv.style.opacity = "100%";
    resultDiv.style.transition = "height .5s, opacity 1s";

    graph[0].classList.add("graph-show");
    graph[0].setAttribute("id", "cyGraph");

    tablesResult[0].classList.add("tables-result-show");

    algorithm();

    var result = "";
    if (
      criticalPath === [] ||
      criticalPath === null ||
      criticalPath === undefined
    ) {
      result = "error";
    } else {
      for (var i = 0; i < criticalPath.length; i++) {
        result += ` '${criticalPath[i]}'`;
        if (i + 1 < criticalPath.length) result += " ->";
      }
    }

    var info1 = `Critical path: ${result}`;
    var info2 = `Critical path duration: ${finalDuration}`;
    resultText1.textContent = info1;
    resultText2.textContent = info2;
    finalDuration = 0;
  }
});
addTransportationBtn.addEventListener("click", function(){
  cleanTransportationTable()
  var recipentsField=document.getElementById("inputRecipientNumber");
  var suppliersField=document.getElementById("inputSuppliersNumber");
  var transportationModal=document.getElementById("transportationModal");
  transportationModal=bootstrap.Modal.getInstance(transportationModal)
  //TODO: ADD A TOAST MSG WITH ERROR
  if(recipentsField.value!==null&&recipentsField.value!=="" && suppliersField.value!==null&&suppliersField.value!==""){
    var recipents=Number(recipentsField.value);
    var suppliers=Number(suppliersField.value);
    transportationModal.hide();
    fillTransportationTable(suppliers,recipents)
  }
  else{
    console.log("error")
  }
});
resetTransportationButton.addEventListener("click", function(){
  cleanTransportationTable();
});
calculateTransportationButton.addEventListener("click", function(){
  alert("calculate")
});