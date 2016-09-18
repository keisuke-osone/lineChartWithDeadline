var path = d3.geo.path()
var years = [1992, 1996, 2000, 2004, 2008, 2012];
var threshold = [0, 1, 6, 5];
var opacity = .5
var demographic_num = d3.select('#demographic_num');
var demo_color = d3.scale.linear().domain([0,55]).range(["#fff", "#00f"]);
var repu_color = d3.scale.linear().domain([0,55]).range(["#fff", "#f00"]);
var ne_color = d3.scale.linear().domain([0,55]).range(["#fff", "#333"]);

var svg_elec = d3.select("#rev_demo_map")
        .append("svg")
        .attr("width", width)
        .attr("height", rev_demo_height);

var legend_rev_demo = d3.select("#rev_demo_map")
        .append("div")
        .attr('id', 'legend_rev_demo')
        .selectAll('div')
        .data(threshold)
        .enter()
        .append('div')
        .attr('class', 'flex_box');

legend_rev_demo.append('div')
        .attr('class', 'legend_color')
        .style('opacity', opacity)
        .style('background-color', function(d, i) {
            if (d == 0) {
                return 'rgb(0,0,255)'
            } else if (d == 1) {
                return 'rgb(100,100,255)'
            } else if (d == 6){
                return 'rgb(255,0,0)'
            } else if (d == 5){
                return 'rgb(255,100,100)'
            }
        });

legend_rev_demo.append('div')
        .attr('class', 'legend_text')
        .style('padding', padding + 'px')
        .text(function(d, i) {
            if (d == 0) {
                return '民主党がすべて勝利';
            }
            if (d == 1) {
                return '民主党が5回勝利';
            }
            if (d == 5) {
                return '共和党が5回勝利';
            }
            if (d == 6) {
                return '共和党がすべて勝利';
            }
        });

var demographics_rev_demo = d3.select("#rev_demo_map")
        .append("div")
        .attr('id', 'demographics_rev_area')
        .append("div")
        .style('opacity', 0)
        .attr('id', 'demographics_rev_demo');

var state_name_rev_demo = demographics_rev_demo
        .append('div')
        .attr('id', 'state_name_rev_demo');

var election_num_rev_demo = demographics_rev_demo
        .append('div')
        .attr('id', 'election_num_rev_demo');

demographics_rev_demo
    .append('div')
    .attr('id', 'history_area')
    .attr('class', 'flex_box')
    .selectAll('div')
    .data(years)
    .enter()
    .append('div')
    .attr('class', 'histories')
    .attr('id', function (d) {
        return 'year_' + d;
    })
    .text(function(d) { return d; });
var projection = d3.geo.albersUsa()
                            .scale(map_scale)
                            .translate([width / 2, height / 2]);
