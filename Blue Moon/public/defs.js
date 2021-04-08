var defs = d3.select('#horizon').append('defs');

//-------------------------------SHAPE DIMENSIONS---------------------------------------//

//horizon dimension
const w = 600, h = 225;

//ground
var hG = h/9, yG = h-hG;

//sky
const hS = h - hG;

//moon
const radius = h/10, holes = [
    {cx: 0, cy: 0, r: radius},
    {cx: -8, cy: -8, r: 6},
    {cx: -16, cy: -6, r: 2},
    {cx: -14, cy: 1, r: 3},
    {cx: 8, cy: -10, r: 3},
    {cx: 10, cy: 12, r: 2.5},
    {cx: 3, cy: 15, r: 3.5}
]

//stars
var starsCoord = [];

for (i=0; i< 200; i++) {
    let cx = Math.random() * w;
    let cy = Math.random() * h*0.8;
    starsCoord.push({cx, cy})
}

//---moon-view
//big moon dimension
const alternateViewW = w/2, bigMoonX = 80, bigMoonY = h/2.5, bigMoonR = radius*2;

//details about rise, set section
const detailsX = bigMoonX*2, detailsY = bigMoonY/1.5;

//---planet-view
//general alignment
const planetY = h/2;
//sun
const bigSunR = 100, bigSunX = -50;

//earth
const earthX = 175, earthR = 25;

//moon
const moonOrbitR = 75, tinyMoonR = 10, moonStartX = earthX - moonOrbitR, moonStartY = planetY - moonOrbitR;

//lonelyMan :(
const lonelyManWH = 20;

//earth designed by Good Ware
const earthPaths = [
    "M216.64,322.72c-17.519-1.91-33.625-10.507-44.96-24c-5.54-9.96-15.682-16.501-27.04-17.44c-7.522,0.308-14.498,4.016-18.96,10.08c-12.96,15.28-31.52,26.8-43.28,26.8c-5.04,0-11.12-2.16-11.76-12.32c-0.402-16.341-4.046-32.439-10.72-47.36l-1.76-4.56c-3.71-8.176-3.079-17.667,1.68-25.28c5.941-7.869,15.346-12.348,25.2-12c10.8,0,14.8-8,17.92-16l2.72-6.88l6.16,0.72h1.36c4.584-0.358,9.008-1.842,12.88-4.32c7.421-10.121,19.472-15.785,32-15.04h2.32h4.64l2.08,4.16c2.08,4.16,5.52,9.2,9.92,9.2c5.68,0,9.68-8,9.84-8.56v-0.48c2.693-8,6.375-15.633,10.96-22.72l8.8-12.08l5.12,14.56c1.923,6.251,3.183,12.686,3.76,19.2c4.96,43.36,11.6,48.96,20.88,56.72c4.998,3.855,9.417,8.408,13.12,13.52c6.498,10.06,8.197,22.484,4.64,33.92c-3.528,15.834-13.31,29.569-27.12,38.08C223.772,322.1,220.218,322.811,216.64,322.72L216.64,322.72z",
    "M308,352.64c-5.016,0.388-9.839-2.009-12.56-6.24l-3.28-5.36l18-18l-2-19.36h17.36c8.204-6.753,15.684-14.34,22.32-22.64c1.227-2.071,2.675-4.002,4.32-5.76l7.2-8l5.44,9.04c1.107,1.92,1.993,3.96,2.64,6.08c8,24-46.08,65.6-48,67.36l-1.28,1.04l-1.6,0.4C313.781,352.049,310.904,352.533,308,352.64L308,352.64z",
    "M236.72,128.64c-16.96,0-35.68-19.2-36.4-20c-4.041,3.358-9.071,5.297-14.32,5.52c-13.84,0-22.32-16-23.2-18c-1.2,0-26.64-1.44-32-12.88c-1.994-5.854-0.437-12.332,4-16.64c4.66-7.039,12.518-11.298,20.96-11.36c11.984,1.235,23.229,6.38,32,14.64h1.6c16,0,27.28,3.68,33.04,10.56c3.445,4.138,4.933,9.564,4.08,14.88c0.96,0,25.28,3.6,29.28,14.16c1.16,4.559-0.395,9.379-4,12.4C248.047,126.354,242.5,128.833,236.72,128.64z"
]
//-------------------------------GRADIENTS---------------------------------------//

