window.onload = function() {

	// params
	let $filePath = './json/data.json?v=3',
		$data = JSON.parse(readJSON($filePath));
		$arPlayer = $data['player'],
		$arTournament = $data['tournament'],
		$TournamentHtml = getTournamentHtml($arTournament),
		$playerHtml = getPlayerItemHTML($arPlayer),
		$tableWrap = document.querySelector('[data-type=tournament-table]'),
		$playerWrap = document.querySelector('[data-type=players]');

	$tableWrap.innerHTML = $TournamentHtml;
	$playerWrap.innerHTML = $playerHtml;


	// generate all tournament content
	function getTournamentHtml($data) {
		let $html = '',
			$tabsHtml = getTournamentTabsHtml($data);
		$html += $tabsHtml;
		$data.forEach($section => {
			let $sectionItems = $section.match,
				$arTempPlayer = JSON.parse(JSON.stringify($arPlayer)),
				$table = getTournamentTableHtml($sectionItems, $arTempPlayer),
				$matches = '';
			if ($sectionItems != undefined) {
				$sectionItems.forEach($item => {
					$matches += getMatchTableHTML($item);
				});
			}
			$html += '<section class="section-item" data-id="' + $section.id + '">';
			$html += '<div class="section-title">Tournament Table</div>';
			$html += $table;
			$html += '<div class="section-title">Matches</div>';
			$html += '<div class="items">';
			$html += $matches;
			$html += '</div>';
			$html += '</section>';
		});
		return $html;
	}


	// generate main table
	function getTournamentTableHtml($sectionItems, $arPlayer) {
		let $html = '';
		$sectionItems.forEach($match => {
			let $matchPlayer_1 = $match[0],
				$matchPlayer_2 = $match[1],
				$player_1 = $matchPlayer_1.player_id - 1,
				$player_2 = $matchPlayer_2.player_id - 1;
			
			if ($matchPlayer_1.winner) {
				$arPlayer[$player_1].win += 1;
				$arPlayer[$player_2].loss += 1;
			} else if($matchPlayer_2.winner) {
				$arPlayer[$player_2].win += 1;
				$arPlayer[$player_1].loss += 1;
			} else {
				$arPlayer[$player_1].draw += 1;
				$arPlayer[$player_2].draw += 1;
			}

			$arPlayer[$player_1].goals += $matchPlayer_1.goal;
			$arPlayer[$player_2].goals += $matchPlayer_2.goal;

			$arPlayer[$player_1].missed += $matchPlayer_2.goal;
			$arPlayer[$player_2].missed += $matchPlayer_1.goal;

			$arPlayer[$player_1].difference += $matchPlayer_1.goal - $matchPlayer_2.goal;
			$arPlayer[$player_2].difference += $matchPlayer_2.goal - $matchPlayer_1.goal;

			$arPlayer[$player_1].score += $matchPlayer_1.score;
			$arPlayer[$player_2].score += $matchPlayer_2.score;
		});
		$arPlayer = sortJSON($arPlayer, 'score', 'desc');
		$html += '<div class="table-wrap">'+
			'<table class="tournament-table tournament-table-main">'+
			'<thead>'+
				'<tr>'+
					'<td>Name</td>'+
					'<td>Win</td>'+
					'<td>Draw</td>'+
					'<td>Loss</td>'+
					'<td>Goals</td>'+
					'<td>Missed</td>'+
					'<td>Difference</td>'+
					'<td>Score</td>'+
				'</tr>'+
			'</thead>' +
			'<tbody>';
		$arPlayer.forEach($player => {
			$html += '<tr>'+
				'<td>' + getPlayerItemHTML($player.id) + '</td>'+
				'<td>' + $player.win + '</td>'+
				'<td>' + $player.draw + '</td>'+
				'<td>' + $player.loss + '</td>'+
				'<td>' + $player.goals + '</td>'+
				'<td>' + $player.missed + '</td>'+
				'<td>' + $player.difference + '</td>'+
				'<td>' + $player.score + '</td>'+
			'</tr>';
		});
		$html += '</tbody></table></div>';
		return $html;
	}


	// sort function
	function sortJSON(arr, key, way) {
		return arr.sort(function(a, b) {
			var x = a[key];
			var y = b[key];
			if (x === y) {
				x = a['difference'];
				y = b['difference'];
			}
			if (x === y) {
				x = a['goals'];
				y = b['goals'];
			}
			if (way === 'asc') { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
			if (way === 'desc') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
		});
	}


	// show match goals and scores
	function getMatchTableHTML($items) {
		let $html = '';
		$html += '<table class="tournament-table">'+
			'<thead>'+
				'<tr>'+
					'<td>Name</td>'+
					'<td>Goals</td>'+
					'<td>Score</td>'+
				'</tr>'+
			'</thead>'+
		'<tbody>';
		$items.forEach($item => {
			let $class = $item.winner == true ? "winner" : '';
			$html += '<tr class="' + $class + '">'+
				'<td>' + getPlayerItemHTML($item.player_id) + '</td>'+
				'<td>' + $item.goal + '</td>'+
				'<td>' + $item.score + '</td>'+
			'</tr>';
		});
		$html += '</tbody></table>';
		return $html;
	}


	// show one player (type number) OR all players (type object)
	function getPlayerItemHTML($playerIdORArPlayer) {
		let $html = '';
		$arPlayer.forEach($item => {
			if (typeof $playerIdORArPlayer === 'number' && $item.id == $playerIdORArPlayer ||
				typeof $playerIdORArPlayer === 'object'
			) {
				$html += '<div class="player-item" data-player-id="' + $item.id + '">';
				$html += '<div class="player-image">' +
					'<img alt="" src="' + $item.image_src + '">' +
				'</div>';
				$html += '<div class="player-name">' + $item.name + '</div>';
				$html += '</div>';
			}
		});
		return $html;
	}


	// genarate tabs
	function getTournamentTabsHtml($data) {
		let $html = '<div class="tournament-tabs">';
		$data.forEach($section => {
			let $sectionTitle = $section.name;
			$html += '<div class="tournament-tab-item" data-id="' + $section.id + '">' + 
				$sectionTitle + 
			'</div>';
		});
		$html += '</div>';
		return $html;
	}


	// JSON file request
	function readJSON(file) {
		var request = new XMLHttpRequest();
		request.open('GET', file, false);
		request.send(null);
		if (request.status == 200) {
			return request.responseText;
		}
	}


	// tab click event
	let $tabs = document.querySelectorAll('.tournament-tab-item');
	for (let $i = 0; $i < $tabs.length; $i++) {
		let $tab = $tabs[$i],
			$tabid = $tab.dataset.id,
			$wrap = document.querySelector('.section-item[data-id="' + $tabid + '"]');
		$tab.onclick = function() {
			if (!$tab.classList.contains('active')) {
				resetActiveTabs();
				$tab.classList.add('active');
				$wrap.classList.add('active');
			}
		}
	}
	function resetActiveTabs() {
		let $tabs = document.querySelectorAll('.tournament-tab-item');
		let $wraps = document.querySelectorAll('.section-item');
		[].forEach.call($tabs, function(el) {
			el.classList.remove("active");
		});
		[].forEach.call($wraps, function(el) {
			el.classList.remove("active");
		});
	}


	// show last tournament
	setActiveLastTabs();
	function setActiveLastTabs() {
		let $lastTab = document.querySelector('.tournament-tab-item:last-child'),
			$lastSection = document.querySelector('.section-item:last-child');
		$lastTab.classList.add('active');
		$lastSection.classList.add('active');
	}


}