d3.csv(DATA_PATH + "presidential_election.csv", function(error, data) {
    if (error) throw error;
        var elections = d3.map(data, function(d){
          return d.name;
        });
        elections.forEach(function(k,v){
          this[k] = v;
        });
    d3.json(DATA_PATH + "us_states.json", function(error, json) {
        if (error) throw error;
        var subunits = topojson.object(json, json.objects.us_states);
        var path = d3.geo.path()
                            .projection(projection);

        svg_elec.selectAll("path")
            .data(subunits.geometries)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "land-boundary")
            .style("stroke", "#000")
            .style("stroke-width", .5)
            .style("opacity", opacity)
            .style("fill", function(d) {
                if (elections[d.properties.name]) {
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
                    total_win_r = elections[d.properties.name]['Total_Rwin'];
                    total_win_d = elections[d.properties.name]['Total_Dwin'];
                    if (total_win_d == 6) {
                        return 'rgb(0,0,255)'
                    } else if (total_win_d == 5) {
                        return 'rgb(100,100,255)'
                    } else if (total_win_r == 6){
                        return 'rgb(255,0,0)'
                    } else if (total_win_r == 5){
                        return 'rgb(255,100,100)'
                    } else {
                        return 'rgb(200,200,200)'
                    }
                }
                return 'rgb(0,0,0)'
            })
            .on('mouseover', function(d) {
                elector_num = elections[d.properties.name]['Elector_2016'];
                jpn_name = elections[d.properties.name]['JPN_expression'];
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1.0)
                    .style("stroke-width", function () {
                        if (d.properties.name == "District of Columbia") {
                            return 0.15
                        }
                        return 1.5
                    });
                demographics_rev_demo.style('opacity', 1.0);
                state_name_rev_demo
                    .transition()
                    .duration(200)
                    .style('color', 'white')
                    .text(function (){
                        if (d.properties.name == "District of Columbia") {
                            return jpn_name + ' (' + d.properties.name + ')'
                        } else {
                            return jpn_name + '州 (' + d.properties.name + ')'
                        }
                    });
                
                election_num_rev_demo
                    .transition()
                    .duration(200)
                    .style('color', function () {
                        if (elector_num < 20) {
                            return 'black';
                        }
                        return 'white';
                    })
                    .style('background-color', function () {
                        total_win_r = elections[d.properties.name]['Total_Rwin'];
                        total_win_d = elections[d.properties.name]['Total_Dwin'];
                        if (total_win_r >= 5) {
                            return repu_color(elector_num);
                        } else if (total_win_d >= 5) {
                            return demo_color(elector_num);
                        } else {
                            return ne_color(elector_num);
                        }
                    })
                    .text('選挙人 ' + elector_num);

                if (elections[d.properties.name]) {
                    total_win_d = elections[d.properties.name]['Total_Dwin'];
                    if (elections[d.properties.name]['1992_Dwin'] == 1) {
                        d3.select('#year_1992')
                            .transition()
                            .duration(200)
                            .style('background-color', 'blue');
                    } else {
                        d3.select('#year_1992')
                        .transition()
                        .duration(200)
                        .style('background-color', 'red');
                    }
                    if (elections[d.properties.name]['1996_Dwin'] == 1) {
                        d3.select('#year_1996')
                        .transition()
                        .duration(200)
                        .style('background-color', 'blue');
                    } else {
                        d3.select('#year_1996')
                            .transition()
                            .duration(200)
                            .style('background-color', 'red');
                    }
                    if (elections[d.properties.name]['2000_Dwin'] == 1) {
                        d3.select('#year_2000')
                            .transition()
                            .duration(200)
                            .style('background-color', 'blue');
                    } else {
                        d3.select('#year_2000')
                            .transition()
                            .duration(200)
                            .style('background-color', 'red');
                    }
                    if (elections[d.properties.name]['2004_Dwin'] == 1) {
                        d3.select('#year_2004')
                            .transition()
                            .duration(200)
                            .style('background-color', 'blue');
                    } else {
                        d3.select('#year_2004')
                            .transition()
                            .duration(200)
                            .style('background-color', 'red');
                    }
                    if (elections[d.properties.name]['2008_Dwin'] == 1) {
                        d3.select('#year_2008')
                            .transition()
                            .duration(200)
                            .style('background-color', 'blue');
                    } else {
                        d3.select('#year_2008')
                            .transition()
                            .duration(200)
                            .style('background-color', 'red');
                    }if (elections[d.properties.name]['2012_Dwin'] == 1) {
                        d3.select('#year_2012')
                            .transition()
                            .duration(200)
                            .style('background-color', 'blue');
                    } else {
                        d3.select('#year_2012')
                            .transition()
                            .duration(200)
                            .style('background-color', 'red');
                    }
                }
            })
            .on('click', function(d) {
                elector_num = elections[d.properties.name]['Elector_2016'];
                jpn_name = elections[d.properties.name]['JPN_expression'];
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1.0)
                    .style("stroke-width", function () {
                        if (d.properties.name == "District of Columbia") {
                            return 0.15
                        }
                        return 1.5
                    });
                state_name_rev_demo
                    .transition()
                    .duration(200)
                    .style('color', 'white')
                    .text(jpn_name + '州 (' + d.properties.name + ')');
                
                election_num_rev_demo
                    .transition()
                    .duration(200)
                    .style('color', function () {
                        if (elector_num < 20) {
                            return 'black';
                        }
                        return 'white';
                    })
                    .style('background-color', function () {
                        total_win_r = elections[d.properties.name]['Total_Rwin'];
                        total_win_d = elections[d.properties.name]['Total_Dwin'];
                        if (total_win_r >= 5) {
                            return repu_color(elector_num);
                        } else if (total_win_d >= 5) {
                            return demo_color(elector_num);
                        } else {
                            return ne_color(elector_num);
                        }
                    })
                    .text('選挙人 ' + elector_num);

                if (elections[d.properties.name]) {
                    total_win_d = elections[d.properties.name]['Total_Dwin'];
                    if (elections[d.properties.name]['1992_Dwin'] == 1) {
                        d3.select('#year_1992')
                            .transition()
                            .duration(200)
                            .style('background-color', 'blue');
                    } else {
                        d3.select('#year_1992')
                        .transition()
                        .duration(200)
                        .style('background-color', 'red');
                    }
                    if (elections[d.properties.name]['1996_Dwin'] == 1) {
                        d3.select('#year_1996')
                        .transition()
                        .duration(200)
                        .style('background-color', 'blue');
                    } else {
                        d3.select('#year_1996')
                            .transition()
                            .duration(200)
                            .style('background-color', 'red');
                    }
                    if (elections[d.properties.name]['2000_Dwin'] == 1) {
                        d3.select('#year_2000')
                            .transition()
                            .duration(200)
                            .style('background-color', 'blue');
                    } else {
                        d3.select('#year_2000')
                            .transition()
                            .duration(200)
                            .style('background-color', 'red');
                    }
                    if (elections[d.properties.name]['2004_Dwin'] == 1) {
                        d3.select('#year_2004')
                            .transition()
                            .duration(200)
                            .style('background-color', 'blue');
                    } else {
                        d3.select('#year_2004')
                            .transition()
                            .duration(200)
                            .style('background-color', 'red');
                    }
                    if (elections[d.properties.name]['2008_Dwin'] == 1) {
                        d3.select('#year_2008')
                            .transition()
                            .duration(200)
                            .style('background-color', 'blue');
                    } else {
                        d3.select('#year_2008')
                            .transition()
                            .duration(200)
                            .style('background-color', 'red');
                    }if (elections[d.properties.name]['2012_Dwin'] == 1) {
                        d3.select('#year_2012')
                            .transition()
                            .duration(200)
                            .style('background-color', 'blue');
                    } else {
                        d3.select('#year_2012')
                            .transition()
                            .duration(200)
                            .style('background-color', 'red');
                    }
                }
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

        var wahingtonLines = {"type": "LineString", "coordinates": [
                    [-77.08687602556878, 38.973472668305305],
                    [-72.60191393754911, 36.73243960414525]
        ]};

        var alaskaLine = svg_elec.selectAll(".alaskaLine")
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

        var hawaiiLine = svg_elec.selectAll(".hawaiiLine")
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

        var wahingtonLine = svg_elec.selectAll(".washingtonLine")
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