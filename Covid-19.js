var data;
var date = [];
var districts_lau_codes = [[],[],[]];
var districts_properties = [];
var axisX;
var mode;
var headline;

function setting(mode) {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/kraj-okres-nakazeni-vyleceni-umrti.json');	

	request.onreadystatechange = function () {
	  if (this.readyState === 4) {
	    data = JSON.parse(this.responseText);
	  }
	};
	request.send();	

	var request2 = new XMLHttpRequest();
	request2.open('GET','CSU_obyv_okresy.json');

	request2.onreadystatechange = function() {
		if (this.readyState === 4) {
			districts_properties = JSON.parse(this.responseText);
			districts_properties = districts_properties['Okresy']
		}
	}	
	request2.send();

	setTimeout(function(){
		setting_date(data, axisX, districts_properties, mode);
	}, 500);
}

setting('abs');

function setting_date(data_file, axisX, districts_properties, mode) {
	if (data) {
		for (i in data['data']) {
			if (date && (!(date.includes(data['data'][i]['datum'])))) {
				date.push(data['data'][i]['datum']);
			}
		}
	} else {
		alert("Data se nepodařilo načíst! Prosím, aktualizujte stránku.");
	}
	setting_numbers(data, date, districts_properties, mode);
}

function setting_numbers(data_file, axisX, districts_properties, mode) {
	for (i in data['data']) {
		if (districts_lau_codes && (!(districts_lau_codes[1].includes(data['data'][i]['okres_lau_kod'])))) {
			districts_lau_codes[1].push(data['data'][i]['okres_lau_kod']);			
			for (j in districts_properties) {
				if (districts_properties[j]['okres_kod'].includes(data['data'][i]['okres_lau_kod'])) {
					districts_lau_codes[0].push(districts_properties[j]['okres_nazev']);
					districts_lau_codes[2].push(districts_properties[j]['obyv_2019']);
				}
			}
		}
	}
	var districts = [];

	var amount;
	var percentage;
	for (i in districts_lau_codes[1]) {
		var district_numbers = [];
		for (j in data['data']) {
			if (data['data'][j]['okres_lau_kod'] == districts_lau_codes[1][i]) {		
				amount = data['data'][j]['kumulativni_pocet_nakazenych']-data['data'][j]['kumulativni_pocet_umrti']-data['data'][j]['kumulativni_pocet_vylecenych'];		
				percentage = ((amount/districts_lau_codes[2][i])*100000).toFixed(0);
				if (mode == 'rel') {
					district_numbers.push(percentage);
				} else {
					district_numbers.push(amount);
				}
				
			}
		}	
		var district_data = {
			label: districts_lau_codes[0][i],
			data: district_numbers,
			lineTension: 0,
    		fill: false,
    		borderColor: 'rgb('+Math.random()*256+', '+Math.random()*256+', '+Math.random()*256+')'
		}
		districts.push(district_data);
	}	
	graf(data, axisX, districts, mode)
}

function graf(data_file, axisX, districts, mode) {
	var ctx;
	if (mode == 'rel') {
		headline = 'Podíl aktivních nakažených Covid-19 na 100 000 obyvatel podle okresů ČR';
	} else {
		headline = 'Počet aktivních nakažených Covid-19 podle okresů ČR';
	}
	ctx = document.getElementById('myChart').getContext('2d');
	var lineChart = new Chart(ctx, {
	  type: 'line',
	  data: {
	    labels: axisX,
	    datasets: districts
	  },
	  options: {
	  	legend: {
            labels: {
                fontColor: "black",
                fontSize: 10
            }
        },
	  	title: {
	  		display: true,
	  		text: headline+' (poslední aktualizace: '+moment(data['modified']).locale('cs').format("LLLL")+')',
	  		fontColor: 'black',
	  		fontStyle: 'bold',
	  		fontSize: 20
	  	},
	  	scales: {
            yAxes: [{
                ticks: {
                    fontColor: "black",
                }
            }],
            xAxes: [{
                ticks: {
                    fontColor: "black",
                }
            }]
        }
	  }
	});
}