let main = document.getElementsByClassName("main")[0];

document.addEventListener("DOMContentLoaded", () => {
	let h1_index = document.getElementById("document-index");
	if (!h1_index) return;

	let list_html = "";

	let headings = [];

	for (let h of main.querySelectorAll("h1, h2, h3")) {
		if (h == h1_index) continue;
		h.id = h.innerText;
		if (h.tagName == "H1") {
			headings.push([h, []])
		}
		if (h.tagName == "H2") {
			headings[headings.length - 1][1].push([h, []])
		}
		if (h.tagName == "H3") {
			headings[headings.length - 1][1][headings[headings.length - 1][1].length - 1][1].push([h, []])
		}
	}

	const list = (headings) => {
		let list_html = "";
		for (let h of headings) {
			let href = "#" + h[0].id;
			let l = "";
			if (h[1].length > 0) {
				l = list(h[1])
			}
			list_html += `<li><a href="${href}">${h[0].innerHTML}</a>${l}</li>\n`;
		}
		return `<ul>${list_html}</ul>`;
	}

	let index = list(headings);
	h1_index.parentElement.innerHTML += index;

	// -----

	main.appendChild(Object.assign(document.createElement("a"), {
		innerHTML: "Наверх",
		classList: ["go-to-top"],
		href: "#top",
	}));
})




