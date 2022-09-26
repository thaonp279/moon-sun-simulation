import * as d3 from "d3";
import * as SunCalc from "suncalc";
import './style.css'
import {moon, sun, ground, moonFraction, moonRiseTime, moonSetTime, fullMoonTime, newMoonTime, tinyMoonG, visLine, lonelyMan} from './shapes';
import {hG, h, w, topSky, bottomSky, topStars, moonShadeCirc, radius, bigMoonShadeCirc, bigMoonR, 
    bigMoonShadeRect, moonShadeRect, moonOrbitR, moonStartX, moonStartY} from './defs'
const milsecPerDay = 24*60*60*1000;

(async () => {

    //------------------------------------INITIALIZATION--------------------------------------------//
    const timerStartAt = new Date();
    const time0 = new Date(new Date().setHours(0,0,0,0));
    var startFastForward: Date;

    //locate user
    const loc: GeolocationPosition = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));

    //time & place - default: indochina
    const lat = loc? loc.coords.latitude: 10.803243;
    const lng = loc? loc.coords.longitude: 106.727914;


    var realReq: number, fastReq: number;

    //initial render
    playReal();

    //events initialization
    const fastButton = document.getElementById('fast');
    const normalButton = document.getElementById('real');

    fastButton?.addEventListener('click', playFastForward);
    normalButton?.addEventListener('click', playReal);

    //------------------------------------ANIMATION REQUESTS--------------------------------------------//
    //---call animation requests
    function playReal(){
        realReq = window.requestAnimationFrame(realSpeed);
        window.cancelAnimationFrame(fastReq);
        //make fastforwarding icons invisible
        d3.selectAll('.playing')
        .style('display', 'none')

        //make play button invisible, ff visible
        d3.select('#real')
            .style('display', 'none')
        d3.select('#fast')
            .style('display', 'block')
    }

    function playFastForward(){
        startFastForward = new Date();
        fastReq = window.requestAnimationFrame(fastForward);
        window.cancelAnimationFrame(realReq);

        //make fastforwarding icons visible
        d3.selectAll('.playing')
        .style('display', 'block')
    
        //make ff button invisible, play visible
        d3.select('#fast')
            .style('display', 'none')
        d3.select('#real')
            .style('display', 'block')
    }

    //---animation loop functions
    function realSpeed(timeStamp: DOMHighResTimeStamp){
        const time = timerStartAt.getTime() + timeStamp;
        animate(time);
        realReq = window.requestAnimationFrame(realSpeed);
    }

    function fastForward(timeStamp: DOMHighResTimeStamp){
        const frameTimestep = 5000;
        const time = (timerStartAt.getTime() - startFastForward.getTime() + timeStamp)*frameTimestep + time0.getTime();
        animate(time);
        fastReq = window.requestAnimationFrame(fastForward);
    }

    //---all functions for animation in horizon view, moon view and planet view
    var animate = (time: number) => {
        animateSunMoon(time);
        displayTime(time);
        colorHorizon(time);
        updateMoonShadow(time);
        updateMoonDetails(time);
        moonOrbit(time);
        lonelyManOrbit(time);
    }

    //------------------------------------HORIZON FUNCTIONS--------------------------------------------//
    function displayTime(time: number): void {
        /** update time on screen */
        const dateTime = new Date(time);
        const place = dateTime.toString().match(/\((.+)\)/);
        (document.getElementById('time') as HTMLElement).textContent = dateTime.toLocaleTimeString();
        (document.getElementById('date') as HTMLElement).textContent = dateTime.toDateString().split(' ').slice(1, 3).join(' ');
        (document.getElementById('place') as HTMLElement).textContent = place? place[1]: '';
    }
    function animateSunMoon(time: number): void {
        /** simulate sun moon across screen */
        const sunCoords = getPosition(time, 'sun');
        const moonCoords = getPosition(time, 'moon');
        
        moon
            .attr('transform', 'translate('+moonCoords.x+','+moonCoords.y+')');
        
        sun
            .attr('cx', sunCoords.x)
            .attr('cy', sunCoords.y)
    }

    
    function getPosition(now: number, object: 'moon'|'sun'): {x: number, y: number} {
        /*
        if (isNaN(now)) {
            now = Date.parse(now);
        }
        */

        const phases = findRiseSetPhase(now, object);
        
        //ellipse dimension:
        const paddingX = hG, paddingY = hG;
        const minor = h - paddingY, major = (w - 2*paddingX)/2;

        //calculate radian
        const start = phases[0].time.getTime(), end = phases[1].time.getTime();
        var radian = Math.PI * (now - start)/(end - start);
        //move object below horizon after sunset/moonset, invert by adding 1 pi
        if (phases[0].type === 'set') radian += Math.PI;

        //coords
        var x = paddingX + major - major * Math.cos(radian);
        var y = paddingY + minor - minor * Math.sin(radian);

        return {x, y}
    }

    interface RiseSetTime {
        time: Date;
        type: 'now' | 'rise' | 'set';
    }

    function findRiseSetPhase(now: number, object: 'moon'|'sun'): RiseSetTime[] {
        var data: RiseSetTime[] = [{time: new Date(now), type: 'now'}];
        //SunCalc provides rise, set time in the current date. 
        //This finds rise, set time for current rise-set phase (possibly a day before or after)
        
        for (let i=-1; i<=1; i++) {
            let t = new Date(now + i * milsecPerDay);
            
            let rise: Date, set: Date;
            if (object === 'moon') {
                rise = SunCalc.getMoonTimes(t, lat, lng).rise;
                set = SunCalc.getMoonTimes(t, lat, lng).set;
            } else {
                rise = SunCalc.getTimes(t, lat, lng).sunrise;
                set = SunCalc.getTimes(t, lat, lng).sunset;
            }
            if (rise) data.push({time: rise, type: 'rise'});
            if (set) data.push({time: set, type: 'set'});
        }

        //locate 2 phases before and after current time
        data.sort((a, b) => a.time.getTime() - b.time.getTime());
        var phases: RiseSetTime[] = [];

        for (let i = 0; i<= data.length; i++) {
            if (data[i].type == 'now') {
                phases.push(data[i-1]);
                phases.push(data[i+1]);
                break;
            }
        }
        
        return phases;
    }

    //---update color of horizon depending on time
    function colorHorizon(time: number): void {
        let dateTime = new Date(time);
        //yesterday
        var yesterday = dateTime.getTime() - milsecPerDay;
        var lastNight = SunCalc.getTimes(new Date(yesterday), lat, lng).night.getTime();
        
        //today
        var times = SunCalc.getTimes(dateTime, lat, lng);
        var timesNum: {[index: string]: number} = {};
        (Object.keys(times) as Array<keyof SunCalc.GetTimesResult>).forEach(t => timesNum[t.toString()] = times[t].getTime()); // convert to time ms
        var {nightEnd, sunrise, goldenHourEnd, solarNoon, goldenHour, sunset, night} = timesNum;

        //tomorrow
        var tomorrow = dateTime.getTime() + milsecPerDay;
        var nextNightEnd = SunCalc.getTimes(new Date(tomorrow), lat, lng).nightEnd.getTime();

        //midnights
        var lastMidNight = new Date((nightEnd - lastNight) / 2 + lastNight);
        var midnight = new Date((nextNightEnd - night) / 2 + night);

        //domains for scales
        var horizonDomain = [lastNight, nightEnd, sunrise, goldenHourEnd, solarNoon, goldenHour, sunset, night, nextNightEnd];
        var starsDomain = [lastNight, lastMidNight, nightEnd, night, midnight, nextNightEnd];

        //sky color
        var topScale = d3.scaleTime()
        .domain(horizonDomain)
        .range(["#032881", "#032881","#ba8816", "#00d4ff", "#00d4ff", "#00d4ff", "#ba8816", "#032881", "#032881"])

        var bottomScale = d3.scaleTime()
        .domain(horizonDomain)
        .range(["black", "black", "#ad3307", "#3662dd", "#3662dd", "#3662dd", "#ad3307", "black", "black"])

        topSky
        .style('stop-color', topScale(dateTime));

        bottomSky
        .style('stop-color', bottomScale(dateTime));

        //ground color
        var groundScale = d3.scaleTime()
        .domain([lastNight, nightEnd, goldenHourEnd, goldenHour, night, nextNightEnd])
        .range(['black', 'black', '#39D08F','#39D08F','black', 'black'])

        ground.attr('fill', groundScale(dateTime))

        //star color
        var starsScale = d3.scaleTime()
        .domain(starsDomain)
        .range(['black', 'white', 'black', 'black', 'white', 'black',])

        topStars
        .style('stop-color', starsScale(dateTime))
    }

    //---update moon shape
    function updateMoonShadow(time: number): void{
        //moon phase
        const f = SunCalc.getMoonIllumination(new Date(time)).phase;
        //moon shade mask radius
        const shadeRScale = 2;
        const shadeRPct = shadeRScale/4 * (Math.sin((4 * f - 0.5) * Math.PI) + 3);
        //moon shade mask location in % of radius
        const shadeXPct = f < 0.25 || f > 0.5 && f < 0.75
            ? 0.5 * (Math.sin((4 * f + 0.5) * Math.PI) - 1)
            : 0.5 * (Math.sin((4 * f - 0.5) * Math.PI) + 1)
        
        //update shade curve
        moonShadeCirc
            .attr('r', shadeRPct*radius)
            .attr('cx', shadeXPct*shadeRPct*radius)

        bigMoonShadeCirc
            .attr('r', shadeRPct*bigMoonR)
            .attr('cx', shadeXPct*shadeRPct*bigMoonR)
        //update shaded area
        if (f < 0.75 && f > 0.25) {
            moonShadeRect
                .attr('fill', 'black')
            moonShadeCirc
                .attr('fill', 'white')

            bigMoonShadeRect
                .attr('fill', 'grey')
            bigMoonShadeCirc
                .attr('fill', 'white')
        } else {
            moonShadeRect
                .attr('fill', 'white')
            moonShadeCirc
                .attr('fill', 'black')

            bigMoonShadeRect
                .attr('fill', 'white')
            bigMoonShadeCirc
                .attr('fill', 'grey')
        }
    }

    //------------------------------------BIG MOON FUNCTIONS--------------------------------------------//
    //---update details about moon fraction, rise, set, full, new moon
    function updateMoonDetails(time: number): void {
        //fraction, rise, set
        var fraction = Math.round(SunCalc.getMoonIllumination(new Date(time)).fraction *100);
        var moonTime = SunCalc.getMoonTimes(new Date(time), lat, lng);

        var timeRegex = /(\d+\:\d+):\d+/
        var timeRiseString = moonTime.rise.toTimeString().match(timeRegex);
        var timeSetString = moonTime.set.toTimeString().match(timeRegex);
        moonFraction
            .text('Moon: '+ fraction +'%')

        moonRiseTime
            .text(moonTime.rise && timeRiseString? timeRiseString.slice(1).join(' '): 'no rise today')

        moonSetTime
            .text(moonTime.set && timeSetString? timeSetString.slice(1).join(' '): 'no set today')

        //dates of next new, full moon
        var t = new Date(new Date(time).setHours(0,0,0,0)).getTime(), fractions = [];
        const maxMoonDays = 31;
        for (let i = 0; i < maxMoonDays; i++) {
            t += milsecPerDay;
            let f = SunCalc.getMoonIllumination(new Date(t)).fraction;
            fractions.push({f, t});
        }
        var nextFullMoon = new Date(fractions.reduce((a, b) => a.f> b.f? a: b).t);
        var nextNewMoon = new Date(fractions.reduce((a, b) => a.f< b.f? a: b).t);

        fullMoonTime
            .text(nextFullMoon.toDateString().split(' ').slice(1, 3).join(' '));

        newMoonTime
            .text(nextNewMoon.toDateString().split(' ').slice(1, 3).join(' '))
    }

    //------------------------------------planet view starts--------------------------------------------//
    

    
    function moonOrbit(time: number): void {
        var phase = SunCalc.getMoonIllumination( new Date(time)).phase;
        var radian = (phase - 0.0155)/(0.9844 - 0.0155) * 2 * Math.PI;

        var x = moonOrbitR - moonOrbitR * Math.cos(radian) + moonStartX;
        var y = moonOrbitR - moonOrbitR * Math.sin(radian) + moonStartY;

        tinyMoonG
            .attr('transform', 'translate(' + x +',' + y +')')

        var angle = radian / Math.PI * 180;

        visLine
            .attr('transform', 'rotate('+angle+')')  
    }

    function lonelyManOrbit(time: number): void {
        const timeInSec = time / 1000;
        const secPerDay = 24 * 60 * 60;
        const startAngle = 90;
        const endAngle = 450;
        
        var scale = d3.scaleTime()
            .domain([0, secPerDay])
            .range([startAngle, endAngle]);
       
        lonelyMan
            .attr('transform', 'rotate('+scale(timeInSec)+')')
    }


})()
