var svgWidth = 660;
var svgHeight = 400;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chartGroup2 = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.95,
      d3.max(healthData, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return textGroup;
  }

// function used for updating circles group with new tooltip------------------------------------------
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty" && chosenYAxis === "healthcare") {
    var label = "In Poverty (%)"
    var label2 = "Lacks Health Care (%)";
  }
  else if (chosenXAxis === "age" && chosenYAxis === "healthcare"){
    var label = "Age";
    var label2 = "Lacks Health Care (%)";
  }
  else if (chosenXAxis === "age" && chosenYAxis === "obesity"){
    var label = "Age";
    var label2 = "Obesity (%)";
  }
  else if (chosenXAxis === "poverty" && chosenYAxis === "obesity") {
    var label = "In Poverty (%)"
    var label2 = "Obesity (%)";
  }


  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .direction("w")
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${label2} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data,this)
    d3.select(this).attr("r",15).attr("stroke","red");
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data,this)
      d3.select(this).attr("r",10).attr("stroke","black");
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(healthData) {
//   if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.obesity = +data.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(healthData, chosenYAxis);
    // .domain([0, d3.max(healthData, d => d.healthcare)])
    // .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis-----------------------------------------------------------
  var yAxis = chartGroup.append("g")
    // .classed("y-axis", true)

    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "gold")
    .attr("opacity", "1")
    .attr("stroke-width", "1")
    .attr("stroke", "black");

// add text State abbr to circles 
  var textGroup = chartGroup2.selectAll("text")
    .data(healthData)
    .enter()
    .append("text")
    
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis])+4.5)
    .text( d => d.abbr)    
    .style("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-size",10);
    

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");

  // append y axis
  var labelsGroupY = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var healthcareLabel = labelsGroupY.append("text")  
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 1.5))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  var obesityLabel = labelsGroupY.append("text")  
    .attr("y", 0 - margin.left + 20)
    .attr("x", 0 - (height / 1.5))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .classed("active", false)
    .classed("axis-text", true)
    .text("Obesity (%)");



  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates text and circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
       
      }
    });

    // y axis labels event listener
  labelsGroupY.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;
        // updates y scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition-------------------------------------------------------
        yAxis = renderAxesY(yLinearScale, yAxis);

        // updates text and circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        textGroup = renderText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      
        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});
