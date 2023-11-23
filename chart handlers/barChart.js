import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import getData from "./fetchData.js";

// Use data to create graph with d3
getData(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then((json) => {
    // Store dataset from JSON in variable
    const dataset = json.data;

    // Define width and height of chart
    const w = 900;
    const h = 460;
    const padding = 60;

    // Determine width of bars
    const numberDataPoints = d3.max(dataset, (d, i) => i);
    const barWidth = (w - padding) / numberDataPoints; // Each individual bar width = total width of graph divided by number of data points, to get an even display

    // Find first date and last date of data to use for domain of x axis
    const firstDateString = dataset[0][0]; // assumes that the data is in chronological order (earliest year will be first datapoint in the json file)
    const lastDateString = dataset[numberDataPoints][0];
    const firstDate = new Date(firstDateString); // Construct firstDate
    let lastDate = new Date(lastDateString); // Construct lastDate
    lastDate.setMonth(lastDate.getMonth() + 3); // Add a quarter such that last date doesn't hang over edge of x-axis

    // Define xScale
    const xScale = d3
      .scaleUtc() // Converts inputs (domain) to outputs (range), e.g. 274 => 1000
      .domain([firstDate, lastDate]) // Domain first date, last date
      .range([padding, w - padding]); // Range = width of chart minus padding on both sides

    // Define yScale
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d[1])])
      .range([h - padding, padding]); // Range = height of chart minus padding on both sides

    // Create tooltip that has opacity 0 by default, and will display during a mouseover event (see below)
    const tooltip = d3
      .select("#bar-chart")
      .append("div")
      .attr("class", "barChartTooltip")
      .style("opacity", 0);

    // Append SVG to #bar-chart
    const svg = d3
      .select("#bar-chart")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    // Display data by appending rects to SVG
    svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("x", (d) => {
        // X value for each datapoint will be the date of each datapoint (converted to the xScale)
        let date = new Date(d[0]);
        return xScale(date);
      })
      .attr("y", (d) => yScale(d[1])) // Start drawing top of rectangles from here downwards
      .attr("width", barWidth)
      .attr("height", (d) => h - padding - yScale(d[1])) // Calculate height of each bar
      .attr("class", "bar")
      .on("mouseover", (event, data) => {
        // display tooltip
        tooltip
          .style("opacity", 0.9)
          .style("left", event.clientX + window.scrollX + "px")
          .style("top", event.clientY + window.scrollY + "px")
          .html(() => {
            // Parse the date string
            let date = new Date(data[0]);
            // Calculate the quarter
            let quarter = "Q" + Math.ceil((date.getMonth() + 1) / 3);
            // Pull year from date string
            let year = date.getFullYear();
            return year + " " + quarter + "<br>" + " $" + data[1] + " Billion";
          });
      })
      .on("mouseout", (d) => {
        // hide tooltip
        tooltip.style("opacity", 0);
      });

    // title") // Display data as text tooltip
    // .text(;

    // Define X and Y axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale); // Q: Why do I need to account for padding and translate the axes if I've made them bottom left and right according to the x and y scales, which also account for padding in the range?

    // Append X axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${h - padding})`)
      .call(xAxis);

    // Append Y axis
    svg.append("g").attr("transform", `translate(${padding}, 0)`).call(yAxis);

    // Caption below graph
    svg
      .append("text")
      .attr("x", 520)
      .attr("y", 450)
      .text("More Information: http://www.bea.gov/national/pdf/nipaguid.pdf")
      .style("font-size", "12px");

    // Y axis "label"
    svg
      .append("text")
      .attr("x", -200)
      .attr("y", 80)
      .text("Gross Domestic Product ($Billion)")
      .attr("transform", "rotate(-90)")
      .style("font-size", "12px");
  })
  .catch((error) => {
    console.error("Error:", error);
  });
