window.onload = () => {
  console.log("Welcome to SavikLand.com, Enjoy your stay!");
};

SL_sectionModule = {
  config: {
    sectionInViewClass: "visible",
    sectionScrollStyleKey: "--scroll-val",
    observer_even: null,
    observer_odd: null,
    visibleSections: [],
  },

  init: function() {
    return;
    let sections = [...document.querySelectorAll("main > section")];
    if (sections == null && sections.length == 0) return;

    //z-indexing
    //   sections.forEach((section, index) => {
    //     section.style.setProperty("--layer-var", (index + 1) * 5); //steps of 5
    //   });

    initializeIntersectionObservers(sections);
    initializeScrollObserver(sections);
  },
  initializeIntersectionObservers: function(sections) {

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
  },
  initializeScrollObserver: function(sections) {
    window.addEventListener("scroll", onScroll);
    sections.forEach(section =>{
      section.style.setProperty("--total-height", section.offsetHeight);
    })
  },

  //handlers/callbacks
  onEnter: function(section) {
    //console.log("just entered: ", section);
    if (!section.classList.contains(config.sectionInViewClass)) {
      section.classList.add(config.sectionInViewClass);
      section.dataset.visible = "";
      config.visibleSections.push(section);
    }
  },
  onExit: function(section) {
    //console.log("just exited: ", section);
    section.classList.remove(config.sectionInViewClass);
    delete section.dataset.visible;
    section.style.removeProperty(config.sectionScrollStyleKey);
    removeElementFromArray(config.visibleSections, section);
  },
  generateObserver: function(){
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
  },
  onScroll: function() {
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
  },

  //helpers
  observeElement: function(element, onEnterCallback, onExitCallback) {
    

    // Return the observer in case you need to disconnect it later
    return observer;
  },
  removeElementFromArray: function(array, elementToRemove) {
    const index = array.indexOf(elementToRemove);
    if (index !== -1) {
      array.splice(index, 1);
    }
  },
};

