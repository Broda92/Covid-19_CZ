var data;
var date = [];
var date3 = [];
var date5 = [];
var districts_lau_codes = [[],[],[]];
var districts_properties = [];
var axisX;
var mode;
var headline;
var target;

function setting() {
	var request = new XMLHttpRequest();
	request.open('GET', 'https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/kraj-okres-nakazeni-vyleceni-umrti.json');	

	request.onreadystatechange = function () {
	  if (this.readyState === 4) {
	    data = JSON.parse(this.responseText);
	    console.log(data);
	  }
	};
	request.send();	

	var request3 = new XMLHttpRequest();
	request3.open('GET','https://onemocneni-aktualne.mzcr.cz/api/v2/covid-19/nakazeni-vyleceni-umrti-testy.json');

	request3.onreadystatechange = function() {
		if (this.readyState === 4) {
			data_CZ = JSON.parse(this.responseText);
			data_CZ = data_CZ['data']
		}
	}	
	request3.send();

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
		if (data && data_CZ && districts_properties) {
			setting_date1(data, axisX, districts_properties, "abs", "myChart");
			setting_date1(data, axisX, districts_properties, "rel", "myChart2");
			setting_date3(data_CZ, axisX);
			update_date_text();
		} else {
			alert("Data se nepodařilo načíst! Prosím, aktualizujte stránku.");
		}		
	}, 1000);
}

setting();

function update_date_text() {
	$("#tiraz").append("Poslední aktualizace: "+moment(data['modified']).locale('cs').format("LLLL"));
};

function setting_date1(data_file, axisX, districts_properties, mode, target) {
		for (i in data['data']) {
			if (date && (!(date.includes(data['data'][i]['datum'])))) {
				date.push(data['data'][i]['datum']);
			}
		}
	setting_numbers1(data, date, districts_properties, mode, target);
}

function setting_numbers1(data_file, axisX, districts_properties, mode, target) {
	for (i in data['data']) {
		if (districts_lau_codes && (!(districts_lau_codes[1].includes(data['data'][i]['kraj_nuts_kod'])))) {
			districts_lau_codes[1].push(data['data'][i]['kraj_nuts_kod']);			
			for (j in districts_properties) {
				if (districts_properties[j]['okres_kod'].includes(data['data'][i]['kraj_nuts_kod'])) {
					districts_lau_codes[0].push(districts_properties[j]['okres_nazev']);
					districts_lau_codes[2].push(districts_properties[j]['obyv_2019']);
				}
			}
		}
	}
	var districts = [];

	var amount;
	var percentage;
	var region_colors = ["red","orange","yellow","green","lime","blue","darkblue","blueviolet","magenta","gray","black","saddlebrown","greenyellow","deepskyblue"]
	for (i in districts_lau_codes[1]) {
		var district_numbers = [];
		for (j in data['data']) {
			if (data['data'][j]['kraj_nuts_kod'] == districts_lau_codes[1][i]) {		
				amount = data['data'][j]['kumulativni_pocet_nakazenych']-data['data'][j]['kumulativni_pocet_umrti']-data['data'][j]['kumulativni_pocet_vylecenych'];		
				percentage = ((amount/districts_lau_codes[2][i])*100000).toFixed(0);
				if (mode == 'rel') {
					district_numbers.push(percentage);
				} else {
					district_numbers.push(amount);
				}
				
			}
		}	
		var regions_codes = [];
		for (c in districts_lau_codes[1]) {
			if (regions_codes.includes((districts_lau_codes[1][c]).slice(2,5)) == false) {
				regions_codes.push((districts_lau_codes[1][c]).slice(2,5));
			}
		}
		var region_color;
		for (r in regions_codes) {
			if (regions_codes[r] == (districts_lau_codes[1][i]).slice(2,5)) {
				region_color = region_colors[r];
			}
		}
		var district_data = {
			label: districts_lau_codes[0][i],
			data: district_numbers,
			lineTension: 0,
    		fill: false,
    		borderColor: region_color
		}
		districts.push(district_data);
	}	
	if (mode == 'rel') {
		headline = 'Počet aktivních nakažených Covid-19 na 100 000 obyvatel podle okresů ČR (data doplňována s týdenním zpožděním)';
	} else {
		headline = 'Počet aktivních nakažených Covid-19 podle okresů ČR (data doplňována s týdenním zpožděním)';
	}
	graf(data, axisX, districts, target, headline);
}

