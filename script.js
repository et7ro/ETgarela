var audioEnabled = false
var synth = new SpeechSynthesisUtterance()
var element = document.querySelector('figure')
function refreshPosition(x, y) {
	let invert = false
	if (x > (document.documentElement.clientWidth / 2)) {
		x = document.documentElement.clientWidth - x
		invert = true
	}
	let dx = (element.offsetLeft + (element.clientWidth / 2)) - x
	let dy = (document.documentElement.clientHeight - (document.documentElement.clientHeight - element.offsetTop - element.clientHeight)) - y
	let theta = Math.atan2(dy, dx)
	theta *= 180 / Math.PI
	let angle = (90 - theta) * 0.5
	document.documentElement.style.setProperty('--x-angle', `${angle / 2}deg`)
	if (!invert) angle *= -1
	document.documentElement.style.setProperty('--y-angle', `${angle}deg`)
}
document.onreadystatechange = () => {
	if (document.readyState == 'complete') resize()
}
element.onclick = e => {
	e.preventDefault()
	fetch('https://litipsum.com/api/dracula/1')
		.then(response => {
			response.text()
				.then(text => {
					setupVoice(text)
				})
				.catch(error => {
					alert(error ?? 'Error')
				})
		})
}
function resize() {
	let size = document.documentElement.clientWidth / 2
	let mouthSize = Math.round(size * 0.08)
	if (mouthSize % 2 != 0) mouthSize++
	document.documentElement.style.setProperty('--size', `${size}px`)
	document.documentElement.style.setProperty('--mouth-size', `${mouthSize}px`)
}
function setupVoice(text) {
	let actors = ['Microsoft Mark', 'Microsoft Guy', 'Male']
	if (/iphone|ipad|macos/i.test(navigator.appVersion)) actors.push('Daniel')
	let voice = speechSynthesis.getVoices().find(el => {
		let byName = new RegExp(`(${actors.join('|')})`, 'i').test(el.name.toLocaleLowerCase())
		let byLocal = el?.localService && el?.lang?.replace('_', '-').toLocaleLowerCase() == 'en-us'
		return byName || byLocal
	})
	if (!voice) return setTimeout(() => setupVoice(text), 100)
	synth.lang = synth.voice?.lang ?? 'en-US'
	synth.voice = voice
	synth.text = text
	speechSynthesis.cancel()
	speechSynthesis.speak(synth)
}
synth.onboundary = e => {
	let vowel = e?.utterance?.text?.substr(e?.charIndex)?.match(/[aeiou]/)
	if (vowel) element.classList.add(vowel[0])
	setTimeout(() => element.classList.remove(vowel[0]), 250)
}
synth.onstart = () => {
	if (/edg/i.test(navigator.appVersion) && (/windows/i.test(navigator.appVersion) || /android/i.test(navigator.appVersion)) ) return
	element.classList.add('speaking')
}
synth.onend = () => {
	element.classList.remove('speaking')
}
/* synth.onerror = e => {
	alert(`Error: ${e}` ?? 'Error')
} */
window.onmousemove = e => {
	refreshPosition(e.x, e.y)
}
window.ontouchmove = e => {
	e.preventDefault()
	refreshPosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY)
}
window.onpagehide = () => {
	speechSynthesis.cancel()
}
window.onclick = e => {
	speechSynthesis.cancel()
}
window.onresize = () => {
	resize()
}
document.onclick = () => {
	speechSynthesis.cancel()
	if (audioEnabled) return
	synth.text = ''
	synth.volume = 0
	speechSynthesis.speak(synth)
	audioEnabled = true
	synth.volume = 1
}