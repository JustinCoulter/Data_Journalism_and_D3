function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("#scatter").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // SVG wrapper dimensions are determined by the current width and
  // height of the browser window.
  var svgWidth = 1000;
  var svgHeight = 600;

  var margin = {
    top: 50,
    bottom: 50,
    right: 50,
    left: 50
  };

  var height = svgHeight - margin.top - margin.bottom;
  var width = svgWidth - margin.left - margin.right;

  // Append SVG element
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  // Append group element
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);



  d3.csv("data.csv").then(function(healthData) {
    // if (error) return console.warn(error);

    // console.log(healthData);

    // log a list of state abbreviations
    var stateAbbr = healthData.map(data => data.abbr);
    console.log("abbr", stateAbbr);

    // parse data and cast to a number value
    healthData.forEach(function(data) {

      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;

      console.log("poverty", data.poverty);
      console.log("healthcare", data.healthcare);
    });

    var xLinearScale = d3.scaleLinear()
    .domain([(d3.min(healthData, d => d.poverty)-(d3.min(healthData, d => d.poverty)*.1)), d3.max(healthData, d => d.poverty)*1.05])
    .range([0, width]);

    var yLinearScale = d3.scaleLinear()
    .domain([(d3.min(healthData, d => d.healthcare)-(d3.min(healthData, d => d.healthcare)*.1)), d3.max(healthData, d => d.healthcare)*1.05])
    .range([height, 0]);

    var xAxis = d3.axisBottom(xLinearScale);
    var yAxis = d3.axisLeft(yLinearScale);

    chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

    // chartGroup.append("text")
    // .attr("transform", `translate(${width / 2}, ${height + margin.top + 100})`)
    // .attr("class", "axisText")
    // .text("Hair Metal Band Hair Length (inches)");

    chartGroup.append("g")
    .call(yAxis);
// text label for the x axis

    svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 40) + ")")
      .style("text-anchor", "middle")
      .text("Poverty");

      // text label for the y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Healthcare");  


    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "10")
        .attr("fill", "gold")
        .attr("stroke-width", "1")
        .attr("stroke", "black")
        .append("text")
        .attr("x", d => d.poverty)
        .attr("y", d => d.healthcare)
        .text("text",d => d.abbr);
  });

}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

