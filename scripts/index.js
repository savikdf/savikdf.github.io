window.onload = () => {
    console.log('Welcome to SavikLand.com, Enjoy your stay!');
};


var sectionModule = (function(){
  let config = {
      sectionInViewClass: "section--visible",
      scrollTrackingDataAttribute: "data-section-visible",
      observers: [],
      visibleSections: [],
  }
  //init
  function initialize(){
      let sections = [...document.querySelectorAll('main > section')];
      if (sections == null && sections.length == 0)
          return;

      //z-indexing
      sections.forEach((section, index) => {
        section.style.setProperty("--layer-var", (index + 1) * 5); //steps of 5
      });

      initializeIntersectionObservers(sections);
      initializeScrollObserver();
  }

  function initializeIntersectionObservers(sections){
      let observers = [];
      sections.forEach((section, index) => {
          observers.push(observeElement(section, onEnter, onExit));
      });
      config.observers = observers;
  }

  function initializeScrollObserver() {
      window.addEventListener('scroll', onScroll);
  }

  //handlers/callbacks
  function onEnter(section){
      if (!section.classList.contains(config.sectionInViewClass)) {
        section.classList.add(config.sectionInViewClass);
        section.setAttribute(config.scrollTrackingDataAttribute, null);
        config.visibleSections.push(section);
      }
  }

  function onExit(section){
    section.classList.remove(config.sectionInViewClass);
    section.removeAttribute(config.scrollTrackingDataAttribute);
    section.style.removeProperty("--scroll-percent");
    removeElementFromArray(config.visibleSections, section);
  }

  function onScroll() {
    // const sections = document.querySelectorAll(`[${config.scrollTrackingDataAttribute}]`);
    console.log(config.visibleSections);
        config.visibleSections.forEach((section) => {
        const boundingBox = section.getBoundingClientRect();
        const percentageVisible = (boundingBox.height + boundingBox.top) / boundingBox.height * 100;
        onScrollPercentage(section, percentageVisible);


        // const isElementTopAboveViewport = boundingBox.top < 0;
        // const isElementTopBelowViewport = boundingBox.top + boundingBox.height > 0;

        // if (isElementTopAboveViewport && isElementTopBelowViewport) {
            
        // }
    });
  }

  //helpers
  function observeElement(element, onEnterCallback, onExitCallback) {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
              if (entry.isIntersecting) {
                  // Element has entered the viewport
                  if (onEnterCallback && typeof onEnterCallback === 'function') {
                      onEnterCallback(element);
                  }
              } else {
                  // Element has exited the viewport
                  if (onExitCallback && typeof onExitCallback === 'function') {
                      onExitCallback(element);
                  }
              }
          });
      });

      observer.observe(element);

      // Return the observer in case you need to disconnect it later
      return observer;
  }  

  function onScrollPercentage(section, percentageVisible) {
      let styleValue = Math.round((percentageVisible + Number.EPSILON) * 100) / 100;
      //console.log({section, percentageVisible, styleValue});
      section.style.setProperty("--scroll-percent", `${styleValue}px`);
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










// var $window = $(window);

// var __deprecatedModule = (function () {
//     // private members
//     let mouseHoldTimer = 0;
//     const timerLimit = 500;

//     // Public Method
//     function InitPage() {
//         _setJqueryEvents();
//         _setStyling();
//         _setWindowScrollEvents();
//     }   

//     function _setWindowScrollEvents(){        
//         $window.on('scroll', function () {


//         });
//     }

//     function _setStyling() {
//         console.log("Setting Jquery Styling on Page");

       

//         //timing func
//         // const interval = setInterval(function() {
//         //     $(".timed-raise").each(function(){
//         //         $(this).toggleClass('raised');
//         //     });
//         //   }, 1000);         
//         //  clearInterval(interval);
        
//     }    

//     function _setJqueryEvents() {
//         console.log("Setting Jquery Events on Page");

//         $(document).on('mousedown', function (e) {
//             mouseHoldTimer = setTimeout(function () {
//                 //call functions on the user holding mouse down for x length of time

//             }, timerLimit);
//         }).on('mouseup', function () {
//             clearTimeout(mouseHoldTimer);
//         });

//         //mouse enter and leave triggers
//         $('.raisable').on('mouseenter', function () {
//             if (!$(this).hasClass('raised')) {
//                 $(this).toggleClass('raised');
//             }
//         }).on('mouseleave', function(){
//             if(!$(this).hasClass('stasis') && $(this).hasClass('raised')){
//                 $(this).toggleClass('raised');
//             }
//         });

//         // //raisable text styles - mouseEnter and mouseLeave based
//         // $('.raisable-text').on('mouseenter', function () {
            
//         //     if (!$(this).hasClass('raised')) {
//         //         //raise
//         //         $(this).toggleClass('raised');

//         //         const text = $(this).find('.content')[0];
//         //         const shadowLength = 20;
//         //         const unit = 'px';
//         //         let xAmp = 0, yAmp = 0;
//         //         let shadowStyle = '';
    
//         //         //setting our directional amplifiers
//         //         if($(text).hasClass('pop-up')){
//         //             yAmp = 1;                    
//         //         }else if($(text).hasClass('pop-down')){
//         //             yAmp = -1;
//         //         }
//         //         if($(text).hasClass('pop-right')){
//         //             xAmp = -1;
//         //         }else if($(text).hasClass('pop-left')){
//         //             xAmp = 1;
//         //         }

//         //         const colors = ['c15'];
//         //         let randomColor = colors[Math.floor(Math.random()*colors.length)];

//         //         for(let i = 1; i < shadowLength; i ++){
//         //             shadowStyle += i == 1 ? "" : ",";
//         //             shadowStyle += `${i * xAmp}${unit} ${i * yAmp}${unit} #${randomColor}`;
//         //         }
//         //         text.style.textShadow=shadowStyle;  
//         //     }

//         // }).on('mouseleave', function(){
//         //     if(!$(this).hasClass('stasis') && $(this).hasClass('raised')){
//         //         //drop
//         //         $(this).toggleClass('raised');

//         //         const text = $(this).find('.content')[0];  
//         //         text.style.textShadow='';  
//         //     }
//         // });

//         //raisable stasis on click
//         $('.raisable').on('click', function () {
//             if ($(this).hasClass('raised')) {
//                 $(this).toggleClass('stasis');
//             }

//             // if($('.stasis').length == 2){
//             //     setTimeout(function(){alert("Under construction, come back later!");}, 1000);
//             // }
//         });
//     } 

    
//     // public members, exposed with return statement
//     return {
//         InitPage: InitPage,
//     };
// })();
