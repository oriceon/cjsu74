//sw

if ('serviceWorker' in navigator) {
	//console.log('CLIENT: service worker registration in progress.');
	navigator.serviceWorker.register('/sw.js').then(function(registration) {
		//console.log('CLIENT: service worker registration complete.');
		// registration.update();
	}, function() {
		//console.log('CLIENT: service worker registration failure.');
	});
} else {
	//console.log('CLIENT: service worker is not supported.');
}


let formData = {}
let positions = {

	nume : [70, 16.5],
	prenume : [70, 16.5],

	data_nastere_ziua: [70, 25.5],
	data_nastere_luna: [76, 25.5],
	data_nastere_an: [83, 25.5],

	adresa_locuintei : [64, 36.5],

	locul_deplasarii_1: [15, 52],
	locul_deplasarii_2: [15, 61],

	motivul_deplasarii_1  : [18.8, 75.2+0.692],
	motivul_deplasarii_2  : [18.8, 79.8+0.692],
	motivul_deplasarii_3  : [18.8, 84.7+0.692],
	motivul_deplasarii_4  : [18.8, 94.1+0.692],
	motivul_deplasarii_5  : [18.8, 99+0.692],
	motivul_deplasarii_6  : [18.8, 103.7+0.692],
	motivul_deplasarii_7  : [18.8, 114.6+0.692],

	motivul_deplasarii_8  : [18.7, 126.6+0.692],
	motivul_deplasarii_9  : [18.7, 131.4+0.692],
	motivul_deplasarii_10 : [18.7, 136+0.692],
	motivul_deplasarii_11 : [18.7, 145.5+0.692],
	motivul_deplasarii_12 : [18.7, 150.3+0.692],
	motivul_deplasarii_13 : [18.7, 155+0.692],
	motivul_deplasarii_14 : [18.7, 159.9+0.692],
	motivul_deplasarii_15 : [18.7, 164.5+0.692],
	motivul_deplasarii_16 : [18.7, 174+0.692],
	motivul_deplasarii_17 : [18.7, 183.5+0.692],
	motivul_deplasarii_18 : [18.7, 193+0.692],
	motivul_deplasarii_19 : [18.7, 207.3+0.692],
	motivul_deplasarii_20 : [18.7, 212+0.692],

	motivul_deplasarii_21 : [18.7, 224.3+0.692],
	motivul_deplasarii_22 : [18.7, 248.2+0.692],
	motivul_deplasarii_23 : [18.7, 253.6+0.692],
	motivul_deplasarii_24 : [18.7, 259.2+0.692],
	motivul_deplasarii_25 : [18.7, 264.5+0.692],

	organizatie: [91, 227],
	sediu_organizatie: [58, 231.8],
	adresa_punct_de_lucru_1: [104, 236.8],
	adresa_punct_de_lucru_2: [36.5, 241.5],

	today : [54, 282],
	semnatura : [130, 280],

}

// console.log(positions);

function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}
let mobileOS = getMobileOperatingSystem();


$(function () {

	let generatePdfBtn = $('#generatePdfBtn');

	let loadingDiv = $('#loading-container');
	let declaratieForm = $('#declaratie');
	let signatureBlackboard = $("#signature-container");
	let signatureBlackboardReset = $("#signature-reset");
	let signatureHolographic = $("#signature");
	let androidIndicator = $("#android-downloads-indicator");

	signatureHolographic.jSignature();
	signatureBlackboardReset.click(function(e){signatureHolographic.jSignature('reset')});
	
	declaratieForm.submit(function(e){
		e.preventDefault();

		generatePdfBtn.prop('disabled',true);
		loadingDiv.removeClass('d-none');

		var sData = declaratieForm.find(':input').not('#semnatura').serializeArray();
		signatureVector = signatureHolographic.jSignature('getData');

		var today = new Date().toJSON().slice(0,10).split('-').reverse().join('.');

		var doc = new jsPDF('p', 'mm', 'a4', true);
		doc.addFileToVFS("Merriweather_Regular.ttf", Merriweather_Regular);
    	doc.addFont('Merriweather_Regular.ttf', 'Merriweather_Regular', 'normal');
    	doc.setFont('Merriweather_Regular');
		doc.setFontSize(11);
		// doc.setTextColor('#004890');
		doc.addImage(background, 'PNG', 0, 0, 210, 297);

		for (var field in sData) {
			if (typeof positions[sData[field].name] !== 'undefined') {
				formData[sData[field].name] = sData[field].value;
			}
		}

		formData.data_nastere_ziua = formData.data_nastere_ziua.padStart(2, '0');
		formData.data_nastere_luna = formData.data_nastere_luna.padStart(2, '0');

		let nume_margin = 58,
			nume_width  = doc.getTextWidth(formData.nume),
			left_padd   = 15;

		positions.prenume = [nume_width + nume_margin + left_padd, 16.5];


		for (var field in sData) {
			if (typeof positions[sData[field].name] !== 'undefined') {
				if (sData[field].value == 'check') {
					doc.circle(positions[sData[field].name][0] + 1.5, positions[sData[field].name][1] + 1.5, 2, 'F');
				} else {
					doc.text(positions[sData[field].name][0] + 1, positions[sData[field].name][1] + 5, formData[sData[field].name]);
				}
			}
		}


		var semnatura_info = doc.getImageProperties(signatureVector);
		var ratio = semnatura_info.width / semnatura_info.height;
		var height = 17;
		var width = height * ratio;
		doc.addImage(signatureVector, 'PNG', positions['semnatura'][0], positions['semnatura'][1] + 10 - height, width, height);

		doc.text(positions['today'][0], positions['today'][1], today);


		var docname = 'DECLARAȚIE PE PROPRIE RĂSPUNDERE COVID-19 cf. Hotărâre CJSU Constanța nr.74, ' + formData.nume + ' ' + formData.prenume + ', ' + today + '.pdf';
		doc.save(docname, { returnPromise: true }).then( setTimeout(function(){
			loadingDiv.addClass('d-none');
			generatePdfBtn.prop('disabled',false);
			if (mobileOS == 'Android') {
				androidIndicator.removeClass('d-none');
				setTimeout(function(){ androidIndicator.addClass('d-none');}, 5000);
			}
		}, 700) );
	})
})