SL_eventsModule = {
  config: {
    debugKeyCode : 190,
    debugEnabled : false,
    mouseXPercent: 0.01,
    mouseYPercent: 0.01,
    scrollbarLenience: -15,
    isMouseOnPage: false,
    timer_noMouseMovement: 0.00,
    timer_noMouseMovementStart: null,
    timer_noMouseMovementDelta: null,
  },  

  init: function(){
    const _ = this;
    //internal
    document.addEventListener("mousemove", SL_eventsModule.handleMouseMove);
    document.addEventListener("mouseenter", SL_eventsModule.handleMouseEnter);
    document.addEventListener("mouseleave", SL_eventsModule.handleMouseLeave);
    document.addEventListener("keydown", SL_eventsModule.handleKeyDown);
    //external
    document.addEventListener("mousemove", SL_siteDataModule.eyeTrack);

    setInterval(_.doTimer, 1000); // update about every second
  },

  //handlers
  handleMouseMove: function(event) {
    const _ = SL_eventsModule;
    _.config.timer_noMouseMovement = 0;
    _.config.timer_noMouseMovementStart = Date.now();

    var eventDoc, doc, body;

    event = event || window.event; // IE-ism

    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
          (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
          (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    //saving percent vars into config
    _.config.mouseXPercent = Math.round(((event.pageX / (window.innerWidth + _.config.scrollbarLenience)) + Number.EPSILON) * 100) / 100;
    _.config.mouseYPercent = Math.round(((event.pageY / window.innerHeight) + Number.EPSILON) * 100) / 100;

    //debug ui
    document.getElementById('debug-mousePercent').textContent = `{X:${_.config.mouseXPercent}, Y:${_.config.mouseYPercent}}`;
  },
  handleKeyDown: function(event){
    const _ = SL_eventsModule;
    if(event.keyCode == _.config.debugKeyCode){
      _.config.debugEnabled = !_.config.debugEnabled;
      document.getElementById('debug-menu').dataset.debugEnabled = _.config.debugEnabled;
    }

  },
  handleMouseEnter: function(event){
    const _ = SL_eventsModule;
    _.config.isMouseOnPage = true;
    document.getElementById("debug-mouseOn").textContent = _.config.isMouseOnPage;
  },
  handleMouseLeave: function(event){
    console.log("out")
    const _ = SL_eventsModule;
    _.config.isMouseOnPage = false;
    document.getElementById("debug-mouseOn").textContent = _.config.isMouseOnPage;
  },

  doTimer: function(){
    const _ = SL_eventsModule;
    //console.log("doing timer")
    _.config.timer_noMouseMovementDelta = Date.now() - _.config.timer_noMouseMovementStart; // milliseconds elapsed since start
    _.config.timer_noMouseMovement = Math.floor(_.config.timer_noMouseMovementDelta / 1000); // in seconds
    document.getElementById('debug-mouseInactiveTimer').textContent = _.config.timer_noMouseMovement;
  },

};

SL_siteDataModule = {
  config : {
    cardSectionId: "job-cards",
    projectCardTemplate: `
      <div class="card swiper-slide">
        <img class="card__logo" src="{logoUrl}"/>
        <h2 class="card__header">{company}</h2>
        <p class="card__role">{position}</p>
        <ul class="card__list">
          {responsibilities}
        </ul>
      </div>
      `,
    cardSwiperConfig: {
      slidesPerView: 3,
      spaceBetween: "0px",
      // Optional parameters
      direction: 'horizontal',
      loop: false,
      autoPlay: false,
      centeredSlides: true,
      keyboard: {
        enabled: true,
      },
      navigation: {
        nextEl: '.card-nav__next',
        prevEl: '.card-nav__prev',
        disabledClass: 'card-nav--disabled'
      },
      a11y: {
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
      },
     
      // And if we need scrollbar
      // scrollbar: {
      //   el: '.swiper-scrollbar',
      // },
    },
    cardSwiper: null,
  },
  init: function() {
    const _ = this;
    _.refreshProjectCards();
    _.initCardSwiper();
  },

  refreshProjectCards: function(){
    const _ = this;
    fetch('../../scripts/savik.json')
        .then(response => response.json())
        .then(resumeData => {
          let cards = [];

          resumeData.jobs.forEach((job, index) => {
            cards.push(_.generateProjectCard(job, index + 1));            
          });

          let insertDiv = document.getElementById(_.config.cardSectionId);
          insertDiv.innerHTML = cards.join('');
        })
        .catch(error => {
          console.error('Error refreshing Project Cards', error);
        });
  },
  initCardSwiper: function(){
    const _ = this;
    const cardSwiper = new Swiper('.card-swiper', _.config.cardSwiperConfig);
    _.config.cardSwiper = cardSwiper;
  },
  eyeTrack: function(){
    let eyes = [...document.querySelectorAll('.eye')];
    if(document.hidden || SL_eventsModule.config.timer_noMouseMovement > 2){
      //return to default state, no longer watching mouse
      // eye.forEach(eye => {
      //   eye.style.setProperty("--hor-offset",  )
      // });

      return;
    }

    eyes.forEach(eye => {
      let offset = (SL_eventsModule.config.mouseXPercent * 100) - 50; //minus 50 to have the baseline as the middle of the screen
      eye.style.setProperty("--hor-offset", `${offset}px`);
    });
  },

  // generators 
  generateProjectCard: function(job, index){
    const _ = this;
    return _.config.projectCardTemplate
      .replace("{num}", index)
      .replace("{company}", job.company)
      .replace("{logoUrl}", job.logoUrl)
      .replace("{position}", job.position)
      .replace("{responsibilities}", _.generateProjectItemList(job.responsibilities));
  },
  generateProjectItemList: function(items){
    let result = '';

    items.forEach((item, i) => {
      result += `<li>${item}</li>`
    });

    return result;
  },
}

MainModule = {
  config:{
    modules: [],
  },
  init: function(){
    const _ = this;
    _.config.modules = _.initializeNamedModules("SL_");
  },
  initializeNamedModules: function(prefix){
    const _ = this;
    let moduleNames = _.getPrefixedModuleNames(prefix);
    let moduleObjects = [];
    moduleNames.forEach(name => {
      const module = window[name];
      if (module && typeof module.init === 'function') {
        moduleObjects.push();
        module.init();
      }
    });
    return moduleObjects;
  },
  getPrefixedModuleNames : function (prefix){
    return Object.keys(window).filter(key => key.startsWith(prefix));
  },
};
MainModule.init();