//sky
var skyGradient = defs
    .append('linearGradient')
    .attr('id', 'skyGradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')

var bottomSky = skyGradient
    .append('stop')
    .attr('offset', '0%')
    .style('stop-color', "#3662dd")

var topSky = skyGradient
    .append('stop')
    .attr('offset', '100%')
    .style('stop-color', "#00d4ff")

//sun
var sunGradient = defs
    .append('radialGradient')
    .attr('id', 'sunGradient')
    .attr('cx', '50%')
    .attr('cy', '50%')
    .attr('r', '60%')
    .attr('fx', '50%')
    .attr('fy', '50%')

var innerSun = sunGradient.append('stop')
    .attr('offset', '0%')
    .style('stop-color', '#ffed29')

var outerSun = sunGradient.append('stop')
    .attr('offset', '90%')
    .style('stop-color', '#f5c134')

//stars
var starsGradient = defs
.append('linearGradient')
.attr('id', 'starsGradient')
.attr('x1', '0%')
.attr('y1', '0%')
.attr('x2', '0%')
.attr('y2', '80%')

var topStars = starsGradient
.append('stop')
.attr('offset', '0%')
.style('stop-color', 'black')

var bottomStars = starsGradient
.append('stop')
.attr('offset', '100%')
.style('stop-color', 'black')


//-------------------------------MASKS---------------------------------------//
//stars in horizon view
var starsMask = defs
    .append('mask')
    .attr('id', 'starsMask')

var visibleStars = starsMask
    .append('rect')
    .attr('width', w)
    .attr('height', h)
    .attr('fill', 'url(#starsGradient)')

//moon in #horizon view
var moonMask = defs
    .append('mask')
    .attr('id', 'moonMask')
    .attr('width', 100)
    .attr('height', 100)

var moonShadeRect = moonMask
    .append('rect')
    .attr('x', -50)
    .attr('y', -50)
    .attr('width', 100)
    .attr('height', 100)
    .attr('fill', 'black')

var moonShadeCirc = moonMask
    .append('circle')
    .attr('r', 22.5)
    .attr('cy', 0)
    .attr('fill', 'white')
    .attr('cx', 0)

//moon in #moon-view
var bigMoonMask = defs
    .append('mask')
    .attr('id', 'bigMoonMask')
    .attr('width', 100)
    .attr('height', 100)

var bigMoonShadeRect = bigMoonMask
    .append('rect')
    .attr('x', -50)
    .attr('y', -50)
    .attr('width', 100)
    .attr('height', 100)
    .attr('fill', '#5C5C5C')

var bigMoonShadeCirc = bigMoonMask
    .append('circle')
    .attr('r', 45)
    .attr('cy', 0)
    .attr('fill', 'white')
    .attr('cx', 0)

//moon & earth in planet view
var planetMask = defs
.append('mask')
.attr('id', 'planetMask')

planetMask
    .append('rect')
    .attr('width', 50)
    .attr('height', 100)
    .attr('fill', 'white')
    .attr('x', -50)
    .attr('y', -50)

planetMask
    .append('rect')
    .attr('width', 50)
    .attr('height', 100)
    .attr('fill', 'grey')
    .attr('y', -50)

    
//-------------------------------SHAPES---------------------------------------//
var halfMoon = defs
    .append('g')
    .attr('id', 'half-moon')

halfMoon
   .append('circle')
   .attr('r', 8)
   .attr('fill', 'white')
   .attr('stroke', 'black')

halfMoon
   .append('rect')
   .attr('x', -8)
   .attr('y', 2)
   .attr('width', 16)
   .attr('height', 8)
   .attr('fill', '#e7d9ea')

halfMoon
   .append('line')
   .attr('x1', -12)
   .attr('y1', 2)
   .attr('x2', 12)
   .attr('y2', 2)
   .attr('stroke', 'black')


//arrow
var arrow = defs
    .append('g')
    .attr('id', 'arrow')

arrow
    .append('line')
    .attr('x1', -4)
    .attr('y1', -4)
    .attr('x2', 0.5)
    .attr('y2', 0.5)
    .attr('stroke', 'black')
    .attr('stroke-width', '1.5px')

arrow
    .append('line')
    .attr('x1', 4)
    .attr('y1', -4)
    .attr('x2', 0)
    .attr('y2', 0)
    .attr('stroke', 'black')
    .attr('stroke-width', '1.5px')