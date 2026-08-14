export const ANOMALY_STYLES = `
#anomaly_btn {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	padding: 0;
	border: 0;
	background: transparent;
	color: var(--fgColor);
	user-select: none;
	cursor: pointer;
}
#anomaly_btn .anomaly-icon {
	width: 24px;
	height: 24px;
	fill: currentColor;
	transition: all .1s ease-in-out;
}
#anomaly_btn:hover .anomaly-icon { color: var(--fgColorHover); scale: 1.1; }
#anomaly_btn:active .anomaly-icon { scale: 1; }
#anomaly_btn[aria-expanded="true"] .anomaly-icon { color: var(--fgColorHover); }
#anomaly_btn .anomaly-counts {
	position: absolute;
	inset: -7px -9px auto auto;
	display: flex;
	flex-direction: column;
	gap: 1px;
	pointer-events: none;
}
#anomaly_btn .anomaly-count {
	box-sizing: border-box;
	display: grid;
	place-items: center;
	min-width: 14px;
	height: 14px;
	padding: 0 3px;
	border: 1px solid var(--bgColorTertiary);
	border-radius: 999px;
	color: white;
	font: 700 8px/1 sans-serif;
	box-shadow: 0 1px 2px rgb(0 0 0 / 28%);
}
#anomaly_btn .anomaly-error-count { background: #b42318; }
#anomaly_btn .anomaly-warning-count { background: #a15c00; }
#anomaly_btn.analyzing .anomaly-icon { animation: anomaly-pulse .8s ease-in-out infinite alternate; }
@keyframes anomaly-pulse { to { opacity: .35; scale: .92; } }

#anomaly_wrapper {
	position: absolute;
	z-index: 220;
	top: 0;
	right: 0;
	box-sizing: border-box;
	display: none;
	flex-direction: column;
	width: min(31rem, 94vw);
	height: 100%;
	background: var(--bgColor, #fff);
	color: var(--fgColor, #202124);
	border-left: 1px solid color-mix(in srgb, currentColor 20%, transparent);
	box-shadow: -10px 0 28px rgb(0 0 0 / 18%);
}
#anomaly_wrapper.open { display: flex; }
.anomaly-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1rem .65rem; }
.anomaly-header h2 { margin: 0; font-size: 1.15rem; }
.anomaly-close { border: 0; background: transparent; color: inherit; padding: .5rem; font-size: 1.25rem; cursor: pointer; }
.anomaly-filters { display: flex; gap: .4rem; padding: 0 1rem .75rem; }
.anomaly-filter { border: 1px solid color-mix(in srgb, currentColor 28%, transparent); background: transparent; color: inherit; border-radius: 999px; padding: .4rem .7rem; cursor: pointer; }
.anomaly-filter[aria-pressed="true"] { background: var(--accentColor, #5267df); border-color: transparent; color: white; }
.anomaly-status { min-height: 1.3rem; margin: 0; padding: 0 1rem .6rem; font-size: .82rem; opacity: .78; }
.anomaly-list { overflow: auto; padding: 0 1rem 2rem; }
.anomaly-severity-title { margin: .7rem 0 .4rem; font-size: .95rem; }
.anomaly-rule-group { margin-bottom: .9rem; }
.anomaly-rule-title { margin: .5rem 0; font-size: .83rem; text-transform: uppercase; letter-spacing: .035em; }
.anomaly-card { border: 1px solid color-mix(in srgb, currentColor 22%, transparent); border-left-width: 4px; border-radius: .55rem; padding: .75rem; margin-bottom: .5rem; background: color-mix(in srgb, var(--bgColor, #fff) 94%, currentColor); }
.anomaly-card[data-severity="error"] { border-left-color: #d92d20; }
.anomaly-card[data-severity="warning"] { border-left-color: #d97706; }
.anomaly-card h4 { margin: 0 0 .35rem; font-size: .95rem; }
.anomaly-card p { margin: .35rem 0; line-height: 1.35; font-size: .86rem; }
.anomaly-evidence { padding: .4rem; border-radius: .35rem; background: rgb(0 0 0 / 6%); overflow-wrap: anywhere; }
.anomaly-actions { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .65rem; }
.anomaly-action { border: 0; border-radius: .4rem; padding: .45rem .65rem; cursor: pointer; background: var(--accentColor, #5267df); color: white; font-weight: 650; }
.anomaly-action.secondary { background: transparent; color: inherit; border: 1px solid color-mix(in srgb, currentColor 35%, transparent); }
.anomaly-empty { padding: 2rem 1rem; text-align: center; opacity: .78; }
.anomaly-target-error { filter: drop-shadow(0 0 .55rem #d92d20) !important; outline: 3px solid #d92d20 !important; outline-offset: 4px; }
.anomaly-target-warning { filter: drop-shadow(0 0 .55rem #d97706) !important; outline: 3px dashed #d97706 !important; outline-offset: 4px; }
#anomaly_wrapper button:focus-visible, #anomaly_btn:focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; }
`;
