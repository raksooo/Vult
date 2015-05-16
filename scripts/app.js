module.exports = {
  init: function (){ app(); return "hej"; } //app()
};

var http = require('http');
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var $ = require('jquery');

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
    saveToken: function() { searchMovie() }
  };

  function saveToken(to) {
    var res = '';
    parseString(to, function (err, result) {
      res = result.methodResponse.params[0].param[0].value[0].struct[0].member[0].value[0].string[0];
      data.token = to;
    });
    console.log(callback);
    callback.saveToken();
  }

  function saveMovieId(mov) {
    var res = '';
    parseString(mov, function (err, result) {
      res = result.methodResponse.params[0].param[0].value[0].struct[0].member[1].value[0].string[0];
     // <value>
     //  <array>
     //   <data>
     //    <value>
     //     <struct>
     //      <member>
     //       <name>id</name>
     //       <value><string>0088763</string></value>
      console.log(res);
    });
  }

	function searchMovie(){
    // struct SearchMoviesOnIMDB(string $token, string $query)
    var xml = createXmlQuery('SearchMoviesOnImdb', [
        {'type' : 'string', 'value' : data.token},
        {'type' : 'string', 'value' : 'Batman Begins'}
    ]);

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

      console.log( res.statusCode );
      buffer = "";
      res.on( "data", function( data ) { buffer = buffer + data; } );
	});
	req.write(xml);
    req.end();
  }

	function searchSubtitle(){
  
  	var subTitleArray = createXmlQuery("SearchSubtitles",
      [{'type': 'struct', 'value': ''},
       {'type': 'string', 'value': ''},
       {'type': 'string', 'value': ''},
       {'type': 'double', 'value': ''},
       {'type': 'string', 'value': ''}]
     );

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

      console.log( res.statusCode );
      buffer = "";
      res.on( "data", function( data ) { buffer = buffer + data; } );
      res.on( "end", function( data ) { saveMovieId(buffer);  /*console.log( buffer );*/ } );
    });

    req.write(xml);
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
      			/*result+="<member><name></name><value><string></string></value>
      			</member><member><name></name><value><string>/value>
      			</member><member><name></string></name><value><double></double></value></member>";
      		*/}
      		result+="</param>";
      	}
      	result +="</params>";
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
      "<value><string>en</string></value>" +
      "</param>" +
      "<param>" +
      "<value><string>OSTestUserAgent</string></value>" +
      "</param>" +
      "</params>" +
      "</methodCall>";

    var xml = createXmlQuery("LogIn",
      [{'type': 'string', 'value': ''},
       {'type': 'string', 'value': ''},
       {'type': 'string', 'value': ''},
       {'type': 'string', 'value': 'OSTestUserAgent'}]
     );

    var xmlTest = "<methodCall>" +
      "<methodName>ServerInfo</methodName>" +
      "</methodCall>";
    console.log(xml);

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

      console.log( res.statusCode );
      buffer = "";
      res.on( "data", function( data ) { buffer = buffer + data; } );
      res.on( "end", function( data ) { saveToken(buffer); /*console.log( buffer );*/ } );
    });

    req.write(xml);
    req.end();

    console.log('thebuffer'+buffer);
    return buffer;
  }
};