document.addEventListener("DOMContentLoaded", () => {
    const yearSelect = document.getElementById("year-select");
    const winnerSection = document.getElementById("winner-section");
    const revealButton = document.getElementById("reveal-winner");
    const winnerDisplay = document.getElementById("winner-display");
    const errorMessage = document.getElementById("error-message");
  
    let selectedYear = null;
    let winnerData = null;
    let allPolls = {};
  
    // Cargar años disponibles desde /polls
    fetch("http://192.168.1.46:8080/polls")
      .then((res) => res.json())
      .then((data) => {
        allPolls = data.polls;
  
        const years = Object.keys(allPolls).sort((a, b) => b - a); // Años descendentes
        years.forEach((year) => {
          const option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearSelect.appendChild(option);
        });
      })
      .catch((err) => {
        console.error("Error cargando los años:", err);
        errorMessage.textContent = "Error cargando los años disponibles.";
      });
  
    // Al cambiar el año
    yearSelect.addEventListener("change", () => {
      selectedYear = yearSelect.value;
      winnerSection.classList.add("hidden");
      winnerDisplay.classList.add("hidden");
      winnerDisplay.innerHTML = "";
      errorMessage.textContent = "";
  
      if (!selectedYear) return;
  
      const selectedPoll = allPolls[selectedYear];
      if (!selectedPoll) {
        errorMessage.textContent = "No se encontró la porra para ese año.";
        return;
      }
  
      if (selectedPoll.isOpen) {
        errorMessage.textContent =
          "La porra debe estar cerrada para calcular el ganador.";
        return;
      }
  
      // La porra está cerrada, podemos obtener el ganador
      fetch(`http://192.168.1.46:8080/winner/${selectedYear}`)
        .then((res) => res.json())
        .then((data) => {
          winnerData = data;
          winnerSection.classList.remove("hidden");
        })
        .catch((err) => {
          errorMessage.textContent =
            "Error al obtener el ganador. Intenta de nuevo.";
          console.error(err);
        });
    });
  
    // Mostrar el resultado al presionar el botón
    revealButton.addEventListener("click", () => {
      if (winnerData) {
        winnerDisplay.innerHTML = `
          <div class="mt-4 p-4 rounded-lg bg-green-800/70 border border-white/20 text-white text-center">
            <p class="text-xl font-semibold">🏆 Ganador: ${winnerData.Name}</p>
            <p class="text-lg mt-2">Puntuación: ${winnerData.Score}</p>
          </div>
        `;
        winnerDisplay.classList.remove("hidden");
      }
    });
  });
  