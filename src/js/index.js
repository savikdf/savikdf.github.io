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
    aboutSection: document.getElementById("about"),
    jobSection: document.getElementById("jobs"),
    projectsSection: document.getElementById("projects"),
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
    accordionContainerSelector: '[data-accordion]',
    accordions: [],
    isMouseOnPage: false,
    timer_noMouseMovement: 0.00,
    timer_noMouseMovementStart: null,
    timer_noMouseMovementDelta: null,
  },  

  init: function(){
    const _ = this;

    _.initAccordions();
    document.addEventListener("mousemove", SL_eventsModule.handleMouseMove);
    document.addEventListener("mouseenter", SL_eventsModule.handleMouseEnter);
    document.addEventListener("mouseleave", SL_eventsModule.handleMouseLeave);
    document.addEventListener("keydown", SL_eventsModule.handleKeyDown);
    //external
    document.addEventListener("mousemove", SL_siteDataModule.eyeTrack);
    
    //setInterval(_.doTimer, 1000); // update about every second
  },
  initAccordions(scope = null){
    const _ = this;

    if(scope == null){
      scope = document.body;
    }

    console.log("init accordions in this section:", scope);

    const accordions = scope.querySelectorAll(_.config.accordionContainerSelector);
    accordions.forEach(accordion => {
      const button = accordion.querySelector('[data-accordion-button]');
      //setup: id="accordion-header-1" aria-expanded="true" aria-controls="accordion-panel-1"
      const panel = accordion.querySelector('[data-accordion-panel]');
      //setup: id="accordion-panel-1" aria-labelledby="accordion-header-1"

      if(button == undefined || panel == undefined){
        console.log("Accordion initialization failed for: ", {accordion, button, panel});
        return;
      }

      //console.log("Accordion initialization for: ", {accordion, button, panel});
      let accordionIndex = _.config.accordions.length;
      let buttonId = `accordion-btn-${accordionIndex}`;
      let panelId = `accordion-panel-${accordionIndex}`;

      //set up panel

      panel.setAttribute("aria-hidden", true);
      panel.classList.remove("open");
      panel.id = panelId;
      panel.setAttribute("aria-labelledby", buttonId);
      //panel.style.setProperty("--og-height", `${panel.getBoundingClientRect().height}px`);

      //set up button
      button.setAttribute("aria-expanded", false);
      button.id = buttonId;
      button.setAttribute("tabindex", "0");
      button.setAttribute("aria-controls", panelId);
      if(!button.classList.contains("btn")){
        button.classList.add("btn");
      }


      button.addEventListener("click", SL_eventsModule.handleAccordionTrigger);

      button.addEventListener("keydown", SL_eventsModule.handleAccordionTrigger);

      //add to config for easy tracking/ debugging
      _.config.accordions.push(accordion);
      return;
    });

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
      document.querySelector('html').dataset.debugEnabled = _.config.debugEnabled;
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
  handleAccordionTrigger: function(event){
    //keypress wasn't a space or enter, ignore
    if (event instanceof KeyboardEvent){
      if(event.code !== "Enter" && event.code !== "Space"){
        return;
      }
    }

    const button = event.target;
    const panel = document.querySelector(`#${button.getAttribute('aria-controls')}`);
    
    button.classList.toggle("expanded");
    panel.classList.toggle("open");

    if (button.classList.contains("expanded")) {
      button.setAttribute("aria-expanded", true);
      panel.setAttribute("aria-hidden", false);
    }
    else {
      button.setAttribute("aria-expanded", false);
      panel.setAttribute("aria-hidden", true);
    }
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
    jsonData: {},
    jobSwiperSelector: "#job__swiper",
    jobDescSwiperSelector: "#job__swiper--desc",
    jobSlideContainerSelector: "#job__slide",
    jobDescContainerSelector: "#job__slide--desc",
    // job swiper
    jobSlideTemplate: `
      <div class="job job__slide swiper-slide" data-img="{imageUrl}">
        <a href="{website}" target="_blank" title="{company} Website">
          <h3 class="job__header">{company}</h3>
        </a>
        <p class="job__position">{position}</p>
      </div>`,
    jobSwiperConfig: {
      slidesPerView: 1,
      grabCursor: true,
      spaceBetween: "0px",
      direction: 'horizontal',
      centeredSlides: false,
      loop: false,
      //loopPreventsSlide: false,
      effect: "creative",
      creativeEffect: {
        limitProgress: 2,
        prev: {
          translate: ["-80%", 0, -500],
          scale: 0.79,
        },
        next: {
          translate: ["80%", 0, -500],
          scale: 0.79,
          rotate: [0, 0, 0],
        },
      },
      breakpoints:{
        767: {
          slidesPerView: 3,
          centeredSlides: true,
        }

      },    
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
      navigation: {
        nextEl: '.job__nav--next',
        prevEl: '.job__nav--prev',
        disabledClass: 'job__nav--disabled'
      },
      a11y: {
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
      },
    },
    jobSwiper: null,
    //job desc swiper
    jobDescSlideTemplate:`
      <div class="jobDesc swiper-slide">
        <h3 class="jobDesc__header">{companyLong}</h3>
        <p class="jobDesc__location"><i class="fa-solid fa-location-dot"></i> {location}</p>
        <div class="jobDesc__dates">
          <i class="fa-solid fa-calendar-days"></i> {startDate} <i class="fa-solid fa-arrow-right-long"></i> {endDate}
        </div>
        
        <div data-accordion>
          <h4 data-accordion-button>Responsibilities</h4>
          <div data-accordion-panel>
           <ul class="jobDesc__list">
            {responsibilities}
            </ul>
          </div>
        </div>
       
      </div>`,
    jobDescSwiperConfig: {
      slidesPerView: 1,
      allowSlideNext: false,
      allowSlidePrev: false,
      effect:"fade",
      fadeEffect: {
        crossFade: true
      },
      spaceBetween: "0px",
      // Optional parameters
      direction: 'horizontal',
      loop: false,
      //loopPreventsSlide: false,
      autoPlay: false,
      centeredSlides: true,
      keyboard: {
        enabled: false,
      },
      // scrollbar: {
      //   el: '.swiper-scrollbar',
      // },
    },
    jobDescSwiper: null,
  },

  //Initializations
  init: async function() {
    const _ = this;
  
    //store json data into _.config
    _.memoizeJson()
      .then(() => {
        //create markup for swiper to use
        _.createAndInsertSlides(_.config.jsonData.jobs, _.config.jobSlideContainerSelector, _.config.jobSlideTemplate);
        _.createAndInsertSlides(_.config.jsonData.jobs, _.config.jobDescContainerSelector, _.config.jobDescSlideTemplate);
      })
      .then(() => {
        //create swipers
        _.initJobSwipers();
        SL_eventsModule.initAccordions(SL_sectionModule.config.jobSection)
      });
  },
  memoizeJson: async function(){
    const _ = this;
    await fetch('/scripts/savik.json')
      .then(response => response.json())
      .then(jsonData => {
        _.config.jsonData = jsonData;
      })
      .catch(error => {
        console.error('Error refreshing Project Cards', error);
      });
  },
  initJobSwipers: function(){
    const _ = this;
    const jobSwiper = new Swiper(_.config.jobSwiperSelector, _.config.jobSwiperConfig);
    const jobDescSwiper = new Swiper(_.config.jobDescSwiperSelector, _.config.jobDescSwiperConfig);

    jobSwiper.on('slideChange', SL_siteDataModule.handleSLideChange);

    // jobDescSwiper.params.control = jobSwiper;
    jobSwiper.controller.control = jobDescSwiper;

    _.config.jobSwiper = jobSwiper;
    _.config.jobDescSwiper = jobDescSwiper;
  },
  createAndInsertSlides: function(jsonData, insertElementSelector, template){
    const _ = this;   
    let slides = [];

    jsonData.forEach(item => {
      slides.push(_.generateTemplate(template, item));            
    });

    let insertDiv = document.querySelector(insertElementSelector);
    insertDiv.innerHTML = slides.join('');  
  },

  //handlers
  handleSLideChange: function(swiper){
    const _ = SL_siteDataModule;
    //_.updateSwiperImg(swiper);
  },

  //effects
  updateSwiperImg: function(swiper){
    const _ = SL_siteDataModule;
    const activeSlide = swiper.slides[swiper.activeIndex];

    const imageUrl = activeSlide.dataset.img;
    if(imageUrl){
      const cardDescContainer = document.getElementById(_.config.cardDescId);
      swiper.el.style.setProperty('--bg-img', `url(${imageUrl})`);
    }
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

  //generators 
  generateTemplate: function(template, obj){
    const _ = this;
    var keys = Object.keys(obj);
    let result = template;

    //generation uses the JSON keys to find what part of the template to swap out for actual data
    keys.forEach(key => {
      let value = obj[key];
      if(Array.isArray(value)){
        result = result.replaceAll(`{${key}}`, _.generateList(value));
      }else{
        result = result.replaceAll(`{${key}}`, value);
      }
    });

    return result;
  },
  generateList: function(items){
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
//initAccordions(document.body);