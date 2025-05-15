document.addEventListener("DOMContentLoaded", () => {
    const yearSelect = document.getElementById("year-select");
    const resultsContainer = document.getElementById("results");
    const isOpenStatus = document.getElementById("is-open-status");
    const toggleButton = document.getElementById("toggle-open");
    const message = document.getElementById("message");
    let messageTimeout;
  
    function clearMessage() {
      message.textContent = "";
      message.className = "";
      if (messageTimeout) clearTimeout(messageTimeout);
    }
  
    function fetchResults(year) {
      fetch(`http://192.168.1.46:8080/result/${year}`)
        .then((res) => res.json())
        .then((data) => {
          resultsContainer.innerHTML = "";
          (data.bets || []).forEach((bet) => {
            const div = document.createElement("div");
            div.className = "bg-white/10 border border-white/20 rounded p-4 mb-2";
            div.innerHTML = `
              <p><strong>${bet.name}</strong></p>
              <p>Ganador: ${bet.winner}</p>
              <p>Último: ${bet.lastPlace}</p>
              <p>España: ${bet.spain}</p>
              <p>Mitad tabla: ${bet.halfTable === 1 ? "Primera" : "Segunda"}</p>
              <p>Favorito: ${bet.favourite}</p>
            `;
            resultsContainer.appendChild(div);
          });
        });
  
      fetch(`http://192.168.1.46:8080/poll?year=${year}`)
        .then((res) => res.json())
        .then((data) => {
          const poll = data.polls[year];
          if (!poll) {
            isOpenStatus.textContent = "❌ No disponible";
            isOpenStatus.className = "text-yellow-400 font-bold";
            toggleButton.textContent = "No disponible";
            toggleButton.disabled = true;
            toggleButton.classList.add("hidden");
            return;
          }
  
          isOpenStatus.textContent = poll.isOpen ? "✅ Abierta" : "❌ Cerrada";
          isOpenStatus.className = poll.isOpen
            ? "text-green-400 font-bold"
            : "text-red-400 font-bold";
          toggleButton.textContent = poll.isOpen ? "Cerrar votación" : "Abrir votación";
          toggleButton.dataset.open = poll.isOpen;
          toggleButton.disabled = false;
          toggleButton.classList.remove("hidden");
        });
    }
  
    function updatePollStatus(year) {
      fetch(`http://192.168.1.46:8080/poll?year=${year}`)
        .then((res) => res.json())
        .then((data) => {
          const poll = data.polls[year];
          if (!poll) return;
  
          isOpenStatus.textContent = poll.isOpen ? "✅ Abierta" : "❌ Cerrada";
          isOpenStatus.className = poll.isOpen
            ? "text-green-400 font-bold"
            : "text-red-400 font-bold";
          toggleButton.textContent = poll.isOpen ? "Cerrar votación" : "Abrir votación";
          toggleButton.dataset.open = poll.isOpen;
        });
    }
  
    yearSelect.addEventListener("change", () => {
      const year = yearSelect.value;
      clearMessage();
      if (year) {
        fetchResults(year);
      } else {
        toggleButton.classList.add("hidden");
        isOpenStatus.textContent = "";
      }
    });
  
    toggleButton.addEventListener("click", () => {
      const year = yearSelect.value;
      if (!year) return;
  
      const newState = toggleButton.dataset.open === "true" ? false : true;
  
      fetch(`http://192.168.1.46:8080/poll/${year}/is-open`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOpen: newState }),
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          message.textContent = "✅ Operación realizada con éxito";
          message.className = "text-green-400 mt-4";
          updatePollStatus(year);
          fetchResults(year);
          if (messageTimeout) clearTimeout(messageTimeout);
          messageTimeout = setTimeout(clearMessage, 4000);
        })
        .catch(() => {
          message.textContent = "❌ Error al cambiar el estado de la votación";
          message.className = "text-red-400 mt-4";
          if (messageTimeout) clearTimeout(messageTimeout);
          messageTimeout = setTimeout(clearMessage, 4000);
        });
    });
  });
  