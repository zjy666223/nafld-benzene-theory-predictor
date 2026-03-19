const inputs = {
  benzene: document.getElementById("benzene"),
  age: document.getElementById("age"),
  sex: document.getElementById("sex"),
  bmi: document.getElementById("bmi"),
  smoking: document.getElementById("smoking"),
  activity: document.getElementById("activity"),
  htn: document.getElementById("htn"),
  dm: document.getElementById("dm"),
  sleep: document.getElementById("sleep"),
  pheno: document.getElementById("pheno")
};

const riskValue = document.getElementById("riskValue");
const riskBadge = document.getElementById("riskBadge");
const riskNeedle = document.getElementById("riskNeedle");
const contribList = document.getElementById("contribList");
const phenoValue = document.getElementById("phenoValue");

const coeff = {
  intercept: -4.35,
  benzenePer01: Math.log(1.31),
  agePer5: Math.log(1.08),
  male: Math.log(1.12),
  bmiUnder: Math.log(0.73),
  bmiOver: Math.log(2.03),
  bmiObese: Math.log(3.48),
  smokingPrev: Math.log(1.09),
  smokingCurrent: Math.log(1.31),
  activityYes: Math.log(0.84),
  htnYes: Math.log(1.88),
  dmYes: Math.log(2.56),
  sleepMid: Math.log(0.91),
  sleepLong: Math.log(1.06),
  phenoPerSD: Math.log(1.24)
};

const colors = ["#0f766e", "#14b8a6", "#2563eb", "#7c3aed", "#f97316", "#ef4444"];

function logistic(x) {
  return 1 / (1 + Math.exp(-x));
}

function formatPercent(x) {
  return `${(x * 100).toFixed(1)}%`;
}

function riskClass(p) {
  if (p < 0.02) return ["Low", "low"];
  if (p < 0.05) return ["Moderate", "moderate"];
  if (p < 0.10) return ["High", "high"];
  return ["Very high", "very-high"];
}

function buildContributors(contribs) {
  contribList.innerHTML = "";
  const ranked = contribs
    .filter(item => Math.abs(item.value) > 0.02)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 5);

  ranked.forEach((item, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "contrib-item";

    const title = document.createElement("div");
    title.className = "contrib-title";
    title.textContent = item.label;

    const value = document.createElement("div");
    value.className = "contrib-value";
    value.textContent = `${item.value > 0 ? "+" : ""}${item.value.toFixed(2)} log-odds`;

    const track = document.createElement("div");
    track.className = "contrib-track";

    const fill = document.createElement("div");
    fill.className = "contrib-fill";
    fill.style.width = `${Math.min(100, Math.abs(item.value) / 1.2 * 100)}%`;
    fill.style.background = colors[idx % colors.length];

    track.appendChild(fill);
    wrapper.appendChild(title);
    wrapper.appendChild(value);
    wrapper.appendChild(track);
    contribList.appendChild(wrapper);
  });
}

function calculate() {
  const benzene = parseFloat(inputs.benzene.value);
  const age = parseFloat(inputs.age.value);
  const pheno = parseFloat(inputs.pheno.value);
  phenoValue.textContent = `${pheno >= 0 ? "+" : ""}${pheno.toFixed(1)} SD`;

  let logit = coeff.intercept;
  const contributions = [];

  const cBenz = ((benzene - 0.43) / 0.1) * coeff.benzenePer01;
  logit += cBenz;
  contributions.push({ label: "Benzene exposure", value: cBenz });

  const cAge = ((age - 55) / 5) * coeff.agePer5;
  logit += cAge;
  contributions.push({ label: "Age", value: cAge });

  if (inputs.sex.value === "male") {
    logit += coeff.male;
    contributions.push({ label: "Male sex", value: coeff.male });
  }

  const bmiMap = {
    under: ["BMI: underweight", coeff.bmiUnder],
    normal: ["BMI: normal", 0],
    over: ["BMI: overweight", coeff.bmiOver],
    obese: ["BMI: obese", coeff.bmiObese]
  };
  const [bmiLabel, bmiValue] = bmiMap[inputs.bmi.value];
  logit += bmiValue;
  contributions.push({ label: bmiLabel, value: bmiValue });

  const smokingMap = {
    never: ["Smoking: never", 0],
    previous: ["Smoking: previous", coeff.smokingPrev],
    current: ["Smoking: current", coeff.smokingCurrent]
  };
  const [smkLabel, smkValue] = smokingMap[inputs.smoking.value];
  logit += smkValue;
  contributions.push({ label: smkLabel, value: smkValue });

  if (inputs.activity.value === "yes") {
    logit += coeff.activityYes;
    contributions.push({ label: "Physical activity", value: coeff.activityYes });
  }

  if (inputs.htn.value === "yes") {
    logit += coeff.htnYes;
    contributions.push({ label: "Hypertension", value: coeff.htnYes });
  }

  if (inputs.dm.value === "yes") {
    logit += coeff.dmYes;
    contributions.push({ label: "Diabetes", value: coeff.dmYes });
  }

  const sleepMap = {
    short: ["Sleep: <7 h", 0],
    mid: ["Sleep: 7-8 h", coeff.sleepMid],
    long: ["Sleep: >8 h", coeff.sleepLong]
  };
  const [sleepLabel, sleepValue] = sleepMap[inputs.sleep.value];
  logit += sleepValue;
  contributions.push({ label: sleepLabel, value: sleepValue });

  const cPheno = pheno * coeff.phenoPerSD;
  logit += cPheno;
  contributions.push({ label: "Accelerated PhenoAge", value: cPheno });

  const risk = logistic(logit);
  const [badgeText, badgeClass] = riskClass(risk);

  riskValue.textContent = formatPercent(risk);
  riskBadge.textContent = badgeText;
  riskBadge.className = `risk-badge ${badgeClass}`;
  riskNeedle.style.left = `${Math.min(96, Math.max(2, risk * 400))}%`;

  buildContributors(contributions);
}

Object.values(inputs).forEach(el => el.addEventListener("input", calculate));
calculate();
