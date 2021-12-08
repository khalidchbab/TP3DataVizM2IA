/*
 Author : Khalid CHBAB
 Master 2 IA Lyon 1
 Module : DataViz
*/
var width = 700,
    height = 580;

var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");

var projection = d3.geoConicConformal().center([2.454071, 46.279229])
    .translate([width / 2, height / 2])
    .scale([3000]);

var colors = ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"]

var color = d3.scaleQuantize()
    .range(colors);

var path = d3.geoPath().projection(projection);

var tooltip = d3.select('body').append('div')
    .attr('class', 'hidden tooltip');

d3.csv("../data/covid-france-mars-avril.csv").then(function (data) {
    color.domain([
        d3.min(data, function (d) {
            return d.hosp;
        }),
        d3.max(data, function (d) {
            return d.hosp;
        })
    ]);

    d3.json("../data/map-france.geojson").then(function (json) {
        for (var i = 0; i < data.length; i++) {
            var dataDep = data[i].dep;
            var dataDay = data[i].jour
            var dataValue = parseInt(data[i].hosp);
            for (var j = 0; j < json.features.length; j++) {
                var jsonDep = json.features[j].properties.code;
                if (dataDep == jsonDep && dataDay == currentWeek) {
                    json.features[j].properties.reg = data[i].Region
                    json.features[j].properties.value = dataValue;                break;
                }
            }
        }

        g.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr('id', d => "d" + d.properties.nom)
            .attr("d", path)
            .attr("class", d => "department")
            .style("fill", function (d) {
                return d.properties.value ? color(d.properties.value) : "#ccc"
            })
            .on('mousemove', (event, d) => {
                var mousePosition = d3.pointer(event);
                tooltip.classed('hidden', false)
                    .attr('style', 'left:' + (mousePosition[0] + 15) +
                        'px; top:' + (mousePosition[1] - 35) + 'px')
                    .html("<b>Région : </b>" + d.properties.reg + "<br>"
                    + "<b>Département : </b>" + d.properties.nom + "<br>"
                    + "<b>Hospitalisation : </b>" + d.properties.value + "<br>");
            })
            .on('mouseout', () => {
                tooltip.classed('hidden', true);
            });

        var legendScale = d3.scaleLinear()
            .domain([0, d3.max(data, e => +e.hosp)])
            .range([0, 9 * 20]);

        var legend = svg.append('g')
            .attr('transform', 'translate(625, 150)')
            .attr('id', 'legend');

        legend.selectAll('.colorbar')
            .data(d3.range(5))
            .enter().append('svg:rect')
            .attr('y', d => d * 20 + 'px')
            .attr('height', '20px')
            .attr('width', '20px')
            .attr('x', '0px')
            .attr('fill', d => colors[d])

        var legendScale = d3.scaleLinear()
            .domain([0, d3.max(data, e => +e.hosp)])
            .range([0, 5 * 20]);

        svg.append("g")
            .attr('transform', 'translate(650, 150)')
            .call(d3.axisRight(legendScale).ticks(6))

    });
});