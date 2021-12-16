window.onload = ()=> {
    console.log('Welcome to SavikLand.com, Enjoy your stay!');
    GlobalModule.InitPage();
};


var GlobalModule = (function() {
    // private members
    let mouseHoldTimer = 0;
    const stasisTimerLimit = 500;

    // Public Method
    function InitPage() {
        _setJqueryEvents();
        _setStyling();
    }
  
    function _setStyling(){
        console.log("Setting Jquery Styling on Page");
        
    }

    // Private Method
    function _setJqueryEvents() {
        console.log("Setting Jquery Events on Page");       
        

        $(document)
        .on('mousedown', function(e) {
            if($(e.target).parent().hasClass('raisable')){
                return
            }
            mouseHoldTimer = setTimeout(function(){
                $('.stasis').removeClass('stasis');
                $('.raised').not('.stuck').removeClass('raised');  
                $('#business').removeClass('business')
            }, stasisTimerLimit);
        })
        .on('mouseup', function(){
            clearTimeout(mouseHoldTimer);
        });

        $('.raisable').on('mouseenter mouseleave', function(){
            if(!$(this).hasClass('stasis')){
                $(this).toggleClass('raised');       
            }
        });

        $('.raisable').on('click', function(){
            if($(this).hasClass('raised')){
                $(this).toggleClass('stasis');      
            }

            if($('.stasis').length == 9){
                $('#business').addClass('business');
            }
        });
    }
    
    // public members, exposed with return statement
    return {
        InitPage: InitPage,
    };
})();
