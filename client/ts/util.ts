export class Util {
	static leftPadZeroes(str: string, amount: number) {
		return "000000000000000000".slice(0, Math.max(0, amount - str.length)) + str;
	}

	/** Converts seconds into a time string as seen in the game clock at the top, for example. */
	static secondsToTimeString(seconds: number, decimalDigits = 3) {
		let abs = Math.abs(seconds);
		let minutes = Math.floor(abs / 60);
		let string = Util.leftPadZeroes(minutes.toString(), 2) + ':' + Util.leftPadZeroes(Math.floor(abs % 60).toString(), 2) + '.' + Util.leftPadZeroes(Math.floor(abs % 1 * 10**decimalDigits).toString(), decimalDigits);
		if (seconds < 0) string = '-' + string;
		
		return string;
	}

	/** Removes all diacritics and special characters from a string and lowercases it. */
	static normalizeString(str: string) {
		return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '').toLowerCase();
	}

	static monthStrings = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	/** Formats a date into "Month Day, Year" with Month being a 3 letter abbreviation of the full month name. */
	static formatDate(date: Date) {
		let month = this.monthStrings[date.getMonth()];
		let day = date.getDate();
		let year = date.getFullYear();

		return `${month} ${day}, ${year}`;
	}

	/** Split a word in camelCame into it's individual parts, while capitalizing each part's first letter. */
	static splitWords(s: string) {
		let re, match, output = [];
		re = /([A-Za-z]?)([a-z]+)/g;
	
		match = re.exec(s);
		while (match) {
			output.push([match[1].toUpperCase(), match[2]].join(""));
			match = re.exec(s);
		}
	
		return output;
	}

	/** Returns true if the currently used device supports mouse "hover" events. */
	static deviceSupportsHover() {
		if (typeof matchMedia === "undefined") return false; // SSR, server definitely doesn't support hover events lol
		return matchMedia('(hover: hover)').matches;
	}

	static urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

	/** Turns raw text into HTML with all URLs wrapped into anchor tags. */
	static linkify(raw: string) {
		if (!raw) return raw;
		if (typeof document === "undefined") return raw; // SSR stuff

		// Since we wanna output HTML, we first need to properly escape all HTML characters included in the raw text to prevent XSS, like so:
		let elem = document.createElement('div');
		elem.textContent = raw;
		let html = elem.innerHTML;

		// Then we can wrap anchor tags around all URLs:
		html = html.replace(this.urlRegEx, `<a href="$&" target="_blank">$&</a>`);
		this.urlRegEx.lastIndex = 0;

		return html;
	}
}