function graf(data_file, axisX, districts, target, headline) {
	var ctx;
	headline = headline;
	ctx = document.getElementById(target).getContext('2d');
	var yAxes_settings;
	if (target == "myChart3") {
		yAxes_settings = [
            {
            	id: 'B',
            	position: 'left',
                ticks: {
                    fontColor: "blue",
                }
            },
            {
            	id: 'A',
            	position: 'right',
                ticks: {
                    fontColor: "orange",
                    callback: function(value, index, values) {
                        return value + ' %';
                    }
                }
            }
            ]
	} else {
		yAxes_settings = [
            {
            	id: 'A',
            	position: 'left',
                ticks: {
                    fontColor: "black",
                }
            }
         ]
	}
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
	  		text: headline,
	  		fontColor: 'black',
	  		fontStyle: 'bold',
	  		fontSize: 20
	  	},
	  	scales: {
            yAxes: yAxes_settings,
            xAxes: [{
                ticks: {
                    fontColor: "black",
                }
            }]
        }
	  }
	});
}

function setting_date3(data_file, axisX) {
	if (data_file) {
		for (i in data_file) {
			if (i > 33) {
				if (date5 && (!(date5.includes(data_file[i]['datum'])))) {
				date5.push(data_file[i]['datum']);
				}
			}			
		}
	} else {
		alert("Data se nepodařilo načíst! Prosím, aktualizujte stránku.");
	}
	setting_numbers3(data_file, date5);
	setting_numbers4(data_file, date5);
	setting_numbers5(data_file, date5);
	setting_numbers6(data_file, date5);
}

function setting_numbers3(data_file, axisX) {
	var cz = []; 
	var numbers_CZ_ratio = [];
	var numbers_CZ_mortality = [];
	var numbers_CZ_tests = [];

	for (var j = 34; j < data_file.length; j++) {
		numbers_CZ_ratio.push((((data_file[j]['kumulativni_pocet_nakazenych'])/(data_file[j]['kumulativni_pocet_testu']))*100).toFixed(4));
		numbers_CZ_mortality.push((((data_file[j]['kumulativni_pocet_umrti'])/(data_file[j]['kumulativni_pocet_nakazenych']))*100).toFixed(4));
		numbers_CZ_tests.push(data_file[j]['kumulativni_pocet_testu']);
	}	
	numbers_CZ_ratio = {
		label: "Poměr nakažených ku testům (% kumulativně)",
		data: numbers_CZ_ratio,
		lineTension: 0,
    	fill: false,
    	borderColor: "orange",
    	yAxisID: 'A'
	}
	numbers_CZ_mortality = {
		label: "Smrtnost (% kumulativně)",
		data: numbers_CZ_mortality,
		lineTension: 0,
    	fill: false,
    	borderColor: "black",
    	yAxisID: 'A'
	}
	numbers_CZ_tests = {
		label: "Absolutní počet testů",
		data: numbers_CZ_tests,
		lineTension: 0,
    	fill: false,
    	borderColor: "blue",
    	yAxisID: 'B'
	}
	cz.push(numbers_CZ_ratio, numbers_CZ_mortality, numbers_CZ_tests);
	var tests_chart_title3;
	if (cz[2]['data'][(cz[2]['data']).length-1] == cz[2]['data'][(cz[2]['data']).length-2]) {
		tests_chart_title3 = 'Covid-19 - Koeficient celkové pozitivity a smrtnosti v ČR (chybí počet testů za včerejší den!)';
	} else {
		tests_chart_title3 = 'Covid-19 - Koeficient celkové pozitivity a smrtnosti v ČR';
	}
	graf(data, axisX, cz, "myChart3", tests_chart_title3)
}

function setting_numbers4(data_file, axisX) {
	var cz = []; 
	var numbers_CZ_infected = [];
	var numbers_CZ_recovered = [];
	var numbers_CZ_dead = [];
	var numbers_CZ_active = [];

	for (var j = 34; j < data_file.length; j++) {
		numbers_CZ_infected.push(data_file[j]['kumulativni_pocet_nakazenych']);
		numbers_CZ_recovered.push(data_file[j]['kumulativni_pocet_vylecenych']);
		numbers_CZ_dead.push(data_file[j]['kumulativni_pocet_umrti']);
		numbers_CZ_active.push(data_file[j]['kumulativni_pocet_nakazenych']-
			data_file[j]['kumulativni_pocet_vylecenych']-data_file[j]['kumulativni_pocet_umrti']);
	}	
	numbers_CZ_infected = {
		label: "Celkový počet nakažených",
		data: numbers_CZ_infected,
		lineTension: 0,
    	fill: false,
    	borderColor: "darkred"
	}
	numbers_CZ_recovered = {
		label: "Celkový počet vyléčených",
		data: numbers_CZ_recovered,
		lineTension: 0,
    	fill: false,
    	borderColor: "green"
	}
	numbers_CZ_dead = {
		label: "Celkový počet zemřelých",
		data: numbers_CZ_dead,
		lineTension: 0,
    	fill: false,
    	borderColor: "black"
	}
	numbers_CZ_active = {
		label: "Aktuální počet nakažených",
		data: numbers_CZ_active,
		lineTension: 0,
    	fill: false,
    	borderColor: "red"
	}
	cz.push(numbers_CZ_infected, numbers_CZ_recovered, numbers_CZ_dead, numbers_CZ_active);
	graf(data, axisX, cz, "myChart4", 'Covid-19 - Počty nakažených, vyléčených a zemřelých')
}

