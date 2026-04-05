const form = document.getElementById("questionnaire");
const summary = document.getElementById("summary");
const results = document.getElementById("results");
const template = document.getElementById("result-template");
const warningBox = document.getElementById("warningBox");

let programmes = [];

function matchesProgramme(programme, reponses) {
  if (programme.residentQuebec && reponses.residentQuebec !== "oui") return null;
  if (!programme.occupation.includes(reponses.occupation)) return null;
  if (!programme.habitation.includes(reponses.habitation)) return null;
  if (!programme.mobilite.includes(reponses.mobilite)) return null;
  if (programme.ageMinimum && reponses.age < programme.ageMinimum) return null;

  let score = 0;

  if (programme.besoins.includes(reponses.besoin)) score += 4;
  if (reponses.age >= 70 && programme.ageMinimum >= 70) score += 2;
  if (reponses.age >= 65 && programme.ageMinimum >= 65 && programme.ageMinimum < 70) score += 2;
  if (reponses.mobilite === "oui" && programme.mobilite.includes("oui")) score += 2;
  if (reponses.habitation === "domicile" && programme.habitation.includes("domicile")) score += 1;
  if (reponses.occupation === "proprietaire" && programme.occupation.includes("proprietaire")) score += 1;
  if (programme.besoins.includes("revenu") && reponses.besoin !== "revenu") score += 0.5;
  if (reponses.urgence && programme.urgence) score += 6;

  return score;
}

function buildSummary(reponses, count) {
  if (reponses.residentQuebec !== "oui") {
    return "Cet outil vise surtout les personnes qui habitent au Québec. Les résultats peuvent être incomplets si ce n'est pas votre cas.";
  }

  if (count === 0) {
    return "Aucun programme n'a été repéré avec ces réponses. Essayez un autre type d'aide ou vérifiez les conditions officielles.";
  }

  if (reponses.urgence) {
    return `${count} ressource${count > 1 ? "s" : ""} utile${count > 1 ? "s" : ""} a été priorisée${count > 1 ? "es" : "e"} pour une aide plus rapide. Commencez par les premières fiches.`;
  }

  return `${count} programme${count > 1 ? "s" : ""} pourrait${count > 1 ? "ent" : ""} convenir à votre situation. Les résultats sont classés selon la proximité avec vos réponses. Vérifiez toujours les conditions officielles avant de faire une demande.`;
}

function renderEmptyState(message = "Aucun résultat pour le moment.") {
  results.innerHTML = `<div class="empty-state">${message}</div>`;
}

function renderResults(programmesCorrespondants) {
  results.innerHTML = "";

  if (programmesCorrespondants.length === 0) {
    renderEmptyState();
    return;
  }

  for (const programme of programmesCorrespondants) {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".result-category").textContent = `${programme.categorie} · ${programme.niveau}`;
    clone.querySelector(".result-title").textContent = programme.nom;
    const typeBadge = document.createElement("span");
    typeBadge.className = "result-type";
    typeBadge.textContent = programme.typeRessource ?? "Ressource";
    clone.querySelector(".result-top > div").appendChild(typeBadge);
    clone.querySelector(".result-status").textContent = programme.statut;
    clone.querySelector(".result-why").textContent = programme.resume;
    clone.querySelector(".result-apply").textContent = programme.demande;
    clone.querySelector(".result-verified").textContent = `Dernière vérification : ${programme.verification}`;
    clone.querySelector(".result-notes").textContent = programme.notes;

    const link = clone.querySelector(".result-link");
    link.href = programme.url;

    const documents = clone.querySelector(".result-documents");
    for (const documentRequis of programme.documents) {
      const li = document.createElement("li");
      li.textContent = documentRequis;
      documents.appendChild(li);
    }

    const conditions = clone.querySelector(".result-conditions");
    for (const condition of programme.conditions) {
      const li = document.createElement("li");
      li.textContent = condition;
      conditions.appendChild(li);
    }

    results.appendChild(clone);
  }
}

function updateWarningBox(reponses) {
  const messages = [];

  if (reponses.urgence) {
    messages.push(`
      <strong>Besoin d'aide maintenant</strong>
      Commencez par les premières fiches. Si la situation est urgente pour le logement, la nourriture, la sécurité ou les finances immédiates, utilisez les ressources de référence rapide comme le 211, votre municipalité ou Services Québec.
    `);
  }

  if (reponses.besoin === "dettes") {
    messages.push(`
      <strong>Attention aux faux services de règlement de dettes</strong>
      Ne payez pas de frais d'avance sans bien comprendre le service. Méfiez-vous des promesses de réduction rapide de dettes, de la pression pour signer et des offres qui demandent un paiement immédiat.
    `);
  }

  if (messages.length === 0) {
    warningBox.classList.add("hidden");
    warningBox.innerHTML = "";
    return;
  }

  warningBox.classList.remove("hidden");
  warningBox.innerHTML = messages.join("");
}

async function loadProgrammes() {
  try {
    const response = await fetch("./programmes.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    programmes = await response.json();
    renderEmptyState("Remplissez le questionnaire pour voir les résultats.");
  } catch (error) {
    summary.textContent = "Impossible de charger les programmes.";
    renderEmptyState("Le fichier de données n'a pas pu être chargé. Ouvrez l'application avec un petit serveur local pour permettre la lecture de programmes.json.");
    console.error(error);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const reponses = {
    age: Number(formData.get("age")),
    residentQuebec: String(formData.get("residentQuebec")),
    habitation: String(formData.get("habitation")),
    occupation: String(formData.get("occupation")),
    mobilite: String(formData.get("mobilite")),
    besoin: String(formData.get("besoin")),
    urgence: formData.get("urgence") === "on"
  };

  const programmesCorrespondants = programmes
    .map((programme) => {
      const score = matchesProgramme(programme, reponses);
      return score === null ? null : { ...programme, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  summary.textContent = buildSummary(reponses, programmesCorrespondants.length);
  updateWarningBox(reponses);
  renderResults(programmesCorrespondants);
});

renderEmptyState("Chargement des programmes...");
loadProgrammes();
