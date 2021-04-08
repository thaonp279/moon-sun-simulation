//-------------------------------HORIZON VIEW---------------------------------------//

//horizon
const horizon = d3.select('#horizon')
    .attr('viewBox', "0 0 "+ w + ' ' + h)
    .attr('preserveAspectRatio', 'xMidYMax meet')

//sky
horizon.append('rect')
    .attr('width', w)
    .attr('height', hS)
    .attr('fill', 'url(#skyGradient)')

//moon
var moon = horizon
    .append('g')
    .attr('mask', 'url(#moonMask)')
    .attr('transform', 'translate(-100, 0)')

moon.selectAll('circle')
    .data(holes)
    .enter()
    .append('circle')
    .attr('r', d => d.r)
    .attr('fill', d => d.r=== radius? 'white': '#dddddd')
    .attr('cx', d=> d.cx)
    .attr('cy', d=> d.cy);

//sun
var sun = horizon
    .append('circle')
    .attr('r', radius)
    .attr('fill', 'url(#sunGradient)')
    .attr('id', 'sun')
    .attr('cx', -100)

//stars
var stars = horizon
    .append('g')
    .attr('mask', 'url(#starsMask)')

stars
    .selectAll('circle')
    .data(starsCoord)
    .enter()
    .append('circle')
    .attr('r', 1)
    .attr('cx', d => d.cx)
    .attr('cy', d => d.cy)
    .attr('fill', 'white')

//ground
var ground = horizon.append('rect')
    .attr('width', w)
    .attr('height', hG)
    .attr('fill', '#39D08F')
    .attr('x', 0)
    .attr('y', yG)    


//-------------------------------MOON VIEW---------------------------------------//

const moonView = d3.select('#moon-view')
    .attr('viewBox', "0 0 "+ alternateViewW + ' ' + h)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .style('background', '#e7d9ea')
    
//moon background underneath
moonView
    .append('circle')
    .attr('r', bigMoonR+3)
    .attr('cx', bigMoonX)
    .attr('cy', bigMoonY)
    .attr('fill', 'black')

//moon
var bigMoon = moonView
    .append('g')
    .attr('mask', 'url(#bigMoonMask)')
    .attr('transform', 'translate('+bigMoonX+','+bigMoonY+')')

bigMoon
    .selectAll('circle')
    .data(holes)
    .enter()
    .append('circle')
    .attr('r', d => d.r*(bigMoonR / radius))
    .attr('fill', d => d.r=== radius? 'white': '#dddddd')
    .attr('cx', d=> d.cx*(bigMoonR / radius))
    .attr('cy', d=> d.cy*(bigMoonR / radius));

// moon illumination fraction under big moon
var moonFraction = moonView
    .append('text')
    .attr('y', bigMoonY + bigMoonR + 30)
    .attr('x', bigMoonX - bigMoonR)

//details about the moon rise, set, next full moon, next new moon
var moonDates = moonView
    .append('g')
    .attr('transform', 'translate('+detailsX+','+detailsY+')')




//moonset
const detailsMargin = 30;
var moonSet = moonDates.append('g');

moonSet
    .append('use')
    .attr('href', '#half-moon')

moonSet
    .append('use')
    .attr('href', '#arrow')
    
var moonSetTime = moonSet
    .append('text')
    .attr('font-size', '10px')
    .attr('x', 20);

//moonrise

var moonRise = moonDates
    .append('g')
    .attr('transform', 'translate(0, 30)')

moonRise
    .append('use')
    .attr('href', '#half-moon')

moonRise
    .append('use')
    .attr('href', '#arrow')
    .attr('transform', 'rotate(180)')
    .attr('y', 4)

var moonRiseTime = moonRise
    .append('text')
    .attr('font-size', '10px')
    .attr('x', 20)

//full moon
var fullMoon = moonDates
    .append('g')
    .attr('transform', 'translate(0, 56)')
    
    fullMoon
    .append('circle')
    .attr('r', 8)
    .attr('fill', 'white')
    .attr('stroke', 'black')

var fullMoonTime = fullMoon
    .append('text')
    .attr('font-size', '10px')
    .attr('x', 20)
    .attr('y', 4)

//new moon
var newMoon = moonDates
    .append('g')
    .attr('transform', 'translate(0, 86)')

    newMoon
    .append('circle')
    .attr('r', 8)
    .attr('fill', 'black')
    .attr('stroke', 'black')

var newMoonTime = newMoon
    .append('text')
    .attr('font-size', '10px')
    .attr('x', 20)
    .attr('y', 4)

//-------------------------------PLANET VIEW---------------------------------------//


const planetView = d3.select('#planet-view')
.attr('viewBox', "0 0 "+ alternateViewW + ' ' + h)
.attr('preserveAspectRatio', 'xMinYMin meet')
.style('background', '#110133')

var orbit = planetView
.append('circle')
.attr('r', moonOrbitR)
.attr('stroke', 'white')
.attr('stroke-dasharray', '5,5')
.attr('fill', 'none')
.attr('cx', earthX)
.attr('cy', planetY)

planetView
.append('circle')
.attr('r', bigSunR)
.attr('cy', planetY)
.attr('cx', bigSunX)
.attr('fill', 'url(#sunGradient)')


var earthG = planetView
.append('g')
.attr('transform', 'translate('+earthX+','+planetY+')')


var earth = earthG
.append('g')
.attr('mask', 'url(#planetMask)')

earth
.append('circle')
.attr('r', earthR)
.attr('fill', 'blue')

//icon from freepik
var lonelyMan = earthG
.append('image')
.attr('href', 'dancing.svg')
.attr('width', lonelyManWH)
.attr('height', lonelyManWH)
.attr('x', -lonelyManWH/2)
.attr('y', -earthR-lonelyManWH)


var tinyMoonG = planetView
.append('g')
.attr('transform', 'translate(102,243)')

//tiny moon black background
tinyMoonG
.append('circle')
.attr('r', tinyMoonR)
.attr('fill', 'black')


var tinyMoon = tinyMoonG
.append('g')
.attr('mask', 'url(#planetMask)')

tinyMoon
.append('circle')
.attr('r', tinyMoonR)
.attr('fill', 'white')

var visLine = tinyMoonG
.append('line')
.attr('x1', 0)
.attr('x2', 0)
.attr('y1', -tinyMoonR)
.attr('y2', tinyMoonR)
.attr('stroke', 'black')
.attr('stroke-dasharray', '2,1')




