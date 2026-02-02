const assign_sticky_headings_top = () => {
	console.log("resized")
	let main = document.getElementsByClassName("main")[0];
	let headings = [];

	for (let h1 of main.getElementsByTagName("H1")) {
		let h1_h = parseFloat(window.getComputedStyle(h1).height);

		for (let h2 of h1.parentElement.getElementsByTagName("H2")) {
			h2.style.top = `${h1_h}px`;
			let h2_h = parseFloat(window.getComputedStyle(h2).height);

			for (let h3 of h1.parentElement.getElementsByTagName("H3")) {
				h3.style.top = `${h1_h + h2_h}px`;
			}
		}
	}
}
window.addEventListener("resize", assign_sticky_headings_top);
document.addEventListener("DOMContentLoaded", assign_sticky_headings_top);

