
var etat = navigator.onLine ? "ONLINE" : "OFFLINE";
var lat_current_position;
var lng_current_position;
var lat_current_signalement;
var lng_current_signalement;
var map;
var poly;
var position_map;
var options_map;
var zoom_map = 15;
var user_marker_map;
var liste_signalement_marker_map=[];

//Icone
var marker_img_icon = '/iroad/images/map-marker.png';
var marker_sign_police = '/iroad/images/police-marqueur.png';
var marker_sign_travaux = '/iroad/images/travaux-marqueur.png';
var marker_sign_bouchon = '/iroad/images/bouchon-marqueur.png';
var marker_sign_accident = '/iroad/images/accident-marqueur.png';
var div_carte = $("#carte-content");
var div_compass = $("#compass");
var div_statut = $("#header-statut");
var div_refocus = $("#button-refocus");
var div_signalement = $("#button-signalement");
var isOffCenter = false;
var signalements=[];
var current_angle = 0;
class signalement {constructor(latitude,longitude,id){
	this.latitude = latitude;
	this.longitude = longitude;
	this.id = id;
}
};
var translationHeight = 0;
var translationWidth = 0;

//Par défaut le centre de la carte est caché car le div
//dépasse les dimensions du viewport
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
		draggable:true,
        icon: marker_img_icon
    });
	
	poly = new google.maps.Polyline({
    strokeColor: '#FF7043',
    strokeOpacity: 5,
    strokeWeight: 5
  });
  poly.setMap(map);
	map.addListener('bounds_changed', addLatLng);
	
	//positionner le marqueur sur la carte
	 user_marker_map.setMap(map);
	 map.addListener('drag', function(){
		 //afficher le bouton derecentrage
	  div_refocus.fadeIn(400,'swing');
	  isOffCenter = true;
	  //On veut pouvoir recentrer automatiquement la carte au bout de 5s
	  setTimeout(function(){map.panTo( user_marker_map.getPosition());
	  div_refocus.fadeOut(400,'swing');
	  isOffCenter =false;},5000);
	 }); 
};

