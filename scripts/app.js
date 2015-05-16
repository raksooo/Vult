module.exports = {
  init: function (){ app(); return "hej"; } //app()
};

var http = require('http');
var xml2js = require('xml2js');

var app = function() {
  var data = {
    searchMovie: searchMovie,
    init: init
  };
  init();


  function init() {
    login();
    searchSubtitle();
  };

	function searchMovie(){
    SearchMoviesOnImdb();
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
      res.on( "end", function( data ) { console.log( buffer ); } );
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
          console.log(param);
      		if(params[param].type === "string"){
      			result += "<value><string>"+params[param].value+"</string></value>";
      		}else if(params[param].type==="struct"){
      			result+="<member><name></name><value><string></string></value>
      			</member><member><name></name><value><string>"+data.token+"/value>
      			</member><member><name></string></name><value><double></double></value></member>";
      		}
      		result+="</param>";
      	}
      	result +="</params>";
      }
      result+="</methodCall>";
      return result;
  }
  //Söka filmer, leta subtitles till filmer, ladda ner subtitles
  var parseString = require('xml2js').parseString;
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
  //  console.log(xml);
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
      res.on( "end", function( data ) { console.log( buffer ); } );
    });

    req.write(xml);
    req.end();

  }
};