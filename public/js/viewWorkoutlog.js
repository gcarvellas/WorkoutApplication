const editLog = document.getElementById('editButton');
const deleteLog = document.getElementById('modalConfirmDelete');
const copyLog = document.getElementById('copyButton');

(function ($) {

  $(deleteLog).on('click', (event) => {
    console.log('delete');

    let workoutLogId = $(deleteLog).data('workoutlogid');
    let workoutId = $(deleteLog).data('workoutid');
    console.log("workoutLogId:", workoutLogId);
    console.log("workoutId:", workoutId);

    let requestConfig = {
      method: "DELETE",
      url: `/workoutlog/${workoutLogId}`,
      dataType: "json",
      success: function(msg) {
        //go to previous workout page
        window.location.href=`/workout/${workoutId}`;
      }
    }

    $.ajax(requestConfig);
  });


  $(editLog).on('click', (event) => {
    console.log('edit');

    let workoutLogId = $(deleteLog).data('workoutlogid');
    let workoutId = $(deleteLog).data('workoutid');
    
    window.location.href=`/workout/${workoutId}/logedit/${workoutLogId}`;
  });

  $(copyLog).on('click', (event) => {
    console.log('copy');

    let workoutLogId = $(deleteLog).data('workoutlogid');
    let workoutId = $(deleteLog).data('workoutid');

    window.location.href=`/workout/${workoutId}/logcopy/${workoutLogId}`;
  });

})(window.jQuery);