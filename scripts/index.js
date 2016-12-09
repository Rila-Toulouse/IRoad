
var isOnline = navigator.onLine ? "ONLINE" : "OFFLINE";
var lat_offset_position;
var lng_offset_position;
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
var timer;

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
class signalement {constructor(id,latitude,longitude,marqueur,evenement,date,utilisateur){
	this.id = id;
	this.latitude = latitude;
	this.longitude = longitude;
	this.marqueur = marqueur;
	this.evenement = evenement;
	this.date = date;
	this.utilisateur=utilisateur;
}
};
var translationHeight = 0;
var translationWidth = 0;

//Par défaut le centre de la carte est caché car le div
//dépasse les dimensions du viewport
function calculerTranslationMap(){
	
	var centreWindowWidth = $(window).width() / 2;
var centreWindowHeight = $(window).height() / 2;
//console.log("le centre de la fenêtre: width " +centreWindowWidth+ ", height " +centreWindowHeight);
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
	 map.addListener('drag',
		function(){
		 //afficher le bouton derecentrage
		div_refocus.fadeIn(400,'swing');
		isOffCenter = true;
		if(timer){
		  clearTimeout(timer); 
		}
	 
	  //On veut pouvoir recentrer automatiquement la carte au bout de 5s
	  // timer = setTimeout(function(){map.panTo( user_marker_map.getPosition());
	  // div_refocus.fadeOut(400,'swing');
	  // isOffCenter =false;},5000);
	 // });
	 
		timer = recentrageAuto();
		});

};

createMap();
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
	//sauvegarde de la position courante 
	lat_current_position = position.coords.latitude;
	lng_current_position = position.coords.longitude;
	//console.log(lat_current_position , lng_current_position );
	lat_offset_position = lat_current_position;
	lng_offset_position = lng_current_position;
	//creation de la carte
	createMap();
	//recupérer les signalements existants
	recupererSignalements();
	
}

function geo_error(error) {
	//TODO prevoir d'afficher le message dans un boite dialogue
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
			//recupererSignalements();
	var distParcourue = calculerDistanceParcourue();
	// >500m
	if(distParcourue > 1){
		recupererSignalements();
		lat_offset_position = lat_current_position;
		lng_offset_position = lng_current_position;
	}
	

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
	//Vérification de l'état online/offline
	showConnection(isOnline);
	if(isOnline){
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
	//timer
	timer = recentrageAuto();
	}
	
	
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
		map.panTo( user_marker_map.getPosition());
	  div_refocus.fadeOut(400,'swing');
	  isOffCenter =false;
};

function recentrageAuto(){
	
	return setTimeout(function(){map.panTo( user_marker_map.getPosition());
	  div_refocus.fadeOut(400,'swing');
	  isOffCenter =false;},5000);
};


$("#a-refocus").on('click', function(){
	recentrer();
});

$("#a-signalement").on('click', function(){
	//enregistre la position de l'évènement
		 lat_current_signalement = lat_current_position;
	 lng_current_signalement = lng_current_position;
	 console.log("Signalement en lat :"+	 lat_current_signalement +", lng : "+lng_current_signalement);
	
});

function createMarker(icon,signalement){
	
	var markerSignalement = new google.maps.Marker({
        //position: {lat:lat_current_signalement,lng:lng_current_signalement},
		position: {lat:signalement.latitude,lng:signalement.longitude},
        icon: icon
    });
	
	
	return markerSignalement;
};

// //Ajoute un marker sur la carte
// function addMarkerOnMap(icon,latitude,longitude){
	
	// var sglt_marker_map = new google.maps.Marker({
        // //position: {lat:lat_current_signalement,lng:lng_current_signalement},
		// position: {lat:latitude,lng:longitude},
		// draggable:false,
        // icon: icon
    // });
	
	// sglt_marker_map.setMap(map);
