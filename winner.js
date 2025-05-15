document.addEventListener("DOMContentLoaded", async () => {
    const yearSelect = document.getElementById("year-select");
    const errorMessage = document.getElementById("error-message");
    const winnerSection = document.getElementById("winner-section");
    const revealBtn = document.getElementById("reveal-winner");
    const winnerDisplay = document.getElementById("winner-display");
  
    let winnerData = null;
  
    // Obtener años
    try {
      const response = await fetch("http://192.168.1.46:8080/polls");
      const data = await response.json();
      const years = Object.keys(data.polls).sort().reverse();
  
      years.forEach((year) => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
  
      yearSelect.addEventListener("change", async () => {
        const year = yearSelect.value;
        errorMessage.textContent = "";
        winnerDisplay.classList.add("hidden");
        winnerDisplay.innerHTML = "";
        winnerSection.classList.add("hidden");
  
        if (!year) return;
  
        const isOpen = data.polls[year].isOpen;
        if (isOpen) {
          errorMessage.textContent = "La porra debe estar cerrada para calcular el ganador.";
          return;
        }
  
        const res = await fetch(`http://192.168.1.46:8080/winner/${year}`);
        winnerData = await res.json();
        winnerSection.classList.remove("hidden");
      });
  
      revealBtn.addEventListener("click", async () => {
        // Ocultar todo
        document.querySelector("select").classList.add("hidden");
        winnerSection.classList.add("hidden");
        errorMessage.classList.add("hidden");
  
        // Crear cuenta atrás
        const countdownEl = document.createElement("div");
        countdownEl.className = "text-6xl font-bold animate-pulse transition-all duration-1000";
        countdownEl.id = "countdown";
        winnerDisplay.innerHTML = "";
        winnerDisplay.classList.remove("hidden");
        winnerDisplay.appendChild(countdownEl);
  
        for (let i = 5; i >= 1; i--) {
          countdownEl.textContent = i;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
  
        // Mostrar ganador
        countdownEl.remove();
  
        const nameEl = document.createElement("div");
        nameEl.className = "text-4xl font-extrabold text-pink-400 mb-2 animate-bounce";
        nameEl.textContent = `🎉 ${winnerData.Name} 🎉`;
  
        const scoreEl = document.createElement("div");
        scoreEl.className = "text-2xl";
        scoreEl.textContent = `Puntuación: ${winnerData.Score}`;
  
        winnerDisplay.appendChild(nameEl);
        winnerDisplay.appendChild(scoreEl);
  
        // Confeti
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
      });
  
    } catch (error) {
      errorMessage.textContent = "Error al cargar los datos.";
      console.error(error);
    }
  });
  