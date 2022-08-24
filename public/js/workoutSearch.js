function xss(input){
    /**
     * Will throw an exception if string contains an HTML element
     * @param {String} input input string
     * @return {String} input string
     * @throws will throw an exception if html is in string
     */
    if (typeof input !== 'string') return input;
    REGEX = "<(“[^”]*”|'[^’]*’|[^'”>])*>";
    if (input.match(REGEX) !== null) throw "Cannot use this";
    return input;
}

function addResults(searchResults) {
    try{
        for(let data of searchResults.data) {
            let intensityHtml = "";
            for(let i = 0; i < data.intensity; i++) {
                intensityHtml += `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fire" viewBox="0 0 16 16">
                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
                </svg>`;
            }
    
                let a = document.createElement('a');
                document.getElementById("search-results").appendChild(a);
                a.href = `/workout/${data._id}`
                a.classList.add("list-group-item");
                a.classList.add("list-group-item-action")
                a.classList.add("flex-column");
                a.classList.add("align-items-start");
                let div = document.createElement('div');
                a.appendChild(div);
                div.classList.add("d-flex");
                div.classList.add("w-100");
                div.classList.add("justify-content-between");
                let h5 = document.createElement('h5');
                div.appendChild(h5);
                h5.classList.add("mb-1");
                let small = document.createElement('small');
                div.appendChild(small);
                small.innerHTML = intensityHtml;
                let p = document.createElement('p');
                a.appendChild(p);
                p.classList.add('mb-1');
                let svg = document.createElement('svg');
                p.appendChild(svg);
                svg.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
                                             <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>`
                let path1 = document.createElement('path');
                svg.appendChild(path1);
                path1.d = "M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z";
                let path2 = document.createElement('path');
                svg.appendChild(path2);
                path2.d = "M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z";
                small = document.createElement('small');
                a.appendChild(small);
                svg = document.createElement('svg');
                small.appendChild(svg);
                svg.outerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                                        <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
                                      </svg>`;
    
                h5.insertAdjacentText('beforeend', data.name);
                p.insertAdjacentText('beforeend', " " + data.length + " minutes");
                small.insertAdjacentText('beforeend'," "+ data.usersLiked.length);
    
        }
    } catch (e) {
        addErrorMessage("Unexpected error", e);
    }
}

function addPagination(uri, currentPage, totalPages, hasNextPage, pageSize) {
    try{
        xss(uri),
        xss(currentPage);
        xss(totalPages);
        xss(hasNextPage);
        xss(pageSize);
        let previousPageHtml = "";
        let pageHtml = "";
    
        if(totalPages > 1) {
            if(currentPage > 1) {
                previousPageHtml += `<li class="page-item">
                                        <a class="page-link" href="${uri}?page=${currentPage - 1}&pageSize=${pageSize}" aria-label="Previous">
                                            <span aria-hidden="true">&laquo;</span>
                                            <span class="sr-only">Previous</span>
                                        </a>
                                    </li>`;
            }
    
            for(let i = 1; i <= totalPages; i++){
                if(i === currentPage) {
                    pageHtml += `<li class="page-item active"><a class="page-link" href="${uri}?page=${i}&pageSize=${pageSize}">${i}</a></li>`;
                } else {
                    pageHtml += `<li class="page-item"><a class="page-link" href="${uri}?page=${i}&pageSize=${pageSize}">${i}</a></li>`;
                }
            }
        }
    
        let nextPageHtml = "";
    
        if(hasNextPage) {
            nextPageHtml = `<li class="page-item">
                                <a class="page-link" href="${uri}?page=${currentPage + 1}&pageSize=${pageSize}" aria-label="Next">
                                    <span aria-hidden="true">&raquo;</span>
                                    <span class="sr-only">Next</span>
                                </a>
                            </li>`;
        }
                        
        $('#pagination').append(`<nav aria-label="Page navigation example">
                                    <ul id="pagination-links" class="pagination justify-content-center">
                                        ${previousPageHtml}
                                        ${pageHtml}
                                        ${nextPageHtml}
                                    </ul>
                                </nav>`);
    
    } catch (e) {
        addErrorMessage(errorTitle, errorMessage);
    }
}

function addErrorMessage(errorTitle, errorMessage) {
    $('#workout-search-error').append(`<div class="alert alert-danger" role="alert">
                            <h4 class="alert-heading">${errorTitle}</h4>
                            <p>${errorMessage}</p>
                        </div>`);
}

