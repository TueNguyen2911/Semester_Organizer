$(document).ready(function() {
    $("form#semester-form").css("display", "none");
});

var is_open = false;
function openForm() {
    if(!is_open)
    {
        $("form#semester-form").css("display", "block");  
        is_open = true;
    }
}
function closeForm() {
    if(is_open) {
        $("form#semester-form").css("display", "none");  
        is_open = false;
    }
}