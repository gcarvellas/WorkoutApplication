function getWorkoutIdFromURL(){
    let url = window.location.href;
    const REGEX = "\/workout\/(.*)";
    return url.match(REGEX)[1];
}

function renderButton(value){
    let likeButton = document.getElementById("likeButton");    
    likeButton.checked = value;
    if (value) likeButton.textContent = "Unlike";
    if (value === false)  likeButton.textContent = "Like";
}

function renderLikeResult(strFunction){
    let likeResult = document.getElementById("likeResult");
    likeResult.textContent = `Successfully ${strFunction} workout`;
    likeResult.classList.remove("hidden");
    likeResult.classList.add("success");
    likeResult.classList.add("font-weight-bold");
}

function renderLikeError(e){
    let likeResult = document.getElementById("likeResult");
    likeResult.textContent = e;
    likeResult.classList.remove("hidden");
    likeResult.classList.add("error");
}

function setError(message){
    let errorElement = document.getElementById("error");
    errorElement.classList.remove("hidden");
    errorElement.classList.add('error');
    errorElement.textContent = message;
}

function getTotalLikes(){
    let totalLikes = document.getElementById("totalLikes").textContent;  
    return parseInt(totalLikes);

}

function renderTotalLikes(value){
    let totalLikes = document.getElementById("totalLikes");  
    totalLikes.textContent = `${value}`;
}


(function ($) {
    function copyButtonListener(){
        let copyButton = document.getElementById("copyWorkout");
        copyButton.addEventListener('click', function(event) {
            try{
                var requestConfig = {
                    method: "POST",
                    url: `/workout/${getWorkoutIdFromURL()}/copy`,
                    error: function(xhr, ajaxOptions, thrownError) {setError(xhr.responseJSON['error'])}
                  }
                $.ajax(requestConfig).then(function (result) {
                    if ("error" in result) throw result.error;
                    if (!("href" in result)) throw "Cannot copy workout";
                    window.location.href = result["href"];

                });
            } catch (e) {
                setError(e);
            }
        });
    }
    function likeButtonListener(){
        let likeButton = document.getElementById("likeButton");
        let workoutId = getWorkoutIdFromURL();
        if (likeButton == null) return;

        try{
            var requestConfig = {
                method: "GET",
                url: `/workout/${workoutId}/isUserLiked`
              }

            requestConfig.error = function(xhr, ajaxOptions, thrownError) {throw xhr.responseJSON['error']};
        
            $.ajax(requestConfig).then(function (result) {
                if ("error" in result) throw result.error;
                if (!("hasLike" in result)) throw "Cannot get like status";
                renderButton(result.hasLike);
            }); 
        
            likeButton.addEventListener('click', async function() {
                try{
                    var requestConfig;
                    var strFunction;
                    if (this.checked) {
                        requestConfig = {
                            method: "DELETE",
                            url: `/workout/${workoutId}/like`
                        }
                        strFunction = "unliked";
                    }
                    else if (this.checked === false){
                        requestConfig = {
                            method: "PUT",
                            url: `/workout/${workoutId}/like`
                        }
                        strFunction = "liked";
                    }
                    else{
                        throw "Undefined state in like button";
                    }
                    requestConfig.error = function(xhr, ajaxOptions, thrownError){ throw xhr.responseJSON['error'] };
                    $.ajax(requestConfig).then(function (result) {
                        if ("error" in result) throw result.error;
                        if (!("hasLike") in result) throw "Cannot like workout";
                        renderLikeResult(strFunction);
                        renderButton(result.hasLike);
                        if (result.hasLike){
                            renderTotalLikes(getTotalLikes()+1);
                        }
                        else{
                            renderTotalLikes(getTotalLikes()-1)
                        }
                    });
                } catch (e) {
                    renderLikeError(e);
                }
            });
        } catch (e) {
            renderLikeError(e);
        }
    }
    likeButtonListener();
    copyButtonListener();
})(window.jQuery);
