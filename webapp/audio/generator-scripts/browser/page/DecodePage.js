// Runs in the browser under test, so it is plain JavaScript and cannot import the package's TypeScript. The runner puts the
// limits on `window.AUDIO_CHECKS` before this loads, so they are written once, in `VERIFICATION_LIMITS`, and not here.
const limits = window.AUDIO_CHECKS;
const resultElement = document.getElementById("result");
document.getElementById("verify").addEventListener("click", verifyExports);

async function verifyExports() {
  try {
    resultElement.textContent = "Running";
    const inventory = await (await fetch("/encoded-audio/report.json")).json();
    const rows = [];
    for (const file of inventory.files) {
      rows.push(await verifyFile(file));
    }
    addCrouchFailures(rows);
    finish(JSON.stringify({userAgent: navigator.userAgent, rows}, null, 2));
  } catch (error) {
    finish(JSON.stringify({error: String(error)}));
  }
}

function finish(text) {
  resultElement.textContent = text;
  resultElement.dataset.complete = "true";
}

async function verifyFile(file) {
  const name = `${file.key}.${file.format}`;
  const bytes = await (await fetch(`/encoded-audio/${name}`)).arrayBuffer();
  let buffer;
  try {
    buffer = await new OfflineAudioContext(file.channels, 1, limits.sampleRate).decodeAudioData(bytes);
  } catch (error) {
    // A browser that cannot play Ogg Vorbis at all is a finding about the browser, so it is reported, not thrown.
    if (file.format === "ogg" && !document.createElement("audio").canPlayType('audio/ogg; codecs="vorbis"')) {
      return {name, unsupported: true, error: String(error)};
    }
    throw error;
  }
  const row = measure(name, buffer);
  row.failures = failuresOf(file, buffer, row);
  if (file.key.startsWith("music-")) {
    row.repeatError = await repeatError(buffer);
    if (row.repeatError > limits.maxRepeatError) {
      row.failures.push("repetition");
    }
  }

  return row;
}

function measure(name, buffer) {
  let peak = 0;
  let power = 0;
  let join = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const samples = buffer.getChannelData(channel);
    join = Math.max(join, Math.abs(samples[0] - samples[samples.length - 1]));
    for (const sample of samples) {
      peak = Math.max(peak, Math.abs(sample));
      power += sample * sample;
    }
  }

  return {
    name,
    frames: buffer.length,
    channels: buffer.numberOfChannels,
    peak,
    rmsDbfs: 20 * Math.log10(Math.sqrt(power / (buffer.length * buffer.numberOfChannels))),
    join,
  };
}

function failuresOf(file, buffer, row) {
  const failures = [];
  if (buffer.numberOfChannels !== file.channels) {
    failures.push("channels");
  }
  if (Math.abs(buffer.length - Math.round(file.seconds * limits.sampleRate)) > limits.durationToleranceFrames) {
    failures.push("duration");
  }
  if (!(row.peak > 0 && row.peak < 1)) {
    failures.push("silence/clipping");
  }
  if (file.key.startsWith("music-") && row.join > limits.maxLoopJump) {
    failures.push("join");
  }

  return failures;
}

// Plays the decoded loop three times offline and compares every sample with the loop repeated, which checks how the
// browser schedules a loop. It says nothing about how the join sounds.
async function repeatError(buffer) {
  const renderer = new OfflineAudioContext(buffer.numberOfChannels, buffer.length * 3, limits.sampleRate);
  const source = renderer.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(renderer.destination);
  source.start();
  const repeated = await renderer.startRendering();
  let worst = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const played = repeated.getChannelData(channel);
    const original = buffer.getChannelData(channel);
    for (let frame = 0; frame < played.length; frame += 1) {
      worst = Math.max(worst, Math.abs(played[frame] - original[frame % original.length]));
    }
  }

  return worst;
}

function addCrouchFailures(rows) {
  for (const row of rows) {
    if (!row.name.startsWith("sfx-step-crouch") || row.unsupported) {
      continue;
    }
    const stand = rows.find(candidate => candidate.name === row.name.replace("crouch", "stand"));
    if (!stand || stand.unsupported || row.rmsDbfs > stand.rmsDbfs - limits.crouchMarginDb) {
      row.failures.push("crouch level");
    }
  }
}
