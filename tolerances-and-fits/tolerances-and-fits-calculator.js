
const round_tail = (x) => {
	return Math.round(x * 10 ** 9) / (10 ** 9);
};


const load_data = (url, callback = (response) => {}) => {
	let xhr = new XMLHttpRequest();
	xhr.open('GET', url);
	xhr.onloadend = function() {
		if (xhr.status != 200) {
			console.error(`Error loading '${url}': returned status code ${xhr.status}`)
		}
		callback(xhr.responseText);
	}
	xhr.send();
}


const DELTAS_START_FROM_COLUMN = 15;
const LINE_NUMBERS = [0, 21, 62, 83, 124, 145, 161];


var tolerances = [];
var holes1_base_deviations = [];
var holes2_base_deviations = [];
var shafts1_base_deviations = [];
var shafts2_base_deviations = [];
var bearings_inner_deviations = [];
var bearings_outer_deviations = [];


load_data('/tolerances-and-fits/data_complete.tsv', (s_data) => {
	console.dir(s_data.split("\n"));
	let data = [];

	for (let line of s_data.split("\n")) {
		line = line.trim()
		if (line != "")
			data.push(line.split("\t").map(s => Number(s.trim())))
	}

	tolerances = data.slice(LINE_NUMBERS[0], LINE_NUMBERS[1])  // Tolerances

	holes1_base_deviations = data.slice(LINE_NUMBERS[1], LINE_NUMBERS[2])  // A--C, R--ZC
	holes2_base_deviations = data.slice(LINE_NUMBERS[2], LINE_NUMBERS[3])  // CD--P, deltas

	shafts1_base_deviations = data.slice(LINE_NUMBERS[3], LINE_NUMBERS[4])  // a--c, r--zc
	shafts2_base_deviations = data.slice(LINE_NUMBERS[4], LINE_NUMBERS[5])  // cd--p

	bearings_inner_deviations = data.slice(LINE_NUMBERS[5], LINE_NUMBERS[6])
	bearings_outer_deviations = data.slice(LINE_NUMBERS[6], undefined)

	parse_fit()
});


