function getRecommendation() {
    document.getElementById("result").innerHTML = "";

    movie = document.getElementById("movie");
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "getRecommendedMovies?film=" + movie.value, false);
    xmlhttp.send();
    var result = JSON.parse(xmlhttp.response);
    console.log(result);

    for (var i = 0; i < result.length; i++) {
        var parsed = result[i];

        var list = document.createElement("ul");
        var offset = document.createElement("li");
        var shortFilm = document.createElement("li");
        var film = document.createElement("li");
        var overlap = document.createElement("li");

        offset.innerHTML = parsed.offset + 's';
        shortFilm.innerHTML = parsed.shortFilm;
        film.innerHTML = parsed.film;
        overlap.innerHTML = Math.round(parsed.overlap*100) + '%';

        list.appendChild(overlap);
        list.appendChild(film);
        list.appendChild(shortFilm);
        list.appendChild(offset);

        document.getElementById("result").appendChild(list);
    };
}

function imFeelingLucky() {
    var movie = document.getElementById("movie").value;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "imFeelingLucky?film=" + movie, false);
    xmlhttp.send();
    document.getElementById("result").innerHTML = xmlhttp.response;
}

