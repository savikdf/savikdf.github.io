window.onload = () => {
  console.log("Welcome to SavikLand.com, Enjoy your stay!");
};

SL_sectionModule = {
  config: {
    sections: [],
    navOgTop: 0,
    sectionInViewClass: "visible",
    sectionScrollStyleKey: "--scroll-val",
    sectionObserver: null,
    visibleSections: [],
    aboutSection: document.getElementById("about"),
    jobSection: document.getElementById("jobs"),
    projectsSection: document.getElementById("projects"),
  },

  init: function() {
    const _ = this;
    let sections = [...document.querySelectorAll("section")];
    _.config.sections = [...sections];
    if (sections != null && sections.length == 0) 
      _.initializeScrollObserver(sections);

    const nav = document.querySelector('nav');
    _.config.navBar = nav;
    _.config.navOgTop = nav.offsetTop; //nav.getBoundingClientRect().top;

    _.initializeIntersectionObservers(sections);
    //z-indexing
    //   sections.forEach((section, index) => {
    //     section.style.setProperty("--layer-var", (index + 1) * 5); //steps of 5
    //   });
  },
  initializeIntersectionObservers: function() {
    const _ = this;
    const observer = _.generateObserver();
    _.config.sections.forEach(section => {
      observer.observe(section);
    });
    _.config.sectionObserver = observer;
  },

  //handlers/callbacks
  onEnter: function(section) {
    const _ = SL_sectionModule;
    //console.log("just entered: ", {"section":section, "bounding top:": section.getBoundingClientRect().top, "navHeight": SL_nav.config.navHeight });
    
    if (!section.classList.contains(_.config.sectionInViewClass)) {
      section.classList.add(_.config.sectionInViewClass);
      section.dataset.visible = "";
      _.config.visibleSections.push(section);
      _.sortVisibleSections();
    }

    SL_nav.handleNavUpdate();
  },
  onExit: function(section) {
    const _ = SL_sectionModule;
    //console.log('just exited:', section);

    section.classList.remove(_.config.sectionInViewClass);
    delete section.dataset.visible;
    section.style.removeProperty(_.config.sectionScrollStyleKey);
    _.removeElementFromArray(_.config.visibleSections, section);
    _.sortVisibleSections()

    SL_nav.handleNavUpdate();
  },
  sortVisibleSections: function(){
    const _ = this;
    if(_.config.visibleSections.length > 1){
      _.config.visibleSections.sort((a, b) => {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
      });
    }
  },
  generateObserver: function(){
    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element has entered the viewport and is past the navbar
          SL_sectionModule.onEnter(entry.target);
        } else {
          // Element has exited the viewport or is behind the navbar
          SL_sectionModule.onExit(entry.target);
        }
      });
    });
  },
  //event reactions
  handleSectionScroll: function(event){
    const _ = SL_sectionModule;
    const sections = _.config.visibleSections; 

    if(sections == null || sections.length < 1)
      return;

    sections.forEach((section) => {

      const boundingBox = section.getBoundingClientRect();
      const clampNumber = (num, a, b) =>
        Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

      // Calculate the percentage visible based on the position of the top and bottom edges
      const topEdgePercentage = clampNumber(-100, 100, (boundingBox.top / window.innerHeight) * 100);
      //const topEdgePercentage = Math.max(0, boundingBox.top / window.innerHeight) * 100;
      //const bottomEdgePercentage = Math.min(100, (window.innerHeight - boundingBox.bottom / window.innerHeight) * 100);
      section.style.setProperty("--top-edge", `${Math.round((topEdgePercentage + Number.EPSILON) * 100) / 100}`);
      //section.style.setProperty("--bottom-edge", Math.round((bottomEdgePercentage + Number.EPSILON) * 100) / 100);
      return;
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
    navLinks: [],
    
    isMouseOnPage: false,
    timer_noMouseMovement: 0.00,
    timer_noMouseMovementStart: null,
    timer_noMouseMovementDelta: null,
  },  

  init: function(){
    const _ = this;
    document.addEventListener("scroll", SL_eventsModule.handleScroll);
    document.addEventListener("mousemove", SL_eventsModule.handleMouseMove);
    document.addEventListener("mouseenter", SL_eventsModule.handleMouseEnter);
    document.addEventListener("mouseleave", SL_eventsModule.handleMouseLeave);
    document.addEventListener("keydown", SL_eventsModule.handleKeyDown);
    //external
    //document.addEventListener("mousemove", SL_siteDataModule.eyeTrack); //scrapped
    //touches
    document.addEventListener('touchstart', SL_siteDataModule.handleTouchEvent);
    document.addEventListener('touchmove', SL_siteDataModule.handleTouchEvent);
    document.addEventListener('touchend', SL_siteDataModule.handleTouchEvent);
  
  },

  //handlers
  handleScroll: function(event){
    SL_sectionModule.handleSectionScroll(event);
    SL_nav.handleNavScroll(event);
  },
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
  handleTouchEvent: function(event){
    const activeTouches = event.touches.length;
    SL_siteDataModule.config.debugEnabled = activeTouches >= 3;
  },
  doTimer: function(){
    const _ = SL_eventsModule;
    //console.log("doing timer")
    _.config.timer_noMouseMovementDelta = Date.now() - _.config.timer_noMouseMovementStart; // milliseconds elapsed since start
    _.config.timer_noMouseMovement = Math.floor(_.config.timer_noMouseMovementDelta / 1000); // in seconds
    document.getElementById('debug-mouseInactiveTimer').textContent = _.config.timer_noMouseMovement;
  },

  //helpers
  smoothScrollWithDuration: function(targetPosition, duration) {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        // Ease-in-out function: t = time, b = start position, c = change in position, d = duration
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
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
    jobSwiperConfig: {
      slidesPerView: 1,
      grabCursor: true,
      spaceBetween: "0px",
      direction: 'horizontal',
      centeredSlides: false,
      loop: false,
      spaceBetween: 100,
      //loopPreventsSlide: false,
      //effect: "slide",
      effect: "creative",
      creativeEffect: {
        limitProgress: 2,
        prev: {
          translate: ["-80%", 0, -500],
          //translate: [0, "-80%", -500],

          scale: 0.79,
        },
        next: {
          translate: ["80%", 0, -500],
          //translate: [0, "80%", -500],

          scale: 0.79,
          rotate: [0, 0, 0],
        },
      },
      breakpoints:{
        600: { //>=
          //direction: 'vertical',
          direction: 'vertical',
          //slidesPerView: 3,
          //centeredSlides: true,
          creativeEffect: {
            limitProgress: 2,
            prev: {
              //translate: ["-80%", 0, -500],
              translate: [0, "-80%", -500],
    
              scale: 0.79,
            },
            next: {
              //translate: ["80%", 0, -500],
              translate: [0, "80%", -500],
    
              scale: 0.79,
              rotate: [0, 0, 0],
            },
          },
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
        _.createAndInsertSlides(_.config.jsonData.jobs, _.config.jobSlideContainerSelector, SL_templates.jobSlideTemplate);
        _.createAndInsertSlides(_.config.jsonData.jobs, _.config.jobDescContainerSelector, SL_templates.jobDescSlideTemplate);
      })
      .then(() => {
        //create swipers
        _.initJobSwipers();
        SL_accordions.initAccordions(SL_sectionModule.config.jobSection);
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
    //removes ping
    swiper.navigation.nextEl.classList.remove('anim__ping--border')

    //collapses the accordions on the adjacent slides
    const _ = SL_siteDataModule;
    const i = swiper.activeIndex;
    const descPrev = _.config.jobDescSwiper.slides[Math.max(0,i-1)];
    const descNext = _.config.jobDescSwiper.slides[Math.min(swiper.slides.length, i+1)];

    if(descPrev || descNext){
      let accordionPrev = descPrev?.querySelector('[data-accordion]');
      let accordionNext = descNext?.querySelector('[data-accordion]');

      if(accordionPrev)
        SL_accordions.toggleAccordion(accordionPrev, isOpen = false);
      
      if(accordionNext)
        SL_accordions.toggleAccordion(accordionNext, isOpen = false);

    }

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

SL_accordions = {
  config: {
    accordionContainerSelector: '[data-accordion]',
    accordions: [],
  },
  init: function(){
    const _ = this;
    _.initAccordions();
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

      button.addEventListener("click", SL_accordions.handleAccordionTrigger);

      button.addEventListener("keydown", SL_accordions.handleAccordionTrigger);

      //add to config for easy tracking/ debugging
      _.config.accordions.push(accordion);
      return;
    });

  },
  toggleAccordion: function(accordion, isOpen = null){
    const button = accordion.querySelector('[data-accordion-button]');
    if(!button)
      return;

    const panel = accordion.querySelector(`#${button.getAttribute('aria-controls')}`);
    //use supplied desired state, if null infer from button state
    if(isOpen == null){
      button.classList.toggle("expanded");
      panel.classList.toggle("open");
    }
    isOpen = isOpen ?? button.classList.contains("expanded");
    button.setAttribute("aria-expanded", isOpen);
    panel.setAttribute("aria-hidden", !isOpen);
    
  },
  handleAccordionTrigger: function(event){
    //keypress wasn't a space or enter, ignore
    if (event instanceof KeyboardEvent){
      if(event.code !== "Enter" && event.code !== "Space"){
        return;
      }
    }

    const _ = SL_accordions;
    let accordion = event.target.closest('[data-accordion]');
    _.toggleAccordion(accordion);
  },
}

SL_nav = {
  config: {
    navBar: null,
    navLinks: [],
    navHeight: 60, //try match $nav-height scss var, right now nothing syncs these two
    navMobBreakpoint: 600,
  },

  init: function(){
    const _ = this;

    const navBar = document.querySelector('nav');
    _.config.navBar = navBar;
    _.config.navHeight = navBar.getBoundingClientRect().height;
    navBar.querySelectorAll('a[href^="#"]').forEach(anchor => {
      _.config.navLinks.push(anchor);
    });

    //init events
    _.config.navLinks.forEach(link => {
      link.addEventListener('click', SL_nav.handleNavLinkClick);
    });
  },

  //event handlers
  handleNavLinkClick: function(event){
    event.preventDefault();
    const _ = SL_nav;

    const anchor = event.target;
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    const offset = SL_nav.config.navHeight;
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY;// + offset;

    _.config.navLinks.forEach(navLink => {
      navLink.classList.remove('active');
    });
    anchor.classList.add('active');

    // const scrollDuration = 500; // Adjust the scroll duration in milliseconds (2000ms = 2 seconds)
    // _.smoothScrollWithDuration(offsetPosition, scrollDuration);

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth' 
    });
  },
  handleNavScroll: function(event){
    _ = SL_sectionModule;
    
    if(window.innerWidth < _.config.navMobBreakpoint)
      return;

    const nav = _.config.navBar;
    const main = document.querySelector('main');
    let stickyClass = "sticky";
    let navOffsetClass = "nav-offset";

    const isSticky = window.scrollY >= _.config.navOgTop; // nav.getBoundingClientRect().top <= 0;
    if(isSticky){
      nav.classList.add(stickyClass);
      main.classList.add(navOffsetClass);
    }else{
      nav.classList.remove(stickyClass);
      main.classList.remove(navOffsetClass);
    }
    //_.handleNavUpdate();
  },
  handleNavUpdate: function(){
    const _ = this;
    if(window.innerWidth < _.config.navMobBreakpoint)
      return;

    const navLinks = _.config.navLinks;
    if(!navLinks)
      return;

    //only sections with ids
    const sectionsWithIds = SL_sectionModule.config.visibleSections.filter(section => section.id);
    let foundMatch = false;

    sectionsWithIds.forEach(section => {
      if(foundMatch)
        return;

      //man, this nav shit sucks
      //todo: fix this garbage
      // let boundingRect = section.getBoundingClientRect();
      // let scrolledPastNav = boundingRect.bottom < _.config.navHeight;
      // if(section.id != "hero" && scrolledPastNav)
      //   return;

      let match = _.config.navLinks.filter(link => { return link.getAttribute('href').substring(1) == section.id });
      if(match && match.length == 1){
        _.config.navLinks.forEach(navLink => {
          navLink.classList.remove('active');
        });
        match[0].classList.add('active');
        foundMatch = true;
      }
    });
  },

}

SL_templates = {
  jobSlideTemplate: `
    <div class="job job__slide swiper-slide" data-img="{imageUrl}">
      <a href="{website}" target="_blank" title="{company} Website">
        <h3 class="job__header">{company}</h3>
      </a>
      <p class="job__position">{position}</p>
    </div>`,
  jobDescSlideTemplate:`
    <div class="jobDesc swiper-slide">
      <h3 class="jobDesc__header swiper-no-swiping">{companyLong}</h3>

      <div data-skills class="jobDesc__skills">
        <!--js inserts here-->
      </div>

      <div class="jobDesc__location badge swiper-no-swiping">
        <i class="fa-solid fa-location-dot"></i>  
        <p>{location}</p>
      </div>
      
      <div class="jobDesc__dates badge swiper-no-swiping">
        <i class="fa-solid fa-calendar-days"></i>
        <div>
          <p>{startDate}</p> 
          <i class="fa-solid fa-arrow-right-long"></i>
          <p>{endDate}</p>
        </div>
      </div>
      
      <div data-accordion class="jobDesc__accordion">
        <h4 data-accordion-button>Responsibilities</h4>
        <div data-accordion-panel>
         <ul class="jobDesc__list">
          {responsibilities}
          </ul>
        </div>
      </div>
     
    </div>`,
  skillBadgeTemplate:`
    <div>
      <p>{text}</p>
    </div>
  `
}

SL_hero = {
  config:{
    animActive: true,
  },
  init: function(){
    const _ = this;
    _.animateTitle();
  },
  animateTitle: function(){
    const _ = this;
    const title = document.querySelector(".hero__title");
    const text = title.textContent;
    title.innerHTML = ""; // Clear the current content

    // Wrap each letter in a span and add to the title
    text.split("").forEach((letter, index) => {
      const span = document.createElement("span");
      span.textContent = letter;
      span.style.zIndex = index * 20;
      //span.style.setProperty("--animDelay", `${index * 20}ms`);

      // Add event listeners for hover behavior
      function AnimInteract(event){
        if(_.config.animActive){
          _.config.animActive = false;
          return;
        }

        if (!span.classList.contains("active")) {
          span.classList.add("active");
        }
      }
      span.addEventListener("mouseenter", AnimInteract);
      span.addEventListener("click", AnimInteract);
      span.addEventListener("touchStart", AnimInteract);

      // Remove 'active' class when the animation ends
      span.addEventListener("animationend", () => {
        span.classList.remove("active");
        if(_.config.animActive){
          setTimeout(() => {
            span.classList.add("active");
          }, 200);
        }
      });

      title.appendChild(span);
      setTimeout(() => {
        span.classList.add('active');
      }, index * 100);
    });
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
