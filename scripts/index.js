window.onload = () => {
    console.log('Welcome to SavikLand.com, Enjoy your stay!');
    GlobalModule.InitPage();
};

var $window = $(window);

var GlobalModule = (function () {
    // private members
    let mouseHoldTimer = 0;
    const stasisTimerLimit = 500;

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

        
    }

    // Private Method
    function _setJqueryEvents() {
        console.log("Setting Jquery Events on Page");


        $(document)
            .on('mousedown', function (e) {
                if ($(e.target).parent().hasClass('raisable')) {
                    return
                }
                mouseHoldTimer = setTimeout(function () {
                    $('.stasis').removeClass('stasis');
                    $('.raised').not('.stuck').removeClass('raised');
                    $('#business').removeClass('business')
                }, stasisTimerLimit);
            })
            .on('mouseup', function () {
                clearTimeout(mouseHoldTimer);
            });

        $('.raisable, .raisable-text').on('mouseenter', function () {
            if (!$(this).hasClass('raised')) {
                $(this).toggleClass('raised');
            }
        }).on('mouseleave', function(){
            if(!$(this).hasClass('stasis') && $(this).hasClass('raised')){
                $(this).toggleClass('raised');
            }
        });

        $('.raisable, .raisable-text').on('click', function () {
            if ($(this).hasClass('raised')) {
                $(this).toggleClass('stasis');
            }

            if ($('.stasis').length == 9) {
                $('#business').addClass('business');
            }
        });
    }

    // public members, exposed with return statement
    return {
        InitPage: InitPage,
    };
})();
