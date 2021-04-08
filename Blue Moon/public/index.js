
(async () => {

    //------------------------------------INITIALIZATION--------------------------------------------//
    var timerStartAt = new Date(), time0 = new Date(new Date().setHours(0,0,0,0)), startFastForward;

    //locate user
    var loc;
    // loc = await new Promise(resolve => navigator.geolocation.getCurrentPosition((res) => {
    //     resolve(res)
    // }));

    //time & place - default: indochina
    var lat = loc? loc.coords.latitude: 10.803243;
    var lng = loc? loc.coords.longitude: 106.727914;


    var realReq, fastReq;

    //initial render
    playReal();

    //events initialization
    document.getElementById('fast').addEventListener('click', playFastForward);
    document.getElementById('real').addEventListener('click', playReal);

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
    function realSpeed(timeStamp){
        var time = Date.parse(timerStartAt) + timeStamp;
        animate(time);
        realReq = window.requestAnimationFrame(realSpeed);
    }

    function fastForward(timeStamp){
        let time = (Date.parse(timerStartAt) - Date.parse(startFastForward) + timeStamp)*5000 + Date.parse(time0);
        animate(time);
        fastReq = window.requestAnimationFrame(fastForward);
    }

    //---all functions for animation in horizon view, moon view and planet view
    var animate = (time) => {
        animateSunMoon(time);
        displayTime(time);
        colorHorizon(time);
        updateMoonShadow(time);
        updateMoonDetails(time);
        moonOrbit(time);
        lonelyManOrbit(time);
    }

    //------------------------------------HORIZON FUNCTIONS--------------------------------------------//
    //---update time on screen
    function displayTime(time) {
        if (!isNaN(time)) {
            time = new Date(time);
        }
        document.getElementById('time').textContent = time.toLocaleTimeString();
        document.getElementById('date').textContent = time.toDateString().split(' ').slice(1, 3).join(' ');
        document.getElementById('place').textContent = time.toString().match(/\((.+)\)/)[1];
    }
    //---simulate sun moon across screen
    function animateSunMoon(time){
        var sunCoords = getPosition(time, 'sun');
        var moonCoords = getPosition(time, 'moon');
        
        moon
            .attr('transform', 'translate('+moonCoords.x+','+moonCoords.y+')');
        
        sun
            .attr('cx', sunCoords.x)
            .attr('cy', sunCoords.y)
    }

    function getPosition(now, object){
        if (isNaN(now)) {
            now = Date.parse(now);
        }

        var phases = findRiseSetPhase(now, object);
        
        //ellipse dimention:
        var paddingX = hG, paddingY = hG;
        var minor = h - paddingY, major = (w - 2*paddingX)/2;

        //calculate radian
        var start = phases[0].time, end = phases[2].time;
        var radian = Math.PI * (now - start)/(end - start);
        //move object below horizon after sunset/moonset, invert by adding 1 pi
        if (phases[0].type === 'set') radian += Math.PI;

        //coords
        var x = paddingX + major - major * Math.cos(radian);
        var y = paddingY + minor - minor * Math.sin(radian);

        return {x, y}
    }

    function findRiseSetPhase(now, object) {
        var data = [{time: new Date(now), type: 'now'}];
        //SunCalc provides rise, set time in the current date. 
        //This finds rise, set time for current rise-set phase (possibly a day before or after)
        for (let i=-1; i<=1; i++) {
            let t = now+i*24*60*60*1000;
            
            let rise, set;
            if (object === 'moon') {
                rise = SunCalc.getMoonTimes(t, lat, lng).rise;
                set = SunCalc.getMoonTimes(t, lat, lng).set;

            } else if (object === 'sun') {
                rise = SunCalc.getTimes(t, lat, lng).sunrise;
                set = SunCalc.getTimes(t, lat, lng).sunset;
            }
            if (rise) data.push({time: rise, type: 'rise'});
            if (set) data.push({time: set, type: 'set'});
        }

        //locate 2 phases before and after current time
        data.sort((a, b) => a.time - b.time);
        var phases = [];
        data.forEach((d, i, arr) => {
            if (d.type === 'now') {
                phases.push(arr[i-1]);
                phases.push(d);
                phases.push(arr[i+1])
            }
        });
        
        return phases
    }

    //---update color of horizon depending on time
    function colorHorizon(time){
        if (!isNaN(time)) {
            time = new Date(time);
        }
        //yesterday
        var yesterday = Date.parse(time) - 24*60*60*1000;
        var lastNight = SunCalc.getTimes(new Date(yesterday), lat, lng).night;
        
        //today
        var {nightEnd, sunrise, goldenHourEnd, solarNoon, goldenHour, sunset, night} = SunCalc.getTimes(time, lat, lng);

        //tomorrow
        var tomorrow = Date.parse(time) + 24*60*60*1000;
        var nextNightEnd = SunCalc.getTimes(new Date(tomorrow), lat, lng).nightEnd;

        //midnights
        var lastMidNight = new Date((nightEnd - lastNight) / 2 + Date.parse(lastNight));
        var midnight = new Date((nextNightEnd - night) / 2 + Date.parse(night));

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
        .style('stop-color', topScale(time));

        bottomSky
        .style('stop-color', bottomScale(time));

        //ground color
        var groundScale = d3.scaleTime()
        .domain([lastNight, nightEnd, goldenHourEnd, goldenHour, night, nextNightEnd])
        .range(['black', 'black', '#39D08F','#39D08F','black', 'black'])

        ground.attr('fill', groundScale(time))

        //star color
        var starsScale = d3.scaleTime()
        .domain(starsDomain)
        .range(['black', 'white', 'black', 'black', 'white', 'black',])

        topStars
        .style('stop-color', starsScale(time))
    }

    //---update moon shape
    function updateMoonShadow(time) {
        //moon phase
        var f = SunCalc.getMoonIllumination(time).phase;
        //moon shade mask radius
        var shadeRScale = 2;
        var shadeRPct = shadeRScale/4 * (Math.sin((4 * f - 0.5) * Math.PI) + 3);
        //moon shade mask location in % of radius
        var shadeXPct = f < 0.25 || f > 0.5 && f < 0.75
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

    // function drawStars(time) {
    //     var hr = new Date(time).getHours();

    //     if (hr === 12) {
    //         console.log(hr);
    //         //stars 
    //         stars
    //             .selectAll('circle')
    //             .remove()

    //         starsCoord = [];
    //         for (i=0; i< 200; i++) {
    //             let cx = Math.random() * w;
    //             let cy = Math.random() * h*0.8;
    //             starsCoord.push({cx, cy})
    //         }
    //         stars
    //             .selectAll('circle')
    //             .data(starsCoord)
    //             .enter()
    //             .append('circle')
    //             .attr('r', 1)
    //             .attr('cx', d => {
    //                 console.log(d);
    //                 return d.cx})
    //             .attr('cy', d => d.cy)
    //             .attr('fill', 'white')

    //     }
    // }

    //------------------------------------BIG MOON FUNCTIONS--------------------------------------------//
    //---update details about moon fraction, rise, set, full, new moon
    function updateMoonDetails(time) {
        //fraction, rise, set
        var fraction = Math.round(SunCalc.getMoonIllumination(time).fraction *100);
        var moonTime = SunCalc.getMoonTimes(time, lat, lng);

        var timeRegex = /(\d+\:\d+):\d+/
        moonFraction
            .text('Moon: '+ fraction +'%')

        moonRiseTime
            .text(moonTime.rise === undefined? 'no rise today': moonTime.rise.toTimeString().match(timeRegex).slice(1).join(' '))

        moonSetTime
            .text(moonTime.set === undefined? 'no set today': moonTime.set.toTimeString().match(timeRegex).slice(1).join(' '))

        //dates of next new, full moon
        var t = Date.parse(new Date(new Date(time).setHours(0,0,0,0))), fractions = [];
        for (let i = 0; i<31; i++) {
            t += 24*60*60*1000;
            let f = SunCalc.getMoonIllumination(t).fraction;
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
    

    
    function moonOrbit(time) {
        var phase = SunCalc.getMoonIllumination(time).phase;
        var radian = (phase - 0.0155)/(0.9844 - 0.0155) * 2 * Math.PI;

        var x = moonOrbitR - moonOrbitR * Math.cos(radian) + moonStartX;
        var y = moonOrbitR - moonOrbitR * Math.sin(radian) + moonStartY;

        tinyMoonG
            .attr('transform', 'translate(' + x +',' + y +')')

        var angle = radian / Math.PI * 180;

        visLine
            .attr('transform', 'rotate('+angle+')')  
    }

    function lonelyManOrbit(time) {
        var date = new Date(time);
        var sec = date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();
        
        var scale = d3.scaleTime().domain([0, 24 * 60 * 60]).range([90, 450]);
       
        lonelyMan
            .attr('transform', 'rotate('+scale(sec)+')')
    }


})()