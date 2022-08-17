const LIKE_WORKOUT_URL = "/workout/like";

function getWorkoutIdFromURL(){
    let url = window.location.href;
    const REGEX = "\/workout\/(.*)";
    return url.match(REGEX);
}

(function ($) {
    function likeButtonListener(){
        let likeButton = document.getElementById("likeButton");
        let workoutId = getWorkoutIdFromURL();
        if (likeButton == null) return;

        try{
            var requestConfig = {
                method: "GET",
                url: LIKE_WORKOUT_URL,
                workout
              }
        
            $.ajax(requestConfig).then(function (result) {
                if ("error" in result) throw result.error;
                if (!("result" in result)) throw "Cannot get like status";
                const isLikedWorkout = result.result;
                if (isLikedWorkout && !likeButton.checked){
                    likeButton.checked = true;
                }
            }); 
        
            likeButton.addEventListener('change', async function() {
                if (this.checked){
                    var requestConfig = {
                        method: "POST",
                        url: LIKE_WORKOUT_URL
                      }
                      $.ajax(requestConfig).then(function (result) {
                        if ("error" in result) throw result.error;
                        if (!("success") in result || !result.success) throw "Cannot like workout";
                        let likeResult = document.getElementById("likeResult");
                        likeResult.textContent = "Successfully liked workout";
                        likeResult.classList.remove("hidden");
                        likeResult.classList.add("success");
                      });
                }
                else{
                    var requestConfig = {
                        method: "DELETE",
                        url: LIKE_WORKOUT_URL
                      }
                    $.ajax(requestConfig).then(function (result) {
                        if ("error" in result) throw result.error;
                        if (!("success") in result || !result.success) throw "Cannot remove like from workout";
                    })
                    let likeResult = document.getElementById("likeResult");
                    likeResult.textContent = "Successfully removed workout";
                    likeResult.classList.remove("hidden");
                    likeResult.classList.add("success");
                }
            })
        } catch (e) {
            let likeResult = document.getElementById("likeResult");
            likeResult.textContent = e;
            likeResult.classList.remove("hidden");
            likeResult.classList.add("error");
        }
    }
    likeButtonListener();
})(window.jQuery);