// }
//Efface tous les marqueurs de la carte
function eraseAllMarkersOnMap(){
	if(signalements.length>0){
for(var i =0; i<signalements.length;i++){
		signalements[i].marqueur.setMap(null);
	}
	}
	
}

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
	
	//TODO a voir pour mettre côté serveur
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


 function afficherSignalementCarte(signalement){
		signalement.marqueur.setMap(map);
		var infosSignalement = "Signalé le " + signalement.date+" par "+ signalement.utilisateur;
	//Initialisation de la boite de dialogue
	
	//Affichage des infos au click sur le marqueur
	signalement.marqueur.addListener('click', function() {
	$("#desc_signalement").fadeIn();
	});
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
			recupererSignalements();
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
		var marqueur;
		if(result.success == true){
			checkSignalements(result.signalements);
			console.log(signalements.length);
			}			
		
	},"json");
};

//*************************************************
//
// Vérifie les signalements entrants (remote) et
// met à jour la liste locale ainsi que l'affichage
//
//*************************************************
function checkSignalements(remote_signalements){
	
	var outSign=[]; //signalements expirés
	var inSign=[]; //nouveau signalements
	
	//Au démarrage de l'appli, récupérer tous les signalements
	if (signalements.length == 0){
		
			signalementsToLocal(remote_signalements);
			console.log("init signalements : " + signalements);
		return;
	}
	//Aucun signalements -> effacer tous les signalements
	if (remote_signalements.length == 0){
		eraseAllMarkersOnMap();
		return;
	}
	//Est-ce que le signalement en local existe  en remote?
	var isInRemote=false; 
	for(var i=0;i<signalements.length;i++)
	{
		for(var j=0;j<remote_signalements.length;j++){
			if(signalements[i].id == remote_signalements[j].Id){
				isInRemote=true;
				break;
			}
		}
		if(!isInRemote)
			outSign.push(signalements[i]);	
	}
	console.log("signalements à effacer : " + outSign.length);
	//Est-ce que le signalement en remote existe en local?
	var isInLocal=false;
	for(var i=0;i<remote_signalements.length;i++)
	{
		for(var j=0;j<signalements.length;j++)
		{
			if(remote_signalements[i].Id == signalements[j].id){
				isInLocal = true;
				break;
			}
		}
		if(!isInLocal)
				inSign.push(remote_signalements[i]);	
	}
	
		//On retire les signalement obsolètes en local
	for (var i=0; i<outSign.length;i++)
	{
		if(signalement.length>0)
		{
			console.log(signalements.length);
			for(var j=0;j<signalements.length;j++)
			{
				if(signalements[j].id == outSign[i].id)
				{
					//effacer le marqueur
					signalements[j].marqueur.setMap(null);
					//mettre à jour les signalements
					signalements.splice(j,1);
					//on sort de la boucle
					break;
				}
			}		
		}
	}

	//on ajoute les nouveaux signalements rentrants	
	signalementsToLocal(inSign);
	
	console.log("Signalements à ajouter: " +inSign.length);
	console.log("Nb Signalements : " + signalements.length);
};

function signalementsToLocal(remote_signalements){
	for(var i=0;i<remote_signalements.length;i++){
		var sign = new signalement(
			remote_signalements[i].Id,
			parseFloat(remote_signalements[i].Latitude),
			parseFloat(remote_signalements[i].Longitude),
			null,
			remote_signalements[i].Id_Evenement,
			remote_signalements[i].DateSignalement,
			remote_signalements[i].Id_Utilisateur);
		var icon = getEvenement(parseInt(sign.evenement));
		//sign.marqueur = createMarker(icon.icon,sign.latitude,sign.longitude,sign.id);
		sign.marqueur = createMarker(icon.icon,sign);
		signalements.push(sign);
		afficherSignalementCarte(sign);	
	}
	
}

function calculerDistanceParcourue(){
	
  var R = 6371; // Rayon de la terre
  var dLat = radians(lat_current_position-lat_offset_position);  
  var dLon = radians(lng_current_position-lng_offset_position); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(radians(lat_offset_position)) * Math.cos(radians(lat_current_position)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
	
};
	
function radians(deg) {
  return deg * (Math.PI/180)
}
