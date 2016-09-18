var path = d3.geo.path()
var election_threshold = [3, 10, 20, 30, 55];
var opacity = 0.8;
var demographic_num = d3.select('#demographic_num');
var election_color = d3.scale.linear().domain([0,55]).range(["#c4fcf4", "#2100e0"]);

var svg_rev_demo = d3.select("#election_num_map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

var legend = d3.select("#election_num_map")
        .append("div")
        .attr('id', 'legend')
        .selectAll('div')
        .data(election_threshold)
        .enter()
        .append('div')
        .attr('class', 'flex_box');

legend.append('div')
        .attr('class', 'legend_color')
        .style('background-color', function(d, i) {
            return election_color(election_threshold[i]);
        });

legend.append('div')
        .attr('class', 'legend_text')
        .text(function(d, i) {
            var min = 0;
            if (i > 0) {
                min = election_threshold[i - 1];
                return  '' + (min + 1) + '~' + d;
            } else {
                return  '' + min + '~' + d + ' (人)';
            }
        });

var demographics = d3.select("#election_num_map")
        .append("div")
        .attr("id", "demographics_area")
        .append("div")
        .style('opacity', 0)
        .attr('id', 'demographics');

var state_name = demographics
        .append('div')
        .attr('id', 'state_name');

var election_num = demographics
        .append('div')
        .attr('id', 'election_num');

// draw maps
d3.csv(DATA_PATH + "presidential_election.csv", function(error, data) {
    if (error) throw error;
        election_min = d3.min(data, function (d) {return parseInt(d['Elector_2016']);});
        election_max = d3.max(data, function (d) {return parseInt(d['Elector_2016']);});
        var elections = d3.map(data, function(d){
          return d.name;
        });
        elections.forEach(function(k,v){
          this[k] = v;
        });

    d3.json(DATA_PATH + "us_states.json", function(error, json) {
        if (error) throw error;
        
        var subunits = topojson.object(json, json.objects.us_states);
        var projection = d3.geo.albersUsa()
                            .scale(map_scale)
                            .translate([width / 2, height / 2]);
        var path = d3.geo.path()
                            .projection(projection);
        svg_rev_demo.selectAll("path")
            .data(subunits.geometries)
            .enter()
            .append("path")
            .attr("class", function(d) { return "subunit " + d.id; })
            .attr("d", path)
            .attr("class", "land-boundary")
            .style("stroke", "#020084")
            .style("stroke-width", .5)
            .style("opacity", opacity)
            .style("fill", function(d) {
                if (d.properties.name == "District of Columbia") {
                        d3.select(this)
                            .style('fill', 'rgb(255,0,0)')
                            .style("stroke-width", .01)
                        var scale = 15;
                        d3.select(this)
                            .attr('transform', function (d) {
                                return "scale(" + scale + ") translate(" + 
                                    (1.0 * projection([-71, 36])[0] - scale * (path.centroid(d)[0])) / scale + 
                                    "," +
                                    (1.0 * projection([-71, 36])[1] - scale * (path.centroid(d)[1])) / scale + 
                                    ")";
                            });
                    }
                if (elections[d.properties.name]) {
                    return getStatesColor(elections, d.properties.name);
                }
                return 'rgb(0,0,0)'
            })
            .on('mouseover', function(d) {
                elector_num = elections[d.properties.name]['Elector_2016'];
                jpn_name = elections[d.properties.name]['JPN_expression'];
                demographics.style('opacity', 1.0);
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style("opacity", 1.0)
                    .style("stroke-width", function () {
                        if (d.properties.name == "District of Columbia") {
                            return 0.15
                        }
                        return 1.5
                    });
                state_name
                    .transition()
                    .duration(200)
                    .text(function (){
                        if (d.properties.name == "District of Columbia") {
                            return jpn_name + ' (' + d.properties.name + ')'
                        } else {
                            return jpn_name + '州 (' + d.properties.name + ')'
                        }
                    });
                election_num
                    .transition()
                    .duration(200)
                    .style('color', 'white')
                    .text('選挙人 ' + elector_num);

            })
            .on('click', function(d) {
                elector_num = elections[d.properties.name]['Elector_2016'];
                jpn_name = elections[d.properties.name]['JPN_expression'];
                d3.select(this)
                    .transition()
                    .duration(100)
                    .style("opacity", 1.0)
                    .style("stroke-width", function () {
                        if (d.properties.name == "District of Columbia") {
                            return 0.15
                        }
                        return 1.5
                    });
                
                state_name
                    .transition()
                    .duration(200)
                    .text(jpn_name + '州 (' + d.properties.name + ')');
                election_num
                    .transition()
                    .duration(200)
                    .style('color', 'white')
                    .text('選挙人 ' + elector_num);

            })
            .on('mouseout', function(d) {
              d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", opacity)
                .style("stroke-width", function () {
                        if (d.properties.name == "District of Columbia") {
                            return 0.05
                        }
                        return .5
                    });
            });
        var alaskaLines = {"type": "LineString", "coordinates": [
                    [-125, 30],
                    [-110, 30],
                    [-110, 23]
        ]};

        var hawaiiLines = {"type": "LineString", "coordinates": [
                    [-110, 28.5],
                    [-102, 28.5],
                    [-102, 23]
        ]};

        var alaskaLines = {"type": "LineString", "coordinates": [
                    [-125, 30],
                    [-110, 30],
                    [-110, 23]
        ]};

        var hawaiiLines = {"type": "LineString", "coordinates": [
                    [-110, 28.5],
                    [-102, 28.5],
                    [-102, 23]
        ]};

        var wahingtonLines = {"type": "LineString", "coordinates": [
                    [-77.08687602556878, 38.973472668305305],
                    [-72.60191393754911, 36.73243960414525]
        ]};

        var alaskaLine = svg_rev_demo.selectAll(".alaskaLine")
            .data([alaskaLines])
            .enter()
            .append("path")
            .attr({
                "class":"line",
                "d": path,
                "fill": "none",
                "stroke": "#222",
                "stroke-width": 2.5
            });

        var hawaiiLine = svg_rev_demo.selectAll(".hawaiiLine")
            .data([hawaiiLines])
            .enter()
            .append("path")
            .attr({
                "class":"line",
                "d": path,
                "fill": "none",
                "stroke": "#222",
                "stroke-width": 2.5
            });

        var wahingtonLine = svg_rev_demo.selectAll(".washingtonLine")
            .data([wahingtonLines])
            .enter()
            .append("path")
            .attr({
                "class":"line",
                "d": path,
                "fill": "none",
                "stroke": "#222",
                "stroke-width": 2.5
            });
    });
});

function getStatesColor (elections, name) {
    for (var i = 0; i < election_threshold.length; i++) {
        if (parseInt(elections[name]['Elector_2016']) <= election_threshold[i]) {
            return election_color(election_threshold[i])
        }
    }
}