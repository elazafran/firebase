$(function () {

	$('#login-form-link').click(function (e) {
		$("#login-form").delay(100).fadeIn(100);
		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
	$('#register-form-link').click(function (e) {
		$("#register-form").delay(100).fadeIn(100);
		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
	$('.fbLogo').click(fbLogin);

});
// enviar mail de confirmacion
var sendEmail = function () {
	var user = firebase.auth().currentUser;

	user.sendEmailVerification()
		//function anonima y la segunda anonima es si todo sale mal
		.then(function () {
			console.log('El correo ha sido enviado');

		}, function (error) {
			//esto es cuando no existe el usuario u otro tipo de error
			console.log(error);
		});
}
// create user
var createUser = function () {
	var email = $('#email-new').val();
	var password = $('#password-new').val();
	firebase.auth().createUserWithEmailAndPassword(email, password)
		//esperamos la promesa
		.then(function (data) {
			console.log(data);
			sendEmail();
			getUser();

		})
		.catch(function (error) {
			console.log(error);
		})

	return false;
}

// get user

var getUser = function () {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user) {
			console.log(user);
			$('.saludo').html('Tu usuario es:<b> ' + user.email + '</b>');

			$('#access').hide();
			$('#logged').show();
		} else {
			$('#access').show();
			$('#logged').hide();
		}
	});
}

getUser();

var login = function () {
	var email = $('#email').val();
	var password = $('#password').val();
	//esto será escucharo por onAuthStateChanged y mostrar u ocultará div según lo tenemos
	firebase.auth().signInWithEmailAndPassword(email, password)
		.catch(function (error) {
			//capturamos si ocurriera algún error
			console.log(error);

		})
}

var logout = function () {
	firebase.auth().signOut()
		.then(function () {
			console.log("El usuario ha cerrado sesion");

		}, function (error) {
			console.log(error);
		});
}

var recoverPass = function () {
	var auth = firebase.auth();
	var email = $('#email').val();
	//metodo que usar firebase para recuperar la contraseña mediante email
	auth.sendPasswordResetEmail(email)
		.then(function () {
			alert('se ha enviado un correo a su cuenta de correo ' + email + '. Por favor, siga los pasos.');
		}, function (error) {
			console.log(error);

		});
}

/*** otros métodos ***/

// perfil de usuario
firebase.auth().currentUser;

// Actualizar perfil
// firebase.auth().currentUser.updateProfile({
// 	displayName: "Javier Aliaga",
// 	photoURL: "https://javieraliaga.info/publicPics/profile.jpg"
// }).then(function () {
// 	//ok
// 	console.log('Se ha actualizado el profile');
// }, function (error) {
// 	//error
// 	console.log(error);

// });

// actualizar correo

// firebase.auth().currentUser.updateEmail("javiealiagaUpdate@gmail.com")
// 	.then(function () {
// 		//ok
// 		console.log('Se ha actualizado el EMAIL');
// 	}, function (error) {
// 		//error
// 		console.log(error);

// 	});
// // Eliminar usuarios
// firebase.auth().currentUser.delete()
// 	.then(function () {
// 		//ok
// 		console.log('Se ha ELIMINADO el suario');
// 	}, function (error) {
// 		//error
// 		console.log(error);

// 	});

// // Re-autenticación

// var email = $('#email').val();
// var password = $('#password').val();
// var credential = firebase.auth.EmailAuthProvider.credential(email,password);

// firebase.auth().currentUser.reauthenticate(credencial).then(function (){
// 	//User Re-autenticación

// },function(error){

// 	// An error happened

// });

var fbLogin = function (){
	//declaramos el proveedor de documentacion

	var provider = new firebase.auth.FacebookAuthProvider();

	firebase.auth().signInWithPopup(provider)
	.then(function (result){
		// tenemos la respuesta, viene access token, el usario y los datos que nos pasa facebook y este usuario se registra en la aplicación
		console.log(result);

	},function(error){
		console.log(error);
		
	});
}
	/***************************/
	//*** FCM SECCIÓN ***//
	/***************************/
	
	// FCM = Firebase Cloud Messaging

	var messaging = firebase.messaging();

	// guardamos el token para hacer el envio de mensage
	var myToken = '';

	// primero pedimos un permiso al navegador, si lo tenemos o no o si tenemos la posibilidad

	messaging.requestPermission()
		.then(function(){
			console.log('El permiso se ha concedido');
			return messaging.getToken();
			
		})
		.then (function(token){
			console.log(token);
			myToken = token;
			
		})
		.catch(function(error){
			console.log(error);
			
		});	

		// recibir mensajes

	messaging.onMessage(function(payload){
			console.log(payload);
			$('#modal-message').text(payload.notification.body);
			$('#mySecondModal').modal('show');
			
		});

		// enviar mensajes

	var sendMessages = function (player, position, number){
			var json = {
				notification:{
					"title":"usuario nuevo",
					"body" : "Se agregó a: " + player + " con el número " +number+ " en la posición de "+ position,
					"icon": "icono.png"
				},
				"to":myToken
			}
			//usamos ajax para un peticio tipo post
			$.ajax({
				type:'POST',
				//url hacia donde vamos a enviar nuestra peticiones
				url : 'https://fcm.googleapis.com/fcm/send',
				//en este encabezado es donde deberá llevar la llave de autenticación
				headers:{
					Authorization : 'Key=AAAApL-C4zc:APA91bEIwhTDJ4RXXb7mqILcFtaH4d_x3Rz2dmct0l16yyKID0znYZ8gUyXJrrc9D5HQRm1q5reE0caQ6FBuqVcoDJtE58Jfn-Yzzg82oUCLUuacb7MI8p12LH6e2C8jpM_KmEiO2RvF'
				},
				// ahora decimo el tipo de contenido que usamos
				contentType: 'application/json',
				data: JSON.stringify(json),
				success:function(response){
					console.log(response);

				},
				error:function(hxr,	status,error){
					console.log(status,error);
					
				}
			});
		}
	/***************************/
	//*** DATABASE SECCIÓN ***//
	/***************************/
	//$("#btnSend").click(savePlayer);
	// Database service reference
	var db = firebase.database().ref('player/');
	// cuando escuche algo realizara una funciona anomina y recibe como un objeto snapshot
	// snapshot , es como el bloque de la informacion uqe ya trajo, y cuando esta escruchando "on" algún cambio
	// aunque sea en lo más profundo de la bbdd

	db.on('value', function (snapshot) {

		//metodo val firebase parsea la información para poder trabajar con ella
		var players = snapshot.val();
		$("#playersTable tbody").empty();

		var row = "";

		for (player in players) {
			row += '<tr id="' + player + '">' +
				'<td class="name">' + players[player].name + '</td>' +
				'<td class="mail">' + players[player].mail + '</td>' +
				'<td class="number">' + players[player].number + '</td>' +
				'<td class="position">' + players[player].position + '</td>' +
				// '<td class="position">' + players[player].surname + '</td>' +
				'<td> <div class="btnEdit btn btn-warning glyphicon glyphicon-edit"></div> </td>' +
				'<td> <div class="btnDelete btn btn-danger glyphicon glyphicon-remove"></div> </td>' +
				'</tr>'
		}

		$("#playersTable tbody").append(row);
		row = "";
		

		$(".btnDelete").click(function () {
			// nos traemos el id del player y procedemos a borrar
			var playerId = $(this).closest('tr').attr('id');

			db.child(playerId).remove();

			// Si dejas db.remove() son parametros se borra toda la base de datos ¡CUIDADO!
			// db.remove();
		})

		$(".btnEdit").click(function () {
			//Asign data to form fields
			var playerId = $(this).closest('tr').attr('id');

			$("#name").val($('#' + playerId).find(".name").text());
			$("#mail").val($('#' + playerId).find(".mail").text());
			$("#number").val($('#' + playerId).find(".number").text());
			$("#position").val($('#' + playerId).find(".position").text());

			//Update button behaviour, quitamos el btn click y cambiamos por lo uqe necesitamos
			$("#btnSend").text("Actualizar").removeClass("btn-primary").addClass("btn-warning").unbind("click").click(function () {
				db.child(playerId).update({
					name: $("#name").val(),
					mail: $("#mail").val(),
					number: $("#number").val(),
					position: $("#position option:selected").text()
				}, function () {
					//limpiamos el formulario
					$("#name").val("");
					$("#mail").val("");
					$("#number").val("");
					$("#position").val("");
					$("#btnSend").text("Enviar").removeClass("btn-warning").addClass("btn-primary").unbind("click").click(savePlayer);
				})
			})

		})
	}, function (errorObject) {
		console.log("The read failed: " + errorObject.code);
	})
	//Save players
	var savePlayer = function () {
		
		var player_number = $("#number").val();
		var dataPlayer = {
			name: $("#name").val(),
			mail: $("#mail").val(),
			number: player_number,
			position: $("#position option:selected").text()
		}

		//comprobamos si existe el usuario
		db.orderByChild( "number")
		.equalTo(player_number)
		//detectamos los cambios una sola ves en vez de "on" que está constantemente
		.once('value',function(snapshot){
			//vamos a preguntar si este snanshot tiene datos sino lanzamos la modal
				if(snapshot.hasChildren()){
					$('#myModal').modal('show');
				}else {
					db.push().set(dataPlayer, function(error){
						if(error){
							console.log(error, 'la sincronización falló');
							
						}else {
							console.log(error, 'la sincronización fue exitosa');
							sendMessages($("#name").val(),$("#position option:selected").text(),player_number);
						}
					});
				}
		});
		//metodo push genera un metodo único y con un UID valga del redundancia único
		//db.push().set(dataPlayer);
	}

	
	//Add player
	$("#btnSend").click(savePlayer);

	// //Offline y Online
	// firebase.database().goOffline();
	// firebase.database().goOnline();