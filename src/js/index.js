window.onload = () => {
  console.log("Welcome to SavikLand.com, Enjoy your stay!");
};

var sectionModule = (function () {
  let config = {
    sectionInViewClass: "visible",
    sectionScrollStyleKey: "--scroll-val",
    observer_even: null,
    observer_odd: null,
    visibleSections: [],
  };
  //init
  function initialize() {
    return;
    let sections = [...document.querySelectorAll("main > section")];
    if (sections == null && sections.length == 0) return;

    //z-indexing
    //   sections.forEach((section, index) => {
    //     section.style.setProperty("--layer-var", (index + 1) * 5); //steps of 5
    //   });

    initializeIntersectionObservers(sections);
    initializeScrollObserver(sections);
  }

  function initializeIntersectionObservers(sections) {

    const observer_odd = generateObserver();
    const observer_even = generateObserver();

    sections.forEach((section, index) => {
      if(index % 2 == 1){
        observer_odd.observe(section);
      }else{
        observer_even.observe(section);
      }
    });

    config.observer_odd = observer_odd;
    config.observer_even = observer_even;
  }

  function initializeScrollObserver(sections) {
    window.addEventListener("scroll", onScroll);
    sections.forEach(section =>{
      section.style.setProperty("--total-height", section.offsetHeight);
    })
  }

  //handlers/callbacks
  function onEnter(section) {
    //console.log("just entered: ", section);
    if (!section.classList.contains(config.sectionInViewClass)) {
      section.classList.add(config.sectionInViewClass);
      section.dataset.visible = "";
      config.visibleSections.push(section);
    }
  }

  function onExit(section) {
    //console.log("just exited: ", section);
    section.classList.remove(config.sectionInViewClass);
    delete section.dataset.visible;
    section.style.removeProperty(config.sectionScrollStyleKey);
    removeElementFromArray(config.visibleSections, section);
  }

  function generateObserver(){
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element has entered the viewport
          onEnter(entry.target);          
        } else {
          // Element has exited the viewport
          onExit(entry.target);          
        }
      });
    });
  }

  function onScroll() {
    return;
    const sections = config.visibleSections; 
    sections.forEach((section) => {

      const boundingBox = section.getBoundingClientRect();

      // Calculate the percentage visible based on the position of the top and bottom edges
      const topEdgePercentage = Math.max(0, boundingBox.top / window.innerHeight) * 100;
      const bottomEdgePercentage = Math.min(100, (window.innerHeight - boundingBox.bottom / window.innerHeight) * 100);

      // Set the percentage visible as the maximum between 0 and the calculated value
      const percentageVisible = 100 - Math.max(0, Math.min(topEdgePercentage,  bottomEdgePercentage));
      //const percentageVisible = 100 - Math.max(0, Math.min(100,  bottomEdgePercentage));

      let roundedStyleValue =
       Math.round((percentageVisible + Number.EPSILON) * 100) / 100;

      // Set the percentage visible as the maximum between 0 and the calculated value
      //const percentageVisible = Math.max(0, Math.min(topEdgePercentage, 100 - bottomEdgePercentage));

      // Set the scroll percent as a CSS variable for the sections styling purposes
      section.style.setProperty(config.sectionScrollStyleKey, roundedStyleValue);
    });
  }

  //helpers
  function observeElement(element, onEnterCallback, onExitCallback) {
    

    // Return the observer in case you need to disconnect it later
    return observer;
  }

  function removeElementFromArray(array, elementToRemove) {
    const index = array.indexOf(elementToRemove);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  return {
    init: initialize,
  };
})().init();

var siteDataModule = (function(){
  let config = {
    projectCardTemplate: `
      <div class="card">
        <h2 class="card__header"><span>{num}</span>{company}</h2>
        <p class="card__role">{position}</p>
        {responsibilities}
      </div>
      `,
  };
  function initialize() {
    refreshProjectCards();
  }

  function refreshProjectCards(){
    fetch('../../scripts/savik.json')
        .then(response => response.json())
        .then(resumeData => {
          let cards = [];

          resumeData.jobs.forEach((job, index) => {
            cards.push(generateProjectCard(job, index + 1));            
          });

          let insertDiv = document.getElementById('job-cards');
          console.log('about to pipe it in', {insertDiv, cards});
          insertDiv.innerHTML = cards.join('');
        })
        .catch(error => {
          console.error('Error refreshing Project Cards', error);
        });
  }

  // generators 
  function generateProjectCard(job, index){
    return config.projectCardTemplate
      .replace("{num}", index)
      .replace("{company}", job.company)
      .replace("{position}", job.position)
      .replace("{responsibilities}", generateProjectItemList(job.responsibilities));
  };
  function generateProjectItemList(items){
    let result = '<ul>'

    items.forEach((item, i) => {
      result += `<li>${item}</li>`
    });

    return result + '</ul>'
  };

  return {
    init: initialize,
  };
})().init();