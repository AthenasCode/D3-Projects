import * as d3 from "https://unpkg.com/d3?module";
import getData from "./fetchData.js";

// Define width and height of chart
export const w = 1400;
export const h = 500;
export const padding = 60;

getData(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then((json) => {
  // Store dataset from JSON in dataset variable (not necessary but for ease of understanding)
  const dataset = json.monthlyVariance;
  const baseTemp = json.baseTemperature;
  console.log("Dataset:", dataset);

  // Define x and y scales
  const xScale = d3
    .scaleLinear() // Not using scaleUtc even though we are working with time, because years are simple enough to apply as a linear scale
    .domain([dataset[0].year, dataset[dataset.length - 1].year + 1]) // Domain first date (minus 1 year so that data isn't directly on the yAxis and it looks cleaner), last date
    .range([padding, w - padding]); // Range = width of chart minus padding on both sides

  const yScale = d3
    .scaleBand() // Not using scaleUtc even though we are working with time, because the months in number format are simple enough to apply as a linear scale
    .domain([
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]) // Jan -> Dec represented as numbers 0 - 12
    .range([padding, h - padding]);

  // Determine bandheight
  const bandHeight = yScale.bandwidth();

  // Append svg to #scatterplot
  const svg = d3
    .select("#scatterplot")
    .append("svg")
    .attr("id", "heatmap")
    .attr("width", w)
    .attr("height", h);

  // Create tooltip that has opacity 0 by default, and will display during a mouseover event (see below)
  const tooltip = d3
    .select("#scatterplot")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Define monthList to use to convert month numbers to strings
  const monthList = [
    { 1: "January" },
    { 2: "February" },
    { 3: "March" },
    { 4: "April" },
    { 5: "May" },
    { 6: "June" },
    { 7: "July" },
    { 8: "August" },
    { 9: "September" },
    { 10: "October" },
    { 11: "November" },
    { 12: "December" },
  ];

  // Display data by appending rects to SVG
  svg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("width", () => {
      return ((w - padding) / ((dataset.length - 1) / 12)).toFixed(0);
    })
    .attr("height", () => {
      // return Math.trunc((h - padding) / 13) - 1;
      return bandHeight;
    })
    .attr("x", (d) => {
      return xScale(d.year);
    })
    .attr("y", (d) => {
      const monthNumber = d.month;

      for (const monthObj of monthList) {
        const key = Object.keys(monthObj)[0]; // get key
        const value = monthObj[key]; // get corresponding value

        if (key == monthNumber) {
          return yScale(value);
        }
      }
    })
    .attr("fill", (d) => {
      const temp = baseTemp + d.variance;
      const colorRanges = [
        { min: -Infinity, max: 3.9, color: "rgb(69, 118, 180)" },
        { min: 3.9, max: 5.0, color: "rgb(116, 173, 209)" },
        { min: 5.0, max: 6.1, color: "rgb(171, 217, 233)" },
        { min: 6.1, max: 7.2, color: "rgb(224, 243, 248)" },
        { min: 7.2, max: 8.3, color: "rgb(255, 255, 191)" },
        { min: 8.3, max: 9.5, color: "rgb(254, 224, 144)" },
        { min: 9.5, max: 10.6, color: "rgb(253, 174, 97)" },
        { min: 10.6, max: 11.7, color: "rgb(244, 109, 67)" },
        { min: 11.7, max: Infinity, color: "rgb(215, 48, 39)" },
      ];

      for (const range of colorRanges) {
        if (temp >= range.min && temp < range.max) {
          return range.color;
        }
      }
    })
    .on("mouseover", (event, data) => {
      // display tooltip
      tooltip
        .style("opacity", 0.9)
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px")
        .html(() => {
          const monthNumber = data.month;
          let month;

          for (const monthObj of monthList) {
            const key = Object.keys(monthObj)[0]; // get key
            const value = monthObj[key]; // get corresponding value
            if (key == monthNumber) {
              month = value;
            }
          }

          const year = data.year;
          const temp = (baseTemp + data.variance).toFixed(1) + "°C";
          const variance = data.variance.toFixed(1) + "°C";

          return `${year} - ${month} <br> ${temp} <br> ${variance}`;
        });
    })
    .on("mouseout", (d) => {
      // hide tooltip
      tooltip.style("opacity", 0);
    });

  // Define X and Y axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")); // format "d" to remove comma in string (1,994 --> 1994)
  const yAxis = d3.axisLeft(yScale);

  // Append X and Y axes
  svg
    .append("g")
    .attr("transform", `translate(0, ${h - padding})`)
    .call(xAxis);

  svg.append("g").attr("transform", `translate(${padding}, 0)`).call(yAxis);

  // Append y label
  svg
    .append("text")
    .attr("x", -h / 2)
    .attr("y", 15)
    .text("Month")
    .attr("transform", "rotate(-90)")
    .style("font", "14px sans-serif");

  // Append x label
  svg
    .append("text")
    .attr("x", w / 2)
    .attr("y", h)
    .text("Year")
    .style("font", "14px sans-serif");
});