(function ($) {
    var searchValue = $('#selection'),
        searchResults = $('#search-results'),
        pagination = $('#pagination'),
        nameValue = $('#search-name-value'),
        errorField = $('#workout-search-error');

    $('#user-workout-search').click(function() {
        searchResults.empty();
        pagination.empty();
        errorField.empty();

        var requestConfig = {
            async: true,
            method: 'GET',
            url: `/workoutSearch/user/loggedInUser?page=1&pageSize=10`
        };

        $.ajax(requestConfig).then(function (searchResult) {
            if(searchResult.data.length !== 0) {
                addResults(searchResult);
                addPagination(`/workoutSearch/user/loggedInUser`, searchResult.page, searchResult.totalPages, searchResult.hasNextPage, 10);
            } else {
                addErrorMessage(`No user workouts found`, `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-frown" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
              </svg> Seems you do not have any workouts made! `);
            }
        });
    });

    $(document).find('form#nameSearch').on('submit', function(event) {
        try{
            event.preventDefault();
            searchResults.empty();
            pagination.empty();
            errorField.empty();
    
            var search_name = nameValue.val();
    
            var requestConfig = {
                async: true,
                method: 'GET',
                url: `/workoutSearch/name/${search_name}?page=1&pageSize=10`
            };
    
            $.ajax(requestConfig).then(function (searchResults) {
    
                if(search_name.trim().length === 0) {
                    addErrorMessage(`Name cannot be empty`, `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-frown" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
                  </svg> Please write something on the search field! `);
                } else if(searchResults.data.length !== 0) {
                    addResults(searchResults);
                    addPagination(`/workoutSearch/name/${xss(search_name)}`, searchResults.page, searchResults.totalPages, searchResults.hasNextPage, 10);
                } else {
                    addErrorMessage(`No workouts found with the name "${xss(search_name)}"`, `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-frown" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
                  </svg> There doesn't appear to be a workout with that name.`);
                }
            });
        } catch (e) {
            addErrorMessage("Unexpected Error", e);
        }
    });

    $(document).on('click', 'ul#pagination-links > li > a',function (event) {
        try{
            event.preventDefault();
            searchResults.empty();
            pagination.empty();
            errorField.empty();
    
            const uri = $(this).attr('href').split('?')[0];
            const splitUrl = $(this).attr('href').split('?')[0].split('/');
            var requestConfig = {
                async: true,
                method: 'GET',
                url: $(this).attr('href')
            };
    
            $.ajax(requestConfig).then(function (searchResults) {
                if(searchResults.data.length !== 0) {
                    addResults(searchResults);
                    addPagination(uri, searchResults.page, searchResults.totalPages, searchResults.hasNextPage, 10);
                }   
            });
        } catch (e) {
            addErrorMessage("Unexpected Error", e);
        }
    });
    
    searchValue.ready(function () {
        try{
            var workoutSearchValue = $(this).find("option:selected").val();

            if(workoutSearchValue !== null) {
                var requestConfig = {
                    async : true,
                    method : 'GET',
                    url : `/workoutSearch/${workoutSearchValue}?page=1&pageSize=10`
                };
        
                $.ajax(requestConfig).then(function (searchResults) {
                    if(searchResults.data.length !== 0) {
                        addResults(searchResults);
                        addPagination(`/workoutSearch/${xss(workoutSearchValue)}`, searchResults.page, searchResults.totalPages, searchResults.hasNextPage, 10);
                    } else {
                        addErrorMessage(`No workouts found`, `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-frown" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                        <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
                                        </svg> There doesn't appear to be any workouts available`);
                    }
                });
            }
        } catch (e) {
            addErrorMessage("Unexpected Error", e);
        }
    });

    searchValue.change(function (event) {
        try{
            event.preventDefault();
            searchResults.empty();
            pagination.empty();
            errorField.empty();
    
            var workoutSearchValue = $(this).find("option:selected").val();
    
            if(workoutSearchValue !== null) {
                var requestConfig = {
                    async : true,
                    method : 'GET',
                    url : `/workoutSearch/${workoutSearchValue}?page=1&pageSize=10`
                };
        
                $.ajax(requestConfig).then(function (searchResults) {
                    if(searchResults.data.length !== 0) {
                        addResults(searchResults);
                        addPagination(`/workoutSearch/${xss(workoutSearchValue)}`, searchResults.page, searchResults.totalPages, searchResults.hasNextPage, 10);
                    } else {
                        addErrorMessage(`No workouts found for ${xss(workoutSearchValue)}`, `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-frown" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                        <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
                                        </svg> There doesn't appear to be a workout for the specific muscle group of ${xss(workoutSearchValue)}`);
                    }
                });
            }
        } catch (e) {
            addErrorMessage("Unexpected Error", e);
        }
    });
})(window.jQuery);