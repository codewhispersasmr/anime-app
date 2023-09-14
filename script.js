const API = `https://kitsu.io/api/edge`;

// get banner
const banner = document.querySelector(`.banner`);
async function getBanner() {
    const response = await fetch(`${API}/trending/anime`);
    const json = await response.json();

    let html = `<ol>`;
    json.data.forEach((item, i) => {
        const d = item.attributes;
        const c = i == 0 ? 'active' : (i == json.data.length - 1 ? 'prev' : 'next');
        const description = d.synopsis.substring(0, 200);
        html += `
            <li class="banner-item ${c}" style="background-image: url('${d.coverImage.original}');">
                <div class="banner-item-detail-container">
                    <div class="banner-item-details">
                        <h1>${d.canonicalTitle}</h1>
                        <div class="meta">
                            <span><i class="fa fa-play-circle"></i> ${d.showType}</span>
                            <span><i class="fa fa-calendar"></i> ${d.startDate}</span>
                            <span><i class="fa fa-hourglass-start"></i> ${d.episodeLength}m</div>
                        <div class="dec">${description}...</div>
                        <div class="action">
                            <a href="https://www.youtube.com/watch?v=${d.youtubeVideoId}" class="btn-watch" target="_blank"><i class="fa fa-play-circle"></i> Watch Trailer</a>
                        </div>
                    </div>
                </div>
            </li>
        `;
    });
    html += `</ol>`;
    html += `<div class="controls">
                <span class="prev" data-val="-1"><i class="fa fa-chevron-left"></i></span>
                <span class="next" data-val="1"><i class="fa fa-chevron-right"></i></span>
            </div>
    `;

    banner.innerHTML = html;

    const bannerItems = banner.querySelectorAll(`.banner-item`);
    let bannerIndex = 1;

    const getCorrectBannerIndex = (index) => {
        if( index > bannerItems.length ) {
            return  1;
        } else if( index < 1 ) {
            return bannerItems.length;
        }
        return index; 
    }

    const updateBanner = (val) => {
        bannerItems.forEach(b => {
            b.classList.remove('active', 'prev', 'next');
        });
        bannerIndex = getCorrectBannerIndex(val);
        prev = getCorrectBannerIndex(bannerIndex-1);
        next = getCorrectBannerIndex(bannerIndex+1);
        banner.querySelector(`.banner-item:nth-of-type(${bannerIndex})`).classList.add('active');
        banner.querySelector(`.banner-item:nth-of-type(${prev})`).classList.add('prev');
        banner.querySelector(`.banner-item:nth-of-type(${next})`).classList.add('next');

    };
    const controls = document.querySelectorAll(`.controls span`);
    controls.forEach(function(item) {
        item.addEventListener('click', function() {
            const val = bannerIndex + parseInt(item.dataset.val);
            updateBanner(val);
        });
    });

    // automated
    setInterval(() => {
        bannerIndex++;
        updateBanner(bannerIndex);
    }, 5000);
}

getBanner();

// get trending
const trending = document.querySelector(`.trending`);
async function getTrending() {
    const response = await fetch(`${API}/anime?filter[status]=current&page[limit]=20&sort=-user_count`);
    const json = await response.json();
    let html = ``;
    json.data.forEach((item) => {
        const d = item.attributes;
        const img = d.posterImage.medium || d.posterImage.original;
        html += `
            <article class="item anime"
                data-title="${d.canonicalTitle}"
                data-img="${img}"
                data-desc='${d.synopsis}'
                data-youtube="${d.youtubeVideoId}"
            >
                <figure>
                    <img src="${img}" />
                </figure>
                <div class="details">
                    <span class="title">${d.canonicalTitle}</span>
                </div>
            </article>
        ` 
    });
    trending.innerHTML = html;
}

getTrending();

function removeModal() {
    if( document.querySelector(`#modal`) ) {
        document.querySelector(`#modal`).remove();
    }
}

document.addEventListener('click', function(e) {
    const target = e.target.closest('.anime');
    if( ! target ) return false;

    removeModal();

    const d = target.dataset;

    let html = `
        <div id="modal" class="modal-window">
            <div>
               <a href="#" title="Close" class="modal-close"><i class="fa fa-close"></i></a> 
                <div class="modal-body">
                    <div>
                        <img src="${d.img}" />
                        <a href="https://www.youtube.com/watch?v=${d.youtube}&mode=theatre" class="btn-watch" target="_blank"><i class="fa fa-play-circle"></i> Watch Trailer</a>
                    </div>
                    <div class="modal-desc">
                        <h1>${d.title}</h1>
                        <p>${d.desc}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterend', html);
});

document.addEventListener('click', function(e) {
    const target = e.target.closest('.modal-close');
    if( ! target ) return;
    e.preventDefault();
    removeModal();
});

window.addEventListener('scroll', function() {
    const body = document.querySelector('body')
    if( window.scrollY > 0 ) {
        body.classList.add('scroll');
    } else {
        body.classList.remove('scroll');
    }
});

// search functions
const home = document.querySelector('.home');
const searchTerm = document.querySelector('.search-term');
const searchButton = document.querySelector('.search-button');
const searchResult = document.querySelector(`.search-result`);

searchButton.addEventListener('click', function() {
    home.classList.add('hide');
    searchResult.classList.remove('hide');
    const text  = searchTerm.value;
    search(`${API}/anime?filter[text]=${text}`);
});

async function search(url) {
    searchResult.querySelector('.list').innerHTML = 'Loading...'
    const response = await fetch(url);
    const data = await response.json();
    searchResult.querySelector('.list').innerHTML = generateSearchHTML(data.data); 
    searchResult.querySelector('.page').innerHTML = generatePagination(data.links);
}

function generateSearchHTML(data) {
    let html = ``;
    data.forEach((item) => {
        const d = item.attributes;
        const img = d.posterImage.medium || d.posterImage.original;
        html += `
            <article class="search-item anime"
                data-title="${d.canonicalTitle}"
                data-img="${img}"
                data-desc='${d.synopsis}'
                data-youtube="${d.youtubeVideoId}"
            >
                <figure>
                    <img src="${img}" />
                </figure>
                <div class="search-details">
                    <span class="title">${d.canonicalTitle}</span>
                </div>
            </article>
        ` 
    });
    return html;
}

function generatePagination(links) {
    let html = ``;
    if( links.prev ) {
        html += `<a href="javascript: search('${links.prev}');"><i class="fa fa-chevron-left"></i></a>`;
    }
    if( links.next ) {
        html += `<a href="javascript: search('${links.next}');"><i class="fa fa-chevron-right"></i></a>`;
    }
    return html;
}

// click logo
const logo = document.querySelector('.logo');
logo.addEventListener('click', function() {
    home.classList.remove('hide');
    searchResult.classList.add('hide');
    searchTerm.value = '';
});