const get_quality_index = (quality) => {
    let list = ["01", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
	let i = search_in(list, quality);
	if (i == -1)
		throw Error(`No quality "${quality}"`);
	return i;
}


const get_table_row = (size, table) => {
    for (let i = table.length - 1; i > -1; --i) {
        if (size > table[i][0])
            return table[i];
	}
	return table[0]
    throw Error(`Cannot find size '${size}' in the table`);
}


const get_tolerance = (size, quality_index) => {
    return get_table_row(size, tolerances)[quality_index + 1];
}


const search_in = (list, target) => {
	for (let i = 0; i < list.length; ++i) {
		if (list[i] === target)
			return i;
	}
	return -1;
}


const get_deviations = (size, base_deviation, quality) => {
    let [ es, ei ] = _get_deviations(size, base_deviation, quality);
    es /= 1000;
    ei /= 1000;
    return [es, ei];
}

const _get_deviations = (size, base_deviation, quality) => {
    if (base_deviation.toLowerCase() == "l") {
        let i = search_in(["0", "6", "5", "4", "T", "2"], quality)

		if (i == -1)
            throw Error(`There is no quality '${quality}' for '${base_deviation}'`)

		if (base_deviation == "L") {  // внутреннее кольцо
            let t = get_table_row(size, bearings_inner_deviations)[i + 1]
            return [0, t]
		} else {  // наружное кольцо
            let t = get_table_row(size, bearings_outer_deviations)[i + 1]
            return [0, t]
		}
	} else {
		let i = 0;
        let qi = get_quality_index(quality)
        let t = get_tolerance(size, qi)

        if (base_deviation.toLowerCase() == "js")
            return [t/2, -t/2];

        if (base_deviation == "h")
            return [0, -t];

        if (base_deviation == "H")
            return [t, 0];

		let delta = 0;
        if (get_quality_index("3") <= qi <= get_quality_index("8")) {
			delta = get_table_row(size, holes2_base_deviations)[DELTAS_START_FROM_COLUMN + qi - get_quality_index("3")]
		}

        i = search_in(["A", "B", "C", "R", "S", "T", "U", "V", "X", "Y", "Z", "ZA", "ZB", "ZC"], base_deviation)

        if (i != -1) {
            let bd = get_table_row(size, holes1_base_deviations)[i + 1]

            if (i <= 2)  // A--C
                return [bd + t, bd]
            else {
                if (qi <= get_quality_index("7")) // добавляем дельту
                    bd += delta
                return [bd, bd - t]
			}
		}

        i = search_in(["CD", "D", "E", "EF", "F", "FG", "G", "J", "J", "J", "K", "M", "N", "P"], base_deviation)
        if (i != -1) {
            if (i == 7) { // J
                if (!( (get_quality_index("6") <= qi <= get_quality_index("8")) ))
                    throw Error(`J is not supported for quality '${quality}'`)
                i += qi - get_quality_index("6")
			}

            let bd = get_table_row(size, holes2_base_deviations)[i + 1]

            if (i <= 6)  // до G включительно
                return [bd + t, bd]
            else {
                if (qi > get_quality_index("8") && i == 10)  // K
                    throw Error(`There is no K for quality '${quality}'`)
                if (qi >= get_quality_index("8") && i == 12 && size > 3) // N
                    bd = 0

                if (size <= 500
                    && (
                        (i == 13 && qi <= get_quality_index("7"))  // P
                        || (10 <= i <= 12 && qi <= get_quality_index("8")) // K, M, N
                    )
				)
					bd += delta
                return [bd, bd - t]
			}
		}

        i = search_in(["a", "b", "c", "r", "s", "t", "u", "v", "x", "y", "z", "za", "zb", "zc"], base_deviation)

        if (i != -1) {
            bd = get_table_row(size, shafts1_base_deviations)[i + 1]

            if (i <= 2) // a--c
                return [bd, bd - t]
            else
                return [bd + t, bd]
		}

        i = search_in(["cd", "d", "e", "ef", "f", "fg", "g", "j", "j", "j", "k", "m", "n", "p"], base_deviation)
        if (i != -1) {
            if (i == 7) { // J
                if (!( (get_quality_index("5") <= qi <= get_quality_index("8")) ))
                    throw Error(`j is not supported for quality '${quality}'`)
                i += qi - get_quality_index("6") + Math.floor(qi == get_quality_index("5"))
			}

            let bd = get_table_row(size, shafts2_base_deviations)[i + 1]

            if (i <= 6)  // до G включительно
                return [bd, bd - t]
            else {
                if (i == 10
                    && (i <= get_quality_index("3") || i > get_quality_index("7"))
				)  // K
                    bd = 0
                return [bd + t, bd]
			}
		}
	}
    throw Error(`Something went wrong: ${size} ${base_deviation}${quality}`)
}


const get_size_with_deviations = (size, base_deviation, quality) => {
    let [ es, ei ] = get_deviations(size, base_deviation, quality)
    return [size, es, ei]
}


const calc_fit = (es1, ei1, es2, ei2) => {
    let S_max = es1 - ei2
    let S_min = ei1 - es2
    let S_avg = (S_max + S_min) / 2
    return [S_max, S_min, S_avg]
}


const get_distribution = (center) => {
    let f = (x) => {
        let a = 0
        if (x <= center) {
            a = 1 / center**2
        } else {
            a = 1 / (center**2 - 2 * center + 1)
        }
        return a * (x - center)**3 + center
    }
    return f
}

const round_machinery = (x) => {
	if (x > 1500)
		return Math.round(x / 100) * 100
	if (x > 500)
		return Math.round(x / 50) * 50
	if (x > 150)
		return Math.round(x / 20) * 20
	if (x > 100)
		return Math.round(x / 10) * 10
	if (x > 25)
		return Math.round(x / 5) * 5
	if (x > 10)
		return Math.round(x / 2) * 2
	return Math.floor(x)
}



const make_assumption = () => {
	const BDs = ["a", "b", "c", "d", "e", "f", "g", "h", "k", "m", "n", "p", "r", "s", "t", "u", "v", "x", "y", "z", "za", "zb", "zc"];
	const choose_bd = () => BDs[Math.floor(get_distribution(0.35)(Math.random()) * BDs.length)];

	const Qs_L = ["0", "6", "5", "4", "2"];
	const choose_q_l = () => Qs_L[Math.floor(get_distribution(0)(Math.random()) * Qs_L.length)];

	const Qs = ["01", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
	const choose_q_i = () => Math.floor(get_distribution(0.45)(Math.random()) * Qs.length);

	let chance = Math.random();
	let assumption = "";
	let size = round_machinery(1 + get_distribution(0.1)(Math.random()) * 500);
	size = round_tail(size);

    let q1_i = 4 + Math.floor(choose_q_i() * 12 / 20);
	let q2_i = q1_i + Math.round(4 * (Math.random() - 0.5));

	let bd1 = "h";
	let q1 = Qs[q1_i];
	let bd2 = choose_bd();
	let q2 = Qs[q2_i];

	if (chance < 0.1) {
		size = Math.round(size / 5) * 5;
		bd1 = "L";
		q1 = choose_q_l()
	} else if (chance < 0.3) {
		let bd1 = choose_bd();
	}

	if (Math.random() < 0.3) {
		[ bd1, bd2 ] = [ bd2, bd1 ];
		[ q1, q2 ] = [ q2, q1 ];
	}

	assumption = `${size} ${bd1.toUpperCase()}${q1} / ${bd2.toLowerCase()}${q2}`

	return assumption;
}



const get_max_zeros = (...numbers) => {
	let m = 0;
	for (let num of numbers) {
		let s_num = String(round_tail(num))
		let i = s_num.indexOf(".");
		if (i != -1)
			m = Math.max(m, s_num.length - (i + 1))
	}
	return m
}


const get_pretty_number_s = (x, max_zeros = 0) => {
	let s_num = String(round_tail(x));
	let i = s_num.indexOf(".");
	if (i == -1) {
		i = s_num.length;
		s_num += ".";
	}
	while (s_num.length < i + 1 + max_zeros) {
		s_num += "0"
	}
	if (x > 0) {
		s_num = "+" + s_num;
	}
	return s_num;
}



let fit_input = document.getElementById("fit-input");
let fit_pretty_print = document.getElementById("fit-pretty-print");
let fit_output = document.getElementById("fit-output");
let fit_did_you_mean = document.getElementById("fit-did-you-mean");

let el_S_max = document.querySelector("#fit-output-1 td:first-child");
let el_S_max_value = document.querySelector("#fit-output-1 td:last-child");
let el_S_min = document.querySelector("#fit-output-2 td:first-child");
let el_S_min_value = document.querySelector("#fit-output-2 td:last-child");
let el_S_avg = document.querySelector("#fit-output-3 td:last-child");
let el_Tp = document.querySelector("#fit-output-4 td:last-child");

let current_fit = {};


const parse_fit = () => {
	current_fit.size = 0;
    fit_pretty_print.innerHTML = "";
    fit_did_you_mean.innerHTML = "";
	el_S_max_value.innerHTML = "";
	el_S_min_value.innerHTML = "";
	el_S_avg.innerHTML = "";
	el_Tp.innerHTML = "";

    let text = fit_input.value.replace(",", ".").trim();
    if (text != "") {
	    try {
			let re_single = /^(\d+?\.?\d*)\s*([A-Za-z]{1,2})\s*([0-9]{1,2})$/;
			let re_fit = /^(\d+?\.?\d*)\s*([A-Za-z]{1,2})\s*([0-9]{1,2})\s*[\\\/]?\s*([A-Za-z]{1,2})\s*([0-9]{1,2})$/;

			let m = undefined;
			m = text.trim().match(re_single)
			if (m) {
				let [ size, bd, q ] = m.slice(1, 4);
				current_fit.size = Number(size)
		        let [es, ei] = get_deviations(size, bd, q)

		        let max_zeros = get_max_zeros(es, ei);

		        let s_es = es != 0 ? get_pretty_number_s(es, max_zeros) : "&nbsp;";
		        let s_ei = ei != 0 ? get_pretty_number_s(ei, max_zeros) : "&nbsp;";

				fit_pretty_print.innerHTML = `${size} ${bd}${q} ( <span class="inline-frac small">${s_es}<br>${s_ei}</span> )`;

				return;
			}

			m = text.trim().match(re_fit)
			if (m) {
		        /*** Определение отклонений ***/

		        let [ size, bd1, q1, bd2, q2 ] = m.slice(1, 6);
		        current_fit.size = Number(size)

		        let [es1, ei1] = get_deviations(size, bd1, q1)
		        let [es2, ei2] = get_deviations(size, bd2, q2)

		        let max_zeros = get_max_zeros(es1, ei1, es2, ei2);

		        let s_es1 = es1 != 0 ? get_pretty_number_s(es1, max_zeros) : "&nbsp;";
		        let s_ei1 = ei1 != 0 ? get_pretty_number_s(ei1, max_zeros) : "&nbsp;";
		        let s_es2 = es2 != 0 ? get_pretty_number_s(es2, max_zeros) : "&nbsp;";
		        let s_ei2 = ei2 != 0 ? get_pretty_number_s(ei2, max_zeros) : "&nbsp;";

				fit_pretty_print.innerHTML = `${size} <span class="inline-frac">${bd1}${q1} ( <span class="inline-frac small">${s_es1}<br>${s_ei1}</span> )` +
		            `<span class="hr"></span>` +
		            `<span class="inline-frac">${bd2}${q2} ( <span class="inline-frac small">${s_es2}<br>${s_ei2}</span> )</span>`;


		        /*** Расчет посадки ***/

		        let [ S_max, S_min, S_avg ] = calc_fit(es1, ei1, es2, ei2).map(round_tail)

		        if (S_max >= 0) {
		        	el_S_max.innerHTML = `Максимальный зазор`;
		            el_S_max_value.innerHTML = `<span class="monospace">${S_max}</span>`;
		        }
		        else {
		        	el_S_max.innerHTML = `Минимальный натяг`;
		            el_S_max_value.innerHTML = `<span class="monospace">${-S_max}</span>`;
		        }

		        if (S_min >= 0) {
		        	el_S_min.innerHTML = `Минимальный зазор`;
		            el_S_min_value.innerHTML = `<span class="monospace">${S_min}</span>`;
		        }
		        else {
		        	el_S_min.innerHTML = `Максимальный натяг`;
		            el_S_min_value.innerHTML = `<span class="monospace">${-S_min}</span>`;
		        }

		        if (S_avg >= 0)
		            el_S_avg.innerHTML = `зазор <span class="monospace">${S_avg}</span>`;
		        else
		            el_S_avg.innerHTML = `натяг <span class="monospace">${-S_avg}</span>`;

				let Tp = round_tail(S_max - S_min)
				el_Tp.innerHTML = `<span class="monospace">${Tp}</span>`;

		        /*** Предложение к исправлению ***/
		        if (bd1.toLowerCase() == bd1 || bd2.toUpperCase() == bd2) {
		            let text = `${size} ${bd1.toUpperCase()}${q1} / ${bd2.toLowerCase()}${q2}`;
		            fit_did_you_mean.innerHTML = `Возможно, вы имели в виду <a href="javascript:;" onclick="fit_input.value = '${text}'; parse_fit()">${text}</a>?`
		        }

				return;
			}

			fit_pretty_print.innerHTML = `не распознано`;
		}
		catch(e) {
			console.error(e);
			fit_pretty_print.innerHTML = `ошибка`;
		}
	} else {
		let assumption = make_assumption();
		fit_did_you_mean.innerHTML = `Например, <a href="javascript:;" onclick="fit_input.value = '${assumption}'; parse_fit()">${assumption}</a>`
	}
}


const apply_fit = (fit) => {
	if (current_fit.size == 0) {
		fit_input.value = make_assumption();
		parse_fit();
	}

	fit_input.value = `${current_fit.size} ${fit}`;
	parse_fit();
}




document.addEventListener("DOMContentLoaded", () => {
	let table = document.getElementById("fix-slashes");
	for (let el of table.querySelectorAll("td, th")) {
		el.innerHTML = el.innerHTML.replaceAll(/([A-Za-z]{1,2})\s*([0-9]{1,2})\s*[\\\/]?\s*([A-Za-z]{1,2})\s*([0-9]{1,2})/g, `<a href="javascript:;" onclick="apply_fit('$1$2 / $3$4')" class="inline-frac">$1$2<span class="hr"></span>$3$4</a>`)
	}
})
