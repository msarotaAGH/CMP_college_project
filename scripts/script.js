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

var addActivityBtn = document.getElementById("addActivityBtn");
var removeActivityBtn = document.getElementById("removeActivityBtn");
var calculateBtn = document.getElementById("calculateBtn");
var resultDiv = document.getElementById("resultDiv");
var resultText = document.getElementById("resultText");
var actList = document.getElementById("actList");

var table = document.getElementById("tableBody");
var counter = 1;

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

  cell[3].setAttribute("id", "actPreceding");

  var li = document.createElement("li");
  var label = document.createElement("label");
  var input = document.createElement("input");
  var t = document.createTextNode("\u00A0");
  input.type = "checkbox";
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
  if (rowsLength >= 1) {
    counter--;
  }
});

calculateBtn.addEventListener("click", function () {
  var result = 0;
  var info = `The result is ${result}`;
  resultText.textContent = info;
  //resultDiv.style.display = "block";
  resultDiv.style.height = "50px";
  resultDiv.style.opacity = "100%";
  resultDiv.style.transition = "height .5s, opacity 1s";
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

getData = () => {
    //tymczasowo zadanie 2 CPM
  return [
    {
      data: { id: "a", duration: 5 },
    },
    {
      data: { id: "b", duration: 3 },
    },
    {
      data: { id: "c", duration: 4 },
    },
    {
      data: { id: "d", duration: 6 },
    },
    {
      data: { id: "e", duration: 4 },
    },
    {
      data: { id: "f", duration: 3 },
    },
    {
      // edge ab
      data: { id: "ab", source: "a", target: "b" },
    },
    {
      // edge ad
      data: { id: "ad", source: "a", target: "d" },
    },
    {
      // edge de
      data: { id: "de", source: "d", target: "e" },
    },
    {
      // edge fb
      data: { id: "fb", source: "b", target: "f" },
    },
    {
      // edge fc
      data: { id: "fc", source: "c", target: "f" },
    },
    {
      // edge fd
      data: { id: "fd", source: "d", target: "f" },
    },
  ];
};
algorithm = () => {
  var data = getData();

  displayGraph(data);
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
          "background-color": "#666",
           label: function (element) { 
            return `${element.data("id")} ${element.data("duration")}`
        },
        },
      },

      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": "#ccc",
          "target-arrow-color": "#ccc",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          label: "data(duration)",
        },
      },
    ],

    layout: {
      name: "grid",
      rows: 1,
    },
  });
};
