
import countryColor from './countryColor.mjs';

var width = 225,
height = 225,
sens = 0.25,
focused,
option,
p;

//Setting projection

var projection = d3.geo.orthographic()
.scale(100)
.rotate([0, 0])
.translate([width / 2, height / 2])
.clipAngle(90);

var path = d3.geo.path()
.projection(projection);

//SVG container

var svg = d3.select("body").append("svg")
.attr("width", width)
.attr("height", height);

//Adding water

svg.append("path")
.datum({type: "Sphere"})
.attr("class", "water")
.attr("d", path);

var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip"),
countryList = d3.select("body").append("select").attr("name", "countries");


queue()
.defer(d3.json, "./custom.geo.json")
.await(ready);

//Main function

function ready(error, world, countryData) {

    var countryById = {},
    countries = world.features;

    //Adding countries to select

    countries.forEach(function(d) {
    countryById[d.properties.iso_n3] = d.properties.name;
    option = countryList.append("option");
    option.text(d.properties.name);
    option.property("value", d.properties.iso_n3);
    });

    //Drawing countries on the globe

    var world = svg.selectAll("path.land")
    .data(countries)
    .enter().append("path")
    .attr("class", "land")
    .attr("d", path)

    //Drag event
/*
    .call(d3.behavior.drag()
    .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
    .on("drag", function() {
        var rotate = projection.rotate();
        projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
        svg.selectAll("path.land").attr("d", path);
        svg.selectAll(".focused").classed("focused", focused = false);
    }))

    //Mouse events
    
    .on("mouseover", function(d) {
    countryTooltip.text(countryById[d.id])
    .style("left", (d3.event.pageX + 7) + "px")
    .style("top", (d3.event.pageY - 15) + "px")
    .style("display", "block")
    .style("opacity", 1);
    })
    .on("mouseout", function(d) {
    countryTooltip.style("opacity", 0)
    .style("display", "none");
    })
    .on("mousemove", function(d) {
    countryTooltip.style("left", (d3.event.pageX + 7) + "px")
    .style("top", (d3.event.pageY - 15) + "px");
    });

    //Country focus on option select

    d3.select("select").on("change", function() {
    var rotate = projection.rotate(),
    focusedCountry = country(countries, this),
    p = d3.geo.centroid(focusedCountry);

    svg.selectAll(".focused").classed("focused", focused = false);

    //Globe rotating

    
    });
*/
    function country(cnt, sel) { 
    for(var i = 0, l = cnt.length; i < l; i++) {
        if(cnt[i].properties.name == sel) {return cnt[i];}
    }
    };

    

    // Twitch listening stuff
    var twitch = window.Twitch.ext;
    const body = document.querySelector('body');
    twitch.listen('broadcast', function (target, contentType, payload) {


        twitch.rig.log('Globe recieved broadcast: ' + payload);
        const jsonPayload = JSON.parse(payload);
        console.log(countryColor[jsonPayload.country_id].name);
        
        let fadeTimer;
        let rotate = projection.rotate();
        let focusedCountry = country(countries, countryColor[jsonPayload.country_id].name);
        console.log(focusedCountry);
        p = d3.geo.centroid(focusedCountry);
        console.log("p: ", p);
        if(focusedCountry){
            body.classList.add('opaque');
            (function transition() 
        {
        console.log("Transition start...");
        d3.transition()
        .duration(2500)
        .tween("rotate", function() {
            var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
            return function(t) {
            projection.rotate(r(t));
            svg.selectAll("path").attr("d", path)
            .classed("focused", function(d, i) {
                if(d.type == "Sphere") {return false;}
                if(d.properties.name == focusedCountry.properties.name)
                {
                    return (focused = d)
                }
                else
                {
                    return false; 
                }
            });
            };
        })
        })();
        }
        
        svg.selectAll(".focused").classed("focused", focused = false);

        fadeTimer = setTimeout(() => {
            body.classList.remove('opaque');
        }, 5000);

    });

};


