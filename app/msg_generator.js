
var util = require('util');
fs = require('fs');


var output_file = "output.txt";
var car_cnt = 5;
// print process.argv
process.argv.forEach(function (val, index, array) {
  if (index == 2)  output_file = val;
  if (index == 3)  car_cnt = val;
});

if(output_file == null) {
  console.log("No output file specified as the first argument");
  return;
}

var content = new Object();
var config = content.config = new Object();

function add_cars_2_consist (config, count) {
  var car_types = Array("SUPERCOACH","SURFLINER","BISTRO","BICYCLE_CAR");
  config.car_count = count;
  var car = config.car = new Array();


  for(i = 1; i <= count; i++) { //starting from 1 in ICD
    var car2add = new Object();
    car2add.id = i + "_CAR_" + i;
    car2add.order = i;
    car2add.type = car_types[Math.floor(Math.random()*car_types.length)];
    car2add.orientation = (i % 3) == 0 ? "forward" : "backward";
    (i % 5) == 1 ? car2add.legacy =  "true" : null;
    (i % 4) == 2 ? car2add.OBISequipped = "true" : null ;
    car.push(car2add);
  }
}

//debugger;

add_cars_2_consist (config, car_cnt);

fs.writeFile(output_file, JSON.stringify(content, null, 2), function (err) {
  if(err) {
   console.log(err);
 } else {
   console.log("JSON saved to " + output_file);
 }
});


//console.log(util.inspect(content, {showHidden: false, depth: null}));

//console.log()
