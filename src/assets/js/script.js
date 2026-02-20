let modal_bg = Object.assign(document.getElementById("modal-background"), {
	close: () => {
		modal_bg.style.display = "none";
	},
	open: () => {
		modal_bg.style = "";
	},
	current_el: null,
});
modal_bg.onclick = (event) => {
	if (event.target === modal_bg) {
		modal_bg.close();
	}
}
let modal_content = document.getElementById("modal-content");
let modal_image = document.getElementById("modal-image");


const open_modal = (content) => {
	modal_image.src = "";
	modal_content.innerHTML = content;
	modal_bg.open();
}

const open_modal_img = (img_src, text = "") => {
	modal_image.src = img_src;
	modal_content.innerHTML = text;
	modal_bg.open();
}

const modal_switch = (increment = 0) => {
	let i = 0;
	let list = document.querySelectorAll(".scalable-with-modal");
	for (; i < list.length; ++i) {
		let el = list[i];
		if (el == modal_bg.current_el) {
			break;
		}
	}

	i += increment;
	if (i < 0) { i = list.length - 1 }
	if (i >= list.length) { i = 0 }

	list[i].show_in_modal();
}



const animate_copy = (element) => {
	let old = element.innerHTML;
	element.innerHTML = "&check;&nbsp;Скопировано";
	setTimeout(() => {
		element.innerHTML = old;
	}, 1000);
}


document.addEventListener("DOMContentLoaded", () => {
	/**
	 * Назначение обработчиков событий раскрытия картинки в модальном окне
	 */
	for (let el of document.querySelectorAll(".scalable-with-modal")) {
		let img = null;
		if (el.tagName == "IMG") {
			img = el;
		} else {
			console.error(`Not an image:`, el);
			continue;
			img = el.querySelector("img");
			if (img === null) {
				console.error(`Cannot find image in`, el);
				continue;
			}
		}

		img.show_in_modal = () => {
			let content = "";

			try {
				let parent = img.parentElement;
				if (parent.classList.contains("img-holder")) {
					parent = parent.parentElement;
				}

				if (parent !== null) {
					parent.querySelectorAll(".scalable-additional-content").forEach((el) => { content += el.outerHTML; });
				}
			} catch (error) {
				console.error(error);
			}

			// let additional_content_id = el.getAttribute("additional-content-id");

			// if (additional_content_id != null) {
			// 	content = document.getElementById(additional_content_id);
			// }

			modal_bg.current_el = el;
			open_modal_img(img.src, content);
		};
		img.addEventListener("click", img.show_in_modal);
	}

	/**
	 * Анимации .animation-appear-on-scroll
	 */
	const observer = new IntersectionObserver(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && (entry.intersectionRect.height > 120 || entry.target.clientHeight < 120)) {
					entry.target.classList.add("animation-started");
				}
			});
		}, {
			root: null,
			threshold: 0.1,
		}
	);
	for (let el of document.querySelectorAll(".animation-appear-on-scroll")) {
		observer.observe(el);
	}


})