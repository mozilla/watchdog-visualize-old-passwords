// TODO: "these passwords are really old!" divider

// Fix: [15:55:20.853] Unexpected value translate(NaN,NaN) parsing transform attribute. resource://jid1-sfxirasrd0mobg-at-jetpack/visualize-old-passwords/data/view_passwords.html

var vis;
var d3Data;

function init() {
    window.loadLogins(function(logins) {
		createViz(processLogins(logins));
		createUI();
    });
}

function processLogins(loginData) {
	d3Data = [];
	
	function fubar(str) {
		var retval = str.substr(0,1);
		for (var i = 1; i < str.length-1; i++)
			retval += '*';
		retval += str.substr(str.length-1,1);
		return retval;
	}
	
	function millisecondsToDays(ms) {
		return ms/1000/60/60/24;
	}
	
	var nowMS = (new Date()).getTime();
	
	var maxDays = 0;
	
	for (var login in loginData) {
		var timesUsed = loginData[login].timesUsed.map(function(x) {
			return Math.max(millisecondsToDays(nowMS-x.when),1);
		});
		var daysNum = millisecondsToDays(nowMS-loginData[login]['timeLastChanged']);
		maxDays = Math.max(maxDays,daysNum);
		// timesUsed and loginData[login].timesUsed are parallel arrays, the former just mapped to time values,
		// and the latter containing the time the password was used *and* the site it was used on.
		var obj = {
			"title": login,
			"subtitle": (daysNum > 5 ? parseInt(daysNum) : parseInt(daysNum*10)/10) + " days old",
			"ranges": [200], // Average recommended password use: 120 days
			"measures":[daysNum],
			"markers": timesUsed,
			"full_times_used": loginData[login].timesUsed
		}
		d3Data.push(obj);
	}
	// Go back and fill in maxDays as a new range, so as to normalize the bars
	for (var idx in d3Data) {
		d3Data[idx].ranges.push(maxDays);
	}
	return d3Data;
}

function createViz(loginData) {
	var w = 960,
	    h = 50,
	    m = [5, 40, 20, 120]; // top right bottom left

	var chart = bulletChart()
	    .duration(1000) // Cute "slide" transition effect
	    .width(w - m[1] - m[3])
	    .height(h - m[0] - m[2]);

	vis = d3.select("#chart").selectAll("svg")
	.data(loginData)
	.enter().append("svg")
	.attr("class", function(x) {
	  if (x.measures[0] < 200)
		  return "bullet";
	  else
		  return "bullet bulletOverdue";
	})
	.attr("width", w)
	.attr("height", h)
	.append("g")
	.attr("transform", "translate(" + m[3] + "," + m[0] + ")")
	.call(chart);
	
	var title = vis.append("g")
	  .attr("text-anchor", "end")
	  .attr("transform", "translate(-6," + (h - m[0] - m[2]) / 2 + ")");

	var visualHash = vis.append("image")
	.attr("class", "title")
	.attr('width',100)
	.attr('height',15)
	.attr("transform", "translate(-105," + (((h - m[0] - m[2]) / 2) - 15) + ")")
	.attr('xlink:href',function(d) { return getDataURLForHash(SHA1(d.title),100,15); });
	
	title.append("text")
	  .attr("class", "subtitle")
	  .attr("dy", "1em")
	  .text(function(d) { return d.subtitle; });
}

function createUI() {	
	// Vis selection refers to each bar element. Consider adding click handlers to only the visual hashes?
  	vis.on('click', function(d) {
          // Password nodes only
          if (confirm("Are you sure you want to display this password in cleartext?")) {
              alert(d.title);
          }
  	});
		
	d3.selectAll(".marker").on("mouseover", function(d,i) {
		// TODO: Having jQuery and d3 is probably redundant. Additionally, there may be a 
		// cleaner way to solve this problem than parallel arrays in the data.
		// However, that may require modifying d3.bullet.js.
		var parentBullet = $(this).parent().get()[0];
		var markerChildrenOfBullet = $(parentBullet).find('.marker').get();
		
		// Bullet chart shows newest sites first, so subtract the found index from the number of markers on the bullet.
		var ithChildOfBullet = (markerChildrenOfBullet.length-1) - markerChildrenOfBullet.indexOf(this);

		// Get parent .bullet element datum
		var parentBulletDatum = d3.select(parentBullet).datum();

		$('#passwordAgeInfo').html(parentBulletDatum.full_times_used[ithChildOfBullet].where);
		$('#passwordAgeInfo').show();
		$('#passwordAgeInfo').css("top", (d3.event.pageY-10)+"px").css("left",(d3.event.pageX+10)+"px");
	});
	
	d3.selectAll(".marker").on("mouseout", function(d,i) {
		$('#passwordAgeInfo').hide();
	});

}