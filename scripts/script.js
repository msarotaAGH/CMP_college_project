function Activity(configs) {
  var self = this;
  configs = configs || {};
  self.id = configs.id;
  self.duration = configs.duration;
  self.est = configs.est; //Earliest Start Time
  self.lst = configs.lst; //Latest Start Time
  self.eet = configs.eet; //Earliest End Time
  self.let = configs.let; //Latest End Time
  self.h = configs.h; //clearance (holgura)
  self.successors = [];
  self.predecessors = configs.predecessors || [];
  return self;
}

function ActivityList() {
  var self = this;
  var processed = false;
  var list = {};
  var start, end;

  self.addActivity = function (activity) {
    list[activity.id] = activity;
  };

  function processList() {
    if (processed) {
      return;
    }
    processed = true;

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

  function setEarlyTimes(root) {
    for (var i in root.successors) {
      var node = root.successors[i];

      var predesessors = node.predecessors;
      for (var j in predesessors) {
        var activity = predesessors[j];
        if (node.est == null || node.est < activity.eet)
          node.est = activity.eet;
      }
      node.eet = node.est + node.duration;
      setEarlyTimes(node);
    }
  }

  function setLateTimes(root) {
    if (root.successors.length == 0) {
      root.let = root.eet;
      root.lst = root.let - root.duration;
      root.h = root.eet - root.let;
    } else {
      for (var i in root.successors) {
        var node = root.successors[i];
        setLateTimes(node);
        if (root.let == null || root.let > node.lst) {
          root.let = node.lst;
        }
      }

      root.lst = root.let - root.duration;
      root.h = root.let - root.eet;
    }
  }

  function buildCriticalPath(root, path) {
    if (root.h == 0) {
      var predecessors = root.predecessors;
      for (var i in predecessors) {
        var node = predecessors[i];
        if (node.h == 0) {
          var clone = new Activity({
            id: node.id,
            duration: node.duration,
            est: node.est,
            lst: node.lst,
            eet: node.eet,
            let: node.let,
            h: node.h,
          });
          if (node !== start) {
            path.predecessors.push(clone);
            buildCriticalPath(node, clone);
          }
        }
      }
    }
  }

  self.getCriticalPath = function (endid) {
    if (!endid) {
      throw new Error("End activity id is required!");
    }
    end = list[endid];
    if (!end) {
      throw new Error("Node end dont not match");
    }
    processList();

    start.est = 0;
    start.eet = 0;
    setEarlyTimes(start);

    //Setup End Times
    end.let = end.eet;
    end.lst = end.let - end.duration;
    end.h = end.eet - end.let;
    setLateTimes(start);

    //Assemble Critical Path (tree)
    var path = null;
    if (end.h == 0) {
      var path = new Activity({
        id: end.id,
        duration: end.duration,
        est: end.est,
        lst: end.lst,
        eet: end.eet,
        let: end.let,
        h: end.h,
      });

      buildCriticalPath(end, path);
    }
    return path;
  };

  self.getList = function () {
    processList();
    return list;
  };

  self.getListAsArray = () => {
    processList();
    return Object.values(list);
  };
  return self;
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
var activityList= new ActivityList();

var addActivityBtn = document.getElementById("addActivityBtn");
var removeActivityBtn = document.getElementById("removeActivityBtn");
var calculateBtn = document.getElementById("calculateBtn");
var resultDiv = document.getElementById("resultDiv");
var resultText = document.getElementById("resultText");
var actList = document.getElementById("actList");
// var graph = document.getElementsByClassName("graph");
var graph = document.getElementById("cyGraph");

var table = document.getElementById("tableBody");
var counter = 1;


parseArray = (cpmList) => {
  console.log("TABLE 3", cpmList);
  var returnArray = [];
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
    nodeObject.data.backgroundColor="#6c757d";
    returnArray.push(nodeObject);

    for (var iter = 0; iter < successors.length; iter++) {
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
  return returnArray;
};

getData = () => {
  //docelowo odbieranie z arraya populowanego przy dodawaniu zwyklym
  //tymczasowo zadanie 2 CPM
  var table3 = new ActivityList();

  table3.addActivity(
    new Activity({
      id: "A",
      duration: 5,
    })
  );

  table3.addActivity(
    new Activity({
      id: "B",
      duration: 3,
      predecessors: ["A"],
    })
  );

  table3.addActivity(
    new Activity({
      id: "C",
      duration: 4,
    })
  );

  table3.addActivity(
    new Activity({
      id: "D",
      duration: 6,
      predecessors: ["A"],
    })
  );

  table3.addActivity(
    new Activity({
      id: "E",
      duration: 4,
      predecessors: ["D"],
    })
  );

  table3.addActivity(
    new Activity({
      id: "F",
      duration: 3,
      predecessors: ["B", "C", "D"],
    })
  );
  return table3;
  
};
markEdges = (graphArray, path) => {
  var currentObject = path;
  var edgeArray = [];
  while (true) {
    var predecessors=currentObject.predecessors;
    if (predecessors.length != 0 && predecessors!= undefined && predecessors!= typeof(undefined)) {
      var edgeObject = new Object();
      edgeObject.source = predecessors[0].id;
      edgeObject.target = currentObject.id;
      edgeArray.push(edgeObject);
      currentObject = predecessors[0];
    } else break;
  }

  for(var currentEdge=0;currentEdge<graphArray.length;currentEdge++){

    if(graphArray[currentEdge].data.source!=undefined && graphArray[currentEdge].data.source!= typeof(undefined) && graphArray[currentEdge].data.target!=undefined && graphArray[currentEdge].data.target!= typeof(undefined)){

      for(var redEdge=0;redEdge<edgeArray.length;redEdge++){

        if(edgeArray[redEdge].source==graphArray[currentEdge].data.source && edgeArray[redEdge].target==graphArray[currentEdge].data.target){
          graphArray[currentEdge].data.color="red"
        }
      }
    }
  }

  return graphArray;
};
displayGraph = (data) => {
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
      name: "grid",
      rows: 1,
    },
  });
};
algorithm = () => {
  //var data = getData(activityList);
  var data = getData();
  var graphArray = parseArray(data.getListAsArray());
  console.log(graphArray);
  var path = data.getCriticalPath("F");
  graphArray=markEdges(graphArray,path);

  console.log(path);
  displayGraph(graphArray);
};


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

  cell[0].setAttribute("id", "actNum");
  cell[0].textContent = counter;

  cell[1].setAttribute("id", "actName");
  cell[1].textContent = actInput.value;

  cell[2].setAttribute("id", "actTime");
  cell[2].textContent = timeInput.value;

  if(counter == 1){
    cell[3].setAttribute("id", "actPreceding");
    cell[3].textContent = "";
  } else {
    var checkboxes = document.querySelectorAll('input[name="actSelected"]:checked');
    if(checkboxes.length > 0){
      var cbValues = [];
    checkboxes.forEach((checkbox) => {
      cbValues.push(checkbox.value.toString());
    })

    var precedingString = "";
    for(var i=0; i < cbValues.length - 1; i++){
      console.log(cbValues[i]);
      cell[3].textContent += cbValues[i] + ', ';
    }
    cell[3].textContent += cbValues[cbValues.length - 1];
    console.log(cbValues[cbValues.length-1]);
    } else {
      cell[3].textContent = "";
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
  counter++;
});

