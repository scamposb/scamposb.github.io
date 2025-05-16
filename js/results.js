document.addEventListener("DOMContentLoaded", () => {
    const yearSelect = document.getElementById("year-select");
    const resultsContainer = document.getElementById("results-container");
    const logo = document.getElementById("logo");
  
    if (logo) {
      logo.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }
  
    fetch(`${SERVER_URL}/polls`)
      .then((res) => res.json())
      .then((data) => {
        const polls = data.polls;
        const years = Object.keys(polls).sort().reverse();
  
        yearSelect.innerHTML = "<option value='' disabled selected>Selecciona un año</option>";
        years.forEach((year) => {
          const option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearSelect.appendChild(option);
        });
  
        yearSelect.addEventListener("change", () => {
          const year = yearSelect.value;
          showResults(year, polls[year]);
        });
      })
      .catch((err) => {
        console.error("Error al cargar resultados:", err);
        resultsContainer.innerHTML = "<p class='text-red-400'>Error al cargar los resultados. Inténtalo más tarde.</p>";
      });
  
    function showResults(year, pollData) {
      resultsContainer.innerHTML = `<h2 class='text-2xl font-semibold mb-4'>Apuestas del año ${year}</h2>`;
  
      const bets = pollData.bets;
      if (!bets || Object.keys(bets).length === 0) {
        resultsContainer.innerHTML += "<p>No hay apuestas para este año.</p>";
        return;
      }
  
      for (const [name, bet] of Object.entries(bets)) {
        const card = document.createElement("div");
        card.className = "bg-card text-white shadow-lg p-4 rounded-lg mb-4";
        card.innerHTML = `
          <h3 class="text-xl font-bold mb-2">${name}</h3>
          <p><strong>Ganador:</strong> ${bet.winner}</p>
          <p><strong>Último lugar:</strong> ${bet.lastPlace}</p>
          <p><strong>Posición de España:</strong> ${bet.spain}</p>
          <p><strong>Mitad de la tabla:</strong> ${bet.halfTable === 1 ? "Primera" : "Segunda"}</p>
          <p><strong>País favorito:</strong> ${bet.favourite}</p>
          <p class="text-sm opacity-70 mt-2">Enviado el: ${new Date(bet.timestamp).toLocaleString()}</p>
        `;
        resultsContainer.appendChild(card);
      }
    }
  });
  