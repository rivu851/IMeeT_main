
import * as Tone from "tone";

let synth,filter;
let dropdownSynth;//let dropdownNoise, dropdownFilter, dropdownEnvelope;
let reverseDropdownSynth;
let zoomSynth, zoomFilter;

const setupClickSound = () => {
  synth = new Tone.Synth({
    oscillator: {
      type: "triangle"
    },
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0,
      release: 0.05
    }
  });

  filter = new Tone.Filter({
    frequency: 2000,
    type: "lowpass",
    rolloff: -12
  });

  synth.connect(filter);
  filter.toDestination();
};
//hambarger navbar dropdown sound
export const setupDropdownSound = () => {
  dropdownSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 2,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.01,
      decay: 0.4,
      sustain: 0,
      release: 0.2,
    },
    volume:-15,
  }).toDestination();

reverseDropdownSynth = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 2,
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.01,
    decay: 0.4,
    sustain: 0,
    release: 0.2,
  },
  volume: -15,
}).toDestination();
};

//zoom in-zoom out sounds for event img
const setupZoomSound = () => {
  // Smooth, deep synth
  zoomSynth = new Tone.Synth({
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.01,   // Slight ramp-up
      decay: 0.2,
      sustain: 0,
      release: 0.3   // Linger a bit
    },
    volume: -20 
  }).toDestination();;

  // Filter to give that deep swoosh
  zoomFilter = new Tone.Filter({
    frequency: 100,  // Start lower for "depth"
    type: "lowpass",
    rolloff: -12,
    Q: 1
  });

  // Connect
  zoomSynth.connect(zoomFilter);
  zoomFilter.toDestination();
};
 const playDropdownSound = async () => {
  await Tone.start();

  if (!dropdownSynth) setupDropdownSound();

  const now = Tone.now();
  dropdownSynth.triggerAttackRelease("C4", "8n", now);
  dropdownSynth.triggerAttackRelease("D4", "8n", now + 0.12);
  dropdownSynth.triggerAttackRelease("E4", "8n", now + 0.24);
};
const playDropdownCloseSound = async () => {
  await Tone.start();
  if (!reverseDropdownSynth) setupDropdownSound();

  const now = Tone.now();
  reverseDropdownSynth.triggerAttackRelease("E4", "8n", now);
  reverseDropdownSynth.triggerAttackRelease("D4", "8n", now + 0.12);
  reverseDropdownSynth.triggerAttackRelease("C4", "8n", now + 0.24);
};


 const playZoomOutSound = async () => {
  await Tone.start();
  if (!zoomSynth || !zoomFilter) setupZoomSound();

  // Start note (low to mid pitch)
  const startNote = "A4";
  const endNote = "A5";

  // Trigger the note
  zoomSynth.triggerAttack(startNote);

  // Slide pitch upward (simulate zoom-in feeling)
  //zoomSynth.frequency.rampTo(Tone.Frequency(endNote), 0.1);

  // Filter opens up slightly while zooming
  //zoomFilter.frequency.rampTo(2000, 0.7);

  // Then release after zoom
  //setTimeout(() => {
    //zoomSynth.triggerRelease();
    //zoomFilter.frequency.rampTo(800, 0.1); // back to low
  //}, 700);
  zoomSynth.frequency.exponentialRampToValueAtTime(
    Tone.Frequency(endNote),
    Tone.now() + 0.4
  );

  // Filter opens up gently
  zoomFilter.frequency.exponentialRampToValueAtTime(1500, Tone.now() + 0.4);

  // Hold note briefly then release
  setTimeout(() => {
    zoomSynth.triggerRelease();
    zoomFilter.frequency.exponentialRampToValueAtTime(600, Tone.now() + 0.2); // smoother back down
  }, 600); 
};

 const playClickSound = async () => {
  if (!synth) setupClickSound();
  await Tone.start();
  synth.triggerAttackRelease("C6", "32n");
};

export {
  
  playDropdownSound,
  playDropdownCloseSound,
  playZoomOutSound,
};

export default playClickSound;

