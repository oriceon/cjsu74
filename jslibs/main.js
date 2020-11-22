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

	nume : [70, 13.5],
	prenume : [70, 13.5],

	data_nastere_ziua: [70, 18.5],
	data_nastere_luna: [76.5, 18.5],
	data_nastere_an: [83, 18.5],

	adresa_locuintei : [64, 26.5],

	locul_deplasarii_1: [15, 42],
	locul_deplasarii_2: [15, 50.5],

	motivul_deplasarii_1  : [18.8, 69.5],
	motivul_deplasarii_2  : [18.8, 74.2],
	motivul_deplasarii_3  : [18.8, 78.9],
	motivul_deplasarii_4  : [18.8, 88.5],
	motivul_deplasarii_5  : [18.8, 93.2],
	motivul_deplasarii_6  : [18.8, 97.8],
	motivul_deplasarii_7  : [18.8, 108.9],

	motivul_deplasarii_8  : [18.7, 122.8],
	motivul_deplasarii_9  : [18.7, 137],
	motivul_deplasarii_10 : [18.7, 141.7],
	motivul_deplasarii_11 : [18.7, 146.5],
	motivul_deplasarii_12 : [18.7, 155.9],
	motivul_deplasarii_13 : [18.7, 160.7],
	motivul_deplasarii_14 : [18.7, 165.4],
	motivul_deplasarii_15 : [18.7, 170.2],
	motivul_deplasarii_16 : [18.7, 174.9],
	motivul_deplasarii_17 : [18.7, 184.4],
	motivul_deplasarii_18 : [18.7, 193.9],
	motivul_deplasarii_19 : [18.7, 198.6],

	motivul_deplasarii_20 : [18.7, 212.9],
	motivul_deplasarii_21 : [18.7, 236.7],
	motivul_deplasarii_22 : [18.7, 242.1],
	motivul_deplasarii_23 : [18.7, 247.6],
	motivul_deplasarii_24 : [18.7, 258.5],

	organizatie: [91, 215],
	sediu_organizatie: [56, 219.8],
	adresa_punct_de_lucru_1: [104, 224.5],
	adresa_punct_de_lucru_2: [36.5, 229.2],

	today : [54, 280],
	semnatura : [130, 278],

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
		doc.setTextColor('#091588');
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

		positions.prenume = [nume_width + nume_margin + left_padd, positions.prenume[1]];


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


		var docname = 'DECLARAȚIE PE PROPRIE RĂSPUNDERE COVID-19 cf. Hotărâre CJSU Constanța nr.74, ' + formData.nume + ' ' + formData.prenume + ', ' + today + ', ' + Math.floor(Math.random() * 100) + '.pdf';
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