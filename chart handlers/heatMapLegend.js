import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { w, h, padding } from "./heatMap.js";

// Define dimensions of SVG
const legendWidth = 300;
const legendHeight = 70;
const legendPadding = 20;

const legendSvg = d3
  .select("#heat-map-legend")
  .append("svg")
  .attr("id", "legend")
  .attr("width", legendWidth)
  .attr("height", legendHeight);

// Define legend datapoints
const tempLegendData = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];

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

// Define legend scale
const legendScale = d3
  .scaleLinear()
  .domain([
    colorRanges[0].max - 2.2,
    colorRanges[colorRanges.length - 1].min + 2.2,
  ])
  .range([legendPadding, legendWidth - legendPadding]);

// Calculate width of legend bands using d3's bandwidth method TODO: calculate this manually (bandwidth might only be useful for more discrete data than temperatures)
const bandwidth = d3
  .scaleBand()
  .domain(tempLegendData)
  .range([legendPadding, legendWidth - legendPadding])
  .round(true)
  .bandwidth();

// Match height to width to create squares
const legendItemHeight = bandwidth;

// Define legend axis
const legendAxis = d3
  .axisBottom(legendScale)
  .tickValues(tempLegendData)
  .tickFormat(d3.format(".1f")); // d3 typically uses whole integers for ticks unless otherwise specified

// Append legend axis
legendSvg
  .append("g")
  .attr("id", "legendAxis")
  .attr("transform", `translate(0, ${legendHeight - legendPadding})`)
  .call(legendAxis);

// Append legend items
legendSvg
  .selectAll("rect")
  .data(colorRanges)
  .enter()
  .append("rect")
  .attr("id", (d) => {
    const id = d.min === -Infinity ? 2.8 : d.min;
    return id;
  })
  .attr("x", (d) => {
    const xValue = d.min === -Infinity ? 2.8 : d.min;
    return legendScale(xValue);
  })
  .attr("y", legendHeight - legendPadding - legendItemHeight)
  .attr("width", bandwidth)
  .attr("height", legendItemHeight)
  .attr("fill", (d) => {
    const fill = d.min === -Infinity ? 2.8 : d.min;
    for (const range of colorRanges) {
      if (fill >= range.min && fill < range.max) {
        return range.color;
      }
    }
  });
