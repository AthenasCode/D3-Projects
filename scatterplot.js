import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import getData from "./fetchData.js";

getData(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
).then((json) => {
  // Store dataset from JSON in dataset variable (not necessary but for ease of understanding)
  const dataset = json;
  console.log("Dataset:", dataset);

  // Define width and height of chart
  const w = 900;
  const h = 440;
  const padding = 60;

  // Define x and y scales

  // Find first and last year for domain of xScale
  // Determine first and last years
  const years = dataset.map((data) => {
    return data.Year;
  });
  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);

  // Convert the minutes:seconds into dates since we can use dates to set the yScale more easily - NOTE: dates will be 1/1/1900 but we can ignore this as we only care about time
  const timeSpecifier = "%M:%S";

  // Parse times to UTC format
  const parsedData = dataset.map((d) => {
    return d3.utcParse(timeSpecifier)(d.Time);
  });

  const xScale = d3
    .scaleLinear() // Not using scaleUtc even though we are working with years, because it's not necessary and adds extra steps
    .domain([firstYear - 1, lastYear]) // Domain first date (minus 1 year so that data isn't directly on the yAxis and it looks cleaner), last date
    .range([padding, w - padding]); // Range = width of chart minus padding on both sides

  const yScale = d3
    .scaleUtc()
    .domain([parsedData[parsedData.length - 1], parsedData[0]]) // Faster times at top of graph, such that the lower numbers are at the upper end of the domain
    .range([h - padding, padding]); // remembering higher number means further from the top of the graph

  // Append svg to #scatterplot
  const svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  // Append tooltip to #scatterplot that has opacity 0 by default
  const tooltip = d3
    .select("#scatterplot")
    .append("div")
    .attr("class", "scatterplotTooltip")
    .style("opacity", 0);

  // Display data by appending circles to SVG
  svg
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => {
      return xScale(d.Year);
    })
    .attr("cy", (d) => {
      return yScale(d3.utcParse(timeSpecifier)(d.Time)); // We don't need to subtract the value from the height of the graph because we are displaying the fastest times at the top (the yAxis is reversed)
    })
    .attr("r", 5)
    .attr("fill", (d) => (d.Doping ? "rgb(31, 119, 180)" : "rgb(255, 127, 14)"))
    .on("mouseover", (event, data) => {
      // display tooltip on mouseover
      tooltip
        .style("opacity", 0.9)
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px")
        .html(() => {
          const name = data.Name;
          const country = data.Nationality;
          const year = data.Year;
          const time = data.Time;
          const description = data.Doping;
          if (description) {
            return `${name}: ${country} <br> Year: ${year}, Time: ${time} <br><br> ${description}`;
          } else {
            return `${name}: ${country} <br> Year: ${year}, Time: ${time}`;
          }
        });
    })
    .on("mouseout", (d) => {
      // hide tooltip
      tooltip.style("opacity", 0);
    });

  // Define X and Y axis
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")); // format "d" to remove comma in string (1,994 --> 1994)
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => {
    return d3.timeFormat(timeSpecifier)(d); // formats ticks in mm:ss
  });

  // Append X and Y axes
  svg
    .append("g")
    .attr("transform", `translate(0, ${h - padding})`)
    .call(xAxis);

  svg.append("g").attr("transform", `translate(${padding}, 0)`).call(yAxis);

  // Append y label
  svg
    .append("text")
    .attr("x", -325)
    .attr("y", 15)
    .text("Time MM:SS")
    .attr("transform", "rotate(-90)")
    .style("font", "14px sans-serif");

  // Append legend
  const legend = svg.append("g").attr("class", "legend");

  function createLegendLabel(labelText, fillColor, translateY) {
    const legendLabel = legend
      .append("g")
      .attr("class", "legend-label")
      .attr("transform", `translate(0, ${translateY})`);

    legendLabel
      .append("rect")
      .attr("x", "822px")
      .attr("width", "18px")
      .attr("height", "18px")
      .attr("fill", fillColor);

    legendLabel
      .append("text")
      .attr("x", "816px")
      .attr("y", "9px")
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(labelText);
  }

  // Create doping legend label
  createLegendLabel("Doping allegations", "rgb(31, 119, 180)", 230);

  // Create no doping legend label
  createLegendLabel("No doping allegations", "rgb(255, 127, 14)", 250);
});