function setting_numbers5(data_file, axisX) {
	var cz = []; 
	var numbers_CZ_infected_daily = [];
	var numbers_CZ_recovered_daily = [];
	var numbers_CZ_dead_daily = [];

	for (var j = 34; j < data_file.length; j++) {
		numbers_CZ_infected_daily.push(data_file[j]['kumulativni_pocet_nakazenych']-data_file[j-1]['kumulativni_pocet_nakazenych']);
		numbers_CZ_recovered_daily.push(data_file[j]['kumulativni_pocet_vylecenych']-data_file[j-1]['kumulativni_pocet_vylecenych']);
		numbers_CZ_dead_daily.push(data_file[j]['kumulativni_pocet_umrti']-data_file[j-1]['kumulativni_pocet_umrti']);
	}	
	numbers_CZ_infected_daily = {
		label: "Počet nových nakažených za den",
		data: numbers_CZ_infected_daily,
    	backgroundColor: "red",
		barThickness: 2
	}
	numbers_CZ_recovered_daily = {
		label: "Počet nových vyléčených za den",
		data: numbers_CZ_recovered_daily,
    	backgroundColor: "green",
		barThickness: 2
	}
	numbers_CZ_dead_daily = {
		label: "Počet nových zemřelých za den",
		data: numbers_CZ_dead_daily,
    	backgroundColor: "black",
		barThickness: 2
	}
	cz.push(numbers_CZ_infected_daily, numbers_CZ_recovered_daily, numbers_CZ_dead_daily);
	graf5(data_file, axisX, cz, "myChart5", 'Covid-19 - Denní počty nových nakažených, vyléčených a zemřelých')
}

function setting_numbers6(data_file, axisX) {
	var cz = []; 
	var numbers_CZ_tests_daily = [];
	var numbers_CZ_positivity_daily = [];

	for (var j = 34; j < data_file.length; j++) {
		numbers_CZ_tests_daily.push(data_file[j]['kumulativni_pocet_testu']-data_file[j-1]['kumulativni_pocet_testu']);
		numbers_CZ_positivity_daily.push(
			(((data_file[j]['kumulativni_pocet_nakazenych']-data_file[j-1]['kumulativni_pocet_nakazenych'])/
									(data_file[j]['kumulativni_pocet_testu']-data_file[j-1]['kumulativni_pocet_testu']))*100).toFixed(2)
			);
	}	
	numbers_CZ_tests_daily = {
		label: "Počet testů za den",
		data: numbers_CZ_tests_daily,
    	backgroundColor: "blue",
		barThickness: 2,
		yAxisID: 'A'
	}
	numbers_CZ_positivity_daily = {
		label: "Podíl pozitivních případů za den (%)",
		data: numbers_CZ_positivity_daily,
    	backgroundColor: "red",
		barThickness: 2,
		yAxisID: 'B'
	}
	cz.push(numbers_CZ_tests_daily, numbers_CZ_positivity_daily);
	var tests_chart_title6;
	if (cz[1]['data'][(cz[1]['data']).length-1] == "Infinity") {
		tests_chart_title6 = 'Covid-19 - Denní počty testů a podíly nakažených (chybí počet testů za včerejší den!)';
	} else {
		tests_chart_title6 = 'Covid-19 - Denní počty testů a podíly nakažených';
	}
	graf5(data_file, axisX, cz, "myChart6", tests_chart_title6)
}

function graf5(data_file, axisX, cz, target, headline) {
	var ctx;
	headline = headline;
	ctx = document.getElementById(target).getContext('2d');
	if (target == "myChart6") {
		yAxes_settings = [
            {
            	id: 'A',
            	position: 'left',
                ticks: {
                    fontColor: "blue",
                }
            },
            {
            	id: 'B',
            	position: 'right',
                ticks: {
                    fontColor: "red",
                    callback: function(value, index, values) {
                        return value + ' %';
                    },
                    max: 35,
	                min: 0
                }
            }
            ]
	} else {
		yAxes_settings = [
            {
            	id: 'A',
            	position: 'left',
                ticks: {
                    fontColor: "black",
                }
            }
         ]
	}
	var myBarChart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	    	labels: axisX,
		    datasets: cz
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
		  		text: headline,
		  		fontColor: 'black',
		  		fontStyle: 'bold',
		  		fontSize: 20
		  	},
		  	scales: {
	            yAxes: yAxes_settings,
	            xAxes: [{
	                ticks: {
	                    fontColor: "black",
	                }
	            }]
	        }
		}
	});
}