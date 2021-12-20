window.onload = () => {
    console.log('Welcome to SavikLand.com, Enjoy your stay!');
    GlobalModule.InitPage();
};

var $window = $(window);

var GlobalModule = (function () {
    // private members
    let mouseHoldTimer = 0;
    const timerLimit = 500;

    // Public Method
    function InitPage() {
        _setJqueryEvents();
        _setStyling();
        _setWindowScrollEvents();
    }   

    function _setWindowScrollEvents(){        
        $window.on('scroll', function () {
            let scroll_offset_multiplier = .10;
            let top_of_element = 0;
            let bottom_of_element = 0;            
            let bottom_of_screen = $window.scrollTop() + $window.innerHeight();
            let top_of_screen = $window.scrollTop();

            $('.js-scroll-activated').each(function(){
                top_of_element = $(this).offset().top;
                bottom_of_element = $(this).offset().top + $(this).outerHeight();  
                
                if ((bottom_of_screen > top_of_element) 
                    && (top_of_screen < bottom_of_element)){
                    // the element is visible, do something
                    $(this).addClass('raised');
                } else {
                    // the element is not visible, do something else
                    $(this).removeClass('raised');
                }
                
            });


        });
    }

    function _setStyling() {
        console.log("Setting Jquery Styling on Page");

       

        //timing func
        // const interval = setInterval(function() {
        //     $(".timed-raise").each(function(){
        //         $(this).toggleClass('raised');
        //     });
        //   }, 1000);         
        //  clearInterval(interval);
        
    }    

    function _setJqueryEvents() {
        console.log("Setting Jquery Events on Page");


        $(document).on('mousedown', function (e) {
            mouseHoldTimer = setTimeout(function () {
                //call functions on the user holding mouse down for x length of time

            }, timerLimit);
        }).on('mouseup', function () {
            clearTimeout(mouseHoldTimer);
        });

        //mouse enter and leave triggers
        $('.raisable').on('mouseenter', function () {
            if (!$(this).hasClass('raised')) {
                $(this).toggleClass('raised');
            }
        }).on('mouseleave', function(){
            if(!$(this).hasClass('stasis') && $(this).hasClass('raised')){
                $(this).toggleClass('raised');
            }
        });

        //raisable text styles
        $('.raisable-text').on('mouseenter', function () {
            
            if (!$(this).hasClass('raised')) {
                //raise
                $(this).toggleClass('raised');

                const text = $(this).find('.content')[0];   
                if(!$(text).hasClass('shelf')){
                    return;
                }      
                const shadowLength = 20;
                const unit = 'px';
                let xAmp = 0, yAmp = 0;
                let shadowStyle = '';
    
                if($(text).hasClass('pop-up')){
                    yAmp = 1;
                }else if($(text).hasClass('pop-down')){
                    yAmp = -1;
                }
    
                if($(text).hasClass('pop-right')){
                    xAmp = -1;
                }else if($(text).hasClass('pop-left')){
                    xAmp = 1;
                }
    
                for(let i = 0; i < shadowLength; i ++){
                    shadowStyle += i == 0 ? "" : ",";
                    shadowStyle += `${i * xAmp}${unit} ${i * yAmp}${unit} #c15`;
                }
                // shadowStyle+='!important;';
                text.style.textShadow=shadowStyle;  
            }

        }).on('mouseleave', function(){
            if(!$(this).hasClass('stasis') && $(this).hasClass('raised')){
                //drop
                $(this).toggleClass('raised');

                const text = $(this).find('.content')[0];   
                if(!$(text).hasClass('shelf')){
                    return;
                }      
                text.style.textShadow='';  
            }
        });

        //stasis on click
        $('.raisable, .raisable-text').on('click', function () {
            if ($(this).hasClass('raised')) {
                $(this).toggleClass('stasis');
            }

            if($('.stasis').length == 2){
                setTimeout(function(){alert("Under construction, come back later!");}, 1000);
            }
        });
    } 

    
    // public members, exposed with return statement
    return {
        InitPage: InitPage,
    };
})();
