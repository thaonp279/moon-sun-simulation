import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id='horizon-view'>
      <svg id='horizon' ></svg>
      <div id='time-place'>
          <h1 id='time'></h1>
          <h2 id='date'></h2>
          <h3 id='place'></h2>
      </div>
      <button id ='real'>
          <i class="fas fa-play fa-lg"></i>
      </button>
      <button id ='fast'>
          <i class="fas fa-fast-forward fa-lg"></i>
      </button>
      <i class="fas fa-fast-forward fa-lg playing"></i>
  </div>
  <div id='alternate-view'>
      <div>
          <svg id='moon-view'></svg>
          <i class="fas fa-fast-forward fa-lg playing"></i>
      </div>
      <div>
          <svg id='planet-view'></svg>
          <i class="fas fa-fast-forward fa-lg playing"></i>
      </div>
  </div>
`
