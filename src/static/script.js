var websocket = new WebSocket("ws://localhost:9999/");

var template;
var results = [];

websocket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    if (data.status === 'first') {
        addOriginal(data.original);
    } else if (data.status === 'film') {
        addFilm(data);
    } else if (data.status === 'done') {
        enableForm();
    }
}

function init() {
    template = document.querySelector('#template');
    document.querySelector('#result').removeChild(template);
}

function addOriginal(original) {
    var originalNode = template.cloneNode();
    originalNode.innerHTML = template.innerHTML;
    originalNode.id = 'original';
    originalNode.querySelector('.title').innerHTML = original.Title;
    var result = document.querySelector('#result');
    result.insertBefore(originalNode, result.firstChild);
}

function insertResult(value) {
    for (var i=0; i<results.length; i++) {
        if (value < results[i]) {
            results.splice(i, 0, value);
            return i;
        }
    }
    results.push(value);
    return results.length - 1;
}

function addFilm(data) {
    var position = insertResult(data.overlap);

    var filmNode = document.createElement('li');
    filmNode.innerHTML = template.innerHTML;
    filmNode.className = 'film';
    filmNode.querySelector('.title').innerHTML = data.film.Title;
    filmNode.querySelector('.overlap').innerHTML = Math.round(data.overlap*100) + '%';
    filmNode.querySelector('.offset').innerHTML = data.shortFilm + ' with ' + data.offset;

    var ul = document.querySelector('#result').querySelector('ul');
    var next = ul.childNodes[position];
    if (next) {
        ul.insertBefore(filmNode, next);
    } else {
        ul.appendChild(filmNode);
    }
}

function enableForm() {
    document.querySelector('#movie').removeAttribute('disabled');
    document.querySelector('#getMatch').removeAttribute('disabled');
}

function getRecommendation() {
    var initial = document.querySelector('.initial');
    if (initial) {
        initial.classList.remove("initial");
    }
    document.querySelector('#movie').setAttribute('disabled', 'disabled');
    document.querySelector('#getMatch').setAttribute('disabled', 'disabled');
    var data = {
        type: 'recommended',
        movie: document.getElementById('movie').value
    }
    websocket.send(JSON.stringify(data));
}

function imFeelingLucky() {
    var movie = document.getElementById("movie").value;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "imFeelingLucky?film=" + movie, false);
    xmlhttp.send();
    document.getElementById("result").innerHTML = xmlhttp.response;
}

