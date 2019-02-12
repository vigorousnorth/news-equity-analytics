
module.exports = (a,b) => {
	// Create arrays of property names
	var aProps = Object.getOwnPropertyNames(a);
	var bProps = Object.getOwnPropertyNames(b);

	if (aProps.length != bProps.length) { return false; }

	for (var i = 0; i < aProps.length; i++) {
		var propName = aProps[i]; 
		if (a[propName] !== b[propName]) { return false; }
	}

	return true;
}


