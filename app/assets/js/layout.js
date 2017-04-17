
$(document).scroll(function(){
    var y = $(document).scrollTop(), header=$('.api-nav');
    // console.log(y);
    if(y>=400){
        header.css({position:"fixed",top:'16px'});
        header.addClass('hidden-sm');
    }
    else{
        header.css({position:"absolute"});
    }
    /*,width:"270px"*/
});