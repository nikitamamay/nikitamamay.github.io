let modal_bg = Object.assign(document.getElementById("modal-background"), {
	close: () => {
		modal_bg.style.display = "none";
	},
	open: () => {
		modal_bg.style.display = "flex";
	},
});
let modal_content = document.getElementById("modal-content");
modal_bg.onclick = (event) => {
	if (event.target === modal_bg) {
		modal_bg.close();
	}
}


const open_modal = (content) => {
	modal_content.innerHTML = content;
	modal_bg.open();
}

const open_modal_img = (url, text = "") => {
	open_modal(`<img src="${url}">${text}`)
}


document.addEventListener("DOMContentLoaded", () => {
	for (let el of document.querySelectorAll(".scalable-with-modal")) {
		let img = el.querySelector(".gallery-image")
		img.style.opacity = 0;
		let div = img.parentElement;
		div.style.backgroundImage = `url(${img.src})`;
		text = `<p>${img.alt}</p>`
		// div.onclick = () => open_modal_img(img.src, text);
		div.onclick = () => open_modal(el.innerHTML);
	}
})