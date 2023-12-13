

let ta_input = document.getElementById("ta_input");
let table_input = document.getElementById("table_input");
let btn_submit_input = document.getElementById("btn_submit_input");
let table_results = document.getElementById("table_results");
let cb_include_from = document.getElementById("cb_include_from");

let all_values = [];


/**
 * @param {Array<Array<Number>} values Два столбца с числами. Первый столбец - X, второй - Y.
 * @param {String} sign Знак операции сравнения в тернарном выражении. По-умолчанию `>` (т.е. "не_включительно").
 * @param {String} var_name Название переменной X в выражении. По-умолчанию `t`.
 * @returns {String} Тернарное выражение на синтаксисе Компас-3D.
 */
const f1 = (values, sign = ">", var_name = "t") => {
    let ternar = String(values[0][1])  // Последнее значение при `else`
    for (let i = 1; i < values.length; ++i) {
		let var_name_from = values[i][0];
		let value = values[i][1];
        ternar = `${var_name}${sign}${var_name_from}?${value}:(${ternar})`;
	}
    return ternar;
}



/**
 * @param {Array<Array<Number>} values Входные численные данные. БЕЗ заголовков.
 * @param {Number} index_X Индекс столбца со значениями независимой переменной X.
 * @param {Number} index_Y Индекс столбца со значениями зависимой переменной Y.
 * @param {boolean} including_from Включать ли значение X в интервал. По-умолчанию `false`.
 * @param {String} var_name Название переменной X в выражении. По-умолчанию `t`.
 * @returns {String} Тернарное выражение на синтаксисе Компас-3D.
 */
const f11 = (values, index_X, index_Y, including_from = false, var_name = "t") => {
    let ternar = String(values[0][index_Y])  // Последнее значение при `else`

	let sign = including_from ? ">=" : ">";

    for (let i = 1; i < values.length; ++i) {
		let var_name_from = values[i][index_X];
		let value = values[i][index_Y];

		let cond = `${var_name}${sign}${var_name_from}`
        ternar = `${cond}?${value}:(${ternar})`;
	}

    return ternar;
}




btn_submit_input.onclick = () => {
	all_values = []

	// Парсинг исходных данных
		for (let line of ta_input.value.split("\n")) {
			line = line.trim();
			if (line == "") continue;
			let line_vals = line.split("\t");
			line_vals = line_vals.map((val) => val.replace(",", "."));
			all_values.push(line_vals);
		}

	let headers = all_values[0]
	let vals = all_values.slice(1)


	// Вывод исходных данных в таблицу (исключительно для визуализации)
		let html_input = ""
		for (let row of all_values) {
			html_input += "<tr>";
				for (let data of row) {
					html_input += `<td>${data}</td>`;
				}
			html_input += "</tr>";
		}
		table_input.innerHTML = html_input;


	let include_from = cb_include_from.checked;

	// Генерация и вывод тернарных выражений
		let html_results = ""

		for (let i = 0; i < vals[0].length; ++i) {
			// генерация тернарного выражения
				let r = f11(vals, 0, i, include_from, );

			// вывод выражения в таблицу с результатами
				html_results += "<tr>";
				html_results += `<td>${headers[i]}</td>`;
				html_results += `<td>${r}</td>`;
				html_results += "</tr>";
		}
		table_results.innerHTML = html_results;



	// def f3(vals: list[float], var: str = "t", sign: str = ">=", k: float = 0) -> str:

    // v: list[tuple[float, float]] = []

    // k = 1 - k

    // for i in range(-1, len(vals) - 1):
    //     values_i = vals[max(i, 0)]
    //     value_cond = values_i + k * (vals[i+1] - values_i)
    //     v.append((value_cond, vals[i+1]))

    // return f1(v, sign, var)
};
