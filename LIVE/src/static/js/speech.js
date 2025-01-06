function speak(words) {
  const utterance = new SpeechSynthesisUtterance(words);
  const voices = speechSynthesis.getVoices();
  // random voice :)
  utterance.voice =
    voices[Math.floor(Math.random() * speechSynthesis.getVoices().length)];
  speechSynthesis.speak(utterance);
}