function addLatLng() {
//ajoute au chemin parcouru la nouvell position
  path = poly.getPath();
  path.push(user_marker_map.getPosition());
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
	$.cookie('user_latitude', lat_current_position);
	$.cookie('user_longitude', lng_current_position);
	var last_lat = lat_current_position;
	var last_lng = lng_current_position;
	//Récupérer les signalements en bases
	recupererSignalements();
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
$('body').css('overflow','hidden')
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

function recentrer(){
	//if(isOffCenter){
		map.panTo( user_marker_map.getPosition());
	  div_refocus.fadeOut(400,'swing');
	  isOffCenter =false;
	//}	
};


$("#a-refocus").on('click', function(){
	recentrer();
});

$("#a-signalement").on('click', function(){
		 lat_current_signalement = lat_current_position;
	 lng_current_signalement = lng_current_position;
	 console.log("Signalement en lat :"+	 lat_current_signalement +", lng : "+lng_current_signalement);
	
});

//Ajoute un marker sur la carte
function addMarkerOnMap(icon,latitude,longitude){
	
	var sglt_marker_map = new google.maps.Marker({
        //position: {lat:lat_current_signalement,lng:lng_current_signalement},
		position: {lat:latitude,lng:longitude},
		draggable:true,
        icon: icon
    });
	
	sglt_marker_map.setMap(map);
}
// function signaler(value){
	
	// switch(value){
		// case 'controle':
		// //TODO appel AJAX
		// //Ajouter un marqueur sur la carte.
		// addMarkerOnMap(marker_sign_police,lat_current_signalement,lng_current_signalement);
		// break;
		// case 'accident':
		// //TODO appel AJAX
		// //Ajouter un marqueur sur la carte.
		// addMarkerOnMap(marker_sign_accident,lat_current_signalement,lng_current_signalement);
		// break;
		// case 'bouchon':
		// //TODO appel AJAX
		// //Ajouter un marqueur sur la carte.
		// addMarkerOnMap(marker_sign_bouchon,lat_current_signalement,lng_current_signalement);
		// break;
		// case 'travaux':
		// //TODO appel AJAX
		// //Ajouter un marqueur sur la carte.
		// addMarkerOnMap(marker_sign_travaux);
		// break;
		
		
		
		// default:
		// break;
	// }
	
// };
function showConnection(state){
	
	style = state ==='ONLINE' ? 'green' : 'red';
	
	div_statut.html("<span class= 'fa fa-microphone' aria-hidden='true'></span><span class='fa fa-signal' style='color: "+style+";'} aria-hidden='true'></span>");	
	
	
	if(state === 'OFFLINE'){
		//TODO afficher un message et afficher la dernière position
		//sur la carte préalablement sauvegardée
	}
	
};


//Gestion du offline
window.addEventListener('online', showConnection('ONLINE'));
window.addEventListener('offline', showConnection('OFFLINE'));

//Gestion du tap sur les elements avec la classe 
$(".img-btn").on("tap",function(){
	//Réduire la taille du bouton puis retrouve sa taille normale
	$(this).animate({'width':'27%','height':'auto'},100,function(){$(this).animate({'width':'27%','height':'auto'}),200});
	setTimeout(function(){window.location.href = "#carte";},200);
})

function signaler(value){
	
	var icon;
	var id;
	var evenement = getEvenement(value);
	
	signalerEvenement(evenement.id,evenement.icon,lat_current_signalement,lng_current_signalement);
	
};

function getEvenement(value){
	var icon;
	var id;
	switch(value){
		case 'controle':
		icon = marker_sign_police;
		id = 2;
		break;
		case 'accident':
		id= 3;
		icon = marker_sign_accident;
		break;
		case 'bouchon':
		id= 1;
		icon = marker_sign_bouchon;
		break;
		case 'travaux':
		id=4;
		icon = marker_sign_travaux;
		break;
		case 2:
		icon = marker_sign_police;
		break;
		case 3:
		icon = marker_sign_accident;
		break;
		case 1:
		icon = marker_sign_bouchon;
		break;
		case 4:
		
		icon = marker_sign_travaux;
		break;
		
		
		default:
		break;
	}	
	return { icon : icon,id:id};
};

// function afficherSignalementCarte(signalement){
	// var icon;
	// console.log(signalement.Id_Evenement);
	// switch(signalement.Id_Evenement){
		// case "1" : icon = marker_sign_bouchon;
		// break;
		// case "2" : icon = marker_sign_police;
		// break;
		// case "3" : icon = marker_sign_accident;
		// break;
		// case "4" : icon = marker_sign_travaux;
		// break;
		// default:
		// break;
	// }
	// console.log(icon);
	// addMarkerOnMap(icon,signalement.Latitude, signalement.Longitude);
// };

function afficherSignalementCarte(signalement){
	var evenement = getEvenement(parseInt(signalement.Id_Evenement));
	//TODO factoriser code répété ligne 265 -->287
	// var icon;
	// switch(signalement.id_Evenement){
		// case 1 : icon = marker_sign_bouchon;
		// break;
		// case 2 : icon = marker_sign_controle;
		// break;
		// case 3 : icon = marker_sign_accident;
		// break;
		// case 4 : icon = marker_sign_travaux;
		// break;
		// default:
		// break;
	// }
	// addMarkerOnMap(icon)
	//TODO effacer tous les marqueurs des signalements récupérés de la carte
		addMarkerOnMap(evenement.icon,signalement.Latitude,signalement.Longitude);
};

function signalerEvenement(id,icon){
	var params={
		latitude: lat_current_signalement,
		longitude: lng_current_signalement,
		evenement: id
	};
	$.post('./php/signalerEvenement.php', params ,function(result){
		$message = result.message;
		if(result.success){
			if(result.nouveau){
				addMarkerOnMap(icon,lat_current_signalement,lng_current_signalement);
			}
			//TODO mettre à jour l'icone
					}
	},"json");
};

function recupererSignalements(){
	var params={
		latitude: lat_current_position,
		longitude: lng_current_position
	};
	
	$.post('./php/recupererSignalements.php', params ,function(result){
		$message = result.message;
		if(result.success == true){
			for(var i =0;i<result.signalements.length;i++){
				console.log("retour ajax : " +result.signalements[i])
				afficherSignalementCarte(result.signalements[i]);
			}
		}
	},"json");
};

