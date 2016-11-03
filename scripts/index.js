
var etat = navigator.onLine ? "ONLINE" : "OFFLINE";
var lat_current_position;
var lng_current_position;
var map;
var position_map;
var options_map;
var zoom_map = 15;
var user_marker_map;
var div_carte = $("#carte-content");
var div_statut = $("#header-statut");
var div_refocus = $("#button-refocus");
var div_signalement = $("#button-signalement");
var isOffCenter = false;

var current_angle = 0;

var translationHeight = 0;
var translationWidth = 0;


function calculerTranslationMap(){
	
	var centreWindowWidth = $(window).width() / 2;
var centreWindowHeight = $(window).height() / 2;
console.log("le centre de la fenêtre: width " +centreWindowWidth+ ", height " +centreWindowHeight);
var centreDivMapWidth = 2000/2;
var centreDivMapHeight = 2000/2;
translationHeight = centreDivMapHeight - centreWindowHeight;
translationWidth = centreDivMapWidth - centreWindowWidth;

	
};
 calculerTranslationMap();



//Créer une map
function createMap() {
	
	//TODO virer les controlles de la carte
    position_map = new google.maps.LatLng(lat_current_position, lng_current_position);
    options_map = {
        zoom: zoom_map,
        center: position_map,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI:true
    };
   
    map = new google.maps.Map(document.getElementById('carte-content'), options_map);
	
	 user_marker_map = new google.maps.Marker({
        position: position_map,
		draggable:true
        //icon: marker_img_icon
    });
	//positionner le marqueur sur la carte
	 user_marker_map.setMap(map);
	 map.addListener('drag', function(){
		 //afficher le bouton derecentrage
	  div_refocus.fadeIn(400,'swing');
	  isOffCenter = true;
	 });
	  
  map.addListener('idle',function(){
	  
  });
	
};

//deplace le marqueur sur la carte et recentre la carte à ce marqueur
function moveMarker( lat,lng ) {
if(user_marker_map){
	 user_marker_map.setPosition( new google.maps.LatLng( lat, lng ) );
		//Si l'utilisateur décentre la carte ne pas recentrer
		if(isOffCenter){
			return;
		}
        map.panTo( new google.maps.LatLng( lat, lng ) );
}
};

function geo_ok(position) {
	lat_current_position = position.coords.latitude;
	lng_current_position = position.coords.longitude;
	createMap();
	//altitude = position.coords.altitude; // seulement sur firefox
}

function geo_error(error) {
	//alert(error.message+" / "+error.code);
	//TODO : prévoir d'enregistrer dans un cookie la dernière position acquise;
	lat_current_position = 43.898324599999995;
	lng_current_position = 1.8960651999999998;
}

function geo() {
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(
			geo_ok,
			geo_error, 
			{ enableHighAccuracy:true, maximumAge:5000, timeout:5000}
		);
	} else {
		alert('Erreur : pas de support de la géolocalisation dans votre navigateur');
	}
}

function setHeightDivMap(){
	var viewport_height = $(window).height();
	var header_height = $("#carte-header").outerHeight();
	var footer_height = $("#carte-footer").outerHeight();
	
	// var 
	
    // var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
    
    // var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
    // if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
        // content_height -= (content.outerHeight() - content.height());
    // }
    return viewport_height - header_height - footer_height;
}
function setHeightBottomControl()
{
	var footerHeight = $("#carte-footer").outerHeight();
	return footerHeight +50 ;
}

var i =0; //itérateur test

//Mets à jour la carte en positionnant le marqueur à la position actuelle
function updateMarkerMap(){
	//stockage position actuelle
	var last_lat = lat_current_position;
	var last_lng = lng_current_position;
	i++;
	var VALUE = 0.0001;
	//Uniquement pour des tests
	if(i<30){
		lat_current_position+=VALUE;
	lng_current_position+=VALUE;
	}else if(i>=30 && i< 50){
		lat_current_position+=VALUE;
	lng_current_position-=0.0001;
	}else if(i>=50&& i< 70){
		lat_current_position+=VALUE;
	lng_current_position+=VALUE+0.0001;
	}else{
		lat_current_position+=VALUE;
	lng_current_position+=VALUE;
	}
	
moveMarker( lat_current_position, lng_current_position );
    		var A = new point(last_lat,last_lng);
		var B = new point(lat_current_position,lng_current_position);
		var C = new point(last_lat + 1,last_lng);
		//Si l'utilisateur décentre la carte ne pas recentrer
	 if(isOffCenter){ return;}
	 rotateMap(A,B,C);
	
};


function stopAutoNavigation(){
	clearInterval(autoPilot);
};

$(document).ready(function(){
	//Notification
	showConnection(etat);
	//placement du bouton de recentrage
	div_refocus.css({"bottom" :  setHeightBottomControl()+"px"});
	div_signalement.css({"bottom" :  setHeightBottomControl()+"px","right": div_refocus.position().left+"px"});
	//initialiser la hauteur du div map 
//div_carte.css(({"width": "100%", "height": setHeightDivMap()+"px"}));
div_carte.css(({"width": "2000px", "height": "2000px","left":"-"+translationWidth+"px","top":"-"+translationHeight+"px"}));
	//cacher le bouton de recentrage
	div_refocus.hide();
	//acquérir la position actuelle
	geo();
});


$(document).on("pageshow", function (event, data) {
    if (map) {
        google.maps.event.trigger(map, "resize"); //permet d'éviter d'afficher une carte grisée
        if (user_marker_map) {
            map.setCenter(user_marker_map.getPosition());
        }
    }
});

//Test
var autoPilot = setInterval(updateMarkerMap,500);

$(".round-button").on('click', function(){
	 map.panTo( user_marker_map.getPosition());
	  div_refocus.fadeOut(400,'swing');
	  isOffCenter =false;
	
});

function showConnection(state){
	div_statut.text(state);
	 //div_statut.html("<a href='#' data-icon='signal' class='ui-btn ui-corner-all ui-icon-signal ui-btn-icon-notext'>Action Icon</a>");
};


//Gestion du offline
window.addEventListener('online', showConnection('ONLINE'));
window.addEventListener('offline', showConnection('OFFLINE'));

