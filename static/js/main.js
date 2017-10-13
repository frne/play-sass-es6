import 'bootstrap';

$(document).ready(function(){
    // launch modal to ensure bootstrap js is working correctly

    $('#modalTrigger').on('click', function(){
        $('#exampleModal').modal()
    });
});