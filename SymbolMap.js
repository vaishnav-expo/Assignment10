var width = 960,
    height = 500;

var radius = d3.scale.sqrt()
    .domain([0, 10000])
    .range([0, 10]);

var path = d3.geo.path();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

queue()
    .defer(d3.json, "us.json")
    .defer(d3.json, "birthscitycentroid.json")
    .defer(d3.csv, "population.csv")
    .await(ready);

function ready(error, us, centroid, data) {
    if (error) throw error;

    //Moves selction to front
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    //Moves selction to back
    d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

    svg.append("path")
        .attr("class", "states")
        .datum(topojson.feature(us, us.objects.counties))
        .attr("d", path);


    var sortData = [];

    data.forEach((i,k) => {
        sortData[k] = +i["BIRTHS2019"];
    })

    sortData.sort(function(a, b) { return b-a; });


    var toppops = [];

    for(let i=0;i<6;i++){
        toppops[i] = sortData[i];
    }

    svg.selectAll(".symbol")
        .data(centroid.features.sort(function(a, b) { return b.properties.births - a.properties.births; }))
        .enter().append("path")
        .attr("class", "symbol")
        .attr("d", path.pointRadius(function(d) { return radius(d.properties.births); }))
        .on("mouseover", function(d) {
            var sel = d3.select(this);
            d3.select("path");
            sel.moveToFront();

            d3.select(this).transition().duration(300).style({'opacity': 1, 'stroke': 'black', 'stroke-width': 1.5});
            div.transition().duration(300)
                .style("opacity", 1)
            div.text(d.properties.name + ": " + d.properties.births)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px");
        })
        .on("mouseout", function() {
            var sel = d3.select(".tooltip");
            sel.moveToBack();
            d3.select(this)
                .transition().duration(300)
                .style({'opacity': 1, 'stroke': 'white', 'stroke-width': 1});
            div.transition().duration(300)
                .style("opacity", 0);
        });
}