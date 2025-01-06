import type RouteHandler from "./types/RouteHandler";

const AssetsDynamiques: RouteHandler[] = [];

AssetsDynamiques.push({
	route: "/AlgoForge.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 791.26 809.17">
    <defs>
        <style>
            .cls-1,
            .cls-2,
            .cls-3 {
                fill: #${fgColor};
            }

            .cls-1 {
                stroke: #${fgColor};
                stroke-miterlimit: 10;
            }

            .cls-3 {
                font-size: 107.48px;
                font-family: HagridTextTrial-Extrabold, Hagrid Text Trial;
                font-weight: 800;
                letter-spacing: -0.01em;
            }

            .cls-4 {
                letter-spacing: 0em;
            }
        </style>
    </defs>
    <g id="Marteau">
        <path class="cls-1"
            d="M714.4,348.46,509.1,302.78a3.64,3.64,0,0,1-2.74-4.42L513.83,268a3.65,3.65,0,0,1,4.33-2.68l204.57,45.79A19.12,19.12,0,0,1,737,334.94h0A19.12,19.12,0,0,1,714.4,348.46Z"
            transform="translate(-29.61 -16.42)" />
        <path class="cls-1"
            d="M486.42,306.85l11.86,2.94a.47.47,0,0,0,.58-.36l10.79-54.65a.47.47,0,0,0-.4-.56l-11-1.45a.47.47,0,0,0-.52.37l-11.7,53.15A.48.48,0,0,0,486.42,306.85Z"
            transform="translate(-29.61 -16.42)" />
        <polyline class="cls-1"
            points="451.99 286.42 428.97 322.96 386.34 312.95 379.57 246.01 415.44 189.08 458.06 199.1 461.97 237.78" />
        <line class="cls-2" x1="516.82" y1="223.85" x2="587.73" y2="202.81" />
        <path class="cls-2"
            d="M544.29,233.09,616,214.64a4.79,4.79,0,0,1,2.73,9.18l-70.14,23.65a7.51,7.51,0,1,1-4.27-14.38Z"
            transform="translate(-29.61 -16.42)" />
        <line class="cls-2" x1="493.89" y1="178.31" x2="603.38" y2="66.51" />
        <path class="cls-2"
            d="M518.14,189.48,630,80a4.14,4.14,0,0,1,5.92,5.79L528.86,200c-7.22,7.09-17.69-3-10.72-10.5Z"
            transform="translate(-29.61 -16.42)" />
        <line class="cls-2" x1="448.53" y1="155.07" x2="468.25" y2="85.85" />
        <path class="cls-2"
            d="M470.93,169.43l22.87-68.31a4.23,4.23,0,0,1,8.12,2.31l-16.57,70.11a7.51,7.51,0,1,1-14.42-4.11Z"
            transform="translate(-29.61 -16.42)" />
        <line class="cls-2" x1="398.74" y1="151.52" x2="357.53" y2="4.27" />
        <path class="cls-2"
            d="M421.12,170,382.94,21.87a4.36,4.36,0,0,1,8.39-2.35l44.24,146.41c2.53,9.79-11.48,13.79-14.45,4Z"
            transform="translate(-29.61 -16.42)" />
        <line class="cls-2" x1="360.53" y1="185.08" x2="306.65" y2="131.56" />
        <path class="cls-2"
            d="M384.85,206.83l-51.24-56.17a3.77,3.77,0,0,1,5.3-5.34l56.51,50.87a7.51,7.51,0,1,1-10.57,10.64Z"
            transform="translate(-29.61 -16.42)" />
        <line class="cls-2" x1="333.59" y1="227.93" x2="180.21" y2="185.89" />
        <path class="cls-2" d="M361.21,251.58,209,205.24a3,3,0,0,1,1.61-5.85l154.56,37.73c9.79,2.83,6,17-4,14.46Z"
            transform="translate(-29.61 -16.42)" />
        <line class="cls-2" x1="333.59" y1="274.56" x2="268.25" y2="292.87" />
        <path class="cls-2"
            d="M365.22,298.21l-26.32,5.6-40.19,8.55a3.19,3.19,0,0,1-1.72-6.13l64.18-22.46a7.51,7.51,0,1,1,4.05,14.44Z"
            transform="translate(-29.61 -16.42)" />
    </g>
    <g id="AlgoForge">
        <path class="cls-2"
            d="M97.71,461.12q-1.83-9-2.48-12.14c-.18-1.09-.41-2.3-.72-3.62s-.63-2.79-1-4.43H67l-4.44,20.19H29.61l6.53-29.19Q49,375.32,52.61,357.05H108q6,28.92,23.27,104.07ZM90,424q-7.57-36.42-9-55.92h-1.7q-2.22,22-8.89,55.92Z"
            transform="translate(-29.61 -16.42)" />
        <path class="cls-2"
            d="M137.58,409.15q0-23-.65-52.1h32.94q-.52,23.06-.52,48,0,15.13.26,30.14,15.94,0,37.65-.27L205,461.12H136.93Q137.59,432.07,137.58,409.15Z"
            transform="translate(-29.61 -16.42)" />
        <path class="cls-2"
            d="M215.17,449.18Q205.3,435.34,205.3,409q0-27.94,11-40.85T252,355.28q17.52,0,27.39,4.57a27.92,27.92,0,0,1,14.25,14.45q4.36,9.9,5.16,26.8l-32.16,3.41q-.53-11.86-4.12-18.48a11.87,11.87,0,0,0-11.17-6.61,33.74,33.74,0,0,0-10.85,1.63A97.2,97.2,0,0,0,238,393.4a112.63,112.63,0,0,0-.78,14.39q0,13.5,4.31,22.5t12.55,9a37.89,37.89,0,0,0,10.07-1.36,23.67,23.67,0,0,0,5.49-3.55,12,12,0,0,1,2.22-1.77q0-4.91-2.22-7.71c-1.49-1.86-3.75-2.79-6.8-2.79h-8v-6.82h47.58V427.7q0,19.1.13,33.42H271.19l.65-23.19h-2q-1.44,12.69-7.91,18.89T244.65,463Q225,463,215.17,449.18Z"
            transform="translate(-29.61 -16.42)" />
        <path class="cls-2"
            d="M327.66,457.37a33.91,33.91,0,0,1-15.36-17.53Q307.4,428,307.4,409q0-28.1,11.17-40.91t35.63-12.82q16.86,0,27.38,5.72a34.71,34.71,0,0,1,15.56,17.67q5,11.93,5,30.89,0,27.69-11.5,40.58T355.11,463Q338.11,463,327.66,457.37Zm38.69-19.44a109,109,0,0,0,3.4-27.55q0-13.5-4-22.23t-12.36-8.73a37,37,0,0,0-11.11,1.63,111,111,0,0,0-2.16,12.21,127,127,0,0,0-.72,14.66q0,13.5,4.19,22.44t12.55,8.93A31.61,31.61,0,0,0,366.35,437.93Z"
            transform="translate(-29.61 -16.42)" />
        <path class="cls-2"
            d="M807.89,439.73h13V427.91c0-2,0-14.41,0-15.33,0-1.17-3.41-.64-4.64-.09.12,3.36-.68,4.09-2.2,6-1.35,1.7-2.83,1.25-4.89,1.25H781.23V404.4l36.36.9v-7.14H755.18c0,7.24-.06,14.45-.16,21.45q-.16,11.5-.49,20.12H803c1.46,0,4.78.68,5.81-.56,1.52-1.8,3.5-4.48,4-6.89a19.09,19.09,0,0,1,.64,3.48,30.85,30.85,0,0,1,0,4.08"
            transform="translate(-29.61 -16.42)" />
        <path class="cls-2"
            d="M816.21,383.84c.12-3.36-.68-4.09-2.2-6-1.35-1.69-2.83-1.24-4.89-1.24H781.23v15.32l36.36-.9v7.13H755.18c0-7.23-.06-14.44-.16-21.44q-.16-11.5-.49-20.12h66.32v11.82c0,2,0,14.41,0,15.33C820.81,384.92,817.44,384.39,816.21,383.84Z"
            transform="translate(-29.61 -16.42)" /><text class="cls-3"
            transform="translate(397.96 423.58) scale(0.98 1)">F<tspan class="cls-4" x="72.44" y="0">ORG</tspan></text>
    </g>
    <g id="Anvil">
        <path class="cls-2"
            d="M542.72,554.62H649.05c38.29-25,93.65-50.76,171.74-76.25V445H401.2v20.5L29.61,462.57S36.92,602.36,337.73,609c0,0,106.86,66.6-82.7,162.48l-.73,54.16h97.34s101-67.34,207.86,0h97.34V770S509.16,688.87,606,589.25H576c-6.44,0-6.43-10,0-10h40.48c5.45-4.84,11.48-9.72,18.16-14.63H542.72C536.27,564.62,536.28,554.62,542.72,554.62Z"
            transform="translate(-29.61 -16.42)" />
    </g>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/bibliocustom.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";
		const nom = req.query.nom || "Nom";

		const svgContent = `
	<svg version="1.1" id="BibliothequeAlgo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 512 415.3" style="enable-background:new 0 0 512 415.3;" xml:space="preserve">
<style type="text/css">
	.st0{fill:none;}
</style>
<path class="st0" fill="#${fgColor}" d="M487.5,36.1v222c0,6.5-5.2,11.6-11.6,11.6H36.1c-6.5,0-11.7-5.2-11.7-11.6v-222c0-6.5,5.2-11.6,11.7-11.6h439.8
	C482.3,24.5,487.5,29.7,487.5,36.1z"/>
<path fill="#${fgColor}" d="M392.7,294.3h98.5c11.5,0,20.8-9.4,20.8-21.1V21.1C512,9.4,502.7,0,491.2,0H20.8C9.3,0,0,9.4,0,21.1v252.1
	c0,11.7,9.3,21.1,20.8,21.1h112.1c6.8,0,12.3,5.5,12.3,12.3v71.9c0,6.8-5.5,12.3-12.3,12.3H12.7c-6.8,0-12.7,5.5-12.7,12.3
	c0,3.3,1.4,6.4,3.6,8.6c2.2,2.2,5.3,3.6,8.6,3.6h487.5c6.8,0,12.2-5.5,12.2-12.2c0-3.4-1.4-6.4-3.6-8.6c-2.2-2.2-5.3-3.6-8.6-3.6
	H392.7c-6.8,0-12.3-5.5-12.3-12.3v-71.9C380.4,299.8,385.9,294.3,392.7,294.3z M355.9,378.5c0,6.8-5.5,12.3-12.3,12.3H182.1
	c-6.8,0-12.3-5.5-12.3-12.3v-71.9c0-6.8,5.5-12.3,12.3-12.3h161.5c6.8,0,12.3,5.5,12.3,12.3V378.5z M36.1,269.8
	c-6.5,0-11.7-5.2-11.7-11.6V24.6c0-0.1,0-0.1,0.1-0.1h450.7c6.8,0,12.2,5.5,12.2,12.2v220.9c0,6.8-5.5,12.2-12.2,12.2H36.1z"/>
<line class="st0" x1="355.9" y1="390.8" x2="169.7" y2="390.8"/>
<g>
	<path fill="#${fgColor}" d="M240.6,176c0-10.4,1.1-18.5,3.2-24.5c2.1-6,5.6-11.2,10.4-15.6c4.8-4.4,8.5-8.4,11-12.1c2.5-3.7,3.8-7.7,3.8-12.1
		c0-10.7-4.2-16.1-12.7-16.1c-3.9,0-7.1,1.6-9.5,4.7c-2.4,3.1-3.7,7.3-3.8,12.7h-33c0.1-14.2,4.2-25.2,12.3-33.1
		c8.1-7.9,19.4-11.9,34-11.9c14.5,0,25.8,3.7,33.7,11c8,7.3,12,17.7,12,31.2c0,5.9-1.1,11.2-3.2,16.1c-2.1,4.8-5.6,9.7-10.4,14.8
		l-11.2,11.4c-3.2,3.3-5.4,6.8-6.6,10.3c-1.2,3.5-1.9,8-2.1,13.3H240.6z M236.6,208.3c0-5.2,1.7-9.6,5.2-12.9
		c3.5-3.4,7.8-5.1,13-5.1c5.2,0,9.6,1.7,13,5.1c3.5,3.4,5.2,7.7,5.2,12.9c0,5.2-1.7,9.6-5.2,12.9c-3.5,3.4-7.8,5.1-13,5.1
		c-5.2,0-9.6-1.7-13-5.1C238.3,217.8,236.6,213.5,236.6,208.3z"/>
</g>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/BibliothequeAlgo.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<?php
header('Content-Type: image/svg+xml');
?>
<svg version="1.1" id="BibliothequeAlgo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 514 514" style="enable-background:new 0 0 514 514;" xml:space="preserve">
<style type="text/css">
    .st0{fill:#${fgColor};}
</style>
<g>
	<path class="st0" d="M125.2,25.1v38.2c0-5.7-2.8-10.3-6.1-10.3H6.1c-1.7,0-3.2,1.2-4.3,3C0.7,57.9,0,60.5,0,63.3V25.1C0,11.2,28,0,62.6,0
		c17.3,0,33,2.8,44.3,7.3C118.2,11.9,125.2,18.2,125.2,25.1z"/>
	<path class="st0" d="M119.1,73.6H6.1C2.7,73.6,0,69,0,63.3v387.9c0-2.9,0.7-5.4,1.8-7.3c1.1-1.9,2.6-3,4.3-3h113c3,0,5.5,3.7,6,8.5v3.6
		c-0.5,4.8-3,8.5-6,8.5H6.1c-3.4,0-6.1-4.6-6.1-10.3v38.2c0,13.8,28,25,62.6,25c33.3,0,60.7-10.4,62.5-23.6c0.1-0.5,0.1-0.9,0.1-1.4
		V63.3C125.2,69,122.5,73.6,119.1,73.6z M72.9,373.2c-0.1,7-4.7,12.6-10.3,12.6c-5.7,0-10.3-5.6-10.3-12.5V141.1
		c0-6.9,4.6-12.5,10.3-12.5c2.9,0,5.4,1.4,7.3,3.7c1.9,2.3,3,5.4,3,8.8V373.2z"/>
</g>
<g>
	<path class="st0" d="M335.1,64.1c-2.3-4.7-8.5-8.9-17.3-12.1c-11.3-4.1-27-6.7-44.3-6.7c-34.6,0-62.6,10.3-62.6,22.9V103c0-2.8,0.7-5.4,1.8-7.3
		c1.1-1.9,2.6-3,4.3-3h113c3.3,0.1,6,4.7,6,10.3c0,5.7-2.7,10.3-6.1,10.3H217c-3.4,0-6.1-4.6-6.1-10.3v353.7c0-2.9,0.7-5.4,1.8-7.3
		c1.1-1.9,2.6-3,4.3-3h113c3.3,0.1,6,4.7,6,10.3c0,5.7-2.7,10.3-6.1,10.3H217c-3.4,0-6.1-4.6-6.1-10.3v34.8
		c0,12.7,28,22.9,62.6,22.9c34.5,0,62.5-10.2,62.6-22.8V68.2C336.1,66.8,335.8,65.4,335.1,64.1z M283.8,385.7
		c-0.1,6.3-4.7,11.5-10.3,11.5c-5.7,0-10.3-5.1-10.3-11.4V174c0-6.3,4.6-11.4,10.3-11.4c2.8,0,5.4,1.3,7.3,3.3c1.9,2.1,3,4.9,3,8.1
		V385.7z"/>
</g>
<g>
	<path class="st0" d="M198.3,81.1c-7.8-3.9-18.5-6.3-30.3-6.3c-22.8,0-41.3,8.8-42.8,20c-0.1,0.5-0.1,0.9-0.1,1.4V493
		c0,11.8,19.2,21.4,42.9,21.4s42.9-9.6,42.9-21.4v-32.6c0,5.7-1.9,10.3-4.2,10.3h-77.4c-2,0-3.7-3.5-4.1-8.1v-4.4
		c0.2-2,0.6-3.7,1.1-5.1c0.8-1.9,1.8-3,3-3h77.4c2.3,0,4.2,4.6,4.2,10.3V128.9c0,5.7-1.9,10.3-4.2,10.3h-77.4c-2,0-3.7-3.5-4.1-8.1
		v-4.4c0.2-2,0.6-3.7,1.1-5.1c0.8-1.9,1.8-3,3-3h77.4c2.3,0,4.2,4.6,4.2,10.3V96.2C210.9,90.3,206.1,85,198.3,81.1z M157.7,195.4
		c0-5.9,4.6-10.7,10.3-10.7c2.8,0,5.4,1.2,7.3,3.1c1.9,1.9,3,4.6,3,7.6v198.4c0,5.9-4.6,10.7-10.3,10.7s-10.3-4.8-10.3-10.7V195.4z"
		/>
</g>
<g>
	<path class="st0" d="M513.9,479.5l-4.9-38.4c0.6,5.4-1.4,11-4.7,11.5l-112.1,14.2c-2.9,0.4-6.2-6.4-7.4-11l5,39.4c1.7,13.8,30.9,21.4,65.2,17
		C489.3,507.8,515.7,493.2,513.9,479.5z M455.5,19.2C454.1,8,434.8,1,409.4,1c-6.1,0-12.5,0.4-19.1,1.2c-34.3,4.4-60.7,19-58.9,32.8
		l3.7,29.1l1,8l0.1,0.6l48.6,383.1v-0.4c0-4.8,1.9-8.6,4.9-9l112.1-14.2c3.2-0.5,6.4,3.5,7.2,8.9L455.5,19.2z M438.8,384.7
		c-5.6,0.7-10.9-4.3-11.7-11.1l-29.2-230.1c-0.9-6.9,3-13,8.6-13.7c0.3,0,0.7-0.1,1-0.1c5.2,0,9.9,4.8,10.7,11.2L447.4,371
		C448.3,377.9,444.4,384,438.8,384.7z M455.5,68.2l-112,14.2c-3.1,0.4-6.4-4.2-7.2-9.4v0c0-0.3-0.1-0.8-0.2-1.1v-2
		c0.2-4.2,2.2-7.5,4.9-7.9l112-14.2c3.3-0.5,6.6,3.8,7.3,9.4C461,62.8,458.9,67.7,455.5,68.2z"/>
</g>
</svg>

	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/boucle.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";
		const bgColor = req.query.bgColor || "ffffff";

		const svgContent = `
	<svg version="1.1" id="Boucle" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 550.4 512" style="enable-background:new 0 0 550.4 512;" xml:space="preserve">
<g>
	<path fill="#${fgColor}" d="M546.8,312.6c-4.7,7.8-13.1,12.6-22.2,12.6h-22c-1.9,6.8-4.1,13.5-6.5,20C459.8,442.6,366,512,256,512
		C114.6,512,0,397.4,0,256C0,114.6,114.6,0,256,0c108.8,0,201.8,67.9,238.8,163.6c-6.5-3.3-13.7-5.1-21-5.1c-10.2,0-20,3.4-28,9.5
		c-10.2-22-24.3-42.3-42-59.9c-39.5-39.5-92-61.2-147.9-61.2c-55.9,0-108.4,21.8-147.9,61.2s-61.2,92-61.2,147.9
		c0,55.8,21.8,108.4,61.2,147.9s92,61.2,147.9,61.2c55.8,0,108.4-21.8,147.9-61.2c17.3-17.3,31.2-37.1,41.4-58.7
		c3.1-6.5,5.8-13.2,8.2-20h-30.4c-9.1,0-17.5-4.8-22.2-12.6c-4.7-7.8-4.9-17.5-0.6-25.5l50.8-94.9c0.8-1.5,1.8-2.9,2.8-4.2
		c4.9-5.9,12.2-9.4,20-9.4c4.8,0,9.3,1.3,13.3,3.7s7.3,5.8,9.5,10l12.1,22.6l38.7,72.3C551.7,295.1,551.4,304.8,546.8,312.6z"/>
</g>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/conditionSortie.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" id="ConditionSortie" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 320.3 319.9" style="enable-background:new 0 0 320.3 319.9;" xml:space="preserve">
    <style type="text/css">
        .st0{stroke:#${fgColor};;stroke-width:27;stroke-linecap:round;stroke-miterlimit:10;}
        .st1{fill:none;stroke:#${fgColor};;stroke-width:15;stroke-linecap:round;stroke-miterlimit:10;}
        .st2{stroke:#${fgColor};;stroke-width:27;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1;}
        .st3{fill:none;stroke:#${fgColor};;stroke-width:27;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1;}
    </style>
    <g fill="#${fgColor}">
        <path d="M277.5,26.9c8.6,0,15.6,7,15.6,15.6v234.9c0,8.6-7,15.6-15.6,15.6H42.6c-8.6,0-15.6-7-15.6-15.6V42.5
            c0-8.6,7-15.6,15.6-15.6H277.5 M277.5-0.1H42.5C19-0.1,0,19,0,42.5v234.9c0,23.5,19.1,42.6,42.6,42.6h234.9
            c23.5,0,42.6-19.1,42.6-42.6V42.5C320,19,301-0.1,277.5-0.1L277.5-0.1z"/>
    </g>
    <polyline fill="#${fgColor}" class="st0" points="107.4,184.6 107.4,16.3 213.4,15.6 213.4,184.6 "/>
    <path fill="#${fgColor}" class="st1" d="M59,197.6"/>
    <path fill="#${fgColor}" class="st2" d="M264.5,184.6L163,249.3c-1.5,1-3.5,1-5.1,0L56.4,184.6H264.5z"/>
    <path fill="#${fgColor}" class="st3" d="M106.6,138.6"/>
    </svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/DictionnaireDonnees.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" id="DictionnaireDonnee" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 448 512" style="enable-background:new 0 0 448 512;" xml:space="preserve">
<path fill="#${fgColor}" d="M439.1,453.3c-4.2-15.4-4.2-59.3,0-74.7c5.4-4.3,8.9-11.1,8.9-18.6V24c0-13.3-10.7-24-24-24H96C43,0,0,43,0,96v320
	c0,53,43,96,96,96h328c13.3,0,24-10.7,24-24C448.1,476.4,449.7,460.8,439.1,453.3z M147.5,231.8c7.8-6.6,9.3-11,16.3-14.8
	c8.9-2.7,9,1.3,17.2,2.4c5.1-0.3,23.4-19.8,34.8-41.8c-5.1-12.8-13-37.4-21.2-47c-1.1,0.9-2.9,3.3-4.8,8.5
	c-4.3,13.3-25.4,9.8-25.1-4.2c0-8.8,4.3-17.8,13.2-27.7c25.6-29.4,50.5-12.2,65.3,28.8c18.3-25.6,34.5-49.6,65.2-41.6
	c8.9,2.3,12.4,14.3,6.1,21c-0.3,0.4-16.5,17.2-16.9,17.6c-15.9-2.4-25.1,6.8-42,35.2c6.2,15.1,15,43.1,25,51.5
	c3.4-1.7,9.5-16,17.5-14.6c5.5-0.1,10.8,3.5,12.4,8.8c3.6,12.8-6.2,22.1-14.1,29.5c-31.6,29.2-53.7,4.7-67.6-33.5
	c-17,26-34.4,46.2-58.8,46.2c-5.8,0-12.6-1.2-19.1-3.8C143.2,248.9,141.3,237.7,147.5,231.8z M381.4,448H96c-17.7,0-32-14.3-32-32
	c0-17.6,14.4-32,32-32h285.4C379.5,401.1,379.5,430.9,381.4,448z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/erreurs.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" id="Erreur" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 558.5 558.5" style="enable-background:new 0 0 558.5 558.5;" xml:space="preserve">
<g fill="#${fgColor}">
	<path d="M554.4,159.5L399,4.1c-2.6-2.6-6.2-4.1-9.9-4.1H169.4c-3.7,0-7.3,1.5-9.9,4.1L4.1,159.5c-2.6,2.6-4.1,6.2-4.1,9.9v219.7
		c0,3.7,1.5,7.3,4.1,10l155.4,155.3c2.6,2.6,6.2,4.1,9.9,4.1h219.7c3.7,0,7.3-1.5,9.9-4.1l155.4-155.3c2.6-2.6,4.1-6.2,4.1-9.9
		V169.4C558.5,165.7,557,162.1,554.4,159.5z M499.4,388.3L388.2,499.4c-8.1,8.1-19,12.6-30.4,12.6H200.6c-11.4,0-22.4-4.5-30.4-12.6
		L59.1,388.3c-8.1-8.1-12.6-19-12.6-30.4V200.6c0-11.4,4.5-22.4,12.6-30.4L170.2,59.1c8.1-8.1,19-12.6,30.4-12.6h157.2
		c11.4,0,22.3,4.5,30.4,12.6l111.2,111.1c8.1,8.1,12.6,19,12.6,30.4v157.2C512,369.3,507.5,380.2,499.4,388.3z"/>
</g>
<g fill="#${fgColor}">
	<path class="st0" d="M307.8,344.4h-55.6c-5.6,0-10.3-4.3-10.8-9.9l-20.1-235c-0.5-5.9,3.9-11.2,9.8-11.7c0.3,0,0.6,0,0.9,0h94.4
		c6,0,10.8,4.8,10.8,10.8c0,0.3,0,0.6,0,0.9l-18.6,235C318.2,340.1,313.5,344.4,307.8,344.4z"/>
	<path class="st1" d="M259.1,398.7h40.2c11.3,0,20.4,9.1,20.4,20.4v31.2c0,11.3-9.1,20.4-20.4,20.4h-40.2
		c-11.3,0-20.4-9.1-20.4-20.4v-31.2C238.7,407.9,247.9,398.7,259.1,398.7z"/>
</g>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/conditionSortie.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" id="ConditionSortie" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 320.3 319.9" style="enable-background:new 0 0 320.3 319.9;" xml:space="preserve" width="32" height="32">
<g fill="#${fgColor}">
	<path d="M277.5,26.9c8.6,0,15.6,7,15.6,15.6v234.9c0,8.6-7,15.6-15.6,15.6H42.6c-8.6,0-15.6-7-15.6-15.6V42.5
		c0-8.6,7-15.6,15.6-15.6H277.5 M277.5-0.1H42.5C19-0.1,0,19,0,42.5v234.9c0,23.5,19.1,42.6,42.6,42.6h234.9
		c23.5,0,42.6-19.1,42.6-42.6V42.5C320,19,301-0.1,277.5-0.1L277.5-0.1z"/>
</g>
<polyline fill="#${fgColor}" points="107.4,184.6 107.4,16.3 213.4,15.6 213.4,184.6 "/>
<path fill="#${fgColor}" d="M59,197.6"/>
<path fill="#${fgColor}" d="M264.5,184.6L163,249.3c-1.5,1-3.5,1-5.1,0L56.4,184.6H264.5z"/>
<path fill="#${fgColor}" d="M106.6,138.6"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/lien.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
<svg version="1.1" id="Lien" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 535.1 535.1" style="enable-background:new 0 0 535.1 535.1;" xml:space="preserve" width="32" height="32">
<path fill="#${fgColor}" d="M519.4,47.1L47.1,519.4c-8.7,8.7-22.8,8.7-31.4,0h0c-8.7-8.7-8.7-22.8,0-31.4L487.9,15.7c8.7-8.7,22.8-8.7,31.4,0v0
	C528,24.4,528,38.5,519.4,47.1z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/pointeur.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" id="Pointeur" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 512.7 512.7" style="enable-background:new 0 0 512.7 512.7;" xml:space="preserve" width="32" height="32">
<style type="text/css">
	.st0{stroke:#000000;stroke-width:0.6643;stroke-miterlimit:10;fill:#${fgColor};}
</style>
<g id="Marteau">
	<path class="st0" d="M448.3,500.8l-272-286.4c-2.6-2.7-2.4-6.9,0.5-9.5c0.1,0,0.1-0.1,0.1-0.1l45.5-37.7c2.9-2.4,7.2-2.1,9.8,0.6
		l270.7,285.8c13.7,14.4,12.6,36.6-2.5,49.7c-0.5,0.5-1,0.8-1.6,1.2l0,0C483.6,516.3,461.4,514.7,448.3,500.8z"/>
	<path class="st0" d="M136.1,196.4l15.4,17c0.3,0.4,0.9,0.4,1.3,0.1c0,0,0,0,0.1,0l77.6-70.7c0.3-0.3,0.4-0.8,0.1-1.2
		c0,0,0,0-0.1-0.1l-15.7-13.8c-0.3-0.3-0.9-0.3-1.2,0l-77.3,67.4C135.8,195.5,135.8,196.1,136.1,196.4L136.1,196.4z"/>
	<polyline class="st0" points="133.1,185.3 56.3,215.8 0.4,155.5 64.1,47.8 183.7,0.4 239.6,60.7 202.7,122.9 	"/>
</g>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/probleme.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" id="Probleme" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 571.2 328.3" style="enable-background:new 0 0 571.2 328.3;" xml:space="preserve" width="32" height="32">
<path fill="#${fgColor}" d="M548,0H23.2C10.4,0,0,10.5,0,23.5v281.3c0,13,10.4,23.5,23.2,23.5H548c12.8,0,23.2-10.5,23.2-23.5V23.5
	C571.2,10.5,560.8,0,548,0z M530.9,301H40.3c-7.2,0-13-5.8-13-13V40.3c0-7.2,5.8-13,13-13h490.6c7.2,0,13,5.8,13,13V288
	C543.9,295.2,538.1,301,530.9,301z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/procedure.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 571.2 328.8" style="enable-background:new 0 0 571.2 328.8;" xml:space="preserve" width="32" height="32">
     <g id="Procedure" fill="#${fgColor}">	<path d="M80.6,300.9c0.8,0.3,1.7,0.4,2.6,0.4h404.7c0.9,0,1.8-0.1,2.6-0.4H80.6z"/>
	<path d="M46.4,300.9h-3c-8.9,0-16.2-7.2-16.2-16.2V43.4c0-8.9,7.2-16.2,16.2-16.2h3c1.7,0,3.2,1.4,3.2,3.2v267.3
		C49.6,299.4,48.1,300.9,46.4,300.9z M498.2,288.3c0,6.1-3.4,11.2-8.1,12.6c-0.8,0.3-1.7,0.4-2.6,0.4H82.8c-0.9,0-1.8-0.1-2.6-0.4
		c-4.7-1.4-8.1-6.5-8.1-12.6V40.7c0-7.2,4.8-13,10.7-13h404.7c5.9,0,10.7,5.8,10.7,13V288.3z M543.9,284.7c0,8.9-7.2,16.2-16.2,16.2
		h-3.8c-1.7,0-3.2-1.4-3.2-3.2V30.4c0-1.7,1.4-3.2,3.2-3.2h3.8c8.9,0,16.2,7.2,16.2,16.2V284.7z M548,0H23.2C10.4,0,0,10.5,0,23.5
		v281.7c0,13,10.4,23.5,23.2,23.5H548c12.8,0,23.2-10.5,23.2-23.5V23.5C571.2,10.5,560.8,0,548,0z"/>
</g>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/redo.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg xmlns="http://www.w3.org/2000/svg" fill="#${fgColor}" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M16.3,15.007a1.5,1.5,0,0,0,2.121,0l4.726-4.725a2.934,2.934,0,0,0,0-4.145L18.416,1.412A1.5,1.5,0,1,0,16.3,3.533L19.532,6.7,5.319,6.7A5.326,5.326,0,0,0,0,12.019V18.7a5.324,5.324,0,0,0,5.318,5.318H18.682a1.5,1.5,0,0,0,0-3H5.318A2.321,2.321,0,0,1,3,18.7V12.019A2.321,2.321,0,0,1,5.319,9.7l14.159,0L16.3,12.886A1.5,1.5,0,0,0,16.3,15.007Z"/></svg>

	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/structureIterative.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";
		const bgColor = req.query.bgColor || "ffffff";

		const svgContent = `
<svg version="1.1" id="StructureIterativeNonBornee" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 550.4 512" style="enable-background:new 0 0 550.4 512;" xml:space="preserve" width="32" height="32">
<g>
	<path fill="#${fgColor}" d="M546.8,312.6c-4.7,7.8-13.1,12.6-22.2,12.6h-22c-1.9,6.8-4.1,13.5-6.5,20C459.8,442.6,366,512,256,512
		C114.6,512,0,397.4,0,256C0,114.6,114.6,0,256,0c108.8,0,201.8,67.9,238.8,163.6c-6.5-3.3-13.7-5.1-21-5.1c-10.2,0-20,3.4-28,9.5
		c-10.2-22-24.3-42.3-42-59.9c-39.5-39.5-92-61.2-147.9-61.2c-55.9,0-108.4,21.8-147.9,61.2s-61.2,92-61.2,147.9
		c0,55.8,21.8,108.4,61.2,147.9s92,61.2,147.9,61.2c55.8,0,108.4-21.8,147.9-61.2c17.3-17.3,31.2-37.1,41.4-58.7
		c3.1-6.5,5.8-13.2,8.2-20h-30.4c-9.1,0-17.5-4.8-22.2-12.6c-4.7-7.8-4.9-17.5-0.6-25.5l50.8-94.9c0.8-1.5,1.8-2.9,2.8-4.2
		c4.9-5.9,12.2-9.4,20-9.4c4.8,0,9.3,1.3,13.3,3.7s7.3,5.8,9.5,10l12.1,22.6l38.7,72.3C551.7,295.1,551.4,304.8,546.8,312.6z"/>
</g>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/structureIterativeBornee.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";
		const bgColor = req.query.bgColor || "ffffff";

		const svgContent = `
	<svg version="1.1" id="StructureIterativeBornee" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 666.3 512" style="enable-background:new 0 0 666.3 512;" xml:space="preserve" width="32" height="32">
<g fill="#${fgColor}">
	<path d="M546.8,312.6c-4.7,7.8-13.1,12.6-22.2,12.6h-22c-1.9,6.8-4.1,13.5-6.5,20C459.8,442.6,366,512,256,512
		C114.6,512,0,397.4,0,256C0,114.6,114.6,0,256,0c108.8,0,201.8,67.9,238.8,163.6c-6.5-3.3-13.7-5.1-21-5.1c-10.2,0-20,3.4-28,9.5
		c-10.2-22-24.3-42.3-42-59.9c-39.5-39.5-92-61.2-147.9-61.2c-55.9,0-108.4,21.8-147.9,61.2s-61.2,92-61.2,147.9
		c0,55.8,21.8,108.4,61.2,147.9s92,61.2,147.9,61.2c55.8,0,108.4-21.8,147.9-61.2c17.3-17.3,31.2-37.1,41.4-58.7
		c3.1-6.5,5.8-13.2,8.2-20H423c-9.1,0-17.5-4.8-22.2-12.6c-4.7-7.8-4.9-17.5-0.6-25.5l50.8-94.9c0.8-1.5,1.8-2.9,2.8-4.2
		c4.9-5.9,12.2-9.4,20-9.4c4.8,0,9.3,1.3,13.3,3.7s7.3,5.8,9.5,10l12.1,22.6l38.7,72.3C551.7,295.1,551.4,304.8,546.8,312.6z"/>

	<path d="M589.5,272.8c0-11.9,1.3-21.3,4-28.1c2.7-6.9,7-12.8,13.1-17.9c6-5,10.6-9.7,13.7-13.9c3.1-4.2,4.7-8.8,4.7-13.9
		c0-12.3-5.3-18.4-15.9-18.4c-4.9,0-8.8,1.8-11.8,5.4c-3,3.6-4.6,8.4-4.8,14.5h-41.3c0.2-16.3,5.3-28.9,15.4-38
		c10.1-9.1,24.2-13.6,42.5-13.6c18.1,0,32.2,4.2,42.2,12.6c10,8.4,15,20.3,15,35.8c0,6.8-1.3,12.9-4,18.4c-2.7,5.5-7,11.2-12.9,17
		l-14,13.1c-4,3.8-6.8,7.8-8.3,11.8c-1.5,4-2.4,9.1-2.6,15.3H589.5z M584.5,309.9c0-6,2.2-11,6.5-14.8c4.4-3.9,9.8-5.8,16.3-5.8
		c6.5,0,11.9,1.9,16.3,5.8c4.4,3.9,6.5,8.8,6.5,14.8c0,6-2.2,11-6.5,14.8c-4.4,3.9-9.8,5.8-16.3,5.8c-6.5,0-11.9-1.9-16.3-5.8
		C586.7,320.9,584.5,315.9,584.5,309.9z"/>
</g>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/structureSi.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" id="StructureSi" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     viewBox="0 0 571.2 328.3" style="enable-background:new 0 0 571.2 328.3;" xml:space="preserve" width="32" height="32">
  <path fill="#${fgColor}" d="M567.7,149.7L495.6,7.2c-2.2-4.4-6.8-7.2-11.7-7.2H87.4c-5,0-9.5,2.8-11.7,7.2L3.4,149.7c-4.6,9.1-4.6,19.8,0,28.9
    l72.2,142.6c2.2,4.4,6.8,7.1,11.7,7.1h396.5c5,0,9.5-2.8,11.7-7.1l72.2-142.6C572.3,169.5,572.3,158.8,567.7,149.7z M271.9,288.9
    c0,7.1-5.9,12.9-13.1,12.9h-163v0L29,169.9c-1.8-3.6-1.8-7.9,0-11.6L95.8,26.5v0h163c7.2,0,13.1,5.8,13.1,12.9V288.9z M542.2,169.9
    l-66.8,131.9v0h-163c-7.2,0-13.1-5.8-13.1-12.9V39.4c0-7.1,5.9-12.9,13.1-12.9h163v0l66.8,131.9C544,162,544,166.3,542.2,169.9z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/structureSwitch.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" id="StructureSwitch" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 571.2 328.3" style="enable-background:new 0 0 571.2 328.3;" xml:space="preserve" width="32" height="32">
<style type="text/css">
	.st0{stroke:#000000;stroke-width:27;stroke-miterlimit:10;}
</style>
<path fill="#${fgColor}" d="M487.8,0H83.4c-2.1,0-4.1,1.2-5,3.1L2.6,153.3c-3.4,6.8-3.4,14.9,0,21.7l75.8,150.2c1,1.9,2.9,3.1,5,3.1h404.3
	c2.1,0,4.1-1.2,5-3.1L568.6,175c3.4-6.8,3.4-14.9,0-21.7L492.8,3.1C491.8,1.2,489.9,0,487.8,0z M96.4,26.5L96.4,26.5l378.3,0v0
	l58.6,116.1c1.9,3.7-0.9,8.1-5,8.1H42.9c-4.2,0-6.9-4.4-5-8.1L96.4,26.5z M272,296.3c0,3.1-2.5,5.6-5.6,5.6H96.4v0L37.8,185.7
	c-1.9-3.7,0.9-8.1,5-8.1h223.4c3.1,0,5.6,2.5,5.6,5.6V296.3z M474.7,301.8L474.7,301.8l-169.9,0c-3.1,0-5.6-2.5-5.6-5.6V183.2
	c0-3.1,2.5-5.6,5.6-5.6h223.4c4.2,0,6.9,4.4,5,8.1L474.7,301.8z"/>
<path class="st0" d="M631.6,244.9"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/undo.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path fill="#${fgColor}" d="M7.7,15.007a1.5,1.5,0,0,1-2.121,0L.858,10.282a2.932,2.932,0,0,1,0-4.145L5.583,1.412A1.5,1.5,0,0,1,7.7,3.533L4.467,6.7l14.213,0A5.325,5.325,0,0,1,24,12.019V18.7a5.323,5.323,0,0,1-5.318,5.318H5.318a1.5,1.5,0,1,1,0-3H18.681A2.321,2.321,0,0,0,21,18.7V12.019A2.321,2.321,0,0,0,18.68,9.7L4.522,9.7,7.7,12.886A1.5,1.5,0,0,1,7.7,15.007Z"/></svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

// #region Cursors

AssetsDynamiques.push({
	route: "/mini/conditionSortieCursor.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 508.2 508.1" style="enable-background:new 0 0 508.2 508.1;" xml:space="preserve" width="32px" height="32px">
<style type="text/css">
	.st0{stroke:#${fgColor};stroke-width:27;stroke-linecap:round;stroke-miterlimit:10;}
	.st1{fill:none;stroke:#${fgColor};stroke-width:15;stroke-linecap:round;stroke-miterlimit:10;}
	.st2{stroke:#${fgColor};stroke-width:27;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1;}
	.st3{fill:none;stroke:#${fgColor};stroke-width:27;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1;}
</style>
<g>
	<path fill="#${fgColor}" d="M465.6,215c8.6,0,15.6,7,15.6,15.6v234.9c0,8.6-7,15.6-15.6,15.6H230.7c-8.6,0-15.6-7-15.6-15.6V230.6
		c0-8.6,7-15.6,15.6-15.6H465.6 M465.6,188h-235c-23.5,0-42.5,19.1-42.5,42.6v234.9c0,23.5,19.1,42.6,42.6,42.6h234.9
		c23.5,0,42.6-19.1,42.6-42.6V230.6C508.1,207.1,489.1,188,465.6,188L465.6,188z"/>
</g>
<polyline fill="#${fgColor}" class="st0" points="295.5,372.7 295.5,204.4 401.5,203.7 401.5,372.7 "/>
<path fill="#${fgColor}" class="st1" d="M247.1,385.7"/>
<path fill="#${fgColor}" class="st2" d="M452.6,372.7l-101.5,64.7c-1.5,1-3.5,1-5.1,0l-101.5-64.7H452.6z"/>
<path fill="#${fgColor}" class="st3" d="M294.7,326.7"/>
<path fill="#${fgColor}" d="M208.1,104c0,3.6-2.9,6.5-6.4,6.5l0,0h-91.1v91.1c0,3.6-2.9,6.5-6.5,6.5s-6.5-2.9-6.5-6.4l0,0v-91.1H6.5
	c-3.6,0-6.5-2.9-6.5-6.5c0-1.8,0.7-3.4,1.9-4.6s2.8-1.9,4.6-1.9h91.1V6.5c0-3.6,2.9-6.5,6.5-6.5c1.8,0,3.4,0.7,4.6,1.9
	s1.9,2.8,1.9,4.6v91.1h91.1C205.2,97.5,208.2,100.4,208.1,104z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/lienCursor.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
	<svg version="1.1" id="LienCursor" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 535.1 535.1" style="enable-background:new 0 0 535.1 535.1;" xml:space="preserve" width="64px" height="32px"> 
<path fill="#${fgColor}" d="M519.4,47.1L47.1,519.4c-8.7,8.7-22.8,8.7-31.4,0l0,0c-8.7-8.7-8.7-22.8,0-31.4L487.9,15.7c8.7-8.7,22.8-8.7,31.4,0l0,0
	C528,24.4,528,38.5,519.4,47.1z"/>
<path fill="#${fgColor}" d="M208.1,104.1c0,3.6-2.9,6.5-6.4,6.5h0l-91.1,0v91.1c0,3.6-2.9,6.5-6.5,6.5c-3.6,0-6.5-2.9-6.5-6.4v0l0-91.1l-91.1,0
	c-3.6,0-6.5-2.9-6.5-6.5c0-1.8,0.7-3.4,1.9-4.6c1.2-1.2,2.8-1.9,4.6-1.9h91.1l0-91.1c0-3.6,2.9-6.5,6.5-6.5c1.8,0,3.4,0.7,4.6,1.9
	c1.2,1.2,1.9,2.8,1.9,4.6v91.1h91.1C205.2,97.6,208.2,100.5,208.1,104.1z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/problemeCursor.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
<svg version="1.1" id="ProblemeCursor" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 779.3 536.4" style="enable-background:new 0 0 779.3 536.4;" xml:space="preserve" width="64px" height="32px">
<path fill="#${fgColor}" d="M756.1,208.1H231.3c-12.8,0-23.2,10.5-23.2,23.5v281.3c0,13,10.4,23.5,23.2,23.5h524.8c12.8,0,23.2-10.5,23.2-23.5V231.6
C779.3,218.6,768.9,208.1,756.1,208.1z M739,509.1H248.4c-7.2,0-13-5.8-13-13V248.4c0-7.2,5.8-13,13-13H739c7.2,0,13,5.8,13,13
v247.7C752,503.3,746.2,509.1,739,509.1z"/>
<path fill="#${fgColor}" d="M208.1,104.1c0,3.6-2.9,6.5-6.4,6.5h0l-91.1,0v91.1c0,3.6-2.9,6.5-6.5,6.5c-3.6,0-6.5-2.9-6.5-6.4v0l0-91.1l-91.1,0
c-3.6,0-6.5-2.9-6.5-6.5c0-1.8,0.7-3.4,1.9-4.6c1.2-1.2,2.8-1.9,4.6-1.9h91.1l0-91.1c0-3.6,2.9-6.5,6.5-6.5c1.8,0,3.4,0.7,4.6,1.9
c1.2,1.2,1.9,2.8,1.9,4.6v91.1h91.1C205.2,97.6,208.2,100.5,208.1,104.1z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/procedureCursor.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
<svg version="1.1" id="ProcedureCursor" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 779.3 536.8" style="enable-background:new 0 0 779.3 536.8;" xml:space="preserve" width="32px" height="32px">
<g fill="#${fgColor}" id="Calque_1_00000034057056868085137710000009322341118287881886_">
	<path d="M288.7,509c0.8,0.3,1.7,0.4,2.6,0.4H696c0.9,0,1.8-0.1,2.6-0.4H288.7z"/>
	<path d="M254.5,509h-3c-8.9,0-16.2-7.2-16.2-16.2V251.5c0-8.9,7.2-16.2,16.2-16.2h3c1.7,0,3.2,1.4,3.2,3.2v267.3
		C257.7,507.5,256.2,509,254.5,509z M706.3,496.4c0,6.1-3.4,11.2-8.1,12.6c-0.8,0.3-1.7,0.4-2.6,0.4H290.9c-0.9,0-1.8-0.1-2.6-0.4
		c-4.7-1.4-8.1-6.5-8.1-12.6V248.8c0-7.2,4.8-13,10.7-13h404.7c5.9,0,10.7,5.8,10.7,13V496.4z M752,492.8c0,8.9-7.2,16.2-16.2,16.2
		H732c-1.7,0-3.2-1.4-3.2-3.2V238.5c0-1.7,1.4-3.2,3.2-3.2h3.8c8.9,0,16.2,7.2,16.2,16.2V492.8z M756.1,208.1H231.3
		c-12.8,0-23.2,10.5-23.2,23.5v281.7c0,13,10.4,23.5,23.2,23.5h524.8c12.8,0,23.2-10.5,23.2-23.5V231.6
		C779.3,218.6,768.9,208.1,756.1,208.1z"/>
</g>
<path fill="#${fgColor}" d="M208.1,104.1c0,3.6-2.9,6.5-6.4,6.5h0l-91.1,0v91.1c0,3.6-2.9,6.5-6.5,6.5c-3.6,0-6.5-2.9-6.5-6.4v0l0-91.1l-91.1,0
	c-3.6,0-6.5-2.9-6.5-6.5c0-1.8,0.7-3.4,1.9-4.6c1.2-1.2,2.8-1.9,4.6-1.9h91.1l0-91.1c0-3.6,2.9-6.5,6.5-6.5c1.8,0,3.4,0.7,4.6,1.9
	c1.2,1.2,1.9,2.8,1.9,4.6v91.1h91.1C205.2,97.6,208.2,100.5,208.1,104.1z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/structureIterativeBorneeCursor.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
<svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 844.4 690.1" style="enable-background:new 0 0 844.4 690.1;" xml:space="preserve" width="64px" height="40px">

	<path fill="#${fgColor}" d="M724.9,490.7c-4.7,7.8-13.1,12.6-22.2,12.6h-22c-1.9,6.8-4.1,13.5-6.5,20c-36.3,97.4-130.1,166.8-240.1,166.8
		c-141.4,0-256-114.6-256-256s114.6-256,256-256c108.8,0,201.8,67.9,238.8,163.6c-6.5-3.3-13.7-5.1-21-5.1c-10.2,0-20,3.4-28,9.5
		c-10.2-22-24.3-42.3-42-59.9c-39.5-39.5-92-61.2-147.9-61.2s-108.4,21.8-147.9,61.2s-61.2,92-61.2,147.9
		c0,55.8,21.8,108.4,61.2,147.9s92,61.2,147.9,61.2c55.8,0,108.4-21.8,147.9-61.2c17.3-17.3,31.2-37.1,41.4-58.7
		c3.1-6.5,5.8-13.2,8.2-20h-30.4c-9.1,0-17.5-4.8-22.2-12.6c-4.7-7.8-4.9-17.5-0.6-25.5l50.8-94.9c0.8-1.5,1.8-2.9,2.8-4.2
		c4.9-5.9,12.2-9.4,20-9.4c4.8,0,9.3,1.3,13.3,3.7s7.3,5.8,9.5,10l12.1,22.6l38.7,72.3C729.8,473.2,729.5,482.9,724.9,490.7z"/>
	<path fill="#${fgColor}" d="M767.6,450.9c0-11.9,1.3-21.3,4-28.1c2.7-6.9,7-12.8,13.1-17.9c6-5,10.6-9.7,13.7-13.9c3.1-4.2,4.7-8.8,4.7-13.9
		c0-12.3-5.3-18.4-15.9-18.4c-4.9,0-8.8,1.8-11.8,5.4c-3,3.6-4.6,8.4-4.8,14.5h-41.3c0.2-16.3,5.3-28.9,15.4-38
		c10.1-9.1,24.2-13.6,42.5-13.6c18.1,0,32.2,4.2,42.2,12.6s15,20.3,15,35.8c0,6.8-1.3,12.9-4,18.4s-7,11.2-12.9,17l-14,13.1
		c-4,3.8-6.8,7.8-8.3,11.8s-2.4,9.1-2.6,15.3h-35V450.9z M762.6,488c0-6,2.2-11,6.5-14.8c4.4-3.9,9.8-5.8,16.3-5.8
		s11.9,1.9,16.3,5.8c4.4,3.9,6.5,8.8,6.5,14.8s-2.2,11-6.5,14.8c-4.4,3.9-9.8,5.8-16.3,5.8s-11.9-1.9-16.3-5.8
		C764.8,499,762.6,494,762.6,488z"/>
<path fill="#${fgColor}" d="M208.1,104.1c0,3.6-2.9,6.5-6.4,6.5h0l-91.1,0v91.1c0,3.6-2.9,6.5-6.5,6.5c-3.6,0-6.5-2.9-6.5-6.4v0l0-91.1l-91.1,0
	c-3.6,0-6.5-2.9-6.5-6.5c0-1.8,0.7-3.4,1.9-4.6c1.2-1.2,2.8-1.9,4.6-1.9h91.1l0-91.1c0-3.6,2.9-6.5,6.5-6.5c1.8,0,3.4,0.7,4.6,1.9
	c1.2,1.2,1.9,2.8,1.9,4.6v91.1h91.1C205.2,97.6,208.2,100.5,208.1,104.1z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/structureIterativeCursor.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
<svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 708.6 670.1" style="enable-background:new 0 0 708.6 670.1;" xml:space="preserve" width="64px" height="40px">

	<path fill="#${fgColor}" d="M704.9,470.7c-4.7,7.8-13.1,12.6-22.2,12.6h-22c-1.9,6.8-4.1,13.5-6.5,20c-36.3,97.4-130.1,166.8-240.1,166.8
		c-141.4,0-256-114.6-256-256s114.6-256,256-256c108.8,0,201.8,67.9,238.8,163.6c-6.5-3.3-13.7-5.1-21-5.1c-10.2,0-20,3.4-28,9.5
		c-10.2-22-24.3-42.3-42-59.9c-39.5-39.5-92-61.2-147.9-61.2s-108.4,21.8-147.9,61.2s-61.2,92-61.2,147.9
		c0,55.8,21.8,108.4,61.2,147.9s92,61.2,147.9,61.2c55.8,0,108.4-21.8,147.9-61.2c17.3-17.3,31.2-37.1,41.4-58.7
		c3.1-6.5,5.8-13.2,8.2-20h-30.4c-9.1,0-17.5-4.8-22.2-12.6c-4.7-7.8-4.9-17.5-0.6-25.5l50.8-94.9c0.8-1.5,1.8-2.9,2.8-4.2
		c4.9-5.9,12.2-9.4,20-9.4c4.8,0,9.3,1.3,13.3,3.7s7.3,5.8,9.5,10l12.1,22.6l38.7,72.3C709.8,453.2,709.5,462.9,704.9,470.7z"/>

<path fill="#${fgColor}" d="M208.1,104.1c0,3.6-2.9,6.5-6.4,6.5h0l-91.1,0v91.1c0,3.6-2.9,6.5-6.5,6.5c-3.6,0-6.5-2.9-6.5-6.4v0l0-91.1l-91.1,0
	c-3.6,0-6.5-2.9-6.5-6.5c0-1.8,0.7-3.4,1.9-4.6c1.2-1.2,2.8-1.9,4.6-1.9h91.1l0-91.1c0-3.6,2.9-6.5,6.5-6.5c1.8,0,3.4,0.7,4.6,1.9
	c1.2,1.2,1.9,2.8,1.9,4.6v91.1h91.1C205.2,97.6,208.2,100.5,208.1,104.1z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/structureSiCursor.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
<svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 779.3 536.4" style="enable-background:new 0 0 779.3 536.4;" xml:space="preserve" width="64px" height="32px">
<path fill="#${fgColor}" d="M775.9,357.8l-72.1-142.5c-2.2-4.4-6.8-7.2-11.7-7.2H295.6c-5,0-9.5,2.8-11.7,7.2l-72.3,142.5c-4.6,9.1-4.6,19.8,0,28.9
	l72.2,142.6c2.2,4.4,6.8,7.1,11.7,7.1H692c5,0,9.5-2.8,11.7-7.1l72.2-142.6C780.5,377.6,780.5,366.9,775.9,357.8z M480.1,497
	c0,7.1-5.9,12.9-13.1,12.9H304l0,0L237.2,378c-1.8-3.6-1.8-7.9,0-11.6L304,234.6l0,0h163c7.2,0,13.1,5.8,13.1,12.9V497z M750.4,378
	l-66.8,131.9l0,0h-163c-7.2,0-13.1-5.8-13.1-12.9V247.5c0-7.1,5.9-12.9,13.1-12.9h163l0,0l66.8,131.9
	C752.2,370.1,752.2,374.4,750.4,378z"/>
<path fill="#${fgColor}" d="M208.1,104.1c0,3.6-2.9,6.5-6.4,6.5h0l-91.1,0v91.1c0,3.6-2.9,6.5-6.5,6.5c-3.6,0-6.5-2.9-6.5-6.4v0l0-91.1l-91.1,0
	c-3.6,0-6.5-2.9-6.5-6.5c0-1.8,0.7-3.4,1.9-4.6c1.2-1.2,2.8-1.9,4.6-1.9h91.1l0-91.1c0-3.6,2.9-6.5,6.5-6.5c1.8,0,3.4,0.7,4.6,1.9
	c1.2,1.2,1.9,2.8,1.9,4.6v91.1h91.1C205.2,97.6,208.2,100.5,208.1,104.1z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

AssetsDynamiques.push({
	route: "/mini/structureSwitchCursor.svg",
	callback: (req, res) => {
		const fgColor = req.query.fgColor || "000000";

		const svgContent = `
<svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 839.7 536.4" style="enable-background:new 0 0 839.7 536.4;" xml:space="preserve" width="64px" height="32px">
<style type="text/css">
	.st0{stroke:#000000;stroke-width:27;stroke-miterlimit:10;}
</style>
<path fill="#${fgColor}" d="M695.9,208.1H291.5c-2.1,0-4.1,1.2-5,3.1l-75.8,150.2c-3.4,6.8-3.4,14.9,0,21.7l75.8,150.2c1,1.9,2.9,3.1,5,3.1h404.3
	c2.1,0,4.1-1.2,5-3.1l75.9-150.2c3.4-6.8,3.4-14.9,0-21.7l-75.8-150.2C699.9,209.3,698,208.1,695.9,208.1z M304.5,234.6L304.5,234.6
	h378.3l0,0l58.6,116.1c1.9,3.7-0.9,8.1-5,8.1H251c-4.2,0-6.9-4.4-5-8.1L304.5,234.6z M480.1,504.4c0,3.1-2.5,5.6-5.6,5.6h-170l0,0
	l-58.6-116.2c-1.9-3.7,0.9-8.1,5-8.1h223.4c3.1,0,5.6,2.5,5.6,5.6v113.1H480.1z M682.8,509.9L682.8,509.9H512.9
	c-3.1,0-5.6-2.5-5.6-5.6v-113c0-3.1,2.5-5.6,5.6-5.6h223.4c4.2,0,6.9,4.4,5,8.1L682.8,509.9z"/>
<path class="st0" fill="#${fgColor}" d="M839.7,453"/>
<path fill="#${fgColor}" d="M208.1,104.1c0,3.6-2.9,6.5-6.4,6.5h0l-91.1,0v91.1c0,3.6-2.9,6.5-6.5,6.5c-3.6,0-6.5-2.9-6.5-6.4v0l0-91.1l-91.1,0
	c-3.6,0-6.5-2.9-6.5-6.5c0-1.8,0.7-3.4,1.9-4.6c1.2-1.2,2.8-1.9,4.6-1.9h91.1l0-91.1c0-3.6,2.9-6.5,6.5-6.5c1.8,0,3.4,0.7,4.6,1.9
	c1.2,1.2,1.9,2.8,1.9,4.6v91.1h91.1C205.2,97.6,208.2,100.5,208.1,104.1z"/>
</svg>
	`;

		res.setHeader("Content-Type", "image/svg+xml");
		res.send(svgContent);
	},
});

export default AssetsDynamiques;
