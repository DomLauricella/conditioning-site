(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let running = false, round = 0, points = 0, rewardLimit = 0, audio = null;
  function display(symbol, title, text, reward = false) {
    $('symbol').textContent = symbol; $('symbol').classList.toggle('reward', reward);
    $('signal').textContent = title; $('stage-text').textContent = text;
  }
  function chime() {
    if (!$('sound').checked || !audio || audio.state !== 'running') return;
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.frequency.value = 660; gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, audio.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
    osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime + 0.36);
  }
  function enableAudio() {
    if (!$('sound').checked) return;
    try { const Audio = window.AudioContext || window.webkitAudioContext; if (Audio) { audio ||= new Audio(); audio.resume().catch(() => {}); } } catch (_) { /* Visual signal remains available. */ }
  }
  $('sound').addEventListener('change', enableAudio);
  function finish() {
    running = false; $('stop').hidden = true; $('press').hidden = true; $('round').textContent = 'Activity complete';
    display('○', 'What did you expect?', 'This time, your click earned no reward.');
    $('reflection').hidden = false; $('reflection-title').focus({preventScroll:true});
  }
  function nextRound() {
    if (!running) return;
    round++; $('round').textContent = 'Keep exploring';
    if (round > rewardLimit) { finish(); return; }
    chime(); points += 10; $('points').textContent = points;
    display('+10', 'Ten points', 'Your click earned a reward. Press again whenever you’re ready.', true);
  }
  function start() {
    running = true; round = 0; points = 0;
    rewardLimit = 6 + Math.floor(Math.random() * 7);
    $('points').textContent = '0';
    $('reflection').hidden = true; $('debrief').hidden = true; $('reflection').reset();
    $('start').hidden = true; $('stop').hidden = false; $('press').hidden = false; enableAudio();
    $('round').textContent = 'Ready for your first click';
    $('press').focus({preventScroll:true}); display('○', 'Give it a click', 'Press the button below and notice what happens.');
  }
  $('start').addEventListener('click', start); $('again').addEventListener('click', start);
  $('press').addEventListener('click', nextRound);
  $('stop').addEventListener('click', () => {
    running = false; $('stop').hidden = true; $('press').hidden = true; $('start').hidden = false;
    $('start').textContent = 'Restart activity'; $('round').textContent = 'Activity stopped';
    display('○', 'Take your time', 'Restart whenever you like, or read the notes below.'); $('start').focus({preventScroll:true});
  });
  $('reflection').addEventListener('submit', event => {
    event.preventDefault(); const answer = new FormData(event.currentTarget).get('expectation');
    $('response').textContent = {yes:'You noticed an expectation that clicking would earn points. Consider whether that reward also encouraged you to keep clicking.',maybe:'An uncertain response is useful, too. A short demonstration may not create a noticeable expectation.'}[answer];
    $('debrief').hidden = false; $('debrief').focus({preventScroll:true}); $('debrief').scrollIntoView({block:'nearest'});
  });
})();
