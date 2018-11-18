function generateDoctorMessage(title, message) {
    return '<div class="demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--4-col-tablet mdl-cell--12-col-desktop">' +
           '  <div class="mdl-card__title mdl-card--expand mdl-color--teal-300">' +
           '    <h2 class="mdl-card__title-text">' + title + '</h2>' +
           '  </div>' +
           '  <div class="mdl-card__supporting-text mdl-color-text--grey-600">' +
                message +
           '  </div>' +
           '  <div class="mdl-card__actions mdl-card--border">' +
           '    <a href="#" class="mdl-button mdl-js-button mdl-js-ripple-effect">Read More</a>' +
           '  </div>' +
           '</div>'
}

window.onload = function() {
    const Http = new XMLHttpRequest();
    const url='https://hackathons-186411.firebaseio.com/data.json';

    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange=(e)=>{
        if (Http.readyState == 4 && Http.status == 200)
        {
            var myJSONResponse = JSON.parse(Http.responseText);
            Object.keys(myJSONResponse).forEach(function(k){
                console.log(k + ' - ' + myJSONResponse[k]);

                var elem = myJSONResponse[k]
                var elementToAdd = generateDoctorMessage(elem['consulta'], elem['respuesta']);
                var parentElement = document.getElementById("card-holder");
                parentElement.innerHTML = elementToAdd + parentElement.innerHTML;
            });
        }
    }
}