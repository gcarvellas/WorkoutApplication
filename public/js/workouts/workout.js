const INTENSITY_HTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fire" viewBox="0 0 16 16">
<path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
</svg>`;

function getWorkoutIdFromURL(){
    let url = window.location.href;
    const REGEX = "\/workout\/(.*)/?";
    return url.match(REGEX)[1].split('/')[0];
}

function generateFire(){
    let temp = document.createElement("small");
    temp.innerHTML = INTENSITY_HTML;
    return temp;
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
    function renderIntensity(){
        const intensityElement = document.getElementById("totalIntensity");
        if (intensityElement){
            const parentElement = intensityElement.parentNode;
            let value = parseInt(intensityElement.textContent);
            intensityElement.remove();
            for(let i=0; i< value; i++){
                parentElement.appendChild(generateFire());
            }
        }
    }
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
    renderIntensity();
})(window.jQuery);
