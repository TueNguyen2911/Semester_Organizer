var is_open;
$(document).ready(function() {
    $("form#semester-form").css("display", "none");
    $("form#course-form").css("display", "none"); 
});

function openSemForm() {
    $("form#semester-form").css("display", "block");  
}
function closeSemForm() {
    $("form#semester-form").css("display", "none");  
}

function openCourseForm() {
    $("form#course-form").css("display", "block");  

}

function closeCourseForm() {
    $("form#course-form").css("display", "none");  

}
