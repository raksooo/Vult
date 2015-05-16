module.exports = {
  init: function (){ app(); return "hej"; } //app()
};

var http = require('http');
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var $ = require('jquery');
//var imdb = require('imdb-api');

var app = function() {
  //var $ = require('jquery')(window);
  var data = {
    //searchMovie: searchMovie,
    init: init,
    token: ''
  };
  init();


  function init() {
    login();
  }

  var callback = {
    saveToken: function() { searchMovie(); },
    saveMovieId: function(imdbid) { searchSubtitle(imdbid); }
  };

  function saveToken(to) {
    //console.log(to);
    var res = '';
    parseString(to, function (err, result) {
      res = result.methodResponse.params[0].param[0].value[0].struct[0].member[0].value[0].string[0];
      data.token = res;
    });
    //console.log(callback);
    callback.saveToken();
  }

  function saveMovieId(mov) {
    var res = '';

    res = JSON.parse(mov).title_popular[0].id;
    // parseString(mov, function (err, result) {
    //   res = result.methodResponse.params[0].param[0].value[0].struct[0].member[0].value[0];//.array[0];
     //                            .data[0].value[0].struct[0].member[0].value[0].string[0];
     //                            <param>
     //                            <value>
     //                            <struct>
     //                            <member>
     //                            <value>
     //                            <array>
     //                            <data>
     //                            <value>
     //                            <struct>
     //                            <member>
     //                            <value><string>0088763</string></value>
     //console.log(res);
     callback.saveMovieId(res.slice(2));

    // );
  }

  function saveSubtitle(sub) {
    var res = '';
    parseString(sub, function (err, result) {
      res = result.methodResponse.params[0].param[0].value[0].struct[0].member[1].value[0].array[0].data[0].value[0].struct[0].member[0];//.value[0].string[0];
    });
    console.log(res);
  }

	function searchMovie(){
    // struct SearchMoviesOnIMDB(string $token, string $query)
    // var xml = createXmlQuery('SearchMoviesOnImdb', [
    //     {'type' : 'string', 'value' : data.token},
    //     {'type' : 'string', 'value' : 'taken'}
    // ]);


    // var getRequest = {
    //   host: 'www.imdb.com',
    //   port: 80,
    //   path: "/xml/find?json=1&nr=1&tt=on&q=lost",
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'text/xml',
    //     'Content-Length': Buffer.byteLength(xml)
    //   }
    // };
    var buffer = '';
    var query = 'taken';
    var req = http.get({
        hostname: 'www.imdb.com',
        port: 80,
        path: '/xml/find?json=1&nr=1&tt=on&q=' + query,
    }, function( res )    {
      //console.log( res.statusCode );
      buffer = "";
      res.on( "data", function( data ) { buffer = buffer + data; } );
      res.on( "end", function( data ) { saveMovieId(buffer); } );
    });
  }

	function searchSubtitle(imdbid){

  	var subTitleArray = createXmlQuery("SearchSubtitles",
      [{'type': 'string', 'value': data.token},
       {'type': 'struct', 'value': imdbid},
       /*{'type': 'string', 'value': ''},
       {'type': 'string', 'value': ''},
       {'type': 'double', 'value': ''},*/
       //{'type': 'string', 'value': imdbid}
       ]
     );
  	//console.log(subTitleArray);
   	var postRequest = {
      host: 'api.opensubtitles.org',
      port: 80,
      path: "/xml-rpc",
      method: 'POST',
      headers: {
          'Content-Type': 'text/xml',
          'Content-Length': Buffer.byteLength(subTitleArray)
      }
    };
	var buffer = '';
    var req = http.request( postRequest, function( res )    {

      // console.log( res.statusCode );
      buffer = "";
      res.on( "data", function( data ) { buffer = buffer + data; } );
      res.on( "end", function( data ) { saveSubtitle(buffer); } );

    }).on('error', function ( res ) {
      console.log(res);
      console.log('Major error!');
    });
    req.write(subTitleArray);
    req.end();

  }

  function createXmlQuery(name, params){
  	var result = "<methodCall>" +
      "<methodName>"+ name+ "</methodName>";
      if (params.length>0) {
      	result += "<params>";
      	for (var param in params){
      		result += "<param>";
      		if(params[param].type === "string"){
            result += "<value><string>"+params[param].value+"</string></value>";
          }else if(params[param].type==="struct"){
            result += "<value><array><data><value><struct><member><name>imdbid</name><value><string>"+params[param].value+"</string></value></member></struct>"+
              "</value></data></array></value>";
          }
          result += "</param>";
        }
        result += "</params>";
      }
      result+="</methodCall>";
      return result;
  }
  //Söka filmer, leta subtitles till filmer, ladda ner subtitles
  // var xml = '<?xml version="1.0" encoding="UTF-8" ?>';
  // parseString(xml, function (err, result) {
  //     console.dir(JSON.stringify(result));
  // });
  function login() {
    var xmlData = "<methodCall>" +
      "<methodName>LogIn</methodName>" +
      "<params>" +
      "<param>" +
      "<value><string></string></value>" +
      "</param>" +
      "<param>" +
      "<value><string></string></value>" +
      "</param>" +
      "<param>" +
      "<value><string></string></value>" +
      "</param>" +
      "<param>" +
      "<value><string>OSTestUserAgent</string></value>" +
      "</param>" +
      "</params>" +
      "</methodCall>";

    var xml = createXmlQuery("LogIn",
      [{'type': 'string', 'value': ''},
       {'type': 'string', 'value': ''},
       {'type': 'string', 'value': 'en'},
       {'type': 'string', 'value': 'OSTestUserAgent'}]
     );

    var xmlTest = "<methodCall>" +
      "<methodName>ServerInfo</methodName>" +
      "</methodCall>";

    var postRequest = {
      host: 'api.opensubtitles.org',
      port: 80,
      path: "/xml-rpc",
      method: 'POST',
      headers: {
          'Content-Type': 'text/xml',
          'Content-Length': Buffer.byteLength(xml)
      }
    };

    var buffer = '';
    var req = http.request( postRequest, function( res )    {

      buffer = "";
      res.on( "data", function( data ) { buffer = buffer + data; } );
      res.on( "end", function( data ) { saveToken(buffer); });
    });

    req.write(xml);
    req.end();

    return buffer;
  }
};
