

let ta_input = document.getElementById("ta_input");
let table_input = document.getElementById("table_input");
let btn_submit_input = document.getElementById("btn_submit_input");
let table_results = document.getElementById("table_results");
let cb_include_from = document.getElementById("cb_include_from");
let cb_has_headings = document.getElementById("cb_has_headings");

let all_values = [];

let ternar_exprs = [];




/**
 * @param {Array<Array<Number>} values Входные численные данные. БЕЗ заголовков.
 * @param {Number} index_X Индекс столбца со значениями независимой переменной X.
 * @param {Number} index_Y Индекс столбца со значениями зависимой переменной Y.
 * @param {boolean} including_from Включать ли значение X в интервал. По-умолчанию `false`.
 * @param {String} var_name Название переменной X в выражении. По-умолчанию `t`.
 * @returns {String} Тернарное выражение на синтаксисе Компас-3D.
 */
const generate_ternar_expr = (values, index_X, index_Y, including_from = false, var_name = "t") => {
	let prev_value = values[0][index_Y];
    let ternar = String(prev_value);  // Последнее значение при `else`

	let sign = including_from ? ">=" : ">";

    for (let i = 1; i < values.length; ++i) {
		let var_name_from = values[i][index_X];
		let value = values[i][index_Y];

		// пропуск подряд идущего дублирующегося значения Y
		if (prev_value == value) continue;

		let cond = `${var_name}${sign}${var_name_from}`
        ternar = `${cond}?${value}:(${ternar})`;

		prev_value = value;
	}

    return ternar;
}



const generate_headers = (length) => {
	let headers = Array();

	headers.push("x");

	for (let i = 0; i < length - 1; i++) {
		headers.push("y" + String(i + 1));
	}

	return headers;
}


const copy_ternar = (index) => {
	navigator.clipboard.writeText(ternar_exprs[index]);
}


btn_submit_input.onclick = () => {
	all_values = [];
	ternar_exprs = [];
	table_input.innerHTML = "";
	table_results.innerHTML = "";

	// Парсинг исходных данных
		for (let line of ta_input.value.split("\n")) {
			line = line.trim();
			if (line == "") continue;
			let line_vals = line.split("\t");
			line_vals = line_vals.map((val) => val.replace(",", "."));
			all_values.push(line_vals);
		}

		if (all_values.length == 0) return;

	// Определение заголовков столбцов
		if (! cb_has_headings.checked) {
			let headers = generate_headers(all_values[0].length);
			all_values.unshift(headers);
		}
		let headers = all_values[0];
		let vals = all_values.slice(1);

	// Сортировка значений по X
		vals.sort((line_a, line_b) => line_a[0] - line_b[0]);

	// Вывод исходных данных в таблицу (исключительно для визуализации)
		let html_input = "";

		html_input += "<tr>";
			for (let data of headers) {
				html_input += `<th>${data}</th>`;
			}
		html_input += "</tr>";

		for (let row of vals) {
			html_input += "<tr>";
				for (let data of row) {
					html_input += `<td>${data}</td>`;
				}
			html_input += "</tr>";
		}

		table_input.innerHTML = html_input;

	// Генерация тернарных выражений
		let include_from = cb_include_from.checked;

		for (let i = 0; i < vals[0].length; ++i) {
			let r = generate_ternar_expr(vals, 0, i, include_from, );
			ternar_exprs.push(r);
		}

	// Вывод тернарных выражений в таблицу с результатами
		let html_results = ""

		for (let i = 0; i < ternar_exprs.length; ++i) {
			html_results += "<tr>";
			html_results += `<td>${headers[i]}</td>`;
			html_results += `<td>${ternar_exprs[i]}</td>`;
			html_results += `<td><button style="width: 150px;" onclick="copy_ternar(${i}); animate_copy(this)">Копировать</button></td>`;
			html_results += "</tr>";
		}
		table_results.innerHTML = html_results;

};
