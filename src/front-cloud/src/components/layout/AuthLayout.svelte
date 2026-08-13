<script lang="ts">
	export let title: string = "Connexion";
</script>

<main class="auth-layout">
	<div class="auth-container">
		<svg
			class="floating-image-1"
			version="1.1"
			id="Calque_1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			x="0px"
			y="0px"
			viewBox="0 0 791.3 809.2"
			style="enable-background:new 0 0 791.3 809.2;"
			xml:space="preserve"
		>
			<g id="Anvil">
				<path
					d="M513.1,323.9h106.3c38.3-25,93.7-50.8,171.7-76.2v-33.4H371.6v20.5L0,231.8c0,0,7.3,139.8,308.1,146.4
                c0,0,106.9,66.6-82.7,162.5l-0.7,54.2h97.3c0,0,101-67.3,207.9,0h97.3v-55.6c0,0-147.7-81.1-50.8-180.8h-30c-6.4,0-6.4-10,0-10
                h40.5c5.5-4.8,11.5-9.7,18.2-14.6h-91.9C506.7,333.9,506.7,323.9,513.1,323.9z"
				/>
			</g>
		</svg>
		<svg
			class="floating-image-2"
			version="1.1"
			id="Calque_1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			x="0px"
			y="0px"
			viewBox="0 0 512.7 512.7"
			style="enable-background:new 0 0 512.7 512.7;"
			xml:space="preserve"
		>
			<style type="text/css">
				.st0 {
					stroke: #000000;
					stroke-width: 0.6643;
					stroke-miterlimit: 10;
				}
			</style>
			<g id="Marteau">
				<path
					class="st0"
					d="M448.3,500.8l-272-286.4c-2.6-2.7-2.4-6.9,0.5-9.5c0.1,0,0.1-0.1,0.1-0.1l45.5-37.7c2.9-2.4,7.2-2.1,9.8,0.6
l270.7,285.8c13.7,14.4,12.6,36.6-2.5,49.7c-0.5,0.5-1,0.8-1.6,1.2l0,0C483.6,516.3,461.4,514.7,448.3,500.8z"
				/>
				<path
					class="st0"
					d="M136.1,196.4l15.4,17c0.3,0.4,0.9,0.4,1.3,0.1c0,0,0,0,0.1,0l77.6-70.7c0.3-0.3,0.4-0.8,0.1-1.2
c0,0,0,0-0.1-0.1l-15.7-13.8c-0.3-0.3-0.9-0.3-1.2,0l-77.3,67.4C135.8,195.5,135.8,196.1,136.1,196.4L136.1,196.4z"
				/>
				<polyline
					class="st0"
					points="133.1,185.3 56.3,215.8 0.4,155.5 64.1,47.8 183.7,0.4 239.6,60.7 202.7,122.9 "
				/>
			</g>
		</svg>
		<div class="auth-box">
			<h2>{title}</h2>
			<slot />
		</div>
	</div>
</main>

<style>
	.auth-layout {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
	}

	.auth-container {
		position: relative;
		width: 400px;
	}

	.floating-image-1 {
		position: absolute;
		z-index: 1;
		top: -90px;
		left: -80px;
		width: 200px;
		transform: rotate(-37deg);
		pointer-events: none;
		animation: float-1-circle 12s ease-in-out infinite;
		fill: var(--fgColor);
	}

	.floating-image-2 {
		position: absolute;
		z-index: 3;
		bottom: -50px;
		right: -60px;
		width: 80px;
		transform: rotate(8deg);
		pointer-events: none;
		animation: float-2 4s ease-in-out infinite alternate;
		fill: var(--fgColor);
	}

	@keyframes float-1-circle {
		0% {
			transform: rotate(-37deg) translate(0, 0);
		}
		25% {
			transform: rotate(-37deg) translate(30px, 20px);
		}
		50% {
			transform: rotate(-37deg) translate(0, 40px);
		}
		75% {
			transform: rotate(-37deg) translate(-30px, 20px);
		}
		100% {
			transform: rotate(-37deg) translate(0, 0);
		}
	}

	@keyframes float-2 {
		0% {
			transform: rotate(8deg) translateY(0);
		}
		100% {
			transform: rotate(30deg) translateY(-15px);
		}
	}

	.auth-box {
		z-index: 2;
		position: relative;
		margin: 0 auto;
		padding: 40px;
		background: var(--bgColorTertiary);
		box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.18);
	}

	.auth-box h2 {
		margin: 0 0 30px;
		color: var(--titleColor);
		text-align: center;
	}
</style>
