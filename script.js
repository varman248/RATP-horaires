
class RATP {

	constructor(){
		this.link = 'https://api-ratp.pierre-grimaud.fr/v3/';
		this.url;
	}

	schedules(type, code, station, way){
		type = type.toLowerCase();
		code = code.toLowerCase();
		station = station.toLowerCase();
		way = way.toUpperCase();
		this.url = this.link + 'schedules/' + type +'/'+ code +'/'+ station +'/'+ way;
	}

	lines(code){
		code = code.toLowerCase();
		this.url = this.link + 'lines/' + code;
	}

	stations(type, code){
		type = type.toLowerCase();
		code = code.toLowerCase();
		this.url = this.link + 'stations/'+ type +'/'+ code;
	}

	destinations(type, code){
		type = type.toLowerCase();
		code = code.toLowerCase();
		this.url = this.link + 'destinations/'+ type +'/'+ code;
	}

	list(){
		this.url = this.link + 'lines';
	}

	traffic(){
		this.url = this.link + 'traffic';
	}

}

/*--------------------- INTERFACE ----------------------*/

class Interface {

	constructor(){
		this.ratp = new RATP();
		this.container = $('<div>').attr({'id':'ratp'}).appendTo($('body'));
		this.container.css({
			'max-width': '500px',
			'margin':'25px auto',
			'display': 'flex',
			'flex-direction': 'column',
			'background-color':'#009688', 
			'padding':'25px', 
		});
	}

	createDiv(){
		let div = $('<div>');
		div.css({
			'transition':'all .4s',
			'display': 'inline-block',
			'background-color':'#00bcd4', 
			'color':'white',
			'font-weight':'bold',
			'margin':'5px', 
			'padding':'5px', 
			'text-align': 'center',
			'box-shadow':'0 0 10px rgba(0,0,0,.2)',
			'border':'5px solid rgba(0,0,0,.1)',
		});
		div.mouseover(()=>{
			div.css({
				'background-color':'orange', 
			});
		});
		div.mouseleave(()=>{
			div.css({
				'background-color':'#00bcd4', 
			});
		});
		div.appendTo(this.container);
		return div;
	}

	displayStation(type, code){
		this.container.empty();
		this.ratp.stations(type, code);
		// GET ALL STATIONS FROM TYPE AND CODE
		$.getJSON(this.ratp.url, (data)=>{
			for (let station of data.result.stations){
				// STORE EACH STATION ON HTML ELEMENT
				let div = this.createDiv().text(station.name);
				div.attr({
					'class':'station',
					'data-type':type,
					'data-code':code,
					'data-station':station.slug,
				});
				// WHEN ONE SPECIFIC STATION WAS CLICKED
				div.click((e)=>{
					let type = $(e.currentTarget).attr('data-type');
					let code = $(e.currentTarget).attr('data-code');
					let station = $(e.currentTarget).attr('data-station');
					this.displaySchedules(type, code, station);
				});
			}
		});
	}

	sortSchedules(arr){
		let list = [];
		let copy = arr.slice();
		while(copy.length>0){
			let schedule = {
				destination:copy[0].destination, 
				message:[copy[0].message],
			};
			let test = schedule.destination;
			copy.shift();
			let remove = [];
			for (let i=0; i<copy.length; i++){
				if (copy[i].destination == test){
					schedule.message.push(copy[i].message);
					remove.push(i);
				}
			}
			// REMOVE PUSHED ELEMENTS
			remove.sort(function(a, b) { return a - b }).reverse();
			for (let i=0; i<remove.length; i++){ copy.splice(remove[i],1); }
			// PUSH SCHEDULE
			list.push(schedule);
		}
		return list;
	}

	displaySchedules(type, code, station){
		this.container.empty();
		// GET STATION SCHEDULES FOR EACH WAYS
		this.ratp.schedules(type, code, station, 'A+R');
		// GET STATION SCHEDULES
		$.getJSON(this.ratp.url, (data)=>{
			// ADD DESTINATION NAME
			let schedules = this.sortSchedules(data.result.schedules);
			for (let schedule of schedules){
				let div = this.createDiv();
				div.attr({'class':'schedule'});
				$('<p>').text(schedule.destination).appendTo(div);
				$('<p>').text(schedule.message.join(' - ')).appendTo(div);
			}
		});
	}

	displayLines(){
		this.container.empty();
		this.ratp.list();
		$.getJSON(this.ratp.url, (data)=>{
			for (let type in data.result){
				let div = this.createDiv();
				div.text(type).attr({
					'class':'type',
					'data-type':type,
				});
				div.click((e)=>{
					this.container.empty();
					let type = $(e.currentTarget).attr('data-type');
					for (let line of data.result[type]){
						let div2 = this.createDiv();
						div2.text(line.name);
						div2.attr({
							'class':'lines',
							'data-type':type,
							'data-code':line.code,
						});
						div2.click((e)=>{
							let type = $(e.currentTarget).attr('data-type');
							let code = $(e.currentTarget).attr('data-code');
							this.displayStation(type, code);
						});
					}
				});
			}
		});
	}

}


//ratp.traffic();
//ratp.schedules('bus', 'pc', 'porte+dauphine+++marechal+de+lattre+de+tassigny', 'R');
//ratp.lines('bus');
//ratp.stations('bus', 'PC');
//ratp.destinations('bus', 'PC');

let interface = new Interface();

interface.displayLines();
//interface.displayStation('bus', 'pc');