removeActivityBtn.addEventListener("click", function () {
  var rowsLength = table.rows.length;
  table.deleteRow(rowsLength - 1);
  actList.removeChild(actList.lastChild);
  if (rowsLength >= 1) {
    counter--;
  }
});

calculateBtn.addEventListener("click", function () {
  var result = 0;
  var info = `The result is ${result}`;
  resultText.textContent = info;
  //resultDiv.style.display = "block";
  //styling the result div
  resultDiv.style.height = "50px";
  resultDiv.style.opacity = "100%";
  resultDiv.style.transition = "height .5s, opacity 1s";
  //styling the graph div
  // if(!graph.classList.contains('graph-show')){
  // }
  graph.classList.add('graph-show');
  // graph.style.height = ""
  // graph.style.height = "400px";
  // graph.style.opacity = "100%";
  // graph.style.transition = "height .5s, opacity 1s";

  algorithm();
});

//data validation
// (function () {
//     'use strict'
//     var forms = document.querySelectorAll('.needs-validation');

//     Array.prototype.slice.call(forms).forEach(function (form){
//         form.addEventListener('submit', function (event) {
//             if(!form.checkValidity()) {
//                 event.preventDefault();
//                 event.stopPropagation();
//                 console.log("aaaaaa");
//             }
//             form.classList.add('was-validated');
//         }, false)
//     })
// })

// dodac sprawdzenie czy tabela nie jest pusta
// bo jesli jest pusta a zostanie wcisniety
// to sie zmniejszy licznik

// $(".checkbox-menu").on("change", "input[type='checkbox']", function() {
//     $(this).closest("li").toggleClass("active", this.checked);
//  });

//  $(document).on('click', '.allow-focus', function (e) {
//    e.stopPropagation();